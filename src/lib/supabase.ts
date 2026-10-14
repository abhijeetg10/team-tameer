import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://dfmsrevoyldpwkhsypud.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmbXNyZXZveWxkcHdraHN5cHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5OTc3MDUsImV4cCI6MjEwNzU3MzcwNX0.DSm9gdOLfZPD664GYD9nVksxTB0_YuFy31UqCJrH6Go';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
