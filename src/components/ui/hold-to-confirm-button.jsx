import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_HOLD_MS = 350;

//Bottone che richiede di tenere premuto invece di un click secco o un AlertDialog — più
//veloce di un popup di conferma da leggere e chiudere, ma protegge dal fat-finger su azioni
//consequenziali (cancella/elimina) durante un uso rapido dell'admin. Il riempimento visivo è
//solo estetico: il fire dell'azione è temporizzato via setTimeout, non dalla transizione CSS.
export const HoldToConfirmButton = React.forwardRef(function HoldToConfirmButton(
  { onConfirm, holdMs = DEFAULT_HOLD_MS, disabled, className, children, ...props },
  ref
) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setHolding(false);
  }, []);

  const start = useCallback(() => {
    if (disabled || timerRef.current) return;
    setHolding(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setHolding(false);
      onConfirm();
    }, holdMs);
  }, [disabled, holdMs, onConfirm]);

  //Se il bottone si disabilita mentre è tenuto premuto (es. un'altra riga ha innescato
  //actionLoading), non deve poter comunque scattare in background.
  useEffect(() => { if (disabled) cancel(); }, [disabled, cancel]);
  useEffect(() => () => cancel(), [cancel]);

  return (
    <Button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn("relative select-none overflow-hidden touch-manipulation", className)}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); start(); }
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") cancel();
      }}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-foreground/20"
        style={{
          width: holding ? "100%" : "0%",
          transition: holding ? `width ${holdMs}ms linear` : "width 120ms ease-out",
        }}
      />
      <span className="relative z-10 inline-flex items-center">{children}</span>
    </Button>
  );
});
