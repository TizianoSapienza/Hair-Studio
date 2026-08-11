import React, { Suspense, useEffect, useState } from "react";
import { accountApi, authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Loader2, Save, Trash2, KeyRound, UserCircle, Eye, EyeOff, Check, X } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import { splitPhone } from "@/lib/phone";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PASSWORD_REGEX } from "@/lib/passwordRules";

const CountryCodeSelect = React.lazy(() => import("@/components/profile/CountryCodeSelect"));

export default function Profile() {
  const { user, checkUserAuth, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("+39");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const pwdReqs = {
    len: newPassword.length >= 8,
    letter: /[A-Za-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[^A-Za-z\d]/.test(newPassword),
  };
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
    const num = phone.replace(/\s+/g, "").replace(/^(0+)/, "");
    if (!num || !/^\d{6,}$/.test(num)) {
      toast.error("Numero non valido", { description: "Inserisci solo le cifre del numero, senza prefisso." });
      return;
    }
    setSaving(true);
    try {
      await accountApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      toast.error("Password non valida", { description: "Serve almeno 8 caratteri, una lettera, un numero e un carattere speciale." });
      return;
    }
    setChangingPwd(true);
    try {
      await authApi.changePassword({ newPassword });
    } catch (err) {
      toast.error("Errore", { description: err.message });
      setChangingPwd(false);
      return;
    }
    //Il cambio password revoca tutte le sessioni lato server: si riporta l'utente al login.
    toast.success("Password aggiornata, effettua di nuovo l'accesso");
    await logout();
    navigate("/login");
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
          <p className="mt-1 text-sm text-muted-foreground">Inserisci la nuova password per aggiornarla direttamente.</p>
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new_password">Nuova password</Label>
                <div className="relative">
                  <Input id="new_password" type={showNew ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostra password">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Conferma password</Label>
                <div className="relative">
                  <Input id="confirm_password" type={showConfirm ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostra password">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {[
                ["len", "Min. 8 caratteri"],
                ["letter", "Una lettera"],
                ["number", "Un numero"],
                ["special", "Carattere speciale"],
              ].map(([k, l]) => (
                <li key={k} className={`flex items-center gap-1.5 ${pwdReqs[k] ? "text-success" : "text-muted-foreground"}`}>
                  {pwdReqs[k] ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {l}
                </li>
              ))}
            </ul>
            <Button type="submit" variant="outline" disabled={changingPwd || !user}>
              {changingPwd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />} Aggiorna password
            </Button>
          </form>
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