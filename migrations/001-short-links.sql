CREATE TABLE IF NOT EXISTS short_links (
  code varchar(10) PRIMARY KEY,
  destination text NOT NULL CHECK (length(destination) <= 2048),
  created_at timestamptz NOT NULL DEFAULT now(),
  disabled boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS short_link_limits (
  bucket text PRIMARY KEY,
  hits integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL
);
