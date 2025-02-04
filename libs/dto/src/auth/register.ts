import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export class RegisterDto extends createZodDto(registerSchema) {}
