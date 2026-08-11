# Graph Report - .  (2026-08-11)

## Corpus Check
- 210 files · ~110,848 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1180 nodes · 1558 edges · 198 communities (106 shown, 92 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.72)
- Token cost: 70,000 input · 7,860 output

## Community Hubs (Navigation)
- Account & Auth Controllers (OTP, Password Reset)
- Express Route Wiring & Auth Middleware
- Public API Controller (Calendar, Services, Staff)
- Admin Content & Schedule Controllers
- Frontend Build Tooling (ESLint, Vite)
- React Page Components
- Backend NPM Dependencies (AWS S3, bcrypt, etc.)
- Express App Bootstrap & SSE Events
- shadcn/ui Sidebar Component
- Project Business Rules & Entity Schema (CLAUDE.md)
- Design Guidelines & Static Assets (index.html, Logo)
- UI Component Library Config (components.json)
- shadcn/ui Menubar Component
- Public Landing Page Sections
- Frontend NPM Dependencies (UI libs)
- Admin Stats Page
- Toast Hook Utility
- Project Architecture Decisions (CLAUDE.md)
- Booking Calendar View
- Image Component (Responsive srcset)
- shadcn/ui Command Palette Component
- shadcn/ui Context Menu Component
- shadcn/ui Dropdown Menu Component
- shadcn/ui Form Component
- Database Seed Script
- shadcn/ui Alert Dialog Component
- shadcn/ui Table Component
- shadcn/ui Toast Component
- Registration & Profile (Country Code Select)
- shadcn/ui Breadcrumb Component
- shadcn/ui Carousel Component
- shadcn/ui Drawer Component
- shadcn/ui Navigation Menu Component
- shadcn/ui Pagination Component
- shadcn/ui Select Component
- shadcn/ui Sheet Component
- Email & Auth Token Rationale (OTP, JWT dual-token)
- React Error Boundary
- shadcn/ui Card Component
- shadcn/ui Dialog Component
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 77
- Community 78
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 152
- Community 154
- Community 155
- Community 157
- Community 170
- Community 173
- Community 188
- Community 189
- Community 192

## God Nodes (most connected - your core abstractions)
1. `pool` - 17 edges
2. `notFound()` - 17 edges
3. `conflict()` - 14 edges
4. `publishAdminEvent()` - 13 edges
5. `asyncHandler()` - 13 edges
6. `withTransaction()` - 12 edges
7. `createBooking()` - 10 edges
8. `transitionBooking()` - 10 edges
9. `getDayOverview()` - 10 edges
10. `unauthorized()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Immagine hero — barbiere che rifinisce la barba di un cliente in poltrona, stile vintage barbershop` --conceptually_related_to--> `Hair Studio — Contesto progetto`  [INFERRED]
  public/img/hero.png → CLAUDE.md
- `Foto barbiere 1 — barbiere sorridente con grembiule grigio in negozio con muro di mattoni` --conceptually_related_to--> `Entità staff`  [INFERRED]
  public/img/barber_1.jpeg → CLAUDE.md
- `Foto barbiere 2 — barbiere sorridente con grembiule grigio, capelli pettinati indietro` --conceptually_related_to--> `Entità staff`  [INFERRED]
  public/img/barber_2.jpeg → CLAUDE.md
- `Foto barbiere 3 — barbiere con grembiule verde 'L'Artigiano Barbesta' e lampadine a vista` --conceptually_related_to--> `Entità staff`  [INFERRED]
  public/img/barber_3.jpeg → CLAUDE.md
- `Logo Hair Studio — forbici minimaliste in linea ocra su sfondo bianco caldo` --conceptually_related_to--> `Linee guida di design`  [INFERRED]
  public/img/logo 2.png → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Obiettivo indipendenza stack (Node/Express, PostgreSQL, JWT+bcrypt, no vendor lock-in)** — claude_md_base44_rewrite_goal, claude_md_no_vendor_lockin_rule, claude_md_stack_jwt_bcrypt, claude_md_stack_postgresql, claude_md_stack_nodejs_express [EXTRACTED 1.00]
