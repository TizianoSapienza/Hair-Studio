import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { businessInfoApi } from "@/api/contentApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { DEFAULT_ORARI } from "@/lib/salonConfig";

const URL_FIELDS = [
  ["instagramUrl", "Instagram"],
  ["facebookUrl", "Facebook"],
  ["whatsappUrl", "WhatsApp"],
  ["googleMapsUrl", "Google Maps"],
  ["googleReviewUrl", "Link recensione Google"],
];

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

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
  logoUrl: "",
  openingHoursDisplay: DEFAULT_ORARI,
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [savedForm, setSavedForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    businessInfoApi.adminGet()
      .then((res) => {
        const rec = res?.businessInfo;
        if (rec) {
          const loaded = {
            businessName: rec.businessName || "",
            address: rec.address || "",
            phone: rec.phone || "",
            email: rec.email || "",
            instagramUrl: rec.instagramUrl || "",
            facebookUrl: rec.facebookUrl || "",
            whatsappUrl: rec.whatsappUrl || "",
            googleMapsUrl: rec.googleMapsUrl || "",
            googleReviewUrl: rec.googleReviewUrl || "",
            logoUrl: rec.logoUrl || "",
            openingHoursDisplay: rec.openingHoursDisplay?.length ? rec.openingHoursDisplay : DEFAULT_ORARI,
          };
          setForm(loaded);
          setSavedForm(loaded);
        }
      })
      .catch(() => setForm(EMPTY))
      .finally(() => setLoading(false));
  }, []);

  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  useEffect(() => {
    const handler = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const updateOrari = (i, field, value) =>
    setForm((f) => ({
      ...f,
      openingHoursDisplay: f.openingHoursDisplay.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    }));

  const validate = () => {
    if (!form.businessName?.trim() || !form.address?.trim() || !form.phone?.trim()) {
      toast.error("Compila nome attività, indirizzo e telefono");
      return false;
    }
    for (const [field, label] of URL_FIELDS) {
      const value = form[field]?.trim();
      if (value && !isValidUrl(value)) {
        toast.error(`Link "${label}" non valido`, { description: "Deve essere un URL completo, es. https://..." });
        return false;
      }
    }
    const openDay = form.openingHoursDisplay.find((row) => !row.chiuso && !row.orario?.trim());
    if (openDay) {
      toast.error(`Orario mancante per ${openDay.giorno}`, { description: "Inserisci l'orario o spunta \"Chiuso\"." });
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    const payload = { ...form, businessName: form.businessName.trim(), address: form.address.trim(), phone: form.phone.trim() };
    try {
      await businessInfoApi.adminUpdate(payload);
      queryClient.invalidateQueries({ queryKey: ["site_data"] });
      setSavedForm(payload);
      setForm(payload);
      toast.success("Impostazioni salvate");
    } catch (err) {
      console.error(err);
      toast.error("Impossibile salvare", { description: "Controlla la connessione e riprova." });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => setForm(savedForm);

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Impostazioni attività</h1>
          <p className="mt-1 text-sm text-muted-foreground">I dati qui modificati aggiornano indirizzo, telefono e orari visibili nel sito.</p>
        </div>

        {loading ? (
          <LoadingSpinner className="py-20" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-start">
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div>
                  <h2 className="font-heading text-lg font-semibold">Dati attività</h2>
                  <span className="mt-1.5 block h-0.5 w-10 rounded-full bg-primary" />
                </div>
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
                <ImageUploadField
                  label="Logo"
                  value={form.logoUrl}
                  onChange={(url) => setForm({ ...form, logoUrl: url })}
                  folder="branding"
                />
              </div>

              <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div>
                  <h2 className="font-heading text-lg font-semibold">Link social ed esterni</h2>
                  <span className="mt-1.5 block h-0.5 w-10 rounded-full bg-primary" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <Label htmlFor="gmaps">Google Maps (URL)</Label>
                    <Input id="gmaps" value={form.googleMapsUrl} onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="greview">Google — link recensione (URL)</Label>
                    <Input id="greview" value={form.googleReviewUrl} onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })} placeholder="https://g.page/.../review" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div>
                <h2 className="font-heading text-lg font-semibold">Orari di apertura</h2>
                <span className="mt-1.5 block h-0.5 w-10 rounded-full bg-primary" />
              </div>
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

            <div className="flex items-center justify-end gap-3">
              {dirty && <p className="mr-auto text-sm text-warning">Modifiche non salvate</p>}
              {dirty && (
                <Button type="button" variant="outline" onClick={handleDiscard} disabled={saving}>Annulla modifiche</Button>
              )}
              <Button type="submit" disabled={saving || !dirty}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvataggio...</> : <><Save className="mr-2 h-4 w-4" /> Salva</>}
              </Button>
            </div>
          </form>
        )}
      </main>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confermi le modifiche?</DialogTitle>
            <DialogDescription>Questi dati sono visibili subito sul sito pubblico (indirizzo, telefono, orari e link social).</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Annulla</Button>
            <Button onClick={handleConfirmSave}>
              <Save className="mr-2 h-4 w-4" /> Conferma e salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
