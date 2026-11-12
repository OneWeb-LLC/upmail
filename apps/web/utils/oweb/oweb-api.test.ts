import { afterEach, describe, expect, it, vi } from "vitest";

import { redeemLaunchTokenViaOweb } from "@/utils/oweb/oweb-api";

describe("redeemLaunchTokenViaOweb", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts launch_token and app_id to the OWeb control plane", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "access",
        refresh_token: "refresh",
        org_id: "org",
        user_id: "user",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await redeemLaunchTokenViaOweb("token-abc");

    expect(result.user_id).toBe("user");
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe(
      "https://oweb.one/api/v1/ecosystem/redeem-launch-token",
    );
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(
      JSON.stringify({ launch_token: "token-abc", app_id: "upmail" }),
    );
  });

  it("surfaces control-plane errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "invalid_token" }),
      }),
    );

    await expect(redeemLaunchTokenViaOweb("bad")).rejects.toThrow(
      "invalid_token",
    );
  });
});
