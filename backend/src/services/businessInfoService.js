import { pool } from "../db/pool.js";

//business_info è una tabella singleton: esiste sempre e solo la riga id=1 (dati anagrafici
//dell'attività, un solo salone), niente relazione con altre entità da id qui.
export async function getBusinessInfo() {
  const { rows } = await pool.query("SELECT * FROM business_info WHERE id = 1");
  return rows[0] || null;
}

export async function upsertBusinessInfo(data) {
  const { rows } = await pool.query(
    `INSERT INTO business_info (
       id, business_name, address, phone, email, instagram_url, facebook_url,
       whatsapp_url, google_maps_url, google_review_url, opening_hours_display, logo_url, updated_at
     ) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
     ON CONFLICT (id) DO UPDATE SET
       business_name = EXCLUDED.business_name,
       address = EXCLUDED.address,
       phone = EXCLUDED.phone,
       email = EXCLUDED.email,
       instagram_url = EXCLUDED.instagram_url,
       facebook_url = EXCLUDED.facebook_url,
       whatsapp_url = EXCLUDED.whatsapp_url,
       google_maps_url = EXCLUDED.google_maps_url,
       google_review_url = EXCLUDED.google_review_url,
       opening_hours_display = EXCLUDED.opening_hours_display,
       logo_url = EXCLUDED.logo_url,
       updated_at = now()
     RETURNING *`,
    [
      data.businessName,
      data.address,
      data.phone,
      data.email ?? null,
      data.instagramUrl ?? null,
      data.facebookUrl ?? null,
      data.whatsappUrl ?? null,
      data.googleMapsUrl ?? null,
      data.googleReviewUrl ?? null,
      JSON.stringify(data.openingHoursDisplay ?? []),
      data.logoUrl ?? null,
    ]
  );
  return rows[0];
}
