import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  LoginDto,
  RegisterDto,
} from "@reactive-resume/dto";
import type { Response } from "express";
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseGuard } from './guards/supabase.guard';
import { SupabaseUser } from './decorators/supabase-user.decorator';
import { User } from '@supabase/supabase-js';

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
  ) {}

  private handleAuthResponse(response: Response, session: any) {
    // Set Supabase session token in cookie
    response.cookie("sb-access-token", session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      user: session.user,
      session: session,
    };
  }

  @Post("register")
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { session } = await this.supabaseAuthService.signUp(registerDto);
      
      if (!session) {
        return { message: "Please check your email to confirm your registration." };
      }

      return this.handleAuthResponse(response, session);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post("login")
  async login(
    @Body() { email, password }: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { session } = await this.supabaseAuthService.signIn(email, password);
      
      if (!session) {
        throw new UnauthorizedException("Invalid credentials");
      }

      return this.handleAuthResponse(response, session);
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }

  @Post("logout")
  @UseGuards(SupabaseGuard)
  async logout(
    @SupabaseUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    await this.supabaseAuthService.signOut(user.id);
    response.clearCookie("sb-access-token");
    return { message: "Logged out successfully" };
  }
}
