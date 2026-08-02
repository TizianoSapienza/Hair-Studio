import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Loader2, Ban, Lock, Check, CheckCircle2, Users, CalendarDays, Clock, RefreshCw, UserX, Scissors } from "lucide-react";
import { formatDateIT, DAY_LABELS_LONG, timeToMinutes } from "@/lib/salonConfig";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function isPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + "T00:00:00") < today;
}
function isToday(dateStr) {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return dateStr === `${y}-${m}-${d}`;
}
function nowTimeStr() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return hh + ":" + mm;
}

const STATUS_STYLE = {
  free: { dot: "bg-emerald-500", label: "Libero", chip: "bg-emerald-50 text-emerald-700" },
  partial: { dot: "bg-amber-500", label: "In parte", chip: "bg-amber-50 text-amber-700" },
  full: { dot: "bg-red-500", label: "Occupato", chip: "bg-red-50 text-red-700" },
  closed: { dot: "bg-muted-foreground", label: "Chiuso", chip: "bg-muted text-muted-foreground" }
};

const FILTERS = [
  { id: "all", label: "Tutti" },
  { id: "morning", label: "Mattina" },
  { id: "afternoon", label: "Pomeriggio" },
  { id: "custom", label: "Personalizzato" }
];

function inFilter(time, f, from, to) {
  if (f === "all") return true;
  if (f === "morning") return time < "12:00";
  if (f === "afternoon") return time >= "12:00";
  if (f === "custom") {
    if (from && time < from) return false;
    if (to && time > to) return false;
    return true;
  }
  return true;
}

const FALLBACK_DAYS = [
  { day_of_week: 0, open: false },
  { day_of_week: 1, open: false },
  { day_of_week: 2, open: true },
  { day_of_week: 3, open: true },
  { day_of_week: 4, open: true },
  { day_of_week: 5, open: true },
  { day_of_week: 6, open: true }
];

export function isClosedDay(dateStr, openingHours, closures) {
  if (Array.isArray(closures)) {
    const c = closures.find((cl) => dateStr >= cl.start_date && (!cl.end_date || dateStr <= cl.end_date));
    if (c) return c.type !== "modified";
  }
  const dow = new Date(dateStr + "T00:00:00").getDay();
  const days = (openingHours && openingHours.days) || FALLBACK_DAYS;
  const dayDef = days.find((x) => x.day_of_week === dow);
  return !dayDef || !dayDef.open;
}

