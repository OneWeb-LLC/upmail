import { env } from "@/env";
import {
  DEFAULT_OWEB_CONTROL_PLANE_URL,
  DEFAULT_SUPABASE_AUTH_URL,
} from "@/utils/oweb/constants";

export function isOwebSatelliteEnabled(): boolean {
  return (
    env.OWEB_SATELLITE_ENABLED &&
    Boolean(env.SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function getOwebControlPlaneUrl(): string {
  return (
    env.OWEB_CONTROL_PLANE_URL ??
    env.NEXT_PUBLIC_OWEB_CONTROL_PLANE_URL ??
    DEFAULT_OWEB_CONTROL_PLANE_URL
  );
}

export function getSupabaseUrl(): string {
  return env.SUPABASE_URL ?? DEFAULT_SUPABASE_AUTH_URL;
}
