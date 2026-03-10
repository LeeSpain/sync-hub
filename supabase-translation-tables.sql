-- Sync Hub: Translation System Tables
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- Translation sessions
CREATE TABLE IF NOT EXISTS translation_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code text UNIQUE NOT NULL,
  language_a text DEFAULT 'en',
  language_b text NOT NULL,
  status text DEFAULT 'waiting',
  created_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + interval '2 hours')
);

-- Subtitle / translation message history
CREATE TABLE IF NOT EXISTS translation_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code text NOT NULL,
  speaker text NOT NULL,
  original_text text NOT NULL,
  translated_text text NOT NULL,
  language_from text NOT NULL,
  language_to text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE translation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_messages ENABLE ROW LEVEL SECURITY;

-- Open policies (personal use)
CREATE POLICY "Allow all on translation_sessions" ON translation_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on translation_messages" ON translation_messages FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for translation tables (needed for live subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE translation_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE translation_messages;
