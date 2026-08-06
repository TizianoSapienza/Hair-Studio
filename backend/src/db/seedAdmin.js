import bcrypt from "bcrypt";
import { pool } from "./pool.js";
import { env } from "../config/env.js";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function run() {
  const email = requiredEnv("SEED_ADMIN_EMAIL");
  const password = requiredEnv("SEED_ADMIN_PASSWORD");
  const firstName = requiredEnv("SEED_ADMIN_FIRST_NAME");
  const lastName = requiredEnv("SEED_ADMIN_LAST_NAME");
  const phone = requiredEnv("SEED_ADMIN_PHONE");

  const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.length > 0) {
    console.log(`L'utente admin ${email} esiste già, nessuna azione eseguita.`);
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptCost);

  await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, 'admin')`,
    [firstName, lastName, email, phone, passwordHash]
  );

  console.log(`Admin creato: ${email}`);
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
