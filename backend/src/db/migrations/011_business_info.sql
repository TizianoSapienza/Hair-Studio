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
  updated_at timestamptz NOT NULL DEFAULT now()
);
