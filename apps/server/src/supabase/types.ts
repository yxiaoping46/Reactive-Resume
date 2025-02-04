export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          name: string;
        };
        Update: {
          email?: string;
          name?: string;
        };
      };
    };
  };
}; 