CREATE TABLE opening_hours (
  day_of_week smallint PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
  is_open boolean NOT NULL DEFAULT true,
  start_time time,
  end_time time,
  CHECK (NOT is_open OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time))
);
