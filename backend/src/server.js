import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Hair Studio backend in ascolto sulla porta ${env.port} (${env.nodeEnv})`);
});
