CREATE TABLE service_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  previous_price numeric(10, 2),
  previous_duration_minutes int,
  new_price numeric(10, 2) NOT NULL,
  new_duration_minutes int NOT NULL,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_price_history_service_id ON service_price_history (service_id, changed_at DESC);
