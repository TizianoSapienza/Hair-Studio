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

const FIELDS = [
  { key: "heroTitle", label: "Hero — Titolo", type: "input" },
  { key: "heroSubtitle", label: "Hero — Sottotitolo", type: "textarea" },
  { key: "chiSiamoTitolo", label: "Chi siamo — Titolo", type: "input" },
  { key: "chiSiamoTesto", label: "Chi siamo — Testo", type: "textarea" },
  { key: "card1Numero", label: "Card 1 — Numero/Titolo", type: "input" },
  { key: "card1Testo", label: "Card 1 — Descrizione", type: "input" },
  { key: "card2Numero", label: "Card 2 — Numero/Titolo", type: "input" },
  { key: "card2Testo", label: "Card 2 — Descrizione", type: "input" },
  { key: "card3Numero", label: "Card 3 — Numero/Titolo", type: "input" },
  { key: "card3Testo", label: "Card 3 — Descrizione", type: "input" },
  { key: "footerDescription", label: "Footer — Descrizione", type: "textarea" },
  { key: "aboutChiSiamo", label: "Pagina About — Chi siamo (presentazione, storia, stile)", type: "textarea" },
  { key: "aboutComeFunziona", label: "Pagina About — Come funziona la prenotazione (app, operatore, calendario)", type: "textarea" },
  { key: "aboutTeam", label: "Pagina About — Il team (barbieri) + CTA Contatti", type: "textarea" },
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
      queryClient.invalidateQueries({ queryKey: ["homepage_content"] });
      toast.success("Contenuti salvati");
    } catch (err) {
      toast.error("Errore nel salvataggio", { description: extractError(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
        <div className="mb-2 flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Contenuti</h1>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">Modifica i testi della homepage e della pagina About visibili a tutti i visitatori.</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea id={f.key} value={form[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} rows={3} />
                ) : (
                  <Input id={f.key} value={form[f.key] || ""} onChange={(e) => update(f.key, e.target.value)} />
                )}
              </div>
            ))}
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