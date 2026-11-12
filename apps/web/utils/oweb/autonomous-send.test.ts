import { beforeEach, describe, expect, it, vi } from "vitest";

import { ActionType } from "@/generated/prisma/enums";

const { isOwebSatelliteEnabledMock, prismaMock } = vi.hoisted(() => ({
  isOwebSatelliteEnabledMock: vi.fn(),
  prismaMock: {
    upmailProfile: { findUnique: vi.fn() },
    rule: { findUnique: vi.fn() },
  },
}));

vi.mock("@/utils/oweb/config", () => ({
  isOwebSatelliteEnabled: isOwebSatelliteEnabledMock,
}));

vi.mock("@/utils/prisma", () => ({
  default: prismaMock,
}));

import { resolveAutomatedSendingDecision } from "@/utils/oweb/autonomous-send";

describe("resolveAutomatedSendingDecision", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isOwebSatelliteEnabledMock.mockReturnValue(true);
    prismaMock.upmailProfile.findUnique.mockResolvedValue(null);
    prismaMock.rule.findUnique.mockResolvedValue(null);
  });

  it("defers automated REPLY when OWeb trust defaults apply", async () => {
    const decision = await resolveAutomatedSendingDecision({
      userId: "user-1",
      actionType: ActionType.REPLY,
      ruleId: "rule-1",
    });

    expect(decision).toEqual({
      mode: "defer_to_draft",
      reason: "oweb_trust_default_review",
    });
  });

  it("allows send when profile autonomous send is enabled", async () => {
    prismaMock.upmailProfile.findUnique.mockResolvedValue({
      autonomousSendEnabled: true,
    });

    const decision = await resolveAutomatedSendingDecision({
      userId: "user-1",
      actionType: ActionType.SEND_EMAIL,
    });

    expect(decision).toEqual({ mode: "send" });
  });

  it("allows send when the rule explicitly enables autonomous send", async () => {
    prismaMock.rule.findUnique.mockResolvedValue({
      autonomousSendEnabled: true,
    });

    const decision = await resolveAutomatedSendingDecision({
      userId: "user-1",
      actionType: ActionType.FORWARD,
      ruleId: "rule-9",
    });

    expect(decision).toEqual({ mode: "send" });
  });
});
