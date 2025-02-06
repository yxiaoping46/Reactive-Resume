import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { CreateResumeDto, ImportResumeDto, ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { defaultResumeData, ResumeData } from "@reactive-resume/schema";
import type { DeepPartial } from "@reactive-resume/utils";
import { ErrorMessage, generateRandomName } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import deepmerge from "deepmerge";

import { PrinterService } from "@/server/printer/printer.service";
import { StorageService } from "../storage/storage.service";
import { SupabaseService } from "../supabase/supabase.service";

@Injectable()
export class ResumeService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly printerService: PrinterService,
    private readonly storageService: StorageService,
  ) {}

  async create(userId: string, createResumeDto: CreateResumeDto) {
    // Get user info from Supabase
    const { data: user, error: userError } = await this.supabaseService.client
      .from('users')
      .select('name, email, picture')
      .eq('id', userId)
      .single();

    if (userError) throw new InternalServerErrorException(userError.message);
    if (!user) throw new BadRequestException('User not found');

    const data = deepmerge(defaultResumeData, {
      basics: { name: user.name, email: user.email, picture: { url: user.picture ?? "" } },
    } satisfies DeepPartial<ResumeData>);

    const { data: resume, error } = await this.supabaseService.client
      .from('resumes_v3')
      .insert({
        data,
        user_id: userId,
        title: createResumeDto.title,
        visibility: createResumeDto.visibility,
        slug: createResumeDto.slug ?? slugify(createResumeDto.title),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }
      throw new InternalServerErrorException(error.message);
    }

    return resume;
  }

  async import(userId: string, importResumeDto: ImportResumeDto) {
    const randomTitle = generateRandomName();

    const { data: resume, error } = await this.supabaseService.client
      .from('resumes_v3')
      .insert({
        user_id: userId,
        visibility: "private",
        data: importResumeDto.data,
        title: importResumeDto.title ?? randomTitle,
        slug: importResumeDto.slug ?? slugify(randomTitle),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }
      throw new InternalServerErrorException(error.message);
    }

    return resume;
  }

  async findAll(userId: string) {
    const { data: resumes, error } = await this.supabaseService.client
      .from('resumes_v3')
      .select()
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new InternalServerErrorException(error.message);
    return resumes;
  }

  async findOne(id: string, userId?: string) {
    let query = this.supabaseService.client
      .from('resumes_v3')
      .select()
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: resume, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        throw new BadRequestException(ErrorMessage.ResumeNotFound);
      }
      throw new InternalServerErrorException(error.message);
    }

    return resume;
  }

  async findOneStatistics(id: string) {
    const { data: stats, error } = await this.supabaseService.client
      .from('resume_v3_statistics')
      .select('views, downloads')
      .eq('resume_id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore not found error
      throw new InternalServerErrorException(error.message);
    }

    return {
      views: stats?.views ?? 0,
      downloads: stats?.downloads ?? 0,
    };
  }

  async findOneByUsernameSlug(username: string, slug: string, userId?: string) {
    // First get the resume
    const { data: resume, error } = await this.supabaseService.client
      .from('resumes_v3')
      .select('*, users!inner(username)')
      .eq('users.username', username)
      .eq('slug', slug)
      .eq('visibility', 'public')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        throw new BadRequestException(ErrorMessage.ResumeNotFound);
      }
      throw new InternalServerErrorException(error.message);
    }

    // Update statistics if not the owner viewing
    if (!userId) {
      const { error: statsError } = await this.supabaseService.client
        .from('resume_v3_statistics')
        .upsert({
          resume_id: resume.id,
          views: 1,
          downloads: 0,
        }, {
          onConflict: 'resume_id',
          count: 'exact'
        });

      if (statsError) {
        Logger.error(statsError);
      }
    }

    return resume;
  }

  async update(userId: string, id: string, updateResumeDto: UpdateResumeDto) {
    // Check if resume is locked
    const { data: existing, error: existingError } = await this.supabaseService.client
      .from('resumes_v3')
      .select('locked')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (existingError) {
      if (existingError.code === 'PGRST116') { // Not found
        throw new BadRequestException(ErrorMessage.ResumeNotFound);
      }
      throw new InternalServerErrorException(existingError.message);
    }

    if (existing.locked) {
      throw new BadRequestException(ErrorMessage.ResumeLocked);
    }

    // Update resume
    const { data: resume, error } = await this.supabaseService.client
      .from('resumes_v3')
      .update({
        title: updateResumeDto.title,
        slug: updateResumeDto.slug,
        visibility: updateResumeDto.visibility,
        data: updateResumeDto.data,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }
      throw new InternalServerErrorException(error.message);
    }

    return resume;
  }

  async lock(userId: string, id: string, set: boolean) {
    const { data: resume, error } = await this.supabaseService.client
      .from('resumes_v3')
      .update({ locked: set })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        throw new BadRequestException(ErrorMessage.ResumeNotFound);
      }
      throw new InternalServerErrorException(error.message);
    }

    return resume;
  }

  async remove(userId: string, id: string) {
    await Promise.all([
      // Remove files in storage
      this.storageService.deleteObject(userId, "resumes", id),
      this.storageService.deleteObject(userId, "previews", id),
    ]);

    const { error } = await this.supabaseService.client
      .from('resumes_v3')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        throw new BadRequestException(ErrorMessage.ResumeNotFound);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async printResume(resume: ResumeDto, userId?: string) {
    const url = await this.printerService.printResume(resume);

    // Update statistics if not the owner
    if (!userId) {
      const { error: statsError } = await this.supabaseService.client
        .from('resume_v3_statistics')
        .upsert({
          resume_id: resume.id,
          downloads: 1,
          views: 0,
        }, {
          onConflict: 'resume_id',
          count: 'exact'
        });

      if (statsError) {
        Logger.error(statsError);
      }
    }

    return url;
  }

  printPreview(resume: ResumeDto) {
    return this.printerService.printPreview(resume);
  }
}
