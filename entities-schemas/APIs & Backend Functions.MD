## Authentication

```bash
npm install @base44/sdk
```

```javascript
import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "6a677a9b2297537e4f1d8e9f",
  headers: {
    "api_key": "143547b564e740418abbe4191a8ded95"
  }
});
```

## BusinessInfo

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `nome_attivita` | string | Yes |  |
| `indirizzo` | string | Yes |  |
| `telefono` | string | Yes |  |
| `email` | string |  |  |
| `instagram_url` | string |  |  |
| `facebook_link` | string |  |  |
| `whatsapp_link` | string |  |  |
| `google_maps_link` | string |  |  |
| `google_review_link` | string |  |  |
| `orari` | array |  |  |
| `note_orari` | string |  |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/BusinessInfo`
List BusinessInfo records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.BusinessInfo.list();
```

### `POST /entities/BusinessInfo`
Create a BusinessInfo record

```javascript
const record = await base44.entities.BusinessInfo.create({
  // your data
});
```

### `DELETE /entities/BusinessInfo`
Delete multiple BusinessInfo records

```javascript
await base44.entities.BusinessInfo.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  nome_attivita: "Example nome_attivita"
});
```

### `POST /entities/BusinessInfo/bulk`
Bulk create BusinessInfo records

```javascript
const records = await base44.entities.BusinessInfo.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/BusinessInfo/bulk`
Bulk update BusinessInfo records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/BusinessInfo/update-many`
Update many BusinessInfo records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/BusinessInfo/{BusinessInfo_id}`
Get a BusinessInfo record by ID

**Parameters:**
- `BusinessInfo_id` (path): Record ID

```javascript
const record = await base44.entities.BusinessInfo.get(recordId);
```

### `PUT /entities/BusinessInfo/{BusinessInfo_id}`
Update a BusinessInfo record

**Parameters:**
- `BusinessInfo_id` (path): Record ID

```javascript
const record = await base44.entities.BusinessInfo.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/BusinessInfo/{BusinessInfo_id}`
Delete a BusinessInfo record

**Parameters:**
- `BusinessInfo_id` (path): Record ID

```javascript
await base44.entities.BusinessInfo.delete(recordId);
```

### `PUT /entities/BusinessInfo/{BusinessInfo_id}/restore`
Restore a deleted BusinessInfo record

**Parameters:**
- `BusinessInfo_id` (path): Record ID

```javascript
const record = await base44.entities.BusinessInfo.restore(recordId);
```

## Service

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes |  |
| `description` | string |  |  |
| `duration_minutes` | number | Yes |  |
| `price` | number | Yes |  |
| `image_url` | string |  |  |
| `active` | boolean |  |  |
| `order` | number |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/Service`
List Service records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.Service.list();
```

### `POST /entities/Service`
Create a Service record

```javascript
const record = await base44.entities.Service.create({
  // your data
});
```

### `DELETE /entities/Service`
Delete multiple Service records

```javascript
await base44.entities.Service.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  name: "Example name"
});
```

### `POST /entities/Service/bulk`
Bulk create Service records

```javascript
const records = await base44.entities.Service.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/Service/bulk`
Bulk update Service records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/Service/update-many`
Update many Service records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/Service/{Service_id}`
Get a Service record by ID

**Parameters:**
- `Service_id` (path): Record ID

```javascript
const record = await base44.entities.Service.get(recordId);
```

### `PUT /entities/Service/{Service_id}`
Update a Service record

**Parameters:**
- `Service_id` (path): Record ID

```javascript
const record = await base44.entities.Service.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/Service/{Service_id}`
Delete a Service record

**Parameters:**
- `Service_id` (path): Record ID

```javascript
await base44.entities.Service.delete(recordId);
```

### `PUT /entities/Service/{Service_id}/restore`
Restore a deleted Service record

**Parameters:**
- `Service_id` (path): Record ID

```javascript
const record = await base44.entities.Service.restore(recordId);
```

