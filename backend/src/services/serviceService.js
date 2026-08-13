import { pool, withTransaction } from "../db/pool.js";

export async function listActiveServices() {
  const { rows } = await pool.query(
    "SELECT * FROM services WHERE active = true ORDER BY display_order, name"
  );
  return rows;
}

export async function listAllServices() {
  const { rows } = await pool.query("SELECT * FROM services ORDER BY display_order, name");
  return rows;
}

export async function getServiceById(id) {
  const { rows } = await pool.query("SELECT * FROM services WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createService(data) {
  const { rows } = await pool.query(
    `INSERT INTO services (name, description, duration_minutes, price, image_url, active, display_order)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, true), COALESCE($7, 0))
     RETURNING *`,
    [
      data.name,
      data.description ?? null,
      data.durationMinutes,
      data.price,
      data.imageUrl ?? null,
      data.active,
      data.displayOrder,
    ]
  );
  return rows[0];
}

//FOR UPDATE serializza due modifiche concorrenti allo stesso servizio: senza il lock, due
//richieste potrebbero leggere lo stesso `current` e una delle due varianti di prezzo/durata
//andrebbe persa nello storico invece di generare la propria riga in service_price_history.
export async function updateService(id, data, userId) {
  return withTransaction(async (client) => {
    const { rows: currentRows } = await client.query("SELECT * FROM services WHERE id = $1 FOR UPDATE", [id]);
    const current = currentRows[0];
    if (!current) return null;

    const priceChanged = data.price !== undefined && Number(data.price) !== Number(current.price);
    const durationChanged =
      data.durationMinutes !== undefined && data.durationMinutes !== current.duration_minutes;

    const next = {
      name: data.name ?? current.name,
      description: data.description ?? current.description,
      durationMinutes: data.durationMinutes ?? current.duration_minutes,
      price: data.price ?? current.price,
      imageUrl: data.imageUrl ?? current.image_url,
      active: data.active ?? current.active,
      displayOrder: data.displayOrder ?? current.display_order,
    };

    const { rows } = await client.query(
      `UPDATE services
       SET name = $2, description = $3, duration_minutes = $4, price = $5,
           image_url = $6, active = $7, display_order = $8, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        next.name,
        next.description,
        next.durationMinutes,
        next.price,
        next.imageUrl,
        next.active,
        next.displayOrder,
      ]
    );

    if (priceChanged || durationChanged) {
      await client.query(
        `INSERT INTO service_price_history
           (service_id, service_name, previous_price, previous_duration_minutes, new_price, new_duration_minutes, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, next.name, current.price, current.duration_minutes, next.price, next.durationMinutes, userId]
      );
    }

    return rows[0];
  });
}

//Riordino in un solo UPDATE invece di N chiamate separate.
export async function reorderServices(orderedIds) {
  const { rows } = await pool.query(
    `UPDATE services
     SET display_order = v.ord - 1, updated_at = now()
     FROM unnest($1::uuid[]) WITH ORDINALITY AS v(id, ord)
     WHERE services.id = v.id
     RETURNING services.*`,
    [orderedIds]
  );
  return rows;
}

export async function deleteService(id) {
  await pool.query("DELETE FROM services WHERE id = $1", [id]);
}

export async function getServicePriceHistory(serviceId) {
  const { rows } = await pool.query(
    `SELECT * FROM service_price_history WHERE service_id = $1 ORDER BY changed_at DESC LIMIT 50`,
    [serviceId]
  );
  return rows;
}
