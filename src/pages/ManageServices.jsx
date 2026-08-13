import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/api/catalogApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Pencil, Trash2, Loader2, Scissors, ArrowLeft, GripVertical, History } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AdminHeader from "@/components/layout/AdminHeader";
import { toast } from "sonner";
import { extractError } from "@/lib/apiError";
import { useDragReorder } from "@/hooks/useDragReorder";

const EMPTY = { name: "", description: "", durationMinutes: 30, price: 10, active: true };

export default function ManageServices() {
  const queryClient = useQueryClient();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const myId = ++loadIdRef.current;
    setLoading(true);
    try {
      const res = await servicesApi.adminList();
      if (myId === loadIdRef.current) setServices(res.services || []);
    } catch {
      if (myId === loadIdRef.current) setServices([]);
    } finally {
      if (myId === loadIdRef.current) setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); setOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.durationMinutes || form.price == null) {
      toast.error("Compila nome, durata e prezzo");
      return;
    }
    if (Number(form.durationMinutes) % 30 !== 0) {
      toast.error("Durata non valida", { description: "Deve essere un multiplo di 30 minuti." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || "",
        durationMinutes: Number(form.durationMinutes),
        price: Number(form.price),
      };
      if (editing) {
        //Lo storico prezzo/durata viene registrato automaticamente dal backend se cambiano.
        await servicesApi.adminUpdate(editing.id, payload);
        toast.success("Servizio aggiornato");
      } else {
        const displayOrder = services.length > 0 ? Math.max(...services.map((s) => s.displayOrder || 0)) + 1 : 0;
        await servicesApi.adminCreate({ ...payload, active: true, displayOrder });
        toast.success("Servizio creato");
      }
      queryClient.invalidateQueries({ queryKey: ["site_data"] });
      setOpen(false);
      await load();
    } catch (err) {
      toast.error("Errore", { description: extractError(err) });
    } finally {
      setSaving(false);
    }
  };

  const { reordering, onDragEnd } = useDragReorder({
    items: services,
    setItems: setServices,
    reorderFn: servicesApi.adminReorder,
    reload: load,
  });

  const toggleActive = async (s) => {
    const next = s.active === false ? true : false;
    const prev = s.active;
    setServices((cur) => cur.map((x) => (x.id === s.id ? { ...x, active: next } : x)));
    try {
      await servicesApi.adminUpdate(s.id, { active: next });
      queryClient.invalidateQueries({ queryKey: ["site_data"] });
    } catch (err) {
      setServices((cur) => cur.map((x) => (x.id === s.id ? { ...x, active: prev } : x)));
      toast.error("Errore", { description: extractError(err) });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await servicesApi.adminDelete(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ["site_data"] });
      toast.success("Servizio eliminato");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error("Errore", { description: extractError(err) });
    } finally {
      setDeleting(false);
    }
  };

  const openHistory = async (s) => {
    setHistory({ service: s, items: [] });
    setHistoryLoading(true);
    try {
      const res = await servicesApi.adminPriceHistory(s.id);
      setHistory({ service: s, items: res.history || [] });
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
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              Trascina le righe per modificare l'ordine nella home.
              {reordering && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </p>
          </div>
          <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nuovo servizio</Button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : services.length === 0 ? (
          <EmptyState icon={Scissors} title="Nessun servizio" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="services" isDropDisabled={reordering}>
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
                              <td className="px-4 py-3">{s.durationMinutes} min</td>
                              <td className="px-4 py-3 font-semibold">€{Number(s.price).toFixed(0)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Switch checked={s.active !== false} onCheckedChange={() => toggleActive(s)} aria-label="Stato servizio" />
                                  <span className={`text-xs font-semibold ${s.active !== false ? "text-success" : "text-destructive"}`}>
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
                <Input id="dur" type="number" min={30} step={30} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required />
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
            <LoadingSpinner className="py-8" />
          ) : (history?.items || []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nessuna modifica registrata a prezzo o durata.</p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {(history?.items || []).map((h) => (
                <li key={h.id} className="rounded-xl border border-border bg-secondary/40 p-3 text-sm">
                  <p className="font-medium">{fmtDate(h.changedAt)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prezzo: <span className="font-medium text-foreground">€{Number(h.previousPrice).toFixed(0)}</span> → <span className="font-medium text-primary">€{Number(h.newPrice).toFixed(0)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Durata: <span className="font-medium text-foreground">{h.previousDurationMinutes} min</span> → <span className="font-medium text-primary">{h.newDurationMinutes} min</span>
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