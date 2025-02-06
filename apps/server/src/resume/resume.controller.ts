import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  CreateResumeDto,
  importResumeSchema,
  ResumeDto,
  UpdateResumeDto,
} from "@reactive-resume/dto";
import { resumeDataSchema } from "@reactive-resume/schema";
import { ErrorMessage } from "@reactive-resume/utils";
import { zodToJsonSchema } from "zod-to-json-schema";
import { User } from '@supabase/supabase-js';
import { SupabaseGuard } from "../auth/guards/supabase.guard";
import { SupabaseUser } from "../auth/decorators/supabase-user.decorator";
import { Resume } from "./decorators/resume.decorator";
import { ResumeGuard } from "./guards/resume.guard";
import { ResumeService } from "./resume.service";

@ApiTags("Resume")
@Controller("resume")
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get("schema")
  getSchema() {
    return zodToJsonSchema(resumeDataSchema);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  async create(@SupabaseUser() user: User, @Body() createResumeDto: CreateResumeDto) {
    try {
      return await this.resumeService.create(user.id, createResumeDto);
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  @Post("import")
  @UseGuards(SupabaseGuard)
  async import(@SupabaseUser() user: User, @Body() importResumeDto: unknown) {
    try {
      const result = importResumeSchema.parse(importResumeDto);
      return await this.resumeService.import(user.id, result);
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  @UseGuards(SupabaseGuard)
  findAll(@SupabaseUser() user: User) {
    return this.resumeService.findAll(user.id);
  }

  @Get(":id")
  @UseGuards(SupabaseGuard, ResumeGuard)
  findOne(@Resume() resume: ResumeDto) {
    return resume;
  }

  @Get(":id/statistics")
  @UseGuards(SupabaseGuard)
  findOneStatistics(@SupabaseUser() user: User, @Param("id") id: string) {
    return this.resumeService.findOneStatistics(id);
  }

  @Get("/public/:username/:slug")
  async findOneByUsernameSlug(
    @Param("username") username: string,
    @Param("slug") slug: string,
    @SupabaseUser() user?: User,
  ) {
    return this.resumeService.findOneByUsernameSlug(username, slug, user?.id);
  }

  @Patch(":id")
  @UseGuards(SupabaseGuard)
  update(
    @SupabaseUser() user: User,
    @Param("id") id: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumeService.update(user.id, id, updateResumeDto);
  }

  @Post(":id/lock")
  @UseGuards(SupabaseGuard)
  lock(@SupabaseUser() user: User, @Param("id") id: string, @Body("set") set = true) {
    return this.resumeService.lock(user.id, id, set);
  }

  @Delete(":id")
  @UseGuards(SupabaseGuard)
  remove(@SupabaseUser() user: User, @Param("id") id: string) {
    return this.resumeService.remove(user.id, id);
  }

  @Get("/print/:id")
  async printResume(@SupabaseUser() user: User | undefined, @Resume() resume: ResumeDto) {
    try {
      const url = await this.resumeService.printResume(resume, user?.id);
      return { url };
    } catch (error) {
      Logger.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  @Get("/print/:id/preview")
  async printPreview(@Resume() resume: ResumeDto) {
    try {
      const url = await this.resumeService.printPreview(resume);

      return { url };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
