function toCamelKey(key) {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

//Converte ricorsivamente le chiavi snake_case in camelCase. Applicata una volta sola,
//a livello di risposta HTTP (vedi app.js), così i service possono continuare a lavorare
//con le righe grezze del DB senza dover fare la conversione in ciascun controller.
export function deepCamelCase(value) {
  if (Array.isArray(value)) return value.map(deepCamelCase);
  if (isPlainObject(value)) {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[toCamelKey(key)] = deepCamelCase(val);
    }
    return out;
  }
  return value;
}
