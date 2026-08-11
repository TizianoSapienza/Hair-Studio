import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { homepageContentApi } from "@/api/contentApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Home, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "@/components/layout/AdminHeader";
import { extractError } from "@/lib/apiError";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const FIELDS = [
  { key: "heroTitle", label: "Titolo", type: "input", section: "hero" },
  { key: "heroImageUrl", label: "Immagine", type: "image", section: "hero" },
  { key: "heroSubtitle", label: "Sottotitolo", type: "textarea", section: "hero" },
  { key: "chiSiamoTitolo", label: "Titolo", type: "input", section: "chiSiamo" },
  { key: "chiSiamoTesto", label: "Testo", type: "textarea", section: "chiSiamo" },
  { key: "aboutImageUrl", label: "Immagine", type: "image", section: "chiSiamo" },
  { key: "card1Numero", label: "Card 1 — Numero/Titolo", type: "input", section: "stats" },
  { key: "card1Testo", label: "Card 1 — Descrizione", type: "input", section: "stats" },
  { key: "card2Numero", label: "Card 2 — Numero/Titolo", type: "input", section: "stats" },
  { key: "card2Testo", label: "Card 2 — Descrizione", type: "input", section: "stats" },
  { key: "card3Numero", label: "Card 3 — Numero/Titolo", type: "input", section: "stats" },
  { key: "card3Testo", label: "Card 3 — Descrizione", type: "input", section: "stats" },
  { key: "footerDescription", label: "Descrizione", type: "textarea", section: "footer" },
  { key: "gallery1ImageUrl", label: "Foto galleria 1", type: "image", section: "gallery" },
  { key: "gallery2ImageUrl", label: "Foto galleria 2", type: "image", section: "gallery" },
  { key: "gallery3ImageUrl", label: "Foto galleria 3", type: "image", section: "gallery" },
  { key: "aboutChiSiamo", label: "Chi siamo", type: "textarea", section: "aboutPage" },
  { key: "aboutComeFunziona", label: "Come funziona la prenotazione online", type: "textarea", section: "aboutPage" },
  { key: "aboutTeam", label: "Il team", type: "textarea", section: "aboutPage" },
];

const COLUMN_1_SECTIONS = [
  { key: "hero", title: "Hero" },
  { key: "chiSiamo", title: "Chi siamo" },
];
const COLUMN_2_SECTIONS = [
  { key: "stats", title: "Statistiche" },
  { key: "footer", title: "Footer" },
];
const FULL_WIDTH_SECTIONS = [
  { key: "gallery", title: "Galleria" },
  { key: "aboutPage", title: "Pagina About" },
];

export default function ManageHomeContent() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    homepageContentApi.adminGet()
      .then((res) => setForm(res?.homepageContent || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      for (const f of FIELDS) payload[f.key] = form[f.key] || "";
      await homepageContentApi.adminUpdate(payload);
      queryClient.invalidateQueries({ queryKey: ["site_data"] });
      toast.success("Contenuti salvati");
    } catch (err) {
      toast.error("Errore nel salvataggio", { description: extractError(err) });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (f) =>
    f.type === "image" ? (
      <ImageUploadField
        key={f.key}
        label={f.label}
        value={form[f.key]}
        onChange={(url) => update(f.key, url)}
        folder="homepage"
      />
    ) : (
      <div key={f.key} className="space-y-2">
        <Label htmlFor={f.key}>{f.label}</Label>
        {f.type === "textarea" ? (
          <Textarea id={f.key} value={form[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} rows={3} />
        ) : (
          <Input id={f.key} value={form[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} />
        )}
      </div>
    );

  const renderSection = (s) => {
    const fields = FIELDS.filter((f) => f.section === s.key);
    return (
      <div key={s.key} className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div>
          <h2 className="font-heading text-lg font-semibold">{s.title}</h2>
          <span className="mt-1.5 block h-0.5 w-10 rounded-full bg-primary" />
        </div>
        {fields.map(renderField)}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
        <div className="mb-2 flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Contenuti</h1>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">Modifica i testi della homepage e della pagina About visibili a tutti i visitatori.</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:items-start">
              <div className="space-y-6">{COLUMN_1_SECTIONS.map(renderSection)}</div>
              <div className="space-y-6">{COLUMN_2_SECTIONS.map(renderSection)}</div>
            </div>
            <div className="space-y-6">{FULL_WIDTH_SECTIONS.map(renderSection)}</div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salva
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
