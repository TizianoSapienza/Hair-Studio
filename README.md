# Hair Studio

Webapp di prenotazione online per **Hair Studio**, barbershop maschile con tre operatori fissi. Landing page pubblica, autenticazione utenti, prenotazione appuntamenti con calendario a slot, dashboard admin per gestione completa di prenotazioni/servizi/staff/contenuti.

Il progetto nasce come riscrittura completa di un prototipo Base44 (no-code, backend proprietario): l'obiettivo è uno stack posseduto interamente, senza dipendenze da piattaforme terze per auth e database. Vedi `CLAUDE.md` per il contesto di progetto esteso.

## Stack tecnologico

**Frontend**
- React 18 + Vite, routing con `react-router-dom`
- Tailwind CSS + componenti shadcn/ui (Radix UI sotto il cofano)
- TanStack React Query per data-fetching/cache lato client
- `react-hook-form` + `zod` per i form
- Server-Sent Events (via `EventSource`) per gli aggiornamenti in tempo reale
- Firebase Cloud Messaging (solo SDK client, per le push — vedi sezione dedicata)

**Backend**
- Node.js + Express
- PostgreSQL (driver `pg`, query SQL dirette, nessun ORM), migrazioni custom (script proprio, non Knex/Prisma)
- Autenticazione custom: JWT (access + refresh token) + bcrypt, nessun servizio di auth-as-a-service
- `zod` per la validazione degli input a livello di rotta
- `helmet` + `express-rate-limit` per hardening HTTP e rate limiting sugli endpoint sensibili (login, registrazione, reset password)
- AWS S3 (via `@aws-sdk/client-s3` + presigned URL) per l'upload delle immagini
- Resend (via `fetch`, nessun SDK) per le email transazionali

Non ci sono servizi gestiti di terze parti per la logica core (niente Auth0/Firebase Auth/Supabase): database e autenticazione sono interamente sotto controllo del backend.

## Architettura e logiche principali

### Autenticazione
JWT a doppio token: **access token** di breve durata (15 minuti, in cookie httpOnly) usato per autenticare le richieste API, e **refresh token** di lunga durata (30 giorni) usato solo per riottenere un nuovo access token, con rotazione ad ogni refresh (il vecchio refresh token viene invalidato e sostituito). Un campo `token_version` sull'utente permette di revocare tutte le sessioni attive istantaneamente (es. dopo un reset password), anche se gli access token già emessi non sono ancora scaduti.

La **registrazione richiede la verifica dell'email via codice OTP** a 6 cifre (validità 15 minuti): l'account viene creato ma resta bloccato in login finché il codice non viene confermato. Il **recupero password** avviene solo tramite link a scadenza (1 ora) ricevuto via email — non esiste più un form "cambia password" nel profilo, solo un bottone che innesca l'invio dell'email di reset.

### Prenotazioni e disponibilità
Gli slot sono da **30 minuti**; servizi più lunghi (es. colore, 60 minuti) occupano più slot consecutivi. La disponibilità è **per singolo operatore**, non globale: ogni membro dello staff ha slot liberi/occupati indipendenti dagli altri. A livello di database, la non-sovrapposizione degli appuntamenti per lo stesso operatore è garantita da un **vincolo `EXCLUDE` con `btree_gist`** su un intervallo temporale generato (`tsrange`), non solo da controlli applicativi — evita race condition su prenotazioni concorrenti. Lo stesso pattern è usato per gli slot bloccati manualmente dall'admin (pause, chiusure impreviste), tenuti in una tabella separata dalle prenotazioni per non sporcare le statistiche.

Gli orari disponibili derivano da `opening_hours` (orario standard settimanale) e vengono sovrascritti da eventuali `closures` (ferie, chiusure straordinarie o orario ridotto per una data specifica).

**Privacy del calendario**: chiunque (loggato o no) vede solo "libero"/"occupato" per ogni slot, mai il nome di chi ha prenotato — la regola è applicata lato API, non solo nascosta in UI, quindi il dettaglio non viene proprio inviato al client se il chiamante non è admin.

Gli stati di una prenotazione (`in_attesa`, `confermata`, `completata`, `cancellata`, `no_show`) sono gestiti da un'unica funzione di transizione centralizzata nel backend, così tutte le regole (email da inviare, notifiche, validità della transizione) restano in un solo posto invece di essere duplicate per ogni azione admin.

### Aggiornamenti in tempo reale
Le viste con dati che cambiano spesso (dashboard admin, calendario, notifiche) si aggiornano da sole via **Server-Sent Events**, senza polling né refresh manuale: un `EventEmitter` in-process sul backend pubblica eventi (nuova prenotazione, conferma, cancellazione, ecc.) su due canali — uno broadcast per l'admin, uno per-utente per le notifiche. Il frontend chiude sempre la sottoscrizione precedente prima di aprirne una nuova, applica debounce (~200-300ms) sulle interazioni rapide (es. cambio giorno nel calendario) e non mostra mai schermate vuote in caricamento (skeleton o dati precedenti mantenuti) — pattern introdotti per evitare bug già visti nel prototipo originale.

> Nota: il bus eventi è in-process, quindi funziona finché il backend gira su una singola istanza; uno scale-out multi-istanza richiederebbe un pub/sub condiviso (es. Redis).

### Email transazionali
Tre soli tipi di email, tutte con lo stesso template HTML brandizzato (palette e font coerenti col resto del sito):
1. **Conferma registrazione** — codice OTP per sbloccare il login.
2. **Recupero password** — link di reset a scadenza.
3. **Conferma/cancellazione prenotazione** — inviata **solo** quando l'azione è compiuta dall'admin (conferma o cancellazione lato gestionale); se è l'utente stesso a cancellare una propria prenotazione non riceve alcuna email, dato che l'ha appena fatto lui stesso.

