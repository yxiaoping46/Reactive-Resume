import { createZodDto } from "@anatine/zod-nestjs";
import { z } from "zod";

import { userSchema } from "../user";

export const authResponseSchema = z.object({
  status: z.enum(['authenticated', 'unauthenticated']),
});

export class AuthResponseDto extends createZodDto(authResponseSchema) {}
