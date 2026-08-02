# Hair Studio — Contesto progetto

## Cos'è questo progetto

Webapp di prenotazione online per **Hair Studio**, barbershop maschile a 
Mascalucia (CT). Tre operatori fissi: Antonio, Andrea, Santo.

Funzionalità principali: landing page pubblica, registrazione/login 
utenti, prenotazione appuntamenti con calendario a slot, dashboard admin 
per gestione prenotazioni/servizi/staff.

## Stato attuale del codice in questa cartella

Il codice presente è stato **copiato manualmente** da un progetto Base44 
(piattaforma no-code con backend proprietario, non esportabile 
integralmente). È quindi probabile che manchino o siano incomplete:
- Logica di autenticazione e gestione permessi (lato server)
- Regole di validazione backend
- Secrets/chiavi API (Resend, Firebase) — NON presenti nei file, andranno 
  reinserite manualmente in fase di configurazione, mai committate nel 
  repository
- Eventuali funzioni backend custom

Prima di scrivere nuovo codice, analizza sempre cosa è realmente presente 
vs cosa manca, confrontando con lo schema entità descritto sotto.

## Obiettivo della riscrittura

Sostituire il backend Base44 (proprietario, client-side rendering, nessun 
controllo diretto) con uno stack posseduto interamente da noi:
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Autenticazione:** custom, JWT + bcrypt (niente Auth0/Firebase 
  Auth/servizi terzi — l'obiettivo esplicito è indipendenza da 
  piattaforme esterne per la logica core)
- **Frontend:** React esistente, da adattare per chiamare le nuove API 
  invece dell'SDK Base44
- **Hosting previsto:** VPS IONOS, Docker, Nginx/Caddy + Let's Encrypt, 
  deploy via GitHub Actions
- **Storage immagini:** servizio S3-compatibile esterno (non ancora 
  scelto definitivamente)

## Schema entità atteso

| Entità | Note |
|---|---|
| `users` | ruolo: `cliente` o `admin`. Admin non auto-registrabile dal form pubblico. Nome e cognome separati (non derivare da email). |
| `services` | nome, durata (minuti), prezzo |
| `staff` | 3 record fissi (Antonio, Andrea, Santo). Non serve UI di creazione/eliminazione, solo modifica. |
| `bookings` | collegata a `user_id`, `service_id`, `staff_id`. Stati: confermata, completata, cancellata, no-show (distinti tra loro) |
| `opening_hours` | orari standard per giorno della settimana, usati per generare gli slot |
| `closures` | eccezioni (ferie, chiusure straordinarie, orario ridotto per data specifica) — sovrascrivono opening_hours |
| `blocked_slots` | slot bloccati manualmente dall'admin (pause, motivi personali) — separata da bookings per non sporcare le statistiche |
| `push_tokens` | token FCM per utente, relazione 1-a-molti (più dispositivi) |
| `business_info` | dati anagrafici mostrati nel sito (indirizzo, telefono, orari testuali, link social, link recensione Google) — editabile da admin |
| `homepage_content` | testi della home page, editabili da admin (hero, chi siamo, card statistiche) |
| `service_price_history` | storico modifiche prezzo/durata di un servizio, popolato automaticamente ad ogni modifica |
| `notifications` | notifiche in-app (campanella in header): user_id, tipo, messaggio, booking_id di riferimento, letta/non letta |

## Regole di business chiave

- **Slot da 30 minuti.** Servizi più lunghi (es. colore, 60 min) occupano 
  slot consecutivi.
- **Disponibilità per operatore**, non globale: ogni staff ha slot liberi/
  occupati indipendenti dagli altri.
- **Privacy calendario:** utenti (loggati o no) vedono solo "libero"/
  "occupato" per slot, MAI il nome di chi ha prenotato. Solo l'admin vede 
  i dettagli completi di ogni prenotazione. Applicare questa regola a 
  livello di API, non solo di frontend.
- **Eliminazione account:** l'utente può eliminare il proprio account 
  (cancellazione reale e completa dei dati, non un semplice logout). 
  L'ADMIN NON deve mai poter eliminare l'account di un utente.
- **Modifica profilo:** sia utente che admin devono poter modificare 
  nome, cognome, email, password dal proprio profilo.
- **Registrazione:** campi nome e cognome separati; numero di telefono 
  con selezione prefisso internazionale completa (tutti i prefissi, lista 
  scorrevole, bandiera + sigla nazione visibili).

## Integrazioni esterne (da ricreare, non presenti nel codice copiato)

- **Resend** — invio email transazionali (conferma prenotazione), da 
  dominio verificato (sottodominio dedicato tipo mail.hairstudio.it)
- **Firebase Cloud Messaging (Web Push)** — notifiche push, richiede 
  service account per invio server-side + VAPID key per il frontend. Su 
  iOS le push funzionano SOLO se l'app è installata come PWA sulla 
  schermata Home — gestire questo caso nel flusso di richiesta permesso

## Aggiornamenti in tempo reale

La maggior parte delle viste con dati che cambiano frequentemente 
(dashboard admin, calendario/prenotazioni, statistiche, notifiche) deve 
aggiornarsi senza bisogno di refresh manuale. Attenzione ai pattern che 
hanno già causato bug in passato su Base44 e che vanno evitati nella 
riscrittura:
- Annullare/ignorare chiamate dati obsolete quando l'utente cambia 
  rapidamente selezione (es. giorno del calendario)
- Chiudere correttamente le sottoscrizioni realtime precedenti prima di 
  aprirne di nuove
- Debounce (~200-300ms) su interazioni rapide dell'utente
- Mai schermo vuoto durante il caricamento: mantenere dati precedenti o 
  skeleton coerente con lo spazio del contenuto finale

## Design

- Logo minimalista (forbici, font serif, testo "HAIR STUDIO")
- Palette: base bianco caldo/grigio chiaro, testo nero-antracite, colore 
  di accento ocra (dal materiale cartaceo del cliente) — usato con 
  parsimonia (bottoni, hover, dettagli)
- Tema chiaro/scuro con toggle in header (visibile anche a utenti non 
  loggati, non nel profilo), colore ocra adattato per leggibilità/resa in 
  modalità scura
- Nessuna dipendenza da librerie/servizi che re-introducano lock-in su 
  piattaforme terze per funzionalità core (auth, database)

## Cosa NON fare

- Non usare servizi di autenticazione/database-as-a-service gestiti da 
  terzi per la logica core (va contro l'obiettivo di indipendenza del 
  progetto) — va bene invece per servizi accessori intercambiabili via 
  semplice chiamata API (email, push, storage immagini)
- Non introdurre SSR/framework diversi da quanto concordato senza prima 
  discuterne — se emergono limiti importanti del CSR (es. SEO), 
  segnalarlo prima di agire, non decidere autonomamente di cambiare stack
- Non committare mai secrets/chiavi API nel repository