## Booking

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `date` | string | Yes |  |
| `start_time` | string | Yes |  |
| `duration_minutes` | number | Yes |  |
| `slots_count` | number |  |  |
| `client_name` | string |  |  |
| `client_email` | string |  |  |
| `client_phone` | string |  |  |
| `service_id` | string |  |  |
| `service_name` | string |  |  |
| `staff_id` | string |  |  |
| `staff_name` | string |  |  |
| `status` | `booked`, `confirmed`, `blocked`, `completed`, `cancelled`, `no_show` | Yes |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/Booking`
List Booking records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.Booking.list();
```

### `POST /entities/Booking`
Create a Booking record

```javascript
const record = await base44.entities.Booking.create({
  // your data
});
```

### `DELETE /entities/Booking`
Delete multiple Booking records

```javascript
await base44.entities.Booking.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  date: "Example date"
});
```

### `POST /entities/Booking/bulk`
Bulk create Booking records

```javascript
const records = await base44.entities.Booking.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/Booking/bulk`
Bulk update Booking records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/Booking/update-many`
Update many Booking records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/Booking/{Booking_id}`
Get a Booking record by ID

**Parameters:**
- `Booking_id` (path): Record ID

```javascript
const record = await base44.entities.Booking.get(recordId);
```

### `PUT /entities/Booking/{Booking_id}`
Update a Booking record

**Parameters:**
- `Booking_id` (path): Record ID

```javascript
const record = await base44.entities.Booking.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/Booking/{Booking_id}`
Delete a Booking record

**Parameters:**
- `Booking_id` (path): Record ID

```javascript
await base44.entities.Booking.delete(recordId);
```

### `PUT /entities/Booking/{Booking_id}/restore`
Restore a deleted Booking record

**Parameters:**
- `Booking_id` (path): Record ID

```javascript
const record = await base44.entities.Booking.restore(recordId);
```

## OpeningHours

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `days` | array | Yes |  |
| `slot_minutes` | number | Yes |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/OpeningHours`
List OpeningHours records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.OpeningHours.list();
```

### `POST /entities/OpeningHours`
Create a OpeningHours record

```javascript
const record = await base44.entities.OpeningHours.create({
  // your data
});
```

### `DELETE /entities/OpeningHours`
Delete multiple OpeningHours records

```javascript
await base44.entities.OpeningHours.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  days: []
});
```

### `POST /entities/OpeningHours/bulk`
Bulk create OpeningHours records

```javascript
const records = await base44.entities.OpeningHours.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/OpeningHours/bulk`
Bulk update OpeningHours records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/OpeningHours/update-many`
Update many OpeningHours records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/OpeningHours/{OpeningHours_id}`
Get a OpeningHours record by ID

**Parameters:**
- `OpeningHours_id` (path): Record ID

```javascript
const record = await base44.entities.OpeningHours.get(recordId);
```

### `PUT /entities/OpeningHours/{OpeningHours_id}`
Update a OpeningHours record

**Parameters:**
- `OpeningHours_id` (path): Record ID

```javascript
const record = await base44.entities.OpeningHours.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/OpeningHours/{OpeningHours_id}`
Delete a OpeningHours record

**Parameters:**
- `OpeningHours_id` (path): Record ID

```javascript
await base44.entities.OpeningHours.delete(recordId);
```

### `PUT /entities/OpeningHours/{OpeningHours_id}/restore`
Restore a deleted OpeningHours record

**Parameters:**
- `OpeningHours_id` (path): Record ID

```javascript
const record = await base44.entities.OpeningHours.restore(recordId);
```

## HomepageContent

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `hero_title` | string |  |  |
| `hero_subtitle` | string |  |  |
| `chi_siamo_titolo` | string |  |  |
| `chi_siamo_testo` | string |  |  |
| `card1_numero` | string |  |  |
| `card1_testo` | string |  |  |
| `card2_numero` | string |  |  |
| `card2_testo` | string |  |  |
| `card3_numero` | string |  |  |
| `card3_testo` | string |  |  |
| `footer_description` | string |  |  |
| `about_chi_siamo` | string |  |  |
| `about_come_funziona` | string |  |  |
| `about_team` | string |  |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/HomepageContent`
List HomepageContent records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.HomepageContent.list();
```

