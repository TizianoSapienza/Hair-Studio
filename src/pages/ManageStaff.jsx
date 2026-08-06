import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { staffApi } from "@/api/catalogApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Pencil, Loader2, UserCircle2, ArrowLeft, GripVertical } from "lucide-react";
import { Image } from "@/components/ui/image";
import AdminHeader from "@/components/layout/AdminHeader";
import { toast } from "sonner";
import { extractError } from "@/lib/apiError";

export default function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", photoUrl: "", specialization: "" });
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffApi.adminList();
      setStaff(res.staff || []);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name || "", photoUrl: s.photoUrl || "", specialization: s.specialization || "" });
    setOpen(true);
  };



  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error("Il nome è obbligatorio"); return; }
    setSaving(true);
    try {
      await staffApi.adminUpdate(editing.id, {
        name: form.name,
        photoUrl: form.photoUrl || "",
        specialization: form.specialization || "",
      });
      toast.success("Operatore aggiornato");
      setOpen(false);
      await load();
    } catch (err) {
      toast.error("Errore", { description: extractError(err) });
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = Array.from(staff);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setStaff(reordered);
    setReordering(true);
    try {
      await staffApi.adminReorder(reordered.map((s) => s.id));
    } catch (err) {
      toast.error("Errore nel riordino", { description: extractError(err) });
      await load();
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Operatori</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            Trascina le card per modificare l'ordine nella home. Modifica nome, foto e specializzazione.
            {reordering && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : staff.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <UserCircle2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">Nessun operatore</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="staff" isDropDisabled={reordering}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                  {staff.map((s, index) => (
                    <Draggable draggableId={s.id} index={index} key={s.id}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                          <div {...prov.dragHandleProps} className="cursor-grab text-muted-foreground">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          {s.photoUrl ? (
                            <Image src={s.photoUrl} className="h-12 w-12 rounded-full object-cover" fittingType="fill" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary"><UserCircle2 className="h-6 w-6 text-muted-foreground" /></div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-heading text-base font-semibold">{s.name}</p>
                            {s.specialization && <p className="truncate text-sm text-muted-foreground">{s.specialization}</p>}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => openEdit(s)}><Pencil className="mr-2 h-4 w-4" /> Modifica</Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Modifica operatore</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">URL Foto</Label>
              <Input id="photo" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spec">Specializzazione</Label>
              <Input id="spec" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="es. Taglio uomo, Barba" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salva</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}