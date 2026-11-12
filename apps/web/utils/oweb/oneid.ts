import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/utils/oweb/supabase/browser";

export function oneIdFromUserMetadata(user: {
  user_metadata?: Record<string, unknown>;
}): string | null {
  const raw = user.user_metadata?.one_id;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

export async function fetchOneIdHandle(userId: string): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("one_id_profiles")
    .select("one_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.one_id ?? null;
}

export function displayNameFromSupabaseUser(user: User): string {
  const metadata = user.user_metadata ?? {};
  if (typeof metadata.full_name === "string" && metadata.full_name) {
    return metadata.full_name;
  }
  if (typeof metadata.name === "string" && metadata.name) {
    return metadata.name;
  }
  return user.email?.split("@")[0] ?? "Upmail user";
}
