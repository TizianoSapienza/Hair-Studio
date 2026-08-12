import React, { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Mail, Lock, User, Phone, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";
import { PASSWORD_REGEX } from "@/lib/passwordRules";
import { normalizePhoneDigits, PHONE_DIGITS_REGEX } from "@/lib/phone";

const CountryCodeSelect = React.lazy(() => import("@/components/profile/CountryCodeSelect"));

function Requirement({ ok, label }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${ok ? "text-success" : "text-muted-foreground"}`}>
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </li>
  );
}

export default function Register() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("+39");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reqs = {
    len: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z\d]/.test(password),
  };

  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim()) { setError("Inserisci il nome"); return; }
    if (!lastName.trim()) { setError("Inserisci il cognome"); return; }
    if (!PASSWORD_REGEX.test(password)) {
      setError("La password non soddisfa tutti i requisiti.");
      return;
    }
    if (password !== confirmPassword) { setError("Le password non coincidono"); return; }

    const num = normalizePhoneDigits(phone, code);
    if (!PHONE_DIGITS_REGEX.test(num)) { setError("Inserisci un numero di telefono valido"); return; }
    const fullPhone = `${code} ${num}`;

    setLoading(true);
    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: fullPhone,
        password,
      });
      window.location.href = `/verify-email?email=${encodeURIComponent(result.email)}`;
    } catch (err) {
      setError(err.message || "Registrazione fallita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title="Crea il tuo account cliente"
      subtitle="Registrati per prenotare il tuo appuntamento"
      footer={<>Hai già un account? <Link to={"/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")} className="text-primary font-medium hover:underline">Accedi</Link></>}
    >
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstname">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="firstname" type="text" autoComplete="given-name" autoFocus placeholder="Mario" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Cognome</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="lastname" type="text" autoComplete="family-name" placeholder="Rossi" value={lastName} onChange={(e) => setLastName(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <div className="flex gap-2">
            <Suspense fallback={<Skeleton className="h-12 w-[112px] shrink-0 rounded-md" />}>
              <CountryCodeSelect value={code} onChange={setCode} triggerClassName="h-12" />
            </Suspense>
            <div className="relative min-w-0 flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="phone" type="tel" autoComplete="tel" placeholder="333 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="email" type="email" autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type={showPwd ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12" required />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostra password">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            <Requirement ok={reqs.len} label="Min. 8 caratteri" />
            <Requirement ok={reqs.letter} label="Una lettera" />
            <Requirement ok={reqs.number} label="Un numero" />
            <Requirement ok={reqs.special} label="Carattere speciale" />
          </ul>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Conferma password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="confirm" type={showPwd2 ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10 h-12" required />
            <button type="button" onClick={() => setShowPwd2(!showPwd2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostra password">
              {showPwd2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creazione account...</> : "Crea account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
