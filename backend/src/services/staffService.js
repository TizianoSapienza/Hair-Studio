import { pool } from "../db/pool.js";

export async function listStaff() {
  const { rows } = await pool.query("SELECT * FROM staff ORDER BY display_order, name");
  return rows;
}

export async function getStaffById(id) {
  const { rows } = await pool.query("SELECT * FROM staff WHERE id = $1", [id]);
  return rows[0] || null;
}

//Riordino in un solo UPDATE invece di N chiamate separate.
export async function reorderStaff(orderedIds) {
  const { rows } = await pool.query(
    `UPDATE staff
     SET display_order = v.ord - 1, updated_at = now()
     FROM unnest($1::uuid[]) WITH ORDINALITY AS v(id, ord)
     WHERE staff.id = v.id
     RETURNING staff.*`,
    [orderedIds]
  );
  return rows;
}

export async function updateStaff(id, data) {
  const current = await getStaffById(id);
  if (!current) return null;

  const { rows } = await pool.query(
    `UPDATE staff
     SET name = $2, photo_url = $3, specialization = $4, display_order = $5, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.name ?? current.name,
      data.photoUrl ?? current.photo_url,
      data.specialization ?? current.specialization,
      data.displayOrder ?? current.display_order,
    ]
  );
  return rows[0];
}
