# Design: sostituzione della costante paesi in CountryCodeSelect

Data: 2026-08-05

## Problema

`src/components/profile/CountryCodeSelect.jsx` contiene un array hardcoded
`COUNTRIES` (~65 paesi, prefisso + emoji bandiera + nome scritti a mano).
Va sostituito con dati derivati da una libreria mantenuta, riducendo al
minimo le costanti scritte a mano, mantenendo qualità di codice
medio-alta e senza rompere il contratto esistente con `Register.jsx` e
`Profile.jsx` (`value`/`onChange` come stringa di prefisso, es. `"+39"`).

## Decisioni

- **Copertura**: lista curata di ~85 paesi (tutta l'Europa + i principali
  del resto del mondo), non tutti i ~250 supportati dalla libreria — un
  dropdown con centinaia di micro-stati/territori poco rilevanti per la
  clientela del salone è rumore, non valore. La lista di ISO da includere
  è hardcoded (`CURATED_ISO` in `phoneCountries.js`), ma prefisso/nome/
  bandiera restano sempre calcolati dalla libreria, non scritti a mano.
  **Nota**: la copertura completa introduceva anche un bug reale, non solo
  rumore — l'Italia (`+39`) condivide il prefisso con la Città del
  Vaticano, quindi con tutti e 250 i paesi il valore di default
  dell'app non mostrava alcuna bandiera (fallback 🌐 per prefisso
  ambiguo). Escludendo il Vaticano dalla lista curata il caso
  d'uso principale torna a mostrare la bandiera corretta.
- **UX ricerca**: dropdown con campo di ricerca/filtro (nome, ISO,
  prefisso), non solo scroll.
- **Bundle**: `libphonenumber-js/min` (~25-30KB gzip) va isolato in un
  chunk separato via `React.lazy`, non nel bundle principale (oggi
  `App.jsx` importa tutte le pagine in modo statico, quindi tutto ciò che
  `Register.jsx`/`Profile.jsx` importano staticamente finisce nel bundle
  iniziale scaricato anche dalla landing pubblica).

## Architettura

### `src/lib/phone.js` (nuovo)

Nessuna dipendenza pesante. Esporta `splitPhone(raw)`:

- stringa vuota/nullish → `{ code: "+39", number: "" }`
- se contiene uno spazio → split sul primo spazio: `{ code: primaParte,
  number: restoDellaStringa }`
- se non contiene spazio → `{ code: "+39", number: str }` (nessun
  parsing di prefissi variabili: l'app salva sempre nel formato `"${code}
  ${number}"`, quindi il caso "senza spazio" è solo input malformato/
  legacy, non uno scenario da supportare con logica dedicata — non c'è
  ancora dato di produzione in questo formato da migrare)

Sostituisce l'attuale `splitPhone` esportato da `CountryCodeSelect.jsx`,
che oggi valida il prefisso contro l'array `COUNTRIES`.

### `src/lib/phoneCountries.js` (nuovo)

- `getPhoneCountries()`: array memoizzato (calcolato una sola volta a
  livello di modulo) di `{ iso, name, callingCode }`, costruito da:
  - `CURATED_ISO`: lista hardcoded di ~85 codici ISO 3166-1 alpha-2
    (tutta l'Europa + i principali paesi extra-UE) usata per filtrare
    l'elenco mostrato
  - `getCountries()` e `getCountryCallingCode()` da `libphonenumber-js/min`
    per validare quali ISO curati sono effettivamente supportati e per
    calcolare il prefisso di ciascuno
  - `Intl.DisplayNames(['it'], { type: 'region' })` per il nome
    localizzato in italiano (nativo del browser, nessuna dipendenza)
  - Italia sempre in cima (mercato principale del salone), il resto in
    ordine alfabetico per nome
- `flagFromIso(iso)`: funzione pura, converte un codice ISO 3166-1
  alpha-2 nei due Regional Indicator Symbols Unicode corrispondenti. Non
  è una tabella dati: è un calcolo (`iso.toUpperCase()` → offset dai
  code point base `U+1F1E6` per 'A').

### `src/components/profile/CountryCodeSelect.jsx` (riscritto)

- Solo default export (il componente). `splitPhone` non vive più qui.
- UI: `Popover` + `Command`/`CommandInput`/`CommandList`/`CommandItem`
  (componenti shadcn già presenti in `src/components/ui/commands.jsx`,
  dipendenza `cmdk` già in `package.json` — nessuna nuova dipendenza per
  la ricerca) al posto di Radix `Select`, per supportare il filtro
  testuale su ~250 voci.
- `CommandInput` filtra per stringa composta `${name} ${iso}
  ${callingCode}` di ogni item (matching di `cmdk`).
- Selezione di un item chiama `onChange(callingCode)` — contratto
  invariato rispetto a oggi.
- **Bandiera nel trigger**: più paesi possono condividere lo stesso
  prefisso (es. `+1` = USA, Canada e ~20 territori caraibici; `+7` =
  Russia e Kazakistan; `+44` = UK e alcune dipendenze della corona).
  Se il prefisso selezionato corrisponde a un solo paese nella lista,
  mostro la sua bandiera reale. Se corrisponde a più paesi, mostro
  l'icona generica 🌐 invece di una bandiera arbitraria/fuorviante
  (riusa il fallback già presente oggi nel componente per valori
  sconosciuti — non introduce una nuova costante).

### `Register.jsx` e `Profile.jsx`

- `import CountryCodeSelect from "@/components/profile/CountryCodeSelect"`
  → `const CountryCodeSelect = React.lazy(() => import("@/components/profile/CountryCodeSelect"))`,
  uso avvolto in `<Suspense fallback={<Skeleton className="h-9 w-[112px]" />}>`
  (dimensione dello skeleton coerente con `triggerClassName` passato in
  ciascuna pagina, es. `h-12` in `Register.jsx`).
- `import { splitPhone } from "@/components/profile/CountryCodeSelect"`
  → `import { splitPhone } from "@/lib/phone"` (solo in `Profile.jsx`,
  unico consumatore di `splitPhone`).

## Error handling

- `Intl.DisplayNames` non gestito con fallback: supporto baseline in
  tutti i browser evergreen target del progetto, nessuno scenario
  realistico di assenza da gestire.
- Nessun risultato nella ricerca → `CommandEmpty` con messaggio
  "Nessun paese trovato".

## Testing

Nessuna suite di test automatici esiste oggi nel progetto per questo
componente. Verifica manuale:

- `Register.jsx` e `Profile.jsx`: valore di default Italia (`+39`) con
  bandiera corretta al primo render (dopo il caricamento lazy).
- Ricerca per nome (es. "franc"), per ISO (es. "fr"), per prefisso
  (es. "33") filtra correttamente.
- Selezione di un paese aggiorna il trigger e chiama `onChange` con il
  prefisso corretto.
- Prefisso condiviso da più paesi (es. `+1`) mostra 🌐 invece di una
  bandiera specifica.
- Numeri già salvati nel formato `"+39 3331234567"` si separano
  correttamente in `Profile.jsx` tramite `splitPhone`.
- Resa corretta in tema chiaro e scuro (Popover/Command sono già
  theme-aware nel progetto).