### `POST /entities/HomepageContent`
Create a HomepageContent record

```javascript
const record = await base44.entities.HomepageContent.create({
  // your data
});
```

### `DELETE /entities/HomepageContent`
Delete multiple HomepageContent records

```javascript
await base44.entities.HomepageContent.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  field: "value"
});
```

### `POST /entities/HomepageContent/bulk`
Bulk create HomepageContent records

```javascript
const records = await base44.entities.HomepageContent.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/HomepageContent/bulk`
Bulk update HomepageContent records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/HomepageContent/update-many`
Update many HomepageContent records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/HomepageContent/{HomepageContent_id}`
Get a HomepageContent record by ID

**Parameters:**
- `HomepageContent_id` (path): Record ID

```javascript
const record = await base44.entities.HomepageContent.get(recordId);
```

### `PUT /entities/HomepageContent/{HomepageContent_id}`
Update a HomepageContent record

**Parameters:**
- `HomepageContent_id` (path): Record ID

```javascript
const record = await base44.entities.HomepageContent.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/HomepageContent/{HomepageContent_id}`
Delete a HomepageContent record

**Parameters:**
- `HomepageContent_id` (path): Record ID

```javascript
await base44.entities.HomepageContent.delete(recordId);
```

### `PUT /entities/HomepageContent/{HomepageContent_id}/restore`
Restore a deleted HomepageContent record

**Parameters:**
- `HomepageContent_id` (path): Record ID

```javascript
const record = await base44.entities.HomepageContent.restore(recordId);
```

## Closures

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `start_date` | string | Yes |  |
| `end_date` | string |  |  |
| `type` | `closed`, `modified` | Yes |  |
| `open_time` | string |  |  |
| `close_time` | string |  |  |
| `note` | string |  |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/Closures`
List Closures records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.Closures.list();
```

### `POST /entities/Closures`
Create a Closures record

```javascript
const record = await base44.entities.Closures.create({
  // your data
});
```

### `DELETE /entities/Closures`
Delete multiple Closures records

```javascript
await base44.entities.Closures.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  start_date: "Example start_date"
});
```

### `POST /entities/Closures/bulk`
Bulk create Closures records

```javascript
const records = await base44.entities.Closures.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/Closures/bulk`
Bulk update Closures records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/Closures/update-many`
Update many Closures records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/Closures/{Closures_id}`
Get a Closures record by ID

**Parameters:**
- `Closures_id` (path): Record ID

```javascript
const record = await base44.entities.Closures.get(recordId);
```

### `PUT /entities/Closures/{Closures_id}`
Update a Closures record

**Parameters:**
- `Closures_id` (path): Record ID

```javascript
const record = await base44.entities.Closures.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/Closures/{Closures_id}`
Delete a Closures record

**Parameters:**
- `Closures_id` (path): Record ID

```javascript
await base44.entities.Closures.delete(recordId);
```

### `PUT /entities/Closures/{Closures_id}/restore`
Restore a deleted Closures record

**Parameters:**
- `Closures_id` (path): Record ID

```javascript
const record = await base44.entities.Closures.restore(recordId);
```

## Staff

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes |  |
| `photo_url` | string |  |  |
| `specialization` | string |  |  |
| `order` | number |  |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/Staff`
List Staff records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.Staff.list();
```

### `POST /entities/Staff`
Create a Staff record

```javascript
const record = await base44.entities.Staff.create({
  // your data
});
```

### `DELETE /entities/Staff`
Delete multiple Staff records

```javascript
await base44.entities.Staff.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  name: "Example name"
});
```

### `POST /entities/Staff/bulk`
Bulk create Staff records

