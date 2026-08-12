import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Hair Studio backend in ascolto sulla porta ${env.port} (${env.nodeEnv})`);
});


//Funzione per gestire la chiusura pulita
const gracefulShutdown = (signal) => {
  console.log(`Ricevuto segnale ${signal}. Chiusura del server in corso...`);
  
  process.on('SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  process.exit(0);
});
  setTimeout(() => {
    console.error('Chiusura forzata a causa del timeout.');
    process.exit(1);
  }, 3000);
};