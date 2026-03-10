-- Sync Hub: AI Assistant Tables
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- AI Configuration (driven by Admin panel)
CREATE TABLE IF NOT EXISTS ai_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default config values
INSERT INTO ai_config (key, value) VALUES
  ('assistant_name', 'Aria'),
  ('personality', 'professional_friendly'),
  ('voice_id', 'default'),
  ('memory_depth', 'full'),
  ('web_search_enabled', 'true'),
  ('business_data_enabled', 'true'),
  ('email_access_enabled', 'true'),
  ('system_prompt_override', '')
ON CONFLICT (key) DO NOTHING;

-- Long-term memory
CREATE TABLE IF NOT EXISTS memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_type text NOT NULL,
  content text NOT NULL,
  importance integer DEFAULT 5,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  last_accessed timestamp with time zone DEFAULT now(),
  access_count integer DEFAULT 0
);

-- Conversation history
CREATE TABLE IF NOT EXISTS conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL,
  content text NOT NULL,
  mode text DEFAULT 'text',
  session_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Open policies (personal use — single user)
CREATE POLICY "Allow all on ai_config" ON ai_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on memories" ON memories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
