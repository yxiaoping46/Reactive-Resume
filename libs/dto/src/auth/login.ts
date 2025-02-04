import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class LoginDto extends createZodDto(loginSchema) {}
