import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { ErrorMessage } from "@reactive-resume/utils";
import { Request } from "express";
import { User } from '@supabase/supabase-js';

import { ResumeService } from "../resume.service";

@Injectable()
export class ResumeGuard implements CanActivate {
  constructor(private readonly resumeService: ResumeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;

    try {
      const resume = await this.resumeService.findOne(
        request.params.id,
        user?.id
      );

      // First check if the resume is public, if yes, attach the resume to the request payload.
      if (resume.visibility === "public") {
        request.payload = { resume };
      }

      // If the resume is private and the user is authenticated and is the owner of the resume, attach the resume to the request payload.
      // Else, if either the user is not authenticated or is not the owner of the resume, throw a 404 error.
      if (resume.visibility === "private") {
        if (user && user.id === resume.user_id) {
          request.payload = { resume };
        } else {
          throw new NotFoundException(ErrorMessage.ResumeNotFound);
        }
      }

      return true;
    } catch {
      throw new NotFoundException(ErrorMessage.ResumeNotFound);
    }
  }
}
