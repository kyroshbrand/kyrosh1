-- ═══════════════════════════════════════════════════════════
-- Kyrosh Chatbot — FRESH INSTALL (v3 with pgvector)
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS match_faqs(vector(384), int, float) CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;

-- ═══════════════════════════════════════════════════════════
-- Tables
-- ═══════════════════════════════════════════════════════════

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
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

CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  embedding vector(384)
);

CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moves INT NOT NULL,
  time_taken INT NOT NULL,
  score INT DEFAULT 12,
  mode TEXT DEFAULT 'memory',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(session_id, created_at);
CREATE INDEX idx_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_users_phone ON users(phone);

-- Vector similarity index (IVFFlat for fast cosine search)
CREATE INDEX idx_faqs_embedding ON faqs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- ═══════════════════════════════════════════════════════════
-- Functions
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

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_faqs(
  query_embedding vector(384),
  match_count int DEFAULT 3,
  match_threshold float DEFAULT 0.1
)
RETURNS TABLE (
  id UUID,
  question TEXT,
  answer TEXT,
  category TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.question,
    f.answer,
    f.category,
    1 - (f.embedding <=> query_embedding) AS similarity
  FROM faqs f
  WHERE 1 - (f.embedding <=> query_embedding) > match_threshold
  ORDER BY f.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_users" ON users FOR ALL TO service_role USING (true);

CREATE POLICY "anon_insert_sessions" ON chat_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_sessions" ON chat_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_sessions" ON chat_sessions FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_sessions" ON chat_sessions FOR DELETE TO anon USING (true);
CREATE POLICY "service_all_sessions" ON chat_sessions FOR ALL TO service_role USING (true);

CREATE POLICY "anon_insert_messages" ON messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_messages" ON messages FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE TO anon USING (true);
CREATE POLICY "service_all_messages" ON messages FOR ALL TO service_role USING (true);

CREATE POLICY "anon_select_faqs" ON faqs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_faqs" ON faqs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "service_all_faqs" ON faqs FOR ALL TO service_role USING (true);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_games" ON games FOR SELECT USING (true);
CREATE POLICY "authenticated_insert_games" ON games FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Also allow inserting without explicit auth.uid() if users are mapped differently, but usually user_id matches auth.uid().
-- For this app, it seems custom auth is used since `users` table has a `password_hash`. We will allow insert by anon for now provided user_id is set, or better, we let the API handle it with service_role.
CREATE POLICY "service_all_games" ON games FOR ALL TO service_role USING (true);
CREATE POLICY "anon_insert_games" ON games FOR INSERT TO anon WITH CHECK (true);
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_score_time ON games(moves ASC, time_taken ASC);

-- ═══════════════════════════════════════════════════════════
-- Enable Realtime
-- ═══════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
