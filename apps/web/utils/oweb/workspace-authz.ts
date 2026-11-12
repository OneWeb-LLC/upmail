import type { SupabaseClient } from "@supabase/supabase-js";

export class OwebWorkspaceAuthorizationError extends Error {
  readonly code = "workspace.forbidden" as const;

  constructor(message = "Not authorized for this workspace") {
    super(message);
    this.name = "OwebWorkspaceAuthorizationError";
  }
}

export async function isActiveWorkspaceMember(
  supabase: SupabaseClient,
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("ao_org_members")
    .select("org_id")
    .eq("user_id", userId)
    .eq("org_id", workspaceId)
    .is("left_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function assertActiveWorkspaceMember(
  supabase: SupabaseClient,
  userId: string,
  workspaceId: string,
): Promise<void> {
  const allowed = await isActiveWorkspaceMember(supabase, userId, workspaceId);
  if (!allowed) {
    throw new OwebWorkspaceAuthorizationError();
  }
}
