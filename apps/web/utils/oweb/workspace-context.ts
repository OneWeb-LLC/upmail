import type { SupabaseClient } from "@supabase/supabase-js";

import { OWEB_WORKSPACE_STORAGE_KEY } from "@/utils/oweb/constants";

const WORKSPACE_ACTIVATED_KINDS = [
  "personal_bootstrap",
  "created",
  "sign_in",
  "sso_launch",
  "invite_accept",
  "provisioned",
] as const;

type WorkspaceRow = {
  id: string;
  kind?: string | null;
  slug?: string | null;
  name?: string | null;
};

export type ResolvedWorkspaceContext = {
  workspaceId: string | null;
  fallbackUsed: boolean;
};

async function loadActivatedWorkspaceIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("one_id_workspace_activations")
    .select("workspace_id")
    .eq("user_id", userId)
    .in("activation_kind", [...WORKSPACE_ACTIVATED_KINDS]);

  if (error) {
    throw new Error(error.message);
  }

  return new Set((data ?? []).map((row) => row.workspace_id as string));
}

async function listMemberWorkspaces(
  supabase: SupabaseClient,
  userId: string,
): Promise<WorkspaceRow[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from("ao_org_members")
    .select("org_id")
    .eq("user_id", userId)
    .is("left_at", null);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const orgIds = (memberships ?? []).map((row) => row.org_id as string);
  if (!orgIds.length) return [];

  const { data: orgs, error: orgError } = await supabase
    .from("ao_orgs")
    .select("id, kind, slug, name")
    .in("id", orgIds);

  if (orgError) {
    throw new Error(orgError.message);
  }

  return (orgs ?? []) as WorkspaceRow[];
}

function pickDefaultWorkspaceId(workspaces: WorkspaceRow[]): string | null {
  if (!workspaces.length) return null;
  const personal = workspaces.find((w) => w.kind === "personal");
  return personal?.id ?? workspaces[0]?.id ?? null;
}

export async function resolveActivatedWorkspaceContext(input: {
  supabase: SupabaseClient;
  userId: string;
  requestedWorkspaceId?: string | null;
}): Promise<ResolvedWorkspaceContext> {
  const memberWorkspaces = await listMemberWorkspaces(
    input.supabase,
    input.userId,
  );
  if (!memberWorkspaces.length) {
    return { workspaceId: null, fallbackUsed: false };
  }

  const activated = await loadActivatedWorkspaceIds(
    input.supabase,
    input.userId,
  );
  const memberIds = new Set(memberWorkspaces.map((w) => w.id));

  if (
    input.requestedWorkspaceId &&
    memberIds.has(input.requestedWorkspaceId) &&
    activated.has(input.requestedWorkspaceId)
  ) {
    return {
      workspaceId: input.requestedWorkspaceId,
      fallbackUsed: false,
    };
  }

  const activatedMembers = memberWorkspaces.filter((w) => activated.has(w.id));
  if (activatedMembers.length) {
    const fallbackId = pickDefaultWorkspaceId(activatedMembers);
    return {
      workspaceId: fallbackId,
      fallbackUsed: Boolean(
        input.requestedWorkspaceId &&
          fallbackId &&
          input.requestedWorkspaceId !== fallbackId,
      ),
    };
  }

  const defaultId = pickDefaultWorkspaceId(memberWorkspaces);
  return {
    workspaceId: defaultId,
    fallbackUsed: Boolean(
      input.requestedWorkspaceId &&
        defaultId &&
        input.requestedWorkspaceId !== defaultId,
    ),
  };
}

export function persistWorkspaceIdInBrowser(workspaceId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OWEB_WORKSPACE_STORAGE_KEY, workspaceId);
}
