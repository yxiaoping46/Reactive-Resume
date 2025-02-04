import { Injectable } from '@nestjs/common';
import { RegisterDto } from '@reactive-resume/dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseAuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async signUp(registerDto: RegisterDto) {
    const { data: authData, error: authError } = await this.supabaseService.client.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
    });

    if (authError) throw authError;

    // Create user profile in the public schema
    const { error: profileError } = await this.supabaseService.client
      .from('users')
      .insert({
        id: authData.user?.id,
        email: registerDto.email,
        name: registerDto.name,
      });

    if (profileError) throw profileError;

    return authData;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  }

  async signOut(userId: string) {
    const { error } = await this.supabaseService.client.auth.admin.signOut(userId);
    if (error) throw error;
  }

  async resetPasswordForEmail(email: string) {
    const { error } = await this.supabaseService.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.PUBLIC_URL}/auth/reset-password`,
    });

    if (error) throw error;
  }

  async updatePassword(userId: string, newPassword: string) {
    const { error } = await this.supabaseService.client.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) throw error;
  }
} 