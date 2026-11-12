import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

import { env } from "@/env";
import {
  OWEB_AUTH_STORAGE_KEY,
  ONE_OS_SUPABASE_PROJECT_ID,
} from "@/utils/oweb/constants";
import { getSupabaseUrl } from "@/utils/oweb/config";

function getSupabasePublishableKey(): string {
  const key =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  return key;
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options as CookieOptions);
        }
      },
    },
    auth: {
      storageKey: OWEB_AUTH_STORAGE_KEY,
    },
    global: {
      headers: {
        "X-Client-Info": `upmail@${ONE_OS_SUPABASE_PROJECT_ID}`,
      },
    },
  });
}
