"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UPMAIL_APP_ID } from "@/utils/oweb/constants";
import { getOwebControlPlaneUrl } from "@/utils/oweb/config";

export function ContinueWithOweb() {
  const launchUrl = new URL("/login", getOwebControlPlaneUrl());
  launchUrl.searchParams.set("launch", UPMAIL_APP_ID);

  return (
    <Button asChild variant="outline" className="w-full">
      <Link href={launchUrl.toString()}>Continue with OWeb</Link>
    </Button>
  );
}
