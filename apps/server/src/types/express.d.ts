import type { Resume } from "@reactive-resume/dto";
import type { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user?: User;
      payload?: {
        resume?: Resume;
      };
    }
  }
}

export {};
