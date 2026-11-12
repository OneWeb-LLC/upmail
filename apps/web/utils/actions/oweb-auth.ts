"use server";

import { redirect } from "next/navigation";

import {
  owebNativeSignInSchema,
  owebSsoRedeemSchema,
} from "@/utils/actions/oweb-auth.validation";
import { isOwebSatelliteEnabled } from "@/utils/oweb/config";
import { completeOwebAuthenticatedSession } from "@/utils/oweb/post-auth-session";
import { createSupabaseServerClient } from "@/utils/oweb/supabase/server";
import { redeemLaunchTokenViaOweb } from "@/utils/oweb/oweb-api";
import { normalizeInternalPath } from "@/utils/path";
import { WELCOME_PATH } from "@/utils/config";

export async function owebNativeSignInAction(formData: FormData) {
  if (!isOwebSatelliteEnabled()) {
    throw new Error("oweb_satellite_disabled");
  }

  const parsed = owebNativeSignInSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next")?.toString(),
  });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? "invalid_credentials");
  }

  await completeOwebAuthenticatedSession({
    supabase,
    user: data.user,
    accessToken: data.session.access_token,
    appActivationKind: "sign_in",
    workspaceActivationKind: "sign_in",
  });

  redirect(normalizeInternalPath(parsed.next) ?? WELCOME_PATH);
}

export async function owebSsoRedeemAction(input: { launchToken: string }) {
  if (!isOwebSatelliteEnabled()) {
    throw new Error("oweb_satellite_disabled");
  }

  const parsed = owebSsoRedeemSchema.parse(input);
  const redeemed = await redeemLaunchTokenViaOweb(parsed.launchToken);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.setSession({
    access_token: redeemed.access_token,
    refresh_token: redeemed.refresh_token ?? "",
  });

  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? "sso_session_failed");
  }

  const result = await completeOwebAuthenticatedSession({
    supabase,
    user: data.user,
    accessToken: data.session.access_token,
    appActivationKind: "sso_launch",
    workspaceActivationKind: "sso_launch",
    requestedWorkspaceId: redeemed.org_id,
  });

  return {
    ok: true as const,
    workspaceId: result.workspaceId,
    fallbackUsed: result.fallbackUsed,
  };
}
