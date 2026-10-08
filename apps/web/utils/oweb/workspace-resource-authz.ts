import type { SupabaseClient } from "@supabase/supabase-js";

import prisma from "@/utils/prisma";
import {
  OwebWorkspaceAuthorizationError,
  assertActiveWorkspaceMember,
} from "@/utils/oweb/workspace-authz";

export async function assertEmailAccountAuthorizedForWorkspace(input: {
  supabase: SupabaseClient;
  userId: string;
  workspaceId: string;
  emailAccountId: string;
}): Promise<void> {
  await assertActiveWorkspaceMember(
    input.supabase,
    input.userId,
    input.workspaceId,
  );

  const binding = await prisma.upmailEmailAccountWorkspace.findUnique({
    where: { emailAccountId: input.emailAccountId },
    select: { owebWorkspaceId: true },
  });

  if (!binding || binding.owebWorkspaceId !== input.workspaceId) {
    throw new OwebWorkspaceAuthorizationError(
      "Email account is not bound to the requested workspace",
    );
  }
}
