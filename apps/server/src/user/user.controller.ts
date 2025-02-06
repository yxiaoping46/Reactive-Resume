import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Patch,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UpdateUserDto } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import type { Response } from "express";

import { SupabaseGuard } from "../auth/guards/supabase.guard";
import { SupabaseUser } from "../auth/decorators/supabase-user.decorator";
import { User } from '@supabase/supabase-js';
import { UserService } from "./user.service";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get("me")
  @UseGuards(SupabaseGuard)
  fetch(@SupabaseUser() user: User) {
    return user;
  }

  @Patch("me")
  @UseGuards(SupabaseGuard)
  async update(@SupabaseUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.updateByEmail(user.email!, {
        user_metadata: {
          name: updateUserDto.name,
          picture: updateUserDto.picture,
          username: updateUserDto.username,
          locale: updateUserDto.locale,
        }
      });
    } catch (error) {
      if (error.code === '23505') { // Unique violation in Postgres
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Delete("me")
  @UseGuards(SupabaseGuard)
  async delete(@SupabaseUser() user: User, @Res({ passthrough: true }) response: Response) {
    await this.userService.deleteOneById(user.id);
    response.status(200).send({ message: "Sorry to see you go, goodbye!" });
  }
}
