import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await verifyEmail(email, code);
      window.location.href = user?.role === "admin" ? "/admin" : returnTo;
    } catch (err) {
      setError(err.message || "Codice non valido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification({ email });
    } catch {
      // Risposta generica indipendentemente dall'esito
    } finally {
      setResending(false);
      setResent(true);
    }
  };

  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Conferma la tua email"
      subtitle={email ? `Abbiamo inviato un codice a ${email}` : "Inserisci il codice ricevuto via email"}
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Torna al login
        </Link>
      }
    >
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Codice di verifica</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="h-12 text-center text-lg tracking-[0.4em]"
            required
          />
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || code.length !== 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifica in corso...</> : "Conferma"}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        {resent ? (
          <p className="text-muted-foreground">Se l'account esiste, un nuovo codice è in arrivo.</p>
        ) : (
          <button type="button" onClick={handleResend} disabled={resending} className="text-primary font-medium hover:underline disabled:opacity-60">
            {resending ? "Invio in corso..." : "Invia di nuovo il codice"}
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
