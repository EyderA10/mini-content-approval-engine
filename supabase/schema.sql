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
ALTER PUBLICATION supabase_realtime ADD TABLE content_pieces;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_content_pieces_share_token ON content_pieces(share_token);
CREATE INDEX IF NOT EXISTS idx_content_pieces_status ON content_pieces(status);