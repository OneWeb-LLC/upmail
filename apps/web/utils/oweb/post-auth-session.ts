import type { SupabaseClient, User } from "@supabase/supabase-js";

import type {
  AppActivationKind,
  WorkspaceActivationKind,
} from "@/utils/oweb/oweb-api";
import {
  activateUpmailApp,
  activateUpmailWorkspace,
} from "@/utils/oweb/oweb-api";
import { upsertUpmailSupabaseProfile } from "@/utils/oweb/ensure-upmail-profile";
import { oneIdFromUserMetadata } from "@/utils/oweb/oneid";
import {
  establishBetterAuthSessionCookie,
  resolveOrCreatePrismaUserForSupabaseUser,
  upsertPrismaUpmailProfile,
} from "@/utils/oweb/session-bridge";
import { resolveActivatedWorkspaceContext } from "@/utils/oweb/workspace-context";

export async function completeOwebAuthenticatedSession(input: {
  supabase: SupabaseClient;
  user: User;
  accessToken: string;
  appActivationKind: AppActivationKind;
  workspaceActivationKind: WorkspaceActivationKind;
  requestedWorkspaceId?: string | null;
}): Promise<{
  userId: string;
  workspaceId: string | null;
  fallbackUsed: boolean;
}> {
  await upsertUpmailSupabaseProfile(input.supabase, input.user);

  await Promise.all([
    activateUpmailApp({
      accessToken: input.accessToken,
      activationKind: input.appActivationKind,
    }).catch(() => {
      /* idempotent — non-fatal */
    }),
  ]);

  const { workspaceId, fallbackUsed } = await resolveActivatedWorkspaceContext({
    supabase: input.supabase,
    userId: input.user.id,
    requestedWorkspaceId: input.requestedWorkspaceId,
  });

  if (workspaceId) {
    await activateUpmailWorkspace({
      accessToken: input.accessToken,
      workspaceId,
      activationKind: input.workspaceActivationKind,
    }).catch(() => {
      /* idempotent — non-fatal */
    });
  }

  const prismaUser = await resolveOrCreatePrismaUserForSupabaseUser(input.user);
  await upsertPrismaUpmailProfile({
    userId: prismaUser.userId,
    oneIdHandle: oneIdFromUserMetadata(input.user),
    activeOwebWorkspaceId: workspaceId,
  });

  await establishBetterAuthSessionCookie(prismaUser.userId);

  return {
    userId: prismaUser.userId,
    workspaceId,
    fallbackUsed,
  };
}
