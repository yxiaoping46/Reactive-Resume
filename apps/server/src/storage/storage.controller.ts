import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { User } from '@supabase/supabase-js';
import { SupabaseGuard } from "../auth/guards/supabase.guard";
import { SupabaseUser } from "../auth/decorators/supabase-user.decorator";
import { StorageService } from "./storage.service";

@ApiTags("Storage")
@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload")
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@SupabaseUser() user: User, @UploadedFile("file") file: Express.Multer.File) {
    return this.storageService.upload(user.id, file);
  }
}
