import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  picture: z.string().url().nullable(),
  username: z.string().min(3),
  locale: z.string(),
  emailVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  provider: z.enum(["email", "github", "google", "openid"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class UserDto extends createZodDto(userSchema) {}