- **Gestione concorrenza prenotazioni per operatore (slot 30min, EXCLUDE constraint, blocked_slots)** — claude_md_slot_30min_rule, claude_md_per_operator_availability, readme_exclude_btree_gist_constraint, claude_md_entity_blocked_slots, claude_md_entity_bookings [INFERRED 0.85]
- **Pipeline aggiornamenti realtime (SSE, EventEmitter, bug patterns evitati, notifications)** — readme_sse_realtime, readme_sse_eventemitter_backend, claude_md_realtime_bug_patterns, claude_md_entity_notifications [INFERRED 0.85]

## Communities (198 total, 92 thin omitted)

### Community 0 - "Account & Auth Controllers (OTP, Password Reset)"
Cohesion: 0.06
Nodes (68): deleteAccount, updateProfile, DUMMY_PASSWORD_HASH, forgotPassword, generateOtpCode(), issueAndSendOtp(), issueSessionAndRespond(), login (+60 more)

### Community 1 - "Express Route Wiring & Auth Middleware"
Cohesion: 0.05
Nodes (52): requireAuth(), router, router, router, router, router, router, router (+44 more)

### Community 2 - "Public API Controller (Calendar, Services, Staff)"
Cohesion: 0.08
Nodes (34): getClosures, getOpeningHours, getPublicCalendar, getServices, getSiteData, getStaff, withTransaction(), completeBlockedSlot() (+26 more)

### Community 3 - "Admin Content & Schedule Controllers"
Cohesion: 0.05
Nodes (43): getBusinessInfo, getHomepageContent, listClients, updateBusinessInfo, updateHomepageContent, createClosure, deleteClosure, listClosures (+35 more)

### Community 4 - "Frontend Build Tooling (ESLint, Vite)"
Cohesion: 0.04
Nodes (46): autoprefixer, baseline-browser-mapping, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint-plugin-unused-imports (+38 more)

### Community 5 - "React Page Components"
Cohesion: 0.05
Nodes (21): About, AdminDashboard, AdminSettings, AdminStats, Booking, Contact, ForgotPassword, Login (+13 more)

### Community 6 - "Backend NPM Dependencies (AWS S3, bcrypt, etc.)"
Cohesion: 0.05
Nodes (37): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcrypt, cookie-parser, cors (+29 more)

### Community 7 - "Express App Bootstrap & SSE Events"
Cohesion: 0.09
Nodes (22): createApp(), env, isProduction, adminEventsStream(), notificationsStream(), sendEvent(), startSse(), requiredEnv() (+14 more)

### Community 8 - "shadcn/ui Sidebar Component"
Cohesion: 0.09
Nodes (26): Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel (+18 more)

### Community 9 - "Project Business Rules & Entity Schema (CLAUDE.md)"
Cohesion: 0.10
Nodes (21): Regola eliminazione account, Regola privacy calendario, Entità bookings, Entità business_info, Entità homepage_content, Entità notifications, Entità push_tokens, Entità service_price_history (+13 more)

### Community 10 - "Design Guidelines & Static Assets (index.html, Logo)"
Cohesion: 0.12
Nodes (20): Linee guida di design, Firebase Cloud Messaging (Web Push), index.html — entry point Vite/React, div#root montaggio React, Script inline bootstrap tema chiaro/scuro (localStorage hs-theme), Logo Hair Studio — forbici minimaliste in linea ocra su sfondo bianco caldo, Galleria immagini admin (riuso upload S3), AWS S3 + presigned URL per upload immagini (+12 more)

### Community 11 - "UI Component Library Config (components.json)"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "shadcn/ui Menubar Component"
Cohesion: 0.12
Nodes (10): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarSubContent (+2 more)

### Community 13 - "Public Landing Page Sections"
Cohesion: 0.20
Nodes (3): DEFAULT_ORARI, PHOTOS, Reveal()

### Community 14 - "Frontend NPM Dependencies (UI libs)"
Cohesion: 0.15
Nodes (13): clsx, embla-carousel-react, @fontsource/manrope, @hookform/resolvers, dependencies, clsx, embla-carousel-react, @fontsource/manrope (+5 more)

