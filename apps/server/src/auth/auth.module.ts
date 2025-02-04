import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthController } from "./auth.controller";
import { SupabaseAuthService } from './supabase-auth.service';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [SupabaseAuthService],
  exports: [SupabaseAuthService],
})
export class AuthModule {}