```javascript
const records = await base44.entities.Staff.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/Staff/bulk`
Bulk update Staff records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/Staff/update-many`
Update many Staff records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/Staff/{Staff_id}`
Get a Staff record by ID

**Parameters:**
- `Staff_id` (path): Record ID

```javascript
const record = await base44.entities.Staff.get(recordId);
```

### `PUT /entities/Staff/{Staff_id}`
Update a Staff record

**Parameters:**
- `Staff_id` (path): Record ID

```javascript
const record = await base44.entities.Staff.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/Staff/{Staff_id}`
Delete a Staff record

**Parameters:**
- `Staff_id` (path): Record ID

```javascript
await base44.entities.Staff.delete(recordId);
```

### `PUT /entities/Staff/{Staff_id}/restore`
Restore a deleted Staff record

**Parameters:**
- `Staff_id` (path): Record ID

```javascript
const record = await base44.entities.Staff.restore(recordId);
```

## PushToken

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | string | Yes |  |
| `token` | string | Yes |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/PushToken`
List PushToken records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.PushToken.list();
```

### `POST /entities/PushToken`
Create a PushToken record

```javascript
const record = await base44.entities.PushToken.create({
  // your data
});
```

### `DELETE /entities/PushToken`
Delete multiple PushToken records

```javascript
await base44.entities.PushToken.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  user_id: "Example user_id"
});
```

### `POST /entities/PushToken/bulk`
Bulk create PushToken records

```javascript
const records = await base44.entities.PushToken.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/PushToken/bulk`
Bulk update PushToken records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/PushToken/update-many`
Update many PushToken records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/PushToken/{PushToken_id}`
Get a PushToken record by ID

**Parameters:**
- `PushToken_id` (path): Record ID

```javascript
const record = await base44.entities.PushToken.get(recordId);
```

### `PUT /entities/PushToken/{PushToken_id}`
Update a PushToken record

**Parameters:**
- `PushToken_id` (path): Record ID

```javascript
const record = await base44.entities.PushToken.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/PushToken/{PushToken_id}`
Delete a PushToken record

**Parameters:**
- `PushToken_id` (path): Record ID

```javascript
await base44.entities.PushToken.delete(recordId);
```

### `PUT /entities/PushToken/{PushToken_id}/restore`
Restore a deleted PushToken record

**Parameters:**
- `PushToken_id` (path): Record ID

```javascript
const record = await base44.entities.PushToken.restore(recordId);
```

## BlockedSlot

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `date` | string | Yes |  |
| `start_time` | string | Yes |  |
| `end_time` | string | Yes |  |
| `staff_id` | string |  |  |
| `staff_name` | string |  |  |
| `note` | string |  |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/BlockedSlot`
List BlockedSlot records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.BlockedSlot.list();
```

### `POST /entities/BlockedSlot`
Create a BlockedSlot record

```javascript
const record = await base44.entities.BlockedSlot.create({
  // your data
});
```

### `DELETE /entities/BlockedSlot`
Delete multiple BlockedSlot records

```javascript
await base44.entities.BlockedSlot.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  date: "Example date"
});
```

### `POST /entities/BlockedSlot/bulk`
Bulk create BlockedSlot records

```javascript
const records = await base44.entities.BlockedSlot.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/BlockedSlot/bulk`
Bulk update BlockedSlot records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/BlockedSlot/update-many`
Update many BlockedSlot records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/BlockedSlot/{BlockedSlot_id}`
Get a BlockedSlot record by ID

**Parameters:**
- `BlockedSlot_id` (path): Record ID

```javascript
const record = await base44.entities.BlockedSlot.get(recordId);
```

### `PUT /entities/BlockedSlot/{BlockedSlot_id}`
Update a BlockedSlot record

**Parameters:**
- `BlockedSlot_id` (path): Record ID

```javascript
const record = await base44.entities.BlockedSlot.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/BlockedSlot/{BlockedSlot_id}`
Delete a BlockedSlot record

**Parameters:**
- `BlockedSlot_id` (path): Record ID

