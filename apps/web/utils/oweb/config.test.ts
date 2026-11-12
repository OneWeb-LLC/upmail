import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getOwebControlPlaneUrl,
  getSupabaseUrl,
  isOwebSatelliteEnabled,
} from "@/utils/oweb/config";

describe("OWeb config (client-safe)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubGlobal("window", undefined);
  });

  it("does not read server env on the client for control plane URL", () => {
    vi.stubGlobal("window", { document: {} });
    vi.stubEnv("NEXT_PUBLIC_OWEB_CONTROL_PLANE_URL", "https://oweb.one");
    vi.stubEnv("OWEB_CONTROL_PLANE_URL", "https://should-not-read.example");

    expect(getOwebControlPlaneUrl()).toBe("https://oweb.one");
  });

  it("does not read server env on the client for Supabase URL", () => {
    vi.stubGlobal("window", { document: {} });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://auth.oweb.one");
    vi.stubEnv("SUPABASE_URL", "https://should-not-read.example");

    expect(getSupabaseUrl()).toBe("https://auth.oweb.one");
  });

});
