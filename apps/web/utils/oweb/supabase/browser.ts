import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/env";
import {
  OWEB_AUTH_STORAGE_KEY,
  ONE_OS_SUPABASE_PROJECT_ID,
} from "@/utils/oweb/constants";
import { getSupabaseUrl } from "@/utils/oweb/config";

export function createSupabaseBrowserClient() {
  const url = getSupabaseUrl();
  const key =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return createBrowserClient(url, key, {
    auth: {
      storageKey: OWEB_AUTH_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "X-Client-Info": `upmail@${ONE_OS_SUPABASE_PROJECT_ID}`,
      },
    },
  });
}
