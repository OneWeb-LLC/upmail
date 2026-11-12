"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LoadingContent } from "@/components/LoadingContent";
import { owebSsoRedeemAction } from "@/utils/actions/oweb-auth";
import { persistWorkspaceIdInBrowser } from "@/utils/oweb/workspace-context";
import { WELCOME_PATH } from "@/utils/config";

export function OwebSsoClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const launchToken = searchParams?.get("launch_token")?.trim();
    if (!launchToken) {
      setError("Missing launch token. Return to OWeb and try again.");
      return;
    }

    const redeem = async () => {
      try {
        const result = await owebSsoRedeemAction({ launchToken });
        if (result.workspaceId) {
          persistWorkspaceIdInBrowser(result.workspaceId);
        }
        router.replace(WELCOME_PATH);
      } catch (redeemError) {
        setError(
          redeemError instanceof Error
            ? redeemError.message
            : "SSO redeem failed",
        );
      }
    };

    redeem().catch(() => {
      setError("SSO redeem failed");
    });
  }, [router, searchParams]);

  return (
    <LoadingContent
      loading={!error}
      error={error ? { error } : undefined}
      loadingComponent={
        <p className="p-8 text-center text-muted-foreground">
          Completing OWeb sign-in…
        </p>
      }
    >
      {null}
    </LoadingContent>
  );
}
