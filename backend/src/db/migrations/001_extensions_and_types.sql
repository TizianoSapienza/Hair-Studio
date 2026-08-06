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
