# TODO — attività da completare quando saranno noti i domini di produzione

## Sicurezza / configurazione

- [ ] **Restringere la Firebase Web API key** (`src/lib/firebase.js`, `public/firebase-messaging-sw.js`,
  progetto Google `hair-studio-331f8`): in Google Cloud Console → Credentials, applicare
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

## Immagini / branding

- [ ] Generare la favicon dal logo del salone e aggiungerla in `public/` (`index.html` ha
  un commento `TODO` nel punto dove va ricollegata).
- [ ] Sostituire il logo placeholder: `SALON.logo_url` in `src/lib/salonConfig.js` è vuoto,
  `Logo.jsx` mostra un rettangolo grigio di fallback finché non c'è un caricamento
  immagini lato admin (previsto, non ancora implementato) o un URL statico da usare
  nel frattempo.
- [ ] Quando si sceglie il provider di storage immagini S3-compatibile (vedi CLAUDE.md),
  valorizzare `WIX_MEDIA_HOSTS` in `src/components/ui/image.jsx` se il provider scelto
  supporta transform URL simili, altrimenti adattare la logica di resize.
- [ ] Aggiungere `public/manifest.json` quando si configura la PWA (necessaria per le push
  su iOS, che funzionano solo da app installata sulla schermata Home — vedi CLAUDE.md).
