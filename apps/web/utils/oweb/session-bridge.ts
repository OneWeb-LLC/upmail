import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { betterAuthConfig } from "@/utils/auth";
import { buildMobileSessionCookie } from "@/utils/mobile-auth/session-cookie";
import prisma from "@/utils/prisma";
import { displayNameFromSupabaseUser } from "@/utils/oweb/oneid";

export async function resolveOrCreatePrismaUserForSupabaseUser(
  user: User,
): Promise<{ userId: string; email: string }> {
  const email = user.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("supabase_user_missing_email");
  }

  const bySupabaseId = await prisma.user.findFirst({
    where: { supabaseAuthId: user.id },
    select: { id: true, email: true },
  });
  if (bySupabaseId) {
    return { userId: bySupabaseId.id, email: bySupabaseId.email };
  }

  const byEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, supabaseAuthId: true },
  });
  if (byEmail) {
    if (!byEmail.supabaseAuthId) {
      await prisma.user.update({
        where: { id: byEmail.id },
        data: { supabaseAuthId: user.id },
      });
    }
    return { userId: byEmail.id, email: byEmail.email };
  }

  const created = await prisma.user.create({
    data: {
      email,
      emailVerified: Boolean(user.email_confirmed_at),
      name: displayNameFromSupabaseUser(user),
      supabaseAuthId: user.id,
    },
    select: { id: true, email: true },
  });

  return { userId: created.id, email: created.email };
}

export async function upsertPrismaUpmailProfile(input: {
  userId: string;
  oneIdHandle: string | null;
  activeOwebWorkspaceId: string | null;
}): Promise<void> {
  await prisma.upmailProfile.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      oneIdHandle: input.oneIdHandle,
      activeOwebWorkspaceId: input.activeOwebWorkspaceId,
    },
    update: {
      oneIdHandle: input.oneIdHandle ?? undefined,
      activeOwebWorkspaceId: input.activeOwebWorkspaceId ?? undefined,
    },
  });
}

export async function establishBetterAuthSessionCookie(userId: string) {
  const authContext = await betterAuthConfig.$context;
  const session = await authContext.internalAdapter.createSession(
    userId,
    false,
    {},
  );
  if (!session?.token || !session.expiresAt) {
    throw new Error("failed_to_create_better_auth_session");
  }

  const sessionCookie = await buildMobileSessionCookie({
    authContext,
    expiresAt: session.expiresAt,
    sessionToken: session.token,
  });

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.options,
  );

  return session;
}
