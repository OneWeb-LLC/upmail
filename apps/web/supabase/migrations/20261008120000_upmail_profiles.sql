-- Upmail OWeb satellite tables on shared One OS (apply via Supabase migration tooling; not auto-run in CI).

CREATE OR REPLACE FUNCTION public.upmail_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.upmail_profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  one_id TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.upmail_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "upmail_profiles self all" ON public.upmail_profiles;
CREATE POLICY "upmail_profiles self all" ON public.upmail_profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.upmail_profiles TO authenticated;
GRANT ALL ON public.upmail_profiles TO service_role;

DROP TRIGGER IF EXISTS upmail_profiles_updated ON public.upmail_profiles;
CREATE TRIGGER upmail_profiles_updated
  BEFORE UPDATE ON public.upmail_profiles
  FOR EACH ROW EXECUTE FUNCTION public.upmail_set_updated_at();

CREATE OR REPLACE FUNCTION public.upmail_is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ao_org_members m
    WHERE m.org_id = p_workspace_id
      AND m.user_id = auth.uid()
      AND m.left_at IS NULL
  );
$$;

CREATE TABLE IF NOT EXISTS public.upmail_workspace_email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oweb_workspace_id UUID NOT NULL,
  email_account_id TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email_account_id)
);

ALTER TABLE public.upmail_workspace_email_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "upmail_workspace_email_accounts member read" ON public.upmail_workspace_email_accounts;
CREATE POLICY "upmail_workspace_email_accounts member read" ON public.upmail_workspace_email_accounts
  FOR SELECT TO authenticated
  USING (public.upmail_is_workspace_member(oweb_workspace_id));

DROP POLICY IF EXISTS "upmail_workspace_email_accounts owner write" ON public.upmail_workspace_email_accounts;
CREATE POLICY "upmail_workspace_email_accounts owner write" ON public.upmail_workspace_email_accounts
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (
    owner_user_id = auth.uid()
    AND public.upmail_is_workspace_member(oweb_workspace_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.upmail_workspace_email_accounts TO authenticated;
GRANT ALL ON public.upmail_workspace_email_accounts TO service_role;

CREATE TABLE IF NOT EXISTS public.upmail_autonomous_send_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oweb_workspace_id UUID,
  email_account_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  execution_mode TEXT NOT NULL,
  rule_id TEXT,
  classification_reason TEXT,
  content_ref TEXT,
  provider_result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.upmail_autonomous_send_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "upmail_autonomous_send_audit self read" ON public.upmail_autonomous_send_audit;
CREATE POLICY "upmail_autonomous_send_audit self read" ON public.upmail_autonomous_send_audit
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "upmail_autonomous_send_audit self insert" ON public.upmail_autonomous_send_audit;
CREATE POLICY "upmail_autonomous_send_audit self insert" ON public.upmail_autonomous_send_audit
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON public.upmail_autonomous_send_audit TO authenticated;
GRANT ALL ON public.upmail_autonomous_send_audit TO service_role;
