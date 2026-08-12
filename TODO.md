# TODO — attività da completare quando saranno noti i domini di produzione

## Sicurezza / configurazione

- [ ] **Restringere la Firebase Web API key** (ora in `VITE_FIREBASE_*` nel `.env`, vedi
  `.env.example` e `src/lib/firebase.js`; progetto Google `hair-studio-331f8`): in Google
  Cloud Console → Credentials, applicare
  alla chiave browser una restrizione "HTTP referrers" limitata al dominio di produzione
  (es. `https://hairstudio.it/*`, `https://www.hairstudio.it/*`). Finché il dominio non è
  deciso la chiave resta senza restrizioni: rischio basso (non protegge dati dell'app, che
  usa auth custom, non Firebase Auth) ma da chiudere prima del lancio pubblico.
- [ ] Nello stesso progetto Google Cloud, disabilitare le API non utilizzate (in particolare
  **Identity Toolkit API**, spesso attiva di default) per evitare che la chiave esposta nel
  bundle possa essere usata per creare account/consumare quota su API non necessarie
  all'app (che non usa Firebase Auth).
- [ ] Impostare `VITE_API_BASE_URL` (https, dominio API di produzione) nelle variabili
  d'ambiente della build di produzione — vedi guard aggiunta in `src/lib/apiClient.js`
  che fa fallire la build se manca o non è `https://` in modalità production.
- [ ] Impostare `FRONTEND_ORIGIN` nel `.env` del backend di produzione al dominio reale del
  frontend (necessario per CORS e per lo scope dei cookie).
- [ ] Fissare `TZ=Europe/Rome` nell'ambiente del processo backend (Dockerfile / env del
  container): senza questo, i controlli su orari/date passate in `scheduleService.js`
  dipendono dal timezone di default del container (spesso UTC), con possibili slot
  rifiutati o accettati erroneamente di 1-2 ore.

## Push notifications (Firebase Cloud Messaging)

- [ ] Le icone in `public/manifest.json` puntano entrambe a `public/img/logo.png`
  (1024×1024, ridimensionata dal browser): va bene per l'MVP, meglio generare asset
  192×192/512×512 dedicati prima del lancio.
