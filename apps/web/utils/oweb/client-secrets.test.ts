import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("OWeb client bundle secrets guard", () => {
  it("does not expose privileged Supabase keys via NEXT_PUBLIC env names", () => {
    const envSource = readFileSync(
      new URL("../../env.ts", import.meta.url),
      "utf8",
    );
    expect(envSource).not.toMatch(/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
    expect(envSource).not.toMatch(/NEXT_PUBLIC_.*SERVICE_ROLE/);
  });
});
