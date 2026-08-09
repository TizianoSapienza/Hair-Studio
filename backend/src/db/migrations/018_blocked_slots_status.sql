ALTER TABLE blocked_slots
  ADD COLUMN status text NOT NULL DEFAULT 'blocked'
    CHECK (status IN ('blocked', 'completata', 'no_show'));
