import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://chocobliss.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

/**
 * Supabase client designated exclusively for media asset & storage buckets
 * as established in Phase 2 Architecture (Option C).
 */
export const supabaseStorage: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
