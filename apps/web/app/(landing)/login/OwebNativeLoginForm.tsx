"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContinueWithOweb } from "@/components/ContinueWithOweb";
import { owebNativeSignInAction } from "@/utils/actions/oweb-auth";
import { toastError } from "@/components/Toast";

export function OwebNativeLoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") ?? undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData();
          formData.set("email", email);
          formData.set("password", password);
          if (next) formData.set("next", next);

          startTransition(async () => {
            try {
              await owebNativeSignInAction(formData);
            } catch (error) {
              toastError({
                title: "Sign in failed",
                description:
                  error instanceof Error
                    ? error.message
                    : "Could not sign in with OneID credentials.",
              });
            }
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="oweb-email">Email</Label>
          <Input
            id="oweb-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oweb-password">Password</Label>
          <Input
            id="oweb-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in with OneID"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <ContinueWithOweb />
    </div>
  );
}
