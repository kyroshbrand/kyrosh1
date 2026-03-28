-- ═══════════════════════════════════════════════════════════
-- Kyrosh Chatbot — FRESH INSTALL
-- Drops everything and recreates from scratch
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Drop existing (order matters)
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ═══════════════════════════════════════════════════════════
-- Tables
-- ═══════════════════════════════════════════════════════════

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_human_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'bot', 'admin')),
  content TEXT NOT NULL,
  is_seen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(session_id, created_at);
CREATE INDEX idx_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_users_phone ON users(phone);

-- ═══════════════════════════════════════════════════════════
-- Auto-update trigger
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_users" ON users FOR ALL TO service_role USING (true);

CREATE POLICY "anon_insert_sessions" ON chat_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_sessions" ON chat_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_sessions" ON chat_sessions FOR UPDATE TO anon USING (true);
CREATE POLICY "service_all_sessions" ON chat_sessions FOR ALL TO service_role USING (true);

CREATE POLICY "anon_insert_messages" ON messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_messages" ON messages FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE TO anon USING (true);
CREATE POLICY "service_all_messages" ON messages FOR ALL TO service_role USING (true);

-- ═══════════════════════════════════════════════════════════
-- Enable Realtime
-- ═══════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
