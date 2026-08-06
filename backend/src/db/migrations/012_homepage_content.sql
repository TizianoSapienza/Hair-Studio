CREATE TABLE homepage_content (
  id int PRIMARY KEY CHECK (id = 1),
  hero_title text,
  hero_subtitle text,
  chi_siamo_titolo text,
  chi_siamo_testo text,
  card1_numero text,
  card1_testo text,
  card2_numero text,
  card2_testo text,
  card3_numero text,
  card3_testo text,
  footer_description text,
  about_chi_siamo text,
  about_come_funziona text,
  about_team text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
