import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  displayNameFromSupabaseUser,
  fetchOneIdHandle,
  oneIdFromUserMetadata,
} from "@/utils/oweb/oneid";

export async function upsertUpmailSupabaseProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const oneId =
    oneIdFromUserMetadata(user) ?? (await fetchOneIdHandle(user.id));

  const { error } = await supabase.from("upmail_profiles").upsert(
    {
      id: user.id,
      one_id: oneId,
      display_name: displayNameFromSupabaseUser(user),
      avatar_url:
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}
