import { pool } from "../db/pool.js";

const FIELDS = [
  "hero_title",
  "hero_subtitle",
  "chi_siamo_titolo",
  "chi_siamo_testo",
  "card1_numero",
  "card1_testo",
  "card2_numero",
  "card2_testo",
  "card3_numero",
  "card3_testo",
  "footer_description",
  "about_chi_siamo",
  "about_come_funziona",
  "about_team",
  "hero_image_url",
  "about_image_url",
  "gallery1_image_url",
  "gallery2_image_url",
  "gallery3_image_url",
];

export async function getHomepageContent() {
  const { rows } = await pool.query("SELECT * FROM homepage_content WHERE id = 1");
  return rows[0] || null;
}

export async function upsertHomepageContent(data) {
  const values = FIELDS.map((snakeField) => {
    const camelField = snakeField.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
    return data[camelField] ?? null;
  });

  const placeholders = FIELDS.map((_, i) => `$${i + 1}`).join(", ");
  const updateSet = FIELDS.map((f) => `${f} = EXCLUDED.${f}`).join(", ");

  const { rows } = await pool.query(
    `INSERT INTO homepage_content (id, ${FIELDS.join(", ")}, updated_at)
     VALUES (1, ${placeholders}, now())
     ON CONFLICT (id) DO UPDATE SET ${updateSet}, updated_at = now()
     RETURNING *`,
    values
  );
  return rows[0];
}
