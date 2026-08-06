CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
  staff_name text NOT NULL,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  duration_minutes int NOT NULL CHECK (duration_minutes > 0 AND duration_minutes % 30 = 0),
  slots_count int GENERATED ALWAYS AS (duration_minutes / 30) STORED,
  status booking_status NOT NULL DEFAULT 'in_attesa',
  notes text,
  appointment_range tsrange GENERATED ALWAYS AS (
    tsrange(
      (booking_date + start_time),
      (booking_date + start_time) + (duration_minutes * interval '1 minute'),
      '[)'
    )
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (staff_id WITH =, appointment_range WITH &&)
  WHERE (status IN ('in_attesa', 'confermata'));

CREATE INDEX idx_bookings_date_staff ON bookings (booking_date, staff_id);
CREATE INDEX idx_bookings_user_id ON bookings (user_id);
