-- 訂閱管家：固定期數／分期付款與貸款扣款擴充
-- Apply after 029_subkeeper_auth_profile.sql on production Supabase.

ALTER TABLE public.personal_subscriptions
  ADD COLUMN IF NOT EXISTS billing_type text NOT NULL DEFAULT 'recurring'
    CHECK (billing_type IN ('recurring', 'installment', 'loan')),
  ADD COLUMN IF NOT EXISTS total_periods integer
    CHECK (total_periods IS NULL OR (total_periods >= 1 AND total_periods <= 600)),
  ADD COLUMN IF NOT EXISTS current_period integer NOT NULL DEFAULT 1
    CHECK (current_period >= 0 AND current_period <= 600),
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS auto_stop boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused'));

-- Sync status with legacy is_active column for existing records
UPDATE public.personal_subscriptions
SET status = CASE WHEN is_active THEN 'active' ELSE 'paused' END
WHERE (is_active = false AND status = 'active');

-- Backfill start_date from next_billing_on where missing
UPDATE public.personal_subscriptions
SET start_date = next_billing_on
WHERE start_date IS NULL AND next_billing_on IS NOT NULL;

CREATE INDEX IF NOT EXISTS personal_subscriptions_user_status_idx
  ON public.personal_subscriptions (user_id, status);

COMMENT ON COLUMN public.personal_subscriptions.billing_type IS
  '扣款類型：recurring(無限期訂閱) | installment(分期/有限期扣款) | loan(貸款)';
COMMENT ON COLUMN public.personal_subscriptions.total_periods IS
  '總期數（僅 installment / loan 使用；recurring 為 NULL）';
COMMENT ON COLUMN public.personal_subscriptions.current_period IS
  '目前進行／已繳期數（預設從 1 開始）';
COMMENT ON COLUMN public.personal_subscriptions.start_date IS
  '首期／開始扣款日期';
COMMENT ON COLUMN public.personal_subscriptions.auto_stop IS
  '達到總期數後是否自動標記為 completed 並停止扣款與日曆顯示';
COMMENT ON COLUMN public.personal_subscriptions.status IS
  '狀態：active(扣款中) | completed(已繳清/已結束) | paused(暫停)';

NOTIFY pgrst, 'reload schema';
