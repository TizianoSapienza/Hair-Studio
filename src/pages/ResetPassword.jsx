import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle, Eye, EyeOff, Check, X } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { PASSWORD_REGEX } from "@/lib/passwordRules";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasLen = PASSWORD_REGEX.test(newPassword);
  const hasMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (!hasLen) {
      setError("La password deve contenere una lettera, un numero e un carattere speciale (min. 8 caratteri)");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token: resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Impossibile reimpostare la password");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Link non valido"
        subtitle="Il link di ripristino è mancante o non valido"
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Richiedi un nuovo link
          </Link>
        }
      >
        <p className="text-center text-sm text-foreground">
          Il link che hai usato risulta incompleto. Richiedi una nuova email di ripristino password.
        </p>
      </AuthLayout>
    );
  }

  const Req = ({ ok, label }) => (
    <li className={`flex items-center gap-1.5 ${ok ? "text-success" : "text-muted-foreground"}`}>
      {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {label}
    </li>
  );

  return (
    <AuthLayout
      icon={Lock}
      title="Nuova password"
      subtitle="Inserisci la tua nuova password"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nuova password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 pl-10 pr-10"
              required
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostra password">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Conferma password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pl-10 pr-10"
              required
            />
          </div>
        </div>
        <ul className="space-y-1 text-xs">
          <Req ok={hasLen} label="Lettera, numero e carattere speciale (min. 8)" />
          <Req ok={hasMatch} label="Le password coincidono" />
        </ul>
        <Button type="submit" className="h-12 w-full font-medium" disabled={loading || !hasLen || !hasMatch}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reimpostazione...
            </>
          ) : (
            "Reimposta password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}