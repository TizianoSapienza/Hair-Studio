import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Home, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "@/components/layout/AdminHeader";
import { useAuth } from "@/lib/AuthContext";

const FIELDS = [
  { key: "hero_title", label: "Hero — Titolo", type: "input" },
  { key: "hero_subtitle", label: "Hero — Sottotitolo", type: "textarea" },
  { key: "chi_siamo_titolo", label: "Chi siamo — Titolo", type: "input" },
  { key: "chi_siamo_testo", label: "Chi siamo — Testo", type: "textarea" },
  { key: "card1_numero", label: "Card 1 — Numero/Titolo", type: "input" },
  { key: "card1_testo", label: "Card 1 — Descrizione", type: "input" },
  { key: "card2_numero", label: "Card 2 — Numero/Titolo", type: "input" },
  { key: "card2_testo", label: "Card 2 — Descrizione", type: "input" },
  { key: "card3_numero", label: "Card 3 — Numero/Titolo", type: "input" },
  { key: "card3_testo", label: "Card 3 — Descrizione", type: "input" },
  { key: "footer_description", label: "Footer — Descrizione", type: "textarea" },
  { key: "about_chi_siamo", label: "Pagina About — Chi siamo (presentazione, storia, stile)", type: "textarea" },
  { key: "about_come_funziona", label: "Pagina About — Come funziona la prenotazione (app, operatore, calendario)", type: "textarea" },
  { key: "about_team", label: "Pagina About — Il team (barbieri) + CTA Contatti", type: "textarea" },
];

export default function ManageHomeContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.HomepageContent.list()
      .then((items) => {
        const rec = (items && items[0]) || null;
        setRecord(rec);
        setForm(rec || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (user && user.role !== "admin") return <Navigate to="/admin" replace />;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;
      if (record?.id) {
        await base44.entities.HomepageContent.update(record.id, payload);
      } else {
        const created = await base44.entities.HomepageContent.create(payload);
        setRecord(created);
      }
      queryClient.invalidateQueries({ queryKey: ["homepage_content"] });
      toast.success("Contenuti salvati");
    } catch (err) {
      toast.error("Errore nel salvataggio");
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