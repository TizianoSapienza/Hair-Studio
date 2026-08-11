CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE user_role AS ENUM ('admin', 'cliente');
CREATE TYPE booking_status AS ENUM ('in_attesa', 'confermata', 'completata', 'cancellata', 'no_show');
CREATE TYPE closure_type AS ENUM ('closed', 'modified');
CREATE TYPE notification_type AS ENUM (
  'nuova_prenotazione',
  'prenotazione_confermata',
  'prenotazione_cancellata'
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email citext UNIQUE NOT NULL,
  phone text NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'cliente',
  -- Permette di revocare gli access token JWT già emessi (stateless) prima della loro
  -- scadenza naturale: il claim "tv" nel token viene confrontato con questo valore ad
  -- ogni richiesta autenticata, incrementandolo ad ogni cambio/reset password.
  token_version int NOT NULL DEFAULT 0,
  email_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  specialization text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration_minutes int NOT NULL CHECK (duration_minutes > 0 AND duration_minutes % 30 = 0),
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  image_url text,
  active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL CHECK (end_time > start_time),
  note text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'blocked' CHECK (status IN ('blocked', 'completata', 'no_show')),
  block_range tsrange GENERATED ALWAYS AS (
    tsrange((blocked_date + start_time), (blocked_date + end_time), '[)')
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blocked_slots ADD CONSTRAINT blocked_slots_no_overlap
  EXCLUDE USING gist (staff_id WITH =, block_range WITH &&);

CREATE INDEX idx_blocked_slots_date_staff ON blocked_slots (blocked_date, staff_id);

CREATE TABLE opening_hours (
  day_of_week smallint PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
  is_open boolean NOT NULL DEFAULT true,
  start_time time,
  end_time time,
  CHECK (NOT is_open OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time))
);

CREATE TABLE app_settings (
  id int PRIMARY KEY CHECK (id = 1),
  slot_minutes int NOT NULL DEFAULT 30 CHECK (slot_minutes > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE business_info (
  id int PRIMARY KEY CHECK (id = 1),
  business_name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text,
  instagram_url text,
  facebook_url text,
  whatsapp_url text,
  google_maps_url text,
  google_review_url text,
  opening_hours_display jsonb NOT NULL DEFAULT '[]'::jsonb,
  logo_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE homepage_content (
  id int PRIMARY KEY CHECK (id = 1),
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  chi_siamo_titolo text,
  chi_siamo_testo text,
  about_image_url text,
  card1_numero text,
  card1_testo text,
  card2_numero text,
  card2_testo text,
  card3_numero text,
  card3_testo text,
  footer_description text,
  gallery1_image_url text,
  gallery2_image_url text,
  gallery3_image_url text,
  about_chi_siamo text,
  about_come_funziona text,
  about_team text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  message text NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

CREATE TABLE push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  device_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens (user_id);

CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  replaced_by uuid REFERENCES refresh_tokens(id),
  user_agent text,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens (token_hash);

CREATE TABLE email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verification_codes_code_hash ON email_verification_codes (code_hash);
