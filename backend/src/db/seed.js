import { pool } from "./pool.js";

const STAFF = [
  { name: "Andrea", display_order: 0 },
  { name: "Paolo", display_order: 1 },
  { name: "Marco", display_order: 2 },
];

//Lun-Sab 09:00-19:00, Domenica chiuso. Placeholder: modificabile da admin dopo il seed.
const OPENING_HOURS = [
  { day_of_week: 0, is_open: false, start_time: null, end_time: null }, //domenica
  { day_of_week: 0, is_open: false, start_time: null, end_time: null }, //lunedì
  { day_of_week: 2, is_open: true, start_time: "09:00", end_time: "19:00" },
  { day_of_week: 3, is_open: true, start_time: "09:00", end_time: "19:00" },
  { day_of_week: 4, is_open: true, start_time: "09:00", end_time: "19:00" },
  { day_of_week: 5, is_open: true, start_time: "09:00", end_time: "19:00" },
  { day_of_week: 6, is_open: true, start_time: "09:00", end_time: "19:00" },
];

async function seedStaff(client) {
  for (const s of STAFF) {
    await client.query(
      `INSERT INTO staff (name, display_order)
       SELECT $1, $2
       WHERE NOT EXISTS (SELECT 1 FROM staff WHERE name = $1)`,
      [s.name, s.display_order]
    );
  }
}

async function seedOpeningHours(client) {
  for (const oh of OPENING_HOURS) {
    await client.query(
      `INSERT INTO opening_hours (day_of_week, is_open, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (day_of_week) DO NOTHING`,
      [oh.day_of_week, oh.is_open, oh.start_time, oh.end_time]
    );
  }
}

async function seedAppSettings(client) {
  await client.query(
    `INSERT INTO app_settings (id, slot_minutes) VALUES (1, 30) ON CONFLICT (id) DO NOTHING`
  );
}

async function seedBusinessInfo(client) {
  await client.query(
    `INSERT INTO business_info (id, business_name, address, phone)
     VALUES (1, 'Hair Studio', 'Ignoto (ZZ)', '')
     ON CONFLICT (id) DO NOTHING`
  );
}

async function seedHomepageContent(client) {
  await client.query(
    `INSERT INTO homepage_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING`
  );
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedStaff(client);
    await seedOpeningHours(client);
    await seedAppSettings(client);
    await seedBusinessInfo(client);
    await seedHomepageContent(client);
    await client.query("COMMIT");
    console.log("Seed completato.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