```javascript
await base44.entities.BlockedSlot.delete(recordId);
```

### `PUT /entities/BlockedSlot/{BlockedSlot_id}/restore`
Restore a deleted BlockedSlot record

**Parameters:**
- `BlockedSlot_id` (path): Record ID

```javascript
const record = await base44.entities.BlockedSlot.restore(recordId);
```

## ServicePriceHistory

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `service_id` | string | Yes |  |
| `service_name` | string |  |  |
| `previous_price` | number |  |  |
| `previous_duration` | number |  |  |
| `new_price` | number |  |  |
| `new_duration` | number |  |  |
| `description` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/ServicePriceHistory`
List ServicePriceHistory records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.ServicePriceHistory.list();
```

### `POST /entities/ServicePriceHistory`
Create a ServicePriceHistory record

```javascript
const record = await base44.entities.ServicePriceHistory.create({
  // your data
});
```

### `DELETE /entities/ServicePriceHistory`
Delete multiple ServicePriceHistory records

```javascript
await base44.entities.ServicePriceHistory.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  service_id: "Example service_id"
});
```

### `POST /entities/ServicePriceHistory/bulk`
Bulk create ServicePriceHistory records

```javascript
const records = await base44.entities.ServicePriceHistory.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/ServicePriceHistory/bulk`
Bulk update ServicePriceHistory records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/ServicePriceHistory/update-many`
Update many ServicePriceHistory records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/ServicePriceHistory/{ServicePriceHistory_id}`
Get a ServicePriceHistory record by ID

**Parameters:**
- `ServicePriceHistory_id` (path): Record ID

```javascript
const record = await base44.entities.ServicePriceHistory.get(recordId);
```

### `PUT /entities/ServicePriceHistory/{ServicePriceHistory_id}`
Update a ServicePriceHistory record

**Parameters:**
- `ServicePriceHistory_id` (path): Record ID

```javascript
const record = await base44.entities.ServicePriceHistory.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/ServicePriceHistory/{ServicePriceHistory_id}`
Delete a ServicePriceHistory record

**Parameters:**
- `ServicePriceHistory_id` (path): Record ID

```javascript
await base44.entities.ServicePriceHistory.delete(recordId);
```

### `PUT /entities/ServicePriceHistory/{ServicePriceHistory_id}/restore`
Restore a deleted ServicePriceHistory record

**Parameters:**
- `ServicePriceHistory_id` (path): Record ID

```javascript
const record = await base44.entities.ServicePriceHistory.restore(recordId);
```

## Notification

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | string | Yes |  |
| `tipo` | `nuova_prenotazione`, `prenotazione_confermata`, `prenotazione_cancellata` | Yes |  |
| `messaggio` | string | Yes |  |
| `booking_id` | string |  |  |
| `letta` | boolean |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/Notification`
List Notification records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.Notification.list();
```

### `POST /entities/Notification`
Create a Notification record

```javascript
const record = await base44.entities.Notification.create({
  // your data
});
```

### `DELETE /entities/Notification`
Delete multiple Notification records

```javascript
await base44.entities.Notification.deleteMany({
  // query filter — WARNING: empty {} deletes ALL records
  user_id: "Example user_id"
});
```

### `POST /entities/Notification/bulk`
Bulk create Notification records

```javascript
const records = await base44.entities.Notification.bulkCreate([
  { /* record 1 */ },
  { /* record 2 */ },
]);
```

### `PUT /entities/Notification/bulk`
Bulk update Notification records

```javascript
// bulk-update is not available via SDK — use the REST API
```

### `PATCH /entities/Notification/update-many`
Update many Notification records by query

```javascript
// update-many is not available via SDK — use the REST API
```

### `GET /entities/Notification/{Notification_id}`
Get a Notification record by ID

**Parameters:**
- `Notification_id` (path): Record ID

```javascript
const record = await base44.entities.Notification.get(recordId);
```

### `PUT /entities/Notification/{Notification_id}`
Update a Notification record

**Parameters:**
- `Notification_id` (path): Record ID

