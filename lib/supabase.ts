// Creates a Supabase client authenticated with the Clerk session token (Clerk's native
// Supabase integration: the session token is the access token, and RLS reads the user
// ID from its "sub" claim). Server only: auth() comes from @clerk/nextjs/server.
// Imports: @supabase/supabase-js, @clerk/nextjs/server. Used by: lib/user-data, lib/actions/*

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }

  return createClient(url, key, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
}
