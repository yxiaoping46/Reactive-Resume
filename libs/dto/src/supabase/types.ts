import { ResumeData } from "@reactive-resume/schema";

export type Database = {
  public: {
    Tables: {
      resumes_v3: {
        Row: {
          id: string;
          title: string;
          slug: string;
          data: ResumeData;
          visibility: 'public' | 'private';
          locked: boolean;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          data?: ResumeData;
          visibility?: 'public' | 'private';
          locked?: boolean;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          data?: ResumeData;
          visibility?: 'public' | 'private';
          locked?: boolean;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      resume_v3_statistics: {
        Row: {
          id: string;
          views: number;
          downloads: number;
          resume_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          views?: number;
          downloads?: number;
          resume_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          views?: number;
          downloads?: number;
          resume_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}; 