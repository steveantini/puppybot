-- ============================================================
-- Migration: Add user_id to chat_history for per-user persistence
-- ============================================================

ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id, created_at);
