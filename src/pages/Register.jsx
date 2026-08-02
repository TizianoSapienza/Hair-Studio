import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User, Phone, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import CountryCodeSelect, { splitPhone } from "@/components/profile/CountryCodeSelect";
import { toast } from "sonner";
import { safeReturnTo } from "@/lib/authReturnTo";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function Requirement({ ok, label }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-600" : "text-muted-foreground"}`}>
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </li>
  );
}

export default function Register() {
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
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const reqs = {
    len: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z\d]/.test(password),
  };

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
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await base44.auth.register({ email, password, full_name: fullName });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registrazione fallita");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      // Persisti il token di sessione. verifyOtp dovrebbe restituire access_token;
      // in caso contrario, effettua il login ora che l'utente è verificato,
      // per garantire che resti autenticato dopo il redirect.
      let token = result?.access_token;
      if (token) {
        base44.auth.setToken(token);
      } else {
        const loginResult = await base44.auth.loginViaEmailPassword(email, password);
        token = loginResult?.access_token;
        if (token) base44.auth.setToken(token);
      }
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const num = phone.replace(/\s+/g, "").replace(/^(0+)/, "");
      const fullPhone = num ? `${code} ${num}` : "";
      try { await base44.auth.updateMe({ first_name: firstName.trim(), last_name: lastName.trim(), phone: fullPhone }); } catch (e) { /* non bloccante */ }
      try { await base44.functions.invoke("SendRegistrationConfirmation", { email, name: fullName }); } catch (e) { /* non bloccante */ }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Codice non valido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast.success("Codice inviato", { description: "Controlla la tua email per il nuovo codice." });
    } catch (err) {
      setError(err.message || "Invio fallito");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  if (showOtp) {
    return (
      <AuthLayout icon={Mail} title="Verifica la tua email" subtitle={`Abbiamo inviato un codice a ${email}`}>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifica in corso...</> : "Verifica"}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Non hai ricevuto il codice?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">Invia di nuovo</button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Crea il tuo account cliente"
      subtitle="Registrati per prenotare il tuo appuntamento"
      footer={<>Hai già un account? <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="text-primary font-medium hover:underline">Accedi</Link></>}
    >
      <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 mr-2" /> Continua con Google
      </Button>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">oppure</span></div>
      </div>

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
            <CountryCodeSelect value={code} onChange={setCode} triggerClassName="h-12" />
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