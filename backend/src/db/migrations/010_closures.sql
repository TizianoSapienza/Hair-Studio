CREATE TABLE closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  end_date date CHECK (end_date IS NULL OR end_date >= start_date),
  closure_type closure_type NOT NULL DEFAULT 'closed',
  open_time time,
  close_time time,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    closure_type = 'closed'
    OR (open_time IS NOT NULL AND close_time IS NOT NULL AND close_time > open_time)
  )
);

CREATE INDEX idx_closures_start_date ON closures (start_date);
