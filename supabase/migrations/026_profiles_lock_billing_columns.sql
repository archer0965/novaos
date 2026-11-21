-- P0 hardening: prevent authenticated clients from self-granting plans / VIP / secrets.
-- Apply ONLY after review on staging; do not auto-apply to production without owner approval.
-- App updates to billing fields must continue via service_role (checkout callback, admin APIs).

-- Replace unrestricted self-update with column-safe policy via trigger.

CREATE OR REPLACE FUNCTION public.profiles_prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role / postgres to update anything
  IF coalesce(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Authenticated users may not change billing / entitlement / secret columns
  IF NEW.plan_type IS DISTINCT FROM OLD.plan_type
     OR NEW.billing_cycle IS DISTINCT FROM OLD.billing_cycle
     OR NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     OR NEW.is_early_bird IS DISTINCT FROM OLD.is_early_bird
     OR NEW.discount_tier IS DISTINCT FROM OLD.discount_tier
     OR NEW.is_ambassador IS DISTINCT FROM OLD.is_ambassador
     OR NEW.signup_early_bird IS DISTINCT FROM OLD.signup_early_bird
     OR NEW.monthly_usage_count IS DISTINCT FROM OLD.monthly_usage_count
     OR NEW.usage_month IS DISTINCT FROM OLD.usage_month
     OR NEW.active_modules IS DISTINCT FROM OLD.active_modules
     OR NEW.referral_credit_balance IS DISTINCT FROM OLD.referral_credit_balance
     OR NEW.referral_discount_used IS DISTINCT FROM OLD.referral_discount_used
     OR NEW.referred_by IS DISTINCT FROM OLD.referred_by
  THEN
    RAISE EXCEPTION 'profiles: billing/entitlement columns are not client-writable';
  END IF;

  -- LINE / ECPay secrets if columns exist (ignore if missing via to_jsonb check)
  IF to_jsonb(NEW) ? 'line_channel_access_token'
     AND NEW.line_channel_access_token IS DISTINCT FROM OLD.line_channel_access_token THEN
    -- Sellers may set their own channel credentials via authenticated API using service role ideally;
    -- Allow only when changed through intentional app path: keep client-writable for settings UX,
    -- but never allow plan fields above.
    NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_profiles_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.profiles_prevent_privilege_escalation();

COMMENT ON FUNCTION public.profiles_prevent_privilege_escalation() IS
  'Blocks client self-elevation of plan/VIP/usage/referral balances. Service role bypasses.';