L'invio è sempre "fire-and-forget" rispetto alla scrittura sul database (non blocca mai la risposta API), e se Resend non è configurato l'invio viene semplicemente saltato senza errori — utile in sviluppo (vedi sezione "Email in locale" più sotto).

### Upload immagini
Le immagini (foto staff, contenuti homepage, logo) vengono caricate direttamente dal browser su S3 tramite **URL presigned** generati dal backend (il backend non fa mai da proxy per i file binari). L'admin ha anche una **Galleria** che elenca le immagini già caricate in passato sul bucket, per riutilizzarle senza doverle ricaricare.

### Contenuti gestibili da admin
Senza accesso al codice, l'admin può modificare da dashboard: testi e immagini della homepage (hero, sezione "chi siamo", card statistiche, galleria), il logo, i dati dell'attività (indirizzo, telefono, social, link recensioni Google), gli orari di apertura e le chiusure straordinarie, l'elenco servizi (nome/durata/prezzo/immagine) con **storico automatico** delle modifiche a prezzo e durata.

## Funzionalità

**Pubbliche**
- Landing page con contenuti dinamici (hero, chi siamo, servizi, staff, galleria)
- Registrazione (nome/cognome separati, telefono con prefisso internazionale selezionabile) e login con verifica email via OTP
- Recupero password via email
- Prenotazione appuntamento: scelta servizio → operatore → data/ora su calendario a slot, senza esporre dettagli altrui
- Tema chiaro/scuro con transizione animata (View Transitions API), toggle visibile anche da utente non loggato

**Area utente**
- Le mie prenotazioni (storico, cancellazione)
- Profilo: modifica nome/cognome/email/telefono, richiesta reset password, eliminazione account (cancellazione reale dei dati — l'admin non può mai eliminare l'account di un utente)
- Notifiche in-app in tempo reale

**Area admin**
- Dashboard prenotazioni con calendario per operatore, azioni conferma/cancella/segna completata/no-show
- Gestione slot bloccati manualmente (pause, motivi personali)
- Gestione servizi (con storico prezzo/durata) e staff (3 operatori fissi, solo modifica)
- Gestione orari di apertura e chiusure straordinarie
- Gestione contenuti homepage e impostazioni attività (inclusi tutti gli upload immagine + logo)
- Statistiche
- Gestione clienti

## Setup locale

### 1. Database

Serve un PostgreSQL raggiungibile (locale o Docker). L'indirizzo va in `DATABASE_URL` (vedi punto 2).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Apri **`backend/.env`** (creato dal comando sopra) e compila i valori:

| Variabile | Dove/come | Obbligatoria |
|---|---|---|
| `DATABASE_URL` | connessione al Postgres del punto 1 | sì — il server non parte senza |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | qualunque stringa lunga/casuale, una a piacere per ciascuna | sì |
| `S3_BUCKET` / `S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | bucket S3 (o compatibile) per l'upload immagini | sì |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / ... | credenziali del primo account admin, usate solo da `npm run seed:admin` | sì, prima del seed |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | vedi sezione Email sotto | no |
| `FCM_SERVICE_ACCOUNT_JSON` | per le push Firebase Cloud Messaging lato server | no |

Poi:

```bash
npm run migrate      # applica le migrazioni in backend/src/db/migrations
npm run seed:admin   # crea l'account admin dalle SEED_ADMIN_* qui sopra
npm run dev          # http://localhost:4000
```

### 3. Frontend

```bash
npm install
npm run dev   # http://localhost:5173, VITE_API_BASE_URL default http://localhost:4000/api
```

## Email in locale (registrazione OTP, recupero password, prenotazioni)

Il backend usa [Resend](https://resend.com) per le email transazionali. **Senza `RESEND_API_KEY`/`RESEND_FROM_EMAIL` in `backend/.env`, l'invio viene semplicemente saltato** (nessun errore, nessun blocco) — utile per sviluppare senza configurare nulla.

In questo caso il codice OTP e il link di reset password non arrivano via email, ma **compaiono nella console del backend** (`npm run dev`), come:
```
[dev] Codice OTP per mario@esempio.com: 482913
[dev] Link di reset password per mario@esempio.com: http://localhost:5173/reset-password?token=...
```
(questi log sono disattivati automaticamente quando `NODE_ENV=production`). Questo è il modo più semplice per testare il flusso completo — registrazione, verifica, recupero password, conferma/cancellazione prenotazione da admin — senza toccare Resend.

Se invece vuoi vedere le email vere arrivare in una casella di posta, configura Resend (`RESEND_API_KEY` dal tuo account, `RESEND_FROM_EMAIL=onboarding@resend.dev` — nessun dominio proprio necessario). **Attenzione**: senza un dominio verificato su Resend, si può inviare solo all'indirizzo email con cui hai creato l'account Resend — qualunque altro destinatario viene rifiutato silenziosamente (l'errore finisce comunque nel log del backend). Per testare con email vere devi quindi registrare l'account cliente di prova usando proprio quell'indirizzo.

## Build

```bash
npm run build              # frontend, richiede VITE_API_BASE_URL su https:// in produzione
cd backend && npm start    # backend
```

## Hosting previsto

VPS IONOS, containerizzato con Docker, reverse proxy Nginx/Caddy con Let's Encrypt per HTTPS, deploy via GitHub Actions.
