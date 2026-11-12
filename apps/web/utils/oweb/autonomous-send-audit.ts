import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionType } from "@/generated/prisma/enums";

export async function recordAutonomousSendAudit(input: {
  supabase: SupabaseClient;
  userId: string;
  owebWorkspaceId?: string | null;
  emailAccountId?: string;
  actionType: ActionType;
  executionMode: "deferred_to_draft" | "autonomous_sent" | "blocked";
  ruleId?: string | null;
  classificationReason?: string | null;
  contentRef?: string | null;
  providerResult?: unknown;
  errorMessage?: string | null;
}): Promise<void> {
  const { error } = await input.supabase
    .from("upmail_autonomous_send_audit")
    .insert({
      user_id: input.userId,
      oweb_workspace_id: input.owebWorkspaceId ?? null,
      email_account_id: input.emailAccountId ?? null,
      action_type: input.actionType,
      execution_mode: input.executionMode,
      rule_id: input.ruleId ?? null,
      classification_reason: input.classificationReason ?? null,
      content_ref: input.contentRef ?? null,
      provider_result: input.providerResult ?? null,
      error_message: input.errorMessage ?? null,
    });

  if (error) {
    return;
  }
}
