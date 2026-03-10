-- Sync Hub — Live Data Tables
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- These tables receive data from the 3 apps via src/lib/syncHub.ts

-- ══════════════════════════════════════
-- 1. APP EVENTS — individual events (sales, signups, alerts, deploys)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app         text NOT NULL CHECK (app IN ('lifelink','vision-sync','aisales')),
  event_type  text NOT NULL,          -- e.g. 'sale', 'signup', 'alert', 'deploy', 'error'
  amount      integer,                -- in pence (999 = £9.99), nullable
  currency    text DEFAULT 'GBP',
  label       text,                   -- human readable description
  metadata    jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz DEFAULT now()
);

-- Index for fast queries by app + time
CREATE INDEX IF NOT EXISTS idx_app_events_app_time ON app_events (app, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_type ON app_events (event_type, created_at DESC);

-- ══════════════════════════════════════
-- 2. APP FINANCE — one row per app, upserted on every payment event
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_finance (
  app                       text PRIMARY KEY CHECK (app IN ('lifelink','vision-sync','aisales')),
  mrr_pence                 integer DEFAULT 0,
  arr_pence                 integer DEFAULT 0,
  total_revenue_pence       integer DEFAULT 0,
  revenue_today_pence       integer DEFAULT 0,
  revenue_mtd_pence         integer DEFAULT 0,
  revenue_ytd_pence         integer DEFAULT 0,
  total_customers           integer DEFAULT 0,
  active_subscriptions      integer DEFAULT 0,
  churn_rate                numeric(5,2) DEFAULT 0,
  avg_revenue_per_user_pence integer DEFAULT 0,
  last_updated              timestamptz DEFAULT now()
);

-- ══════════════════════════════════════
-- 3. APP DAILY METRICS — one row per app per day
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_daily_metrics (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app           text NOT NULL CHECK (app IN ('lifelink','vision-sync','aisales')),
  date          date NOT NULL DEFAULT CURRENT_DATE,
  revenue_pence integer DEFAULT 0,
  new_signups   integer DEFAULT 0,
  new_leads     integer DEFAULT 0,
  active_users  integer DEFAULT 0,
  total_users   integer DEFAULT 0,
  mrr_pence     integer DEFAULT 0,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(app, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_app_date ON app_daily_metrics (app, date DESC);

-- ══════════════════════════════════════
-- RLS POLICIES — anon can INSERT (from apps) and SELECT (from dashboard)
-- ══════════════════════════════════════

-- app_events
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_events" ON app_events;
CREATE POLICY "anon_insert_events" ON app_events FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "anon_read_events" ON app_events;
CREATE POLICY "anon_read_events" ON app_events FOR SELECT TO anon USING (true);

-- app_finance
ALTER TABLE app_finance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_upsert_finance" ON app_finance;
CREATE POLICY "anon_upsert_finance" ON app_finance FOR ALL TO anon USING (true) WITH CHECK (true);

-- app_daily_metrics
ALTER TABLE app_daily_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_upsert_daily" ON app_daily_metrics;
CREATE POLICY "anon_upsert_daily" ON app_daily_metrics FOR ALL TO anon USING (true) WITH CHECK (true);
