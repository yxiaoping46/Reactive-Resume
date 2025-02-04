import { SupabaseProvider } from './providers/supabase.provider';
import { AuthProvider } from './providers/auth.provider';

export function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        {/* Rest of your app components */}
      </AuthProvider>
    </SupabaseProvider>
  );
} 