### Community 15 - "Admin Stats Page"
Cohesion: 0.27
Nodes (11): AdminStats(), isoWeekMonday(), isoWeekNumber(), labelFor(), MONTH_LABELS, MONTH_SHORT, pad(), rangeFor() (+3 more)

### Community 16 - "Toast Hook Utility"
Cohesion: 0.27
Nodes (10): actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState, reducer(), toast() (+2 more)

### Community 17 - "Project Architecture Decisions (CLAUDE.md)"
Cohesion: 0.18
Nodes (11): Obiettivo riscrittura backend Base44, Hair Studio — Contesto progetto, Hosting VPS IONOS + Docker + Nginx/Caddy + GitHub Actions, Divieto lock-in servizi terzi per logica core, Resend (email transazionali), Autenticazione custom JWT + bcrypt, Stack Node.js + Express, Database PostgreSQL (+3 more)

### Community 18 - "Booking Calendar View"
Cohesion: 0.29
Nodes (10): addDays(), CalendarView(), FILTERS, inFilter(), isClosedDay(), isPast(), isToday(), nowTimeStr() (+2 more)

### Community 19 - "Image Component (Responsive srcset)"
Cohesion: 0.29
Nodes (10): buildSrcSet(), buildTransformUrl(), clamp01(), clampDim(), DEVICE_PIXEL_RATIOS, Image, ImageWrapper, parseWixMediaUrl() (+2 more)

### Community 20 - "shadcn/ui Command Palette Component"
Cohesion: 0.20
Nodes (7): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator

### Community 21 - "shadcn/ui Context Menu Component"
Cohesion: 0.20
Nodes (8): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuSubContent, ContextMenuSubTrigger

### Community 22 - "shadcn/ui Dropdown Menu Component"
Cohesion: 0.20
Nodes (8): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSubContent, DropdownMenuSubTrigger

### Community 23 - "shadcn/ui Form Component"
Cohesion: 0.29
Nodes (8): FormControl, FormDescription, FormFieldContext, FormItem, FormItemContext, FormLabel, FormMessage, useFormField()

### Community 24 - "Database Seed Script"
Cohesion: 0.36
Nodes (8): OPENING_HOURS, run(), seedAppSettings(), seedBusinessInfo(), seedHomepageContent(), seedOpeningHours(), seedStaff(), STAFF

### Community 25 - "shadcn/ui Alert Dialog Component"
Cohesion: 0.22
Nodes (6): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogOverlay, AlertDialogTitle

### Community 26 - "shadcn/ui Table Component"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 27 - "shadcn/ui Toast Component"
Cohesion: 0.25
Nodes (8): Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, toastVariants, ToastViewport

### Community 29 - "shadcn/ui Breadcrumb Component"
Cohesion: 0.25
Nodes (5): Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage

### Community 30 - "shadcn/ui Carousel Component"
Cohesion: 0.39
Nodes (7): Carousel, CarouselContent, CarouselContext, CarouselItem, CarouselNext, CarouselPrevious, useCarousel()

### Community 31 - "shadcn/ui Drawer Component"
Cohesion: 0.25
Nodes (4): DrawerContent, DrawerDescription, DrawerOverlay, DrawerTitle

### Community 32 - "shadcn/ui Navigation Menu Component"
Cohesion: 0.29
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 34 - "shadcn/ui Select Component"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 35 - "shadcn/ui Sheet Component"
Cohesion: 0.29
Nodes (5): SheetContent, SheetDescription, SheetOverlay, SheetTitle, sheetVariants

### Community 36 - "Email & Auth Token Rationale (OTP, JWT dual-token)"
Cohesion: 0.33
Nodes (7): OTP/reset link loggati in console in dev senza Resend, Invio email fire-and-forget, skip se Resend non configurato, Autenticazione JWT a doppio token (access+refresh), Verifica email via OTP alla registrazione, Recupero password via link a scadenza, token_version per revoca sessioni, Tre tipi di email transazionali (OTP, reset, conferma/cancellazione)

### Community 38 - "shadcn/ui Card Component"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 39 - "shadcn/ui Dialog Component"
Cohesion: 0.29
Nodes (4): DialogContent, DialogDescription, DialogOverlay, DialogTitle

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (4): api, ApiError, refreshAccessToken(), request()

