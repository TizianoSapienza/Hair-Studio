CREATE TABLE app_settings (
  id int PRIMARY KEY CHECK (id = 1),
  slot_minutes int NOT NULL DEFAULT 30 CHECK (slot_minutes > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
