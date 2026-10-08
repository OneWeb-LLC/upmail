import { describe, expect, it, vi } from "vitest";

import {
  OwebWorkspaceAuthorizationError,
  assertActiveWorkspaceMember,
  isActiveWorkspaceMember,
} from "@/utils/oweb/workspace-authz";

function createSupabaseMock(rows: { org_id: string }[] | null, error?: string) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: rows?.[0] ?? null,
                error: error ? { message: error } : null,
              }),
            }),
          }),
        }),
      }),
    }),
  };
}

describe("oweb workspace authz", () => {
  it("allows active workspace members", async () => {
    const supabase = createSupabaseMock([{ org_id: "ws-1" }]);
    await expect(
      assertActiveWorkspaceMember(supabase as never, "user-1", "ws-1"),
    ).resolves.toBeUndefined();
  });

  it("rejects users who are not workspace members", async () => {
    const supabase = createSupabaseMock([]);
    await expect(
      assertActiveWorkspaceMember(supabase as never, "user-1", "ws-2"),
    ).rejects.toBeInstanceOf(OwebWorkspaceAuthorizationError);
    await expect(
      isActiveWorkspaceMember(supabase as never, "user-1", "ws-2"),
    ).resolves.toBe(false);
  });
});
