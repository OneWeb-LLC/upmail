import { env } from "@/env";
import {
  DEFAULT_OWEB_CONTROL_PLANE_URL,
  DEFAULT_SUPABASE_AUTH_URL,
} from "@/utils/oweb/constants";

function getSupabasePublishableKey(): string | undefined {
  return (
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function hasPublicSupabaseAuthConfig(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublishableKey());
}

function hasServerSupabaseAuthConfig(): boolean {
  return Boolean(
    (env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL) &&
      getSupabasePublishableKey(),
  );
}

export function isOwebSatelliteEnabled(): boolean {
  if (typeof window !== "undefined") {
    return hasPublicSupabaseAuthConfig();
  }

  return env.OWEB_SATELLITE_ENABLED && hasServerSupabaseAuthConfig();
}

export function getOwebControlPlaneUrl(): string {
  if (typeof window !== "undefined") {
    return (
      env.NEXT_PUBLIC_OWEB_CONTROL_PLANE_URL ?? DEFAULT_OWEB_CONTROL_PLANE_URL
    );
  }

  return (
    env.OWEB_CONTROL_PLANE_URL ??
    env.NEXT_PUBLIC_OWEB_CONTROL_PLANE_URL ??
    DEFAULT_OWEB_CONTROL_PLANE_URL
  );
}

export function getSupabaseUrl(): string {
  if (typeof window !== "undefined") {
    return env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_SUPABASE_AUTH_URL;
  }

  return (
    env.SUPABASE_URL ??
    env.NEXT_PUBLIC_SUPABASE_URL ??
    DEFAULT_SUPABASE_AUTH_URL
  );
}
