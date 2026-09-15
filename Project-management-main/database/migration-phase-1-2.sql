BEGIN;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE meeting_minutes
  ADD COLUMN IF NOT EXISTS blocker TEXT,
  ADD COLUMN IF NOT EXISTS decision TEXT,
  ADD COLUMN IF NOT EXISTS action TEXT,
  ADD COLUMN IF NOT EXISTS action_owner TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS action_status TEXT NOT NULL DEFAULT 'Open',
  ADD COLUMN IF NOT EXISTS review_state TEXT NOT NULL DEFAULT 'Reviewed',
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_month TEXT;

CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_state (key, version)
VALUES ('portfolio', 1)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION bump_portfolio_version()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE app_state
  SET version = version + 1,
      updated_at = NOW()
  WHERE key = 'portfolio';
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_bump_portfolio_version ON projects;
CREATE TRIGGER projects_bump_portfolio_version
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH STATEMENT EXECUTE FUNCTION bump_portfolio_version();

DROP TRIGGER IF EXISTS meetings_bump_portfolio_version ON meeting_minutes;
CREATE TRIGGER meetings_bump_portfolio_version
AFTER INSERT OR UPDATE OR DELETE ON meeting_minutes
FOR EACH STATEMENT EXECUTE FUNCTION bump_portfolio_version();

CREATE TABLE IF NOT EXISTS auth_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_time
ON auth_attempts (ip_address, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_meeting_review_month
ON meeting_minutes (review_month);

CREATE INDEX IF NOT EXISTS idx_meeting_action_status
ON meeting_minutes (action_status);

UPDATE projects
SET status = CASE
  WHEN LOWER(TRIM(status)) IN ('done', 'completed', 'complete') THEN 'Done'
  WHEN LOWER(TRIM(status)) = 'late' THEN 'Late'
  WHEN LOWER(TRIM(status)) IN ('on progress', 'on going', 'ongoing', 'in progress') THEN 'On Progress'
  ELSE 'Not Started'
END;

UPDATE meeting_minutes
SET status = CASE
  WHEN LOWER(TRIM(status)) IN ('done', 'completed', 'complete') THEN 'Done'
  WHEN LOWER(TRIM(status)) = 'late' THEN 'Late'
  WHEN LOWER(TRIM(status)) IN ('on progress', 'on going', 'ongoing', 'in progress') THEN 'On Progress'
  ELSE COALESCE(NULLIF(status, ''), 'Not Started')
END,
reviewed_at = COALESCE(reviewed_at, created_at),
review_month = COALESCE(review_month, TO_CHAR(review_date, 'YYYY-MM'));

COMMIT;

SELECT version, updated_at FROM app_state WHERE key = 'portfolio';
