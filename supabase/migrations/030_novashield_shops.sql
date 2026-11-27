-- Nova商譽寶 (NovaShield) — 歸屬拓新雲端 NovaOS 旗下門市商譽管理模組
-- 使用 NovaOS 既有 Supabase 資料庫、綠界 ECPay 金流與 Resend 到期提醒排程。

CREATE TABLE IF NOT EXISTS public.novashield_shops (
  shop_id text PRIMARY KEY,
  owner_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan text NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO')),
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
  plan_expires_at timestamptz,
  reminder_3d_for timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS novashield_shops_expiring_idx
  ON public.novashield_shops (plan, plan_expires_at)
  WHERE plan = 'PRO' AND plan_expires_at IS NOT NULL;

ALTER TABLE public.novashield_shops ENABLE ROW LEVEL SECURITY;

-- 綠界回調防重複入帳（避免重試重複累加方案天數）
CREATE TABLE IF NOT EXISTS public.novashield_processed_trades (
  merchant_trade_no text PRIMARY KEY,
  shop_id text NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount integer NOT NULL CHECK (amount > 0),
  rtn_code text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.novashield_processed_trades ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.novashield_shops IS
  'Nova商譽寶 (NovaShield) 門市設定與付費方案狀態（由伺服端 service_role 管理，PRO 僅由綠界回調開通）';