### Community 41 - "Community 41"
Cohesion: 0.47
Nodes (5): FCM_VAPID_KEY, firebaseConfig, getApp(), getMessagingInstance(), requestFcmToken()

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (5): AdminSettings(), DEFAULT_ORARI, EMPTY, isValidUrl(), URL_FIELDS

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (4): COLUMN_1_SECTIONS, COLUMN_2_SECTIONS, FIELDS, FULL_WIDTH_SECTIONS

### Community 45 - "Community 45"
Cohesion: 0.60
Nodes (4): ensureMigrationsTable(), getAppliedMigrations(), migrationsDir, run()

### Community 46 - "Community 46"
Cohesion: 0.40
Nodes (4): businessInfoApi, clientsApi, homepageContentApi, siteDataApi

### Community 47 - "Community 47"
Cohesion: 0.40
Nodes (3): ADMIN_TABS, HIDDEN_ROUTES, USER_TABS

### Community 48 - "Community 48"
Cohesion: 0.50
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 50 - "Community 50"
Cohesion: 0.60
Nodes (4): ensureConnection(), listeners, subscribeAdminEvents(), teardownIfIdle()

### Community 51 - "Community 51"
Cohesion: 0.50
Nodes (3): getInitialTheme(), ThemeContext, ThemeProvider()

### Community 52 - "Community 52"
Cohesion: 0.50
Nodes (4): React 18 + Vite + TanStack Query + react-hook-form/zod, Nota: scale-out multi-istanza richiede pub/sub condiviso (Redis), EventEmitter in-process backend (canali admin/utente), Server-Sent Events per aggiornamenti realtime

### Community 53 - "Community 53"
Cohesion: 0.67
Nodes (3): METRICS, numValue(), StatsCompare()

### Community 55 - "Community 55"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 56 - "Community 56"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 57 - "Community 57"
Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 58 - "Community 58"
Cohesion: 0.50
Nodes (3): ToggleGroup, ToggleGroupContext, ToggleGroupItem

### Community 62 - "Community 62"
Cohesion: 1.00
Nodes (3): Entità closures, Entità opening_hours, opening_hours sovrascritto da closures

## Ambiguous Edges - Review These
- `Resend (email transazionali)` → `Autenticazione custom JWT + bcrypt`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to

## Knowledge Gaps
- **431 isolated node(s):** `name`, `version`, `private`, `type`, `node` (+426 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **92 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Resend (email transazionali)` and `Autenticazione custom JWT + bcrypt`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Frontend NPM Dependencies (UI libs)` to `Community 128`, `Community 129`, `Community 130`, `Community 131`, `Frontend Build Tooling (ESLint, Vite)`, `Community 83`, `Community 85`, `Community 86`, `Community 87`, `Community 88`, `Community 89`, `Community 90`, `Community 91`, `Community 92`, `Community 93`, `Community 94`, `Community 95`, `Community 96`, `Community 97`, `Community 98`, `Community 99`, `Community 100`, `Community 101`, `Community 102`, `Community 103`, `Community 104`, `Community 105`, `Community 106`, `Community 107`, `Community 108`, `Community 109`, `Community 110`, `Community 111`, `Community 112`, `Community 113`, `Community 114`, `Community 115`, `Community 116`, `Community 117`, `Community 118`, `Community 119`, `Community 120`, `Community 121`, `Community 122`, `Community 123`, `Community 124`, `Community 125`, `Community 126`, `Community 127`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `pool` connect `Account & Auth Controllers (OTP, Password Reset)` to `Database Seed Script`, `Public API Controller (Calendar, Services, Staff)`, `Community 45`, `Express App Bootstrap & SSE Events`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _431 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Account & Auth Controllers (OTP, Password Reset)` be split into smaller, more focused modules?**
  _Cohesion score 0.05890257558790594 - nodes in this community are weakly interconnected._
- **Should `Express Route Wiring & Auth Middleware` be split into smaller, more focused modules?**
  _Cohesion score 0.05413469735720375 - nodes in this community are weakly interconnected._
- **Should `Public API Controller (Calendar, Services, Staff)` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._