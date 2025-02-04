import { User, Session } from '@supabase/supabase-js';

export interface SupabaseAuthResponse {
  user: User | null;
  session: Session | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
} 