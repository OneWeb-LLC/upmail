import { getOwebControlPlaneUrl } from "@/utils/oweb/config";
import { UPMAIL_APP_ID } from "@/utils/oweb/constants";

export type RedeemLaunchTokenResponse = {
  access_token: string;
  refresh_token: string | null;
  org_id: string;
  user_id: string;
};

export type AppActivationKind =
  | "signup"
  | "sign_in"
  | "sso_launch"
  | "invite_accept"
  | "oneid_claim"
  | "import_reconciled";

export type WorkspaceActivationKind =
  | "personal_bootstrap"
  | "created"
  | "sign_in"
  | "sso_launch"
  | "invite_accept"
  | "provisioned"
  | "import_reconciled";

async function postJson<T>(
  path: string,
  body: Record<string, unknown>,
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(new URL(path, getOwebControlPlaneUrl()), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!response.ok) {
    throw new Error(payload.error ?? `oweb_api_${response.status}`);
  }

  return payload;
}

export async function redeemLaunchTokenViaOweb(
  launchToken: string,
): Promise<RedeemLaunchTokenResponse> {
  return postJson<RedeemLaunchTokenResponse>(
    "/api/v1/ecosystem/redeem-launch-token",
    {
      launch_token: launchToken,
      app_id: UPMAIL_APP_ID,
    },
  );
}

export async function activateUpmailApp(input: {
  accessToken: string;
  activationKind: AppActivationKind;
}): Promise<void> {
  await postJson(
    "/api/v1/oneid/activate",
    {
      app_id: UPMAIL_APP_ID,
      activation_kind: input.activationKind,
    },
    input.accessToken,
  );
}

export async function activateUpmailWorkspace(input: {
  accessToken: string;
  workspaceId: string;
  activationKind: WorkspaceActivationKind;
}): Promise<void> {
  await postJson(
    "/api/v1/oneid/activate-workspace",
    {
      workspace_id: input.workspaceId,
      activation_kind: input.activationKind,
    },
    input.accessToken,
  );
}
