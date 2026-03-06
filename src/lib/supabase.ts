import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://jrltxuhcmvqxuwukacju.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybHR4dWhjbXZxeHV3dWthY2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzcwMjMsImV4cCI6MjA4ODM1MzAyM30.bOGTUXpGREOzLtfMGplq8kQdv6H1LD1Fx-ZrQw62vZQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
