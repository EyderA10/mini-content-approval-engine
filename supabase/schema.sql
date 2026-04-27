-- Database Schema: content_pieces table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  client_feedback TEXT,
  client_name TEXT,
  client_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime for this table
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE content_pieces;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure UPDATE/DELETE events include full record payloads
ALTER TABLE content_pieces REPLICA IDENTITY FULL;

-- Allow browser anon role to read rows for dashboard + realtime
GRANT SELECT ON TABLE content_pieces TO anon;

-- If RLS is enabled, this policy allows anon read access.
-- Keep disabled if you intentionally require auth to read.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'content_pieces'
      AND policyname = 'anon_select_content_pieces'
  ) THEN
    CREATE POLICY anon_select_content_pieces
      ON public.content_pieces
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_content_pieces_share_token ON content_pieces(share_token);
CREATE INDEX IF NOT EXISTS idx_content_pieces_status ON content_pieces(status);