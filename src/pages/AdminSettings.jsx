import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

const DEFAULT_ORARI = [
  { giorno: "Lunedì", orario: "", chiuso: true },
  { giorno: "Martedì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Mercoledì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Giovedì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Venerdì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Sabato", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Domenica", orario: "", chiuso: true },
];

const EMPTY = {
  nome_attivita: "Hair Studio",
  indirizzo: "",
  telefono: "",
  email: "",
  instagram_url: "",
  facebook_link: "",
  whatsapp_link: "",
  google_maps_link: "",
  google_review_link: "",
  orari: DEFAULT_ORARI,
};

export default function AdminSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.BusinessInfo.list()
      .then((items) => {
        const rec = (items || [])[0];
        if (rec) {
          setRecord(rec);
          setForm({
            nome_attivita: rec.nome_attivita || "",
            indirizzo: rec.indirizzo || "",
            telefono: rec.telefono || "",
            email: rec.email || "",
            instagram_url: rec.instagram_url || "",
            facebook_link: rec.facebook_link || "",
            whatsapp_link: rec.whatsapp_link || "",
            google_maps_link: rec.google_maps_link || "",
            google_review_link: rec.google_review_link || "",
            orari: rec.orari && rec.orari.length ? rec.orari : DEFAULT_ORARI,
          });
        }
      })
      .catch(() => setForm(EMPTY))
      .finally(() => setLoading(false));
  }, []);

  if (user && user.role !== "admin") return <Navigate to="/" replace />;

  const updateOrari = (i, field, value) =>
    setForm((f) => ({
      ...f,
      orari: f.orari.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nome_attivita || !form.indirizzo || !form.telefono) {
      toast.error("Compila nome attività, indirizzo e telefono");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nome_attivita: form.nome_attivita,
        indirizzo: form.indirizzo,
        telefono: form.telefono,
        email: form.email || "",
        instagram_url: form.instagram_url || "",
        facebook_link: form.facebook_link || "",
        whatsapp_link: form.whatsapp_link || "",
        google_maps_link: form.google_maps_link || "",
        google_review_link: form.google_review_link || "",
        orari: form.orari,
      };
      if (record) {
        await base44.entities.BusinessInfo.update(record.id, payload);
      } else {
        const created = await base44.entities.BusinessInfo.create(payload);
        setRecord(created);
      }
      queryClient.invalidateQueries({ queryKey: ["business_info"] });
      toast.success("Impostazioni salvate");
    } catch (err) {
      toast.error("Errore", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Impostazioni attività</h1>
          <p className="mt-1 text-sm text-muted-foreground">I dati qui modificati aggiornano indirizzo, telefono e orari visibili nel sito.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome attività</Label>
              <Input id="nome" value={form.nome_attivita} onChange={(e) => setForm({ ...form, nome_attivita: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="indirizzo">Indirizzo</Label>
              <Input id="indirizzo" value={form.indirizzo} onChange={(e) => setForm({ ...form, indirizzo: e.target.value })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (opzionale)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (URL)</Label>
              <Input id="instagram" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://www.instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook (URL)</Label>
              <Input id="facebook" value={form.facebook_link} onChange={(e) => setForm({ ...form, facebook_link: e.target.value })} placeholder="https://www.facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (URL o numero)</Label>
              <Input id="whatsapp" value={form.whatsapp_link} onChange={(e) => setForm({ ...form, whatsapp_link: e.target.value })} placeholder="https://wa.me/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gmaps">Google Maps — scheda attività (URL)</Label>
              <Input id="gmaps" value={form.google_maps_link} onChange={(e) => setForm({ ...form, google_maps_link: e.target.value })} placeholder="https://maps.google.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="greview">Google — link recensione (URL)</Label>
              <Input id="greview" value={form.google_review_link} onChange={(e) => setForm({ ...form, google_review_link: e.target.value })} placeholder="https://g.page/.../review" />
            </div>

            <div className="space-y-2">
              <Label>Orari di apertura</Label>
              <div className="space-y-2 rounded-xl border border-border p-3">
                {form.orari.map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm font-medium">{row.giorno}</span>
                    <Input
                      value={row.orario}
                      onChange={(e) => updateOrari(i, "orario", e.target.value)}
                      disabled={row.chiuso}
                      placeholder="es. 8:30 – 19:30"
                      className="h-9 flex-1"
                    />
                    <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox checked={!!row.chiuso} onCheckedChange={(v) => updateOrari(i, "chiuso", !!v)} />
                      Chiuso
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvataggio...</> : <><Save className="mr-2 h-4 w-4" /> Salva</>}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}