export default function CalendarView({
  mode = "public",
  date,
  onDateChange,
  refreshKey = 0,
  onSlotSelect,
  selectedSlot,
  onAfterAction,
  staffId = "any"
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customFrom, setCustomFrom] = useState("08:30");
  const [customTo, setCustomTo] = useState("19:00");
  const [slotModal, setSlotModal] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(date);
  const [meta, setMeta] = useState({ openingHours: null, closures: [] });
  const [staffFilter, setStaffFilter] = useState("any");
  const [blockSelection, setBlockSelection] = useState(new Set());
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockName, setBlockName] = useState("");
  const [blockStaff, setBlockStaff] = useState("");
  const isMobile = useIsMobile();

  const dateStr = toDateString(date);
  const queryStaff = mode === "admin" ? staffFilter : staffId;
  const debouncedDateStr = useDebouncedValue(dateStr, 250);
  const loadIdRef = useRef(0);

  const load = useCallback(async (silent) => {
    const myId = ++loadIdRef.current;
    if (!silent) setLoading(true);
    try {
      const res = await base44.functions.invoke("GetCalendar", { date: debouncedDateStr, staff_id: queryStaff });
      if (myId === loadIdRef.current) setData(res.data);
    } catch (e) {
      if (myId === loadIdRef.current && !silent) setData(null);
    } finally {
      if (myId === loadIdRef.current && !silent) setLoading(false);
    }
  }, [debouncedDateStr, queryStaff]);

  useEffect(() => { load(); }, [load, refreshKey]);
  useEffect(() => { setSelected(new Set()); setBlockSelection(new Set()); }, [dateStr, refreshKey]);
  useEffect(() => { setPickerMonth(date); }, [date]);

  // Sincronizzazione in tempo reale: aggiorna solo per il giorno visualizzato.
  // La sottoscrizione viene chiusa e riaperta quando cambia il giorno (deps=[load])
  // quindi c'e' sempre una sola sottoscrizione attiva per il contesto corrente.
  useEffect(() => {
    const unsub = base44.entities.Booking.subscribe((event) => {
      if (event?.data?.date && event.data.date !== debouncedDateStr) return;
      load(true);
    });
    return unsub;
  }, [load]);

  useEffect(() => {
    Promise.all([
      base44.entities.OpeningHours.list().catch(() => []),
      base44.entities.Closures.list().catch(() => []),
    ]).then(([oh, cl]) => setMeta({ openingHours: (oh || [])[0] || null, closures: cl || [] }));
  }, []);

  const reload = async () => { await load(); onAfterAction && onAfterAction(); };

  const opBusyAt = (opId, time) => {
    if (!data) return false;
    const slotMin = data.slotMinutes || 30;
    const tM = timeToMinutes(time);
    return (data.bookings || []).some((b) => {
      if (b.status === "cancelled" || b.status === "no_show") return false;
      if (!b.staff_id) return true;
      if (b.staff_id !== opId) return false;
      const count = b.slots_count || 1;
      const sM = timeToMinutes(b.start_time);
      return tM >= sM && tM < sM + count * slotMin;
    });
  };

  const handleBlockMany = async (times, name, staffId) => {
    setActionLoading("block");
    let firstErr = null;
    try {
      for (const t of times) {
        try {
          await base44.functions.invoke("BlockSlot", { date: dateStr, start_time: t, slots_count: 1, note: name || "", staff_id: staffId || "" });
        } catch (e) { if (!firstErr) firstErr = e.message; }
      }
      await reload();
      setBlockSelection(new Set());
      if (firstErr) toast.error("Alcuni slot non bloccati", { description: firstErr });
      else toast.success(`${times.length} slot bloccati`);
    } finally {
      setActionLoading(null);
    }
  };
  const handleCancel = async (id) => {
    setActionLoading("cancel-" + id);
    try { await base44.functions.invoke("CancelBooking", { booking_id: id }); await reload(); } finally { setActionLoading(null); }
  };
  const handleComplete = async (id) => {
    setActionLoading("complete-" + id);
    try { await base44.functions.invoke("CompleteBooking", { booking_id: id }); await reload(); } finally { setActionLoading(null); }
  };
  const handleNoShow = async (id) => {
    setActionLoading("noshow-" + id);
    try { await base44.functions.invoke("MarkNoShow", { booking_id: id }); await reload(); } finally { setActionLoading(null); }
  };
  const handleConfirm = async (id) => {
    setActionLoading("confirm-" + id);
    try { await base44.functions.invoke("ConfirmBooking", { booking_id: id }); await reload(); } finally { setActionLoading(null); }
  };

  const modalComplete = (id) => { handleComplete(id); setSlotModal(null); };
  const modalCancel = (id) => { handleCancel(id); setSlotModal(null); };
  const modalNoShow = (id) => { handleNoShow(id); setSlotModal(null); };
  const modalConfirm = (id) => { handleConfirm(id); setSlotModal(null); };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleBlockSelect = (time) => {
    setBlockSelection((prev) => {
      const next = new Set(prev);
      if (next.has(time)) next.delete(time); else next.add(time);
      return next;
    });
  };

  const bulkAction = async (kind) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setActionLoading("bulk-" + kind);
    try {
      for (const id of ids) {
        const b = (data.bookings || []).find((x) => x.id === id);
        if (!b) continue;
        if (kind === "complete" && b.status !== "booked" && b.status !== "confirmed") continue;
        if (kind === "cancel" && (b.status === "completed" || b.status === "blocked")) continue;
        const fn = kind === "complete" ? "CompleteBooking" : "CancelBooking";
        await base44.functions.invoke(fn, { booking_id: id });
      }
      await reload();
    } finally {
      setActionLoading(null);
    }
  };

  const weekday = new Date(dateStr + "T00:00:00").getDay();
  const closed = data && !data.open;
  const past = isPast(dateStr);
  const readOnly = mode === "admin" && past;
  const bookings = (data && data.bookings) || [];
  const visibleBookings = queryStaff === "any" ? bookings : bookings.filter((b) => b.staff_id === queryStaff);
  const slotBookings = slotModal ? visibleBookings.filter((b) => b.start_time === slotModal) : [];
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const blockTimes = Array.from(blockSelection).sort();

  const blockableSlots = data && data.open ? data.slots.filter((s) => s.available && !past && inFilter(s.time, timeFilter, customFrom, customTo)) : [];

  const openBlockDialog = () => {
    setBlockName("");
    const avail = (data?.operators || []).filter((op) => !blockTimes.some((t) => opBusyAt(op.id, t)));
    setBlockStaff(avail[0]?.id || "");
    setBlockOpen(true);
  };

  const renderItem = (b, closeModal) => {
    const isBlock = b.status === "blocked";
    const completed = b.status === "completed";
    const noShow = b.status === "no_show";
    const pending = b.status === "booked";
    const confirmed = b.status === "confirmed";
    const onComplete = () => closeModal ? modalComplete(b.id) : handleComplete(b.id);
    const onCancel = () => closeModal ? modalCancel(b.id) : handleCancel(b.id);
    const onNoShow = () => closeModal ? modalNoShow(b.id) : handleNoShow(b.id);
    const onConfirm = () => closeModal ? modalConfirm(b.id) : handleConfirm(b.id);
    return (
      <li key={b.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${noShow ? "border-red-400/70 bg-red-50/70 dark:border-red-600/50 dark:bg-red-950/50" : "border-border bg-secondary/40"} ${completed ? "opacity-60" : ""}`}>
        <div className="flex min-w-0 items-start gap-3">
          {(pending || confirmed) && (
            <Checkbox checked={selected.has(b.id)} onCheckedChange={() => toggleSelect(b.id)} className="mt-1" />
          )}
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold">{b.start_time}</p>
            <p className="truncate text-sm font-medium">
              {isBlock ? (b.client_name && b.client_name !== "Bloccato (manuale)" ? `Bloccato: ${b.client_name}` : "Slot bloccato") : b.service_name}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
              <Scissors className="h-3 w-3 text-primary" /> {b.staff_name || "Tutti"}
            </span>
            {!isBlock && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{b.client_name} · {b.client_phone || "—"} · {b.client_email || "—"}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pending && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
              <Clock className="mr-1 h-3.5 w-3.5" /> In attesa
            </span>
          )}
          {confirmed && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Confermata
            </span>
          )}
          {completed && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <Check className="mr-1 h-3.5 w-3.5" /> Completato
            </span>
          )}
          {noShow && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-900/70 dark:text-red-100">
              <UserX className="mr-1 h-3.5 w-3.5" /> No-show
            </span>
          )}
          {pending && !completed && !isBlock && (
            <>
              <Button size="sm" onClick={onConfirm} disabled={readOnly || actionLoading === "confirm-" + b.id}>
                {actionLoading === "confirm-" + b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1 h-4 w-4" /> Conferma</>}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel} disabled={readOnly || actionLoading === "cancel-" + b.id}>
                {actionLoading === "cancel-" + b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Ban className="mr-1 h-4 w-4" /> Cancella</>}
              </Button>
            </>
          )}
          {(confirmed || isBlock) && !completed && (
            <>
              <Button size="sm" onClick={onComplete} disabled={readOnly || actionLoading === "complete-" + b.id}>
                {actionLoading === "complete-" + b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1 h-4 w-4" /> Completa</>}
              </Button>
              <Button size="sm" variant="outline" onClick={onNoShow} disabled={readOnly || actionLoading === "noshow-" + b.id}>
                {actionLoading === "noshow-" + b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserX className="mr-1 h-4 w-4" /> No-show</>}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel} disabled={readOnly || actionLoading === "cancel-" + b.id}>
                {actionLoading === "cancel-" + b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Ban className="mr-1 h-4 w-4" /> {isBlock ? "Rimuovi" : "Cancella"}</>}
              </Button>
            </>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" className="h-11 w-11 md:h-9 md:w-9" onClick={() => onDateChange(addDays(date, -1))} aria-label="Giorno precedente">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          {isMobile ? (
            <Drawer open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <DrawerTrigger asChild>
                <button className="flex flex-col items-center rounded-lg px-3 py-1 text-center transition-colors hover:bg-secondary">
                  <p className="font-heading text-base font-semibold capitalize">{formatDateIT(dateStr)}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />{DAY_LABELS_LONG[weekday]}</p>
                </button>
              </DrawerTrigger>
              <DrawerContent className="mx-auto max-w-md">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Seleziona data</DrawerTitle>
                </DrawerHeader>
                <div className="flex justify-center p-4 pt-0">
                  <Calendar
                    mode="single" weekStartsOn={1} month={pickerMonth} onMonthChange={setPickerMonth}
                    selected={date} onSelect={(d) => { if (d) { onDateChange(d); setDatePickerOpen(false); } }}
                    disabled={mode === "booking" ? (d) => d < todayMidnight : undefined}
                    modifiers={{ closed: (d) => isClosedDay(toDateString(d), meta.openingHours, meta.closures) }}
                    modifiersClassNames={{ closed: "bg-red-100 text-red-700 line-through dark:bg-red-900/40 dark:text-red-300" }}
                    classNames={{ day_today: "" }} initialFocus />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button className="flex flex-col items-center rounded-lg px-3 py-1 text-center transition-colors hover:bg-secondary">
                  <p className="font-heading text-base font-semibold capitalize">{formatDateIT(dateStr)}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />{DAY_LABELS_LONG[weekday]}</p>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single" weekStartsOn={1} month={pickerMonth} onMonthChange={setPickerMonth}
                  selected={date} onSelect={(d) => { if (d) { onDateChange(d); setDatePickerOpen(false); } }}
                  disabled={mode === "booking" ? (d) => d < todayMidnight : undefined}
                  modifiers={{ closed: (d) => isClosedDay(toDateString(d), meta.openingHours, meta.closures) }}
                  modifiersClassNames={{ closed: "bg-red-100 text-red-700 line-through dark:bg-red-900/40 dark:text-red-300" }}
                  classNames={{ day_today: "" }} initialFocus />
              </PopoverContent>
            </Popover>
          )}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-11 w-11 md:h-9 md:w-9" onClick={() => onDateChange(addDays(date, 1))} aria-label="Giorno successivo">
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11 md:h-9 md:w-9" onClick={reload} aria-label="Aggiorna">
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mode === "admin" && (
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Orario:</p>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <Button key={f.id} size="sm" variant={timeFilter === f.id ? "default" : "outline"} onClick={() => setTimeFilter(f.id)}>{f.label}</Button>
                ))}
                {timeFilter === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm hover:bg-accent">
                        <span className="font-mono">{customFrom}</span><span className="text-muted-foreground">→</span><span className="font-mono">{customTo}</span><Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" align="start">
                      <div className="flex items-center gap-2">
                        <Input type="time" step={1800} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} onClick={(e) => { try { e.currentTarget.showPicker(); } catch (_) {} }} className="h-8 w-[88px] cursor-pointer text-xs text-foreground accent-primary" />
                        <span className="text-xs text-muted-foreground">→</span>
                        <Input type="time" step={1800} value={customTo} onChange={(e) => setCustomTo(e.target.value)} onClick={(e) => { try { e.currentTarget.showPicker(); } catch (_) {} }} className="h-8 w-[88px] cursor-pointer text-xs text-foreground accent-primary" />
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            {(data?.operators || []).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Operatore:</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={queryStaff === "any" ? "default" : "outline"} onClick={() => setStaffFilter("any")}>Tutti</Button>
                  {(data.operators || []).map((op) => (
                    <Button key={op.id} size="sm" variant={queryStaff === op.id ? "default" : "outline"} onClick={() => setStaffFilter(op.id)}>{op.name}</Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loading && data ? (
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary/60" />
          </div>
        ) : null}
        {loading && !data ? (
          <div className="mt-5 flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : closed ? (
          <div className="py-16 text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">Il salone è chiuso</p>
            <p className="text-sm text-muted-foreground">{data.reason || "Nessun appuntamento disponibile in questa data."}</p>
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {data.slots.filter((s) => inFilter(s.time, timeFilter, customFrom, customTo)).map((slot) => {
                const style = STATUS_STYLE[slot.status] || STATUS_STYLE.free;
                const slotPast = past || (isToday(dateStr) && slot.time <= nowTimeStr());
                const isSelectable = mode === "booking" && slot.available && !slotPast;
                const isSelected = selectedSlot === slot.time;
                const hasBookings = visibleBookings.some((b) => b.start_time === slot.time);
                const bookingChip = slot.available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700";
                const bookingDot = slot.available ? "bg-emerald-500" : "bg-red-500";
                return (
                  <button
                    key={slot.time} type="button"
                    disabled={mode === "booking" && !isSelectable}
                    onClick={() => { if (mode === "admin") { setSlotModal(slot.time); return; } if (isSelectable) onSlotSelect && onSlotSelect(slot.time); }}
                    className={[
                      "flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                      isSelected ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" : "border-border",
                      mode === "booking" && isSelectable ? "hover:border-primary hover:shadow-sm cursor-pointer" : "",
                      mode === "admin" ? "hover:border-primary/60 cursor-pointer" : "",
                      !slot.available && mode === "booking" ? "opacity-70 cursor-default" : "",
                      slotPast && mode === "booking" ? "opacity-50" : ""
                    ].join(" ")}>
                    {mode === "booking" && slotPast ? (
                      <div className="flex w-full items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-muted-foreground">{slot.time}</span>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <div className="flex w-full items-center justify-between">
                          <span className="font-mono text-sm font-semibold">{slot.time}</span>
                          {mode === "admin" && hasBookings && <Users className="h-3.5 w-3.5 text-brand" />}
                        </div>
                        <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${mode === "admin" ? style.chip : bookingChip}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${mode === "admin" ? style.dot : bookingDot}`} />
                          {mode === "admin" ? (queryStaff !== "any" ? (slot.available ? "Libero" : "Occupato") : `${slot.freeCount} disp.`) : (slot.available ? `Libero (${slot.freeCount})` : "Occupato")}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Libero</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> In parte</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Occupato</span>
            </div>

            {mode === "admin" && (
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-heading text-sm font-semibold">Prenotazioni del giorno ({visibleBookings.length}){queryStaff !== "any" ? ` · ${(data?.operators || []).find((o) => o.id === queryStaff)?.name || "operatore"}` : ""}</h4>
                  {selected.size > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="default" onClick={() => bulkAction("complete")} disabled={!!actionLoading}><Check className="mr-1 h-4 w-4" /> Completa ({selected.size})</Button>
                      <Button size="sm" variant="outline" onClick={() => bulkAction("cancel")} disabled={!!actionLoading}><Ban className="mr-1 h-4 w-4" /> Cancella ({selected.size})</Button>
                    </div>
                  )}
                </div>

                {visibleBookings.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Nessuna prenotazione.</p>
                ) : (
                  <ul className="mt-3 space-y-2">{visibleBookings.map((b) => renderItem(b, false))}</ul>
                )}

                {!readOnly && blockableSlots.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Seleziona gli slot da bloccare:</p>
                      {blockSelection.size > 0 && (
                        <Button size="sm" onClick={openBlockDialog} disabled={!!actionLoading && actionLoading === "block"}>
                          {actionLoading === "block" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />} Blocca selezionati ({blockSelection.size})
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {blockableSlots.map((s) => {
                        const sel = blockSelection.has(s.time);
                        return (
                          <button key={s.time} type="button" onClick={() => toggleBlockSelect(s.time)}
                            className={["rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                              sel ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/50"].join(" ")}>
                            {s.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <Dialog open={!!slotModal} onOpenChange={(o) => !o && setSlotModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Prenotazioni delle ore {slotModal}</DialogTitle>
              <DialogDescription>{slotBookings.length} appuntamento/i in questo slot{queryStaff !== "any" ? " per l'operatore" : ""}.</DialogDescription>
            </DialogHeader>
            {slotBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessuna prenotazione in questo slot.</p>
            ) : (
              <ul className="space-y-2">{slotBookings.map((b) => renderItem(b, true))}</ul>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Blocca {blockTimes.length} slot</DialogTitle>
              <DialogDescription>{blockTimes.join(", ")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm font-medium">Operatore</p>
              <div className="flex flex-wrap gap-2">
                {(data?.operators || []).map((op) => {
                  const busy = blockTimes.some((t) => opBusyAt(op.id, t));
                  return (
                    <button type="button" key={op.id} disabled={busy} onClick={() => setBlockStaff(op.id)}
                      className={["rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        blockStaff === op.id ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" : "border-border bg-card",
                        busy ? "opacity-40 cursor-not-allowed" : "hover:border-primary/50"].join(" ")}>
                      {op.name}{busy ? " · occupato" : ""}
                    </button>
                  );
                })}
                <button type="button" onClick={() => setBlockStaff("")}
                  className={["rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    blockStaff === "" ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/50"].join(" ")}>
                  Tutti gli operatori
                </button>
              </div>
            </div>
            <Input value={blockName} onChange={(e) => setBlockName(e.target.value)} placeholder="Nominativo / nota (opzionale)" autoFocus />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setBlockOpen(false)}>Annulla</Button>
              <Button size="sm" onClick={() => { handleBlockMany(blockTimes, blockName, blockStaff); setBlockOpen(false); }} disabled={actionLoading === "block" || blockTimes.length === 0}>
                {actionLoading === "block" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />} Blocca
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}