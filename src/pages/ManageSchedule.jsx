import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { scheduleApi } from "@/api/scheduleApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Loader2, Save, ArrowLeft, CalendarOff } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { toast } from "sonner";
import { DAY_LABELS_LONG, formatDateIT } from "@/lib/salonConfig";

const DEFAULT_DAYS = [
  { dayOfWeek: 0, isOpen: false, startTime: "", endTime: "" },
  { dayOfWeek: 1, isOpen: false, startTime: "", endTime: "" },
  { dayOfWeek: 2, isOpen: true, startTime: "08:30", endTime: "19:30" },
  { dayOfWeek: 3, isOpen: true, startTime: "08:30", endTime: "19:30" },
  { dayOfWeek: 4, isOpen: true, startTime: "08:30", endTime: "19:30" },
  { dayOfWeek: 5, isOpen: true, startTime: "08:30", endTime: "19:30" },
  { dayOfWeek: 6, isOpen: true, startTime: "08:30", endTime: "19:30" },
];

const EMPTY_CLOSURE = { startDate: "", endDate: "", closureType: "closed", openTime: "", closeTime: "", note: "" };

export default function ManageSchedule() {
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [loadingOh, setLoadingOh] = useState(true);
  const [savingOh, setSavingOh] = useState(false);

  const [closures, setClosures] = useState([]);
  const [loadingCl, setLoadingCl] = useState(true);
  const [closureOpen, setClosureOpen] = useState(false);
  const [closureForm, setClosureForm] = useState(EMPTY_CLOSURE);
  const [savingCl, setSavingCl] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadOh = useCallback(async () => {
    setLoadingOh(true);
    try {
      const res = await scheduleApi.openingHours();
      const rows = res.openingHours || [];
      if (rows.length) {
        setDays(rows.map((r) => ({
          dayOfWeek: r.dayOfWeek,
          isOpen: r.isOpen,
          startTime: r.startTime || "",
          endTime: r.endTime || "",
        })));
      }
      if (res.slotMinutes) setSlotMinutes(res.slotMinutes);
    } catch { /* noop */ }
    finally { setLoadingOh(false); }
  }, []);

  const loadClosures = useCallback(async () => {
    setLoadingCl(true);
    try {
      const res = await scheduleApi.adminClosures();
      setClosures(res.closures || []);
    } catch { setClosures([]); }
    finally { setLoadingCl(false); }
  }, []);

  useEffect(() => { loadOh(); loadClosures(); }, [loadOh, loadClosures]);

  const updateDay = (i, field, value) =>
    setDays((cur) => cur.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));

  const handleSaveOh = async (e) => {
    e.preventDefault();
    setSavingOh(true);
    try {
      await scheduleApi.adminUpdateOpeningHours({
        days: days.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          isOpen: !!d.isOpen,
          startTime: d.isOpen ? d.startTime : undefined,
          endTime: d.isOpen ? d.endTime : undefined,
        })),
        slotMinutes: Number(slotMinutes) || 30,
      });
      toast.success("Orari salvati");
    } catch (err) {
      toast.error("Errore", { description: err.message });
    } finally {
      setSavingOh(false);
    }
  };

  const handleSaveClosure = async (e) => {
    e.preventDefault();
    if (!closureForm.startDate) { toast.error("Data inizio obbligatoria"); return; }
    setSavingCl(true);
    try {
      await scheduleApi.adminCreateClosure({
        startDate: closureForm.startDate,
        endDate: closureForm.endDate || closureForm.startDate,
        closureType: closureForm.closureType,
        openTime: closureForm.closureType === "modified" ? closureForm.openTime : undefined,
        closeTime: closureForm.closureType === "modified" ? closureForm.closeTime : undefined,
        note: closureForm.note || undefined,
      });
      toast.success("Chiusura aggiunta");
      setClosureOpen(false);
      setClosureForm(EMPTY_CLOSURE);
      await loadClosures();
    } catch (err) {
      toast.error("Errore", { description: err.message });
    } finally {
      setSavingCl(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await scheduleApi.adminDeleteClosure(deleteTarget.id);
      toast.success("Chiusura eliminata");
      setDeleteTarget(null);
      await loadClosures();
    } catch (err) {
      toast.error("Errore", { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Orari e chiusure</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configura gli orari settimanali (usati per generare gli slot) e le chiusure straordinarie.</p>
        </div>

        <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-start">
          {loadingOh ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <form onSubmit={handleSaveOh} className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">Orari settimanali</h2>
                <div className="flex items-center gap-2">
                  <Label htmlFor="slot" className="text-xs text-muted-foreground">Slot (min)</Label>
                  <Input id="slot" type="number" min={15} step={15} value={slotMinutes} onChange={(e) => setSlotMinutes(e.target.value)} className="h-9 w-20" />
                </div>
              </div>
              <div className="space-y-2">
                {days.map((d, i) => (
                  <div key={d.dayOfWeek} className="rounded-xl border border-border/60 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{DAY_LABELS_LONG[d.dayOfWeek]}</span>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Checkbox checked={!!d.isOpen} onCheckedChange={(v) => updateDay(i, "isOpen", !!v)} />
                        Aperto
                      </label>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input type="time" value={d.startTime} onChange={(e) => updateDay(i, "startTime", e.target.value)} disabled={!d.isOpen} className="h-9 flex-1" />
                      <span className="text-muted-foreground">–</span>
                      <Input type="time" value={d.endTime} onChange={(e) => updateDay(i, "endTime", e.target.value)} disabled={!d.isOpen} className="h-9 flex-1" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={savingOh}>
                  {savingOh ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvataggio...</> : <><Save className="mr-2 h-4 w-4" /> Salva orari</>}
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 lg:max-h-[70vh] lg:overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Chiusure straordinarie</h2>
              <Button size="sm" onClick={() => { setClosureForm(EMPTY_CLOSURE); setClosureOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Aggiungi</Button>
            </div>
            {loadingCl ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : closures.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <CalendarOff className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Nessuna chiusura programmata.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {closures.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <p className="font-medium">
                        {formatDateIT(c.startDate)}{c.endDate && c.endDate !== c.startDate ? " → " + formatDateIT(c.endDate) : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {c.closureType === "closed" ? "Chiusura totale" : `Orario modificato: ${c.openTime}–${c.closeTime}`}
                        {c.note ? " · " + c.note : ""}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <Dialog open={closureOpen} onOpenChange={setClosureOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nuova chiusura</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveClosure} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Data inizio</Label>
                <Input id="start" type="date" value={closureForm.startDate} onChange={(e) => setClosureForm({ ...closureForm, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Data fine (opz.)</Label>
                <Input id="end" type="date" value={closureForm.endDate} onChange={(e) => setClosureForm({ ...closureForm, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant={closureForm.closureType === "closed" ? "default" : "outline"} onClick={() => setClosureForm({ ...closureForm, closureType: "closed" })}>Chiusura totale</Button>
                <Button type="button" size="sm" variant={closureForm.closureType === "modified" ? "default" : "outline"} onClick={() => setClosureForm({ ...closureForm, closureType: "modified" })}>Orario modificato</Button>
              </div>
            </div>
            {closureForm.closureType === "modified" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ot">Apertura</Label>
                  <Input id="ot" type="time" value={closureForm.openTime} onChange={(e) => setClosureForm({ ...closureForm, openTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct">Chiusura</Label>
                  <Input id="ct" type="time" value={closureForm.closeTime} onChange={(e) => setClosureForm({ ...closureForm, closeTime: e.target.value })} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="note">Nota (opz.)</Label>
              <Textarea id="note" rows={2} value={closureForm.note} onChange={(e) => setClosureForm({ ...closureForm, note: e.target.value })} placeholder="es. Ferie estive" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClosureOpen(false)}>Annulla</Button>
              <Button type="submit" disabled={savingCl}>{savingCl ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Aggiungi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la chiusura?</AlertDialogTitle>
            <AlertDialogDescription>L'orario standard verrà ripristinato per le date interessate.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
