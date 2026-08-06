import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { businessInfoApi } from "@/api/contentApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
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
  businessName: "Hair Studio",
  address: "",
  phone: "",
  email: "",
  instagramUrl: "",
  facebookUrl: "",
  whatsappUrl: "",
  googleMapsUrl: "",
  googleReviewUrl: "",
  openingHoursDisplay: DEFAULT_ORARI,
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    businessInfoApi.adminGet()
      .then((res) => {
        const rec = res?.businessInfo;
        if (rec) {
          setForm({
            businessName: rec.businessName || "",
            address: rec.address || "",
            phone: rec.phone || "",
            email: rec.email || "",
            instagramUrl: rec.instagramUrl || "",
            facebookUrl: rec.facebookUrl || "",
            whatsappUrl: rec.whatsappUrl || "",
            googleMapsUrl: rec.googleMapsUrl || "",
            googleReviewUrl: rec.googleReviewUrl || "",
            openingHoursDisplay: rec.openingHoursDisplay?.length ? rec.openingHoursDisplay : DEFAULT_ORARI,
          });
        }
      })
      .catch(() => setForm(EMPTY))
      .finally(() => setLoading(false));
  }, []);

  const updateOrari = (i, field, value) =>
    setForm((f) => ({
      ...f,
      openingHoursDisplay: f.openingHoursDisplay.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.address || !form.phone) {
      toast.error("Compila nome attività, indirizzo e telefono");
      return;
    }
    setSaving(true);
    try {
      await businessInfoApi.adminUpdate(form);
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
              <Input id="nome" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="indirizzo">Indirizzo</Label>
              <Input id="indirizzo" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (opzionale)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram (URL)</Label>
              <Input id="instagram" value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} placeholder="https://www.instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook (URL)</Label>
              <Input id="facebook" value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} placeholder="https://www.facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (URL)</Label>
              <Input id="whatsapp" value={form.whatsappUrl} onChange={(e) => setForm({ ...form, whatsappUrl: e.target.value })} placeholder="https://wa.me/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gmaps">Google Maps — scheda attività (URL)</Label>
              <Input id="gmaps" value={form.googleMapsUrl} onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="greview">Google — link recensione (URL)</Label>
              <Input id="greview" value={form.googleReviewUrl} onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })} placeholder="https://g.page/.../review" />
            </div>

            <div className="space-y-2">
              <Label>Orari di apertura</Label>
              <div className="space-y-2 rounded-xl border border-border p-3">
                {form.openingHoursDisplay.map((row, i) => (
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
