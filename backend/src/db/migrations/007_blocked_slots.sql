CREATE TABLE blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL CHECK (end_time > start_time),
  note text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  block_range tsrange GENERATED ALWAYS AS (
    tsrange((blocked_date + start_time), (blocked_date + end_time), '[)')
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blocked_slots ADD CONSTRAINT blocked_slots_no_overlap
  EXCLUDE USING gist (staff_id WITH =, block_range WITH &&);

CREATE INDEX idx_blocked_slots_date_staff ON blocked_slots (blocked_date, staff_id);
