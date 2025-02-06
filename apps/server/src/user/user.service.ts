import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserDto } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { StorageService } from "../storage/storage.service";
import { SupabaseService } from "../supabase/supabase.service";
import { User } from '@supabase/supabase-js';

@Injectable()
export class UserService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly storageService: StorageService,
  ) {}

  async findOneById(id: string): Promise<User> {
    const { data: user, error } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    if (!user) throw new InternalServerErrorException(ErrorMessage.UserNotFound);

    return user;
  }

  async findOneByIdentifier(identifier: string): Promise<User | null> {
    // First, find the user by email
    const { data: userByEmail, error: emailError } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('email', identifier)
      .single();

    if (emailError && emailError.code !== 'PGRST116') {
      throw new InternalServerErrorException(emailError.message);
    }

    if (userByEmail) return userByEmail;

    // If not found by email, try username
    const { data: userByUsername, error: usernameError } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('username', identifier)
      .single();

    if (usernameError && usernameError.code !== 'PGRST116') {
      throw new InternalServerErrorException(usernameError.message);
    }

    return userByUsername || null;
  }

  async findOneByIdentifierOrThrow(identifier: string): Promise<User> {
    const user = await this.findOneByIdentifier(identifier);
    
    if (!user) {
      throw new InternalServerErrorException(ErrorMessage.UserNotFound);
    }

    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    const { data: user, error } = await this.supabase.client
      .from('users')
      .insert({
        email: data.email,
        name: data.user_metadata?.name,
        picture: data.user_metadata?.picture,
        username: data.user_metadata?.username,
      })
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return user;
  }

  async updateByEmail(email: string, data: Partial<User>): Promise<User> {
    const { data: user, error } = await this.supabase.client
      .from('users')
      .update({
        name: data.user_metadata?.name,
        picture: data.user_metadata?.picture,
        username: data.user_metadata?.username,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return user;
  }

  async deleteOneById(id: string): Promise<void> {
    await Promise.all([
      this.storageService.deleteFolder(id),
      this.supabase.client.from('users').delete().eq('id', id),
    ]);
  }
}
