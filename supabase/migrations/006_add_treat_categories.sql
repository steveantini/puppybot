-- ============================================================
-- Migration 006: Add Whimzees and Kong Ziggies treat categories
-- ============================================================

ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS whimzees integer DEFAULT 0;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS kong_ziggies integer DEFAULT 0;
