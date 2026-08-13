import React, { Suspense, useEffect, useState } from "react";
import { accountApi, authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Loader2, Save, Trash2, KeyRound, UserCircle } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import { splitPhone, normalizePhoneDigits, PHONE_DIGITS_REGEX, DEFAULT_COUNTRY_CODE } from "@/lib/phone";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CountryCodeSelect = React.lazy(() => import("@/components/profile/CountryCodeSelect"));

export default function Profile() {
  const { user, checkUserAuth, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    const { code: c, number } = splitPhone(user.phone || "");
    setCode(c);
    setPhone(number);
    setLoading(false);
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    const num = normalizePhoneDigits(phone, code);
    if (!PHONE_DIGITS_REGEX.test(num)) {
      toast.error("Numero non valido", { description: "Inserisci solo le cifre del numero, senza prefisso." });
      return;
    }
    setSaving(true);
    try {
      await accountApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: `${code} ${num}`,
      });
      await checkUserAuth();
      toast.success("Profilo aggiornato");
    } catch (err) {
      toast.error("Errore", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSendReset = async () => {
    setResetSending(true);
    try {
      await authApi.forgotPassword({ email: user.email });
      toast.success("Email inviata", { description: "Controlla la tua casella di posta per il link di reset." });
    } finally {
      setResetSending(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await accountApi.deleteAccount();
      toast.success("Account eliminato");
      await logout();
      navigate("/");
    } catch (err) {
      toast.error("Errore", { description: err.message });
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <SiteHeader minimal />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Account</p>
          <h1 className="mt-1 flex items-center gap-2 font-heading text-3xl font-semibold tracking-tight"><UserCircle className="h-7 w-7 text-primary" /> Il mio profilo</h1>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nome</Label>
                {loading ? <Skeleton className="h-9 w-full" /> : <Input id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Mario" />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Cognome</Label>
                {loading ? <Skeleton className="h-9 w-full" /> : <Input id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Rossi" />}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email di accesso</Label>
              {loading ? <Skeleton className="h-9 w-full" /> : (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              {loading ? (
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-[112px] shrink-0" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              ) : (
                <div className="flex gap-2">
                  <Suspense fallback={<Skeleton className="h-9 w-[112px] shrink-0" />}>
                    <CountryCodeSelect value={code} onChange={setCode} />
                  </Suspense>
                  <div className="relative min-w-0 flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" placeholder="333 1234567" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" disabled={saving || loading}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salva modifiche
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><KeyRound className="h-5 w-5 text-primary" /> Sicurezza</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ti invieremo un'email con un link per reimpostare la password.</p>
          <Button variant="outline" className="mt-4" disabled={resetSending || !user} onClick={handleSendReset}>
            {resetSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />} Invia email per reimpostare la password
          </Button>
        </div>

        {!isAdmin && (
          <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <h3 className="font-heading text-base font-semibold text-destructive">Elimina account</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              L'eliminazione del tuo account è permanente. Tutte le tue prenotazioni verranno cancellate e non potrai più accedere. Questa azione non può essere annullata.
            </p>
            <Button variant="destructive" className="mt-4" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Elimina il mio account
            </Button>
          </div>
        )}
      </main>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di eliminare il tuo account?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è permanente e non può essere annullata. Il tuo account e tutte le prenotazioni associate verranno rimossi definitivamente dal database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Elimina account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}