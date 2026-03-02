import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Anon Key dari environment variables (.env.local)
// Nilai default string kosong ('') ditambahkan agar TypeScript tidak error saat build
// jika file .env belum dibuat.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// Inisialisasi client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
