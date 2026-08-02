import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Pencil, Trash2, Loader2, Scissors, ArrowLeft, GripVertical, History } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { clearServicesCache } from "@/hooks/useServices";

const EMPTY = { name: "", description: "", duration_minutes: 30, price: 10, active: true };

export default function ManageServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await base44.entities.Service.list("order");
      setServices(items || []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (user && user.role !== "admin") return <Navigate to="/" replace />;

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); setOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.duration_minutes || form.price == null) {
      toast.error("Compila nome, durata e prezzo");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || "",
        duration_minutes: Number(form.duration_minutes),
        price: Number(form.price),
      };
      if (editing) {
        const priceChanged = Number(editing.price) !== Number(payload.price);
        const durChanged = Number(editing.duration_minutes) !== Number(payload.duration_minutes);
        if (priceChanged || durChanged) {
          await base44.entities.ServicePriceHistory.create({
            service_id: editing.id,
            service_name: editing.name,
            previous_price: Number(editing.price),
            previous_duration: Number(editing.duration_minutes),
            new_price: Number(payload.price),
            new_duration: Number(payload.duration_minutes),
          }).catch(() => {});
        }
        await base44.entities.Service.update(editing.id, payload);
        toast.success("Servizio aggiornato");
      } else {
        const order = (services.length > 0) ? Math.max(...services.map((s) => s.order || 0)) + 1 : 0;
        await base44.entities.Service.create({ ...payload, active: true, order });
        toast.success("Servizio creato");
      }
      clearServicesCache();
      setOpen(false);
      await load();
    } catch (err) {
      toast.error("Errore", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = Array.from(services);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setServices(reordered);
    setReordering(true);
    try {
      const updates = reordered.map((s, i) => ({ id: s.id, order: i }));
      await base44.entities.Service.bulkUpdate(updates);
      clearServicesCache();
    } catch (err) {
      toast.error("Errore nel riordino");
      await load();
    } finally {
      setReordering(false);
    }
  };

  const toggleActive = async (s) => {
    const next = s.active === false ? true : false;
    const prev = s.active;
    setServices((cur) => cur.map((x) => (x.id === s.id ? { ...x, active: next } : x)));
    try {
      await base44.entities.Service.update(s.id, { active: next });
      clearServicesCache();
    } catch (err) {
      setServices((cur) => cur.map((x) => (x.id === s.id ? { ...x, active: prev } : x)));
      toast.error("Errore", { description: err.message });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await base44.entities.Service.delete(deleteTarget.id);
      clearServicesCache();
      toast.success("Servizio eliminato");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error("Errore", { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const openHistory = async (s) => {
    setHistory({ service: s, items: [] });
    setHistoryLoading(true);
    try {
      const items = await base44.entities.ServicePriceHistory.filter({ service_id: s.id }, "-created_date", 50);
      setHistory({ service: s, items: items || [] });
    } catch {
      setHistory({ service: s, items: [] });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }); } catch { return d; }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">Gestione servizi</h1>
            <p className="mt-1 text-sm text-muted-foreground">Trascina le righe per modificare l'ordine nella home.</p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nuovo servizio</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Scissors className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">Nessun servizio</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="services">
                {(provided) => (
                  <table className="w-full min-w-[700px] text-sm" ref={provided.innerRef} {...provided.droppableProps}>
                    <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-2 py-3 w-10"></th>
                        <th className="px-4 py-3">Servizio</th>
                        <th className="px-4 py-3">Durata</th>
                        <th className="px-4 py-3">Prezzo</th>
                        <th className="px-4 py-3">Stato</th>
                        <th className="px-4 py-3 text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {services.map((s, index) => (
                        <Draggable draggableId={s.id} index={index} key={s.id}>
                          {(prov) => (
                            <tr ref={prov.innerRef} {...prov.draggableProps} className="hover:bg-secondary/30">
                              <td {...prov.dragHandleProps} className="cursor-grab px-2 py-3 text-center align-middle">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-medium">{s.name}</p>
                                {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                              </td>
                              <td className="px-4 py-3">{s.duration_minutes} min</td>
                              <td className="px-4 py-3 font-semibold">€{Number(s.price).toFixed(0)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Switch checked={s.active !== false} onCheckedChange={() => toggleActive(s)} aria-label="Stato servizio" />
                                  <span className={`text-xs font-semibold ${s.active !== false ? "text-emerald-600" : "text-red-600"}`}>
                                    {s.active !== false ? "ON" : "OFF"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  <Button size="icon" variant="ghost" onClick={() => openHistory(s)} aria-label="Storico"><History className="h-4 w-4" /></Button>
                                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                                  <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifica servizio" : "Nuovo servizio"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrizione</Label>
              <Textarea id="desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dur">Durata (min)</Label>
                <Input id="dur" type="number" min={15} step={15} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prezzo (€)</Label>
                <Input id="price" type="number" min={0} step={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{editing ? "Salva" : "Crea"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!history} onOpenChange={(o) => !o && setHistory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Storico modifiche — {history?.service?.name}</DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (history?.items || []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nessuna modifica registrata a prezzo o durata.</p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {(history?.items || []).map((h) => (
                <li key={h.id} className="rounded-xl border border-border bg-secondary/40 p-3 text-sm">
                  <p className="font-medium">{fmtDate(h.created_date)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prezzo: <span className="font-medium text-foreground">€{Number(h.previous_price).toFixed(0)}</span> → <span className="font-medium text-primary">€{Number(h.new_price).toFixed(0)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Durata: <span className="font-medium text-foreground">{h.previous_duration} min</span> → <span className="font-medium text-primary">{h.new_duration} min</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare il servizio?</AlertDialogTitle>
            <AlertDialogDescription>
              Stai per eliminare "{deleteTarget?.name}". Questa azione non può essere annullata.
            </AlertDialogDescription>
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