```javascript
const record = await base44.entities.Notification.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/Notification/{Notification_id}`
Delete a Notification record

**Parameters:**
- `Notification_id` (path): Record ID

```javascript
await base44.entities.Notification.delete(recordId);
```

### `PUT /entities/Notification/{Notification_id}/restore`
Restore a deleted Notification record

**Parameters:**
- `Notification_id` (path): Record ID

```javascript
const record = await base44.entities.Notification.restore(recordId);
```

## User

### Schema

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | Yes | The email of the user |
| `full_name` | string | Yes | The full name of the user |
| `role` | `admin`, `user` | Yes | The role of the user in the app |
| `first_name` | string |  |  |
| `last_name` | string |  |  |
| `phone` | string |  |  |
| `id` | string |  | Unique record identifier |
| `created_date` | string |  | Record creation timestamp |
| `updated_date` | string |  | Record last update timestamp |
| `created_by_id` | string |  | ID of the user who created the record |

### Endpoints

### `GET /entities/User`
List User records

**Parameters:**
- `q` (query): JSON query filter, e.g. {"status":"active"}
- `limit` (query): Maximum number of records to return
- `skip` (query): Number of records to skip (pagination)
- `sort_by` (query): Field name to sort by. Prefix with '-' for descending order, e.g. -created_date

```javascript
const records = await base44.entities.User.list();
```

### `POST /entities/User`
Create a User record

```javascript
const record = await base44.entities.User.create({
  // your data
});
```

### `GET /entities/User/{User_id}`
Get a User record by ID

**Parameters:**
- `User_id` (path): Record ID

```javascript
const record = await base44.entities.User.get(recordId);
```

### `PUT /entities/User/{User_id}`
Update a User record

**Parameters:**
- `User_id` (path): Record ID

```javascript
const record = await base44.entities.User.update(recordId, {
  // fields to update
});
```

### `DELETE /entities/User/{User_id}`
Delete a User record

**Parameters:**
- `User_id` (path): Record ID

```javascript
await base44.entities.User.delete(recordId);
```

------------------------------------------------------------------
## Backend Functions

### `POST /functions/CancelBooking`
Invoke 'CancelBooking'

```javascript
const result = await base44.functions.CancelBooking({
  // your payload
});
```

### `POST /functions/GetCalendar`
Invoke 'GetCalendar'

```javascript
const result = await base44.functions.GetCalendar({
  // your payload
});
```

### `POST /functions/BlockSlot`
Invoke 'BlockSlot'

```javascript
const result = await base44.functions.BlockSlot({
  // your payload
});
```

### `POST /functions/CompleteBooking`
Invoke 'CompleteBooking'

```javascript
const result = await base44.functions.CompleteBooking({
  // your payload
});
```

### `POST /functions/CreateBooking`
Invoke 'CreateBooking'

```javascript
const result = await base44.functions.CreateBooking({
  // your payload
});
```

### `POST /functions/SendRegistrationConfirmation`
Invoke 'SendRegistrationConfirmation'

```javascript
const result = await base44.functions.SendRegistrationConfirmation({
  // your payload
});
```

### `POST /functions/DeleteAccount`
Invoke 'DeleteAccount'

```javascript
const result = await base44.functions.DeleteAccount({
  // your payload
});
```

### `POST /functions/MarkNoShow`
Invoke 'MarkNoShow'

```javascript
const result = await base44.functions.MarkNoShow({
  // your payload
});
```

### `POST /functions/GetPublicSiteData`
Invoke 'GetPublicSiteData'

```javascript
const result = await base44.functions.GetPublicSiteData({
  // your payload
});
```

### `POST /functions/SendPushNotification`
Invoke 'SendPushNotification'

```javascript
const result = await base44.functions.SendPushNotification({
  // your payload
});
```

### `POST /functions/ConfirmBooking`
Invoke 'ConfirmBooking'

```javascript
const result = await base44.functions.ConfirmBooking({
  // your payload
});
```