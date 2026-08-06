import path from "node:path"
import { fileURLToPath } from "node:url"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, "VITE_")

  // Le variabili VITE_* finiscono sempre nel bundle client-side: se manca l'URL del
  // backend di produzione (o punta a un endpoint non-HTTPS), meglio far fallire la
  // build subito piuttosto che pubblicare un bundle che contatta silenziosamente
  // http://localhost:4000 o invia credenziali in chiaro. Vedi TODO.md.
  if (command === "build" && mode === "production") {
    const apiBaseUrl = env.VITE_API_BASE_URL
    if (!apiBaseUrl || !apiBaseUrl.startsWith("https://")) {
      throw new Error(
        "VITE_API_BASE_URL mancante o non-HTTPS: obbligatoria (https://) per la build di produzione."
      )
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
