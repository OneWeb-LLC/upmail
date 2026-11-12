import { ActionType } from "@/generated/prisma/enums";
import { isOwebSatelliteEnabled } from "@/utils/oweb/config";
import { isSendingActionType } from "@/utils/ai/sending-action";
import prisma from "@/utils/prisma";

export type AutonomousSendDecision =
  | { mode: "send" }
  | {
      mode: "defer_to_draft";
      reason: "oweb_trust_default_review";
    };

export async function resolveAutomatedSendingDecision(input: {
  userId: string;
  actionType: ActionType;
  ruleId?: string | null;
}): Promise<AutonomousSendDecision> {
  if (!isOwebSatelliteEnabled() || !isSendingActionType(input.actionType)) {
    return { mode: "send" };
  }

  const profile = await prisma.upmailProfile.findUnique({
    where: { userId: input.userId },
    select: { autonomousSendEnabled: true },
  });

  if (profile?.autonomousSendEnabled) {
    return { mode: "send" };
  }

  if (input.ruleId) {
    const rule = await prisma.rule.findUnique({
      where: { id: input.ruleId },
      select: { autonomousSendEnabled: true },
    });
    if (rule?.autonomousSendEnabled) {
      return { mode: "send" };
    }
  }

  return { mode: "defer_to_draft", reason: "oweb_trust_default_review" };
}

export function mapSendingActionToDraft(actionType: ActionType): ActionType {
  if (actionType === ActionType.REPLY) {
    return ActionType.DRAFT_EMAIL;
  }
  return ActionType.DRAFT_EMAIL;
}
