import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "@/api/catalogApi";
import { bookingsApi } from "@/api/bookingsApi";
import { scheduleApi } from "@/api/scheduleApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Check, Clock, Loader2, Scissors, CalendarCheck, CalendarDays, Sparkles } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import CalendarView from "@/components/booking/CalendarView";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { formatDateIT } from "@/lib/salonConfig";
import { toDateString } from "@/lib/dateUtils";
import { formatDuration } from "@/lib/format";
import { extractError } from "@/lib/apiError";
import useServices from "@/hooks/useServices";

export default function Booking() {
  const { user } = useAuth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [date, setDate] = useState(today);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("any");
  const [staff, setStaff] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [assignedStaff, setAssignedStaff] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const queryClient = useQueryClient();

  const { data: services = [], isLoading: loadingSvc } = useServices();

  useEffect(() => {
    staffApi.listPublic()
      .then((res) => setStaff(res.staff || []))
      .catch(() => setStaff([]));
    scheduleApi.openingHours()
      .then((res) => { if (res.slotMinutes) setSlotMinutes(res.slotMinutes); })
      .catch(() => {});
  }, []);

  const slotsNeededFor = (s) => Math.max(1, Math.ceil(s.durationMinutes / slotMinutes));

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await bookingsApi.create(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });

  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const handleStaffChange = (id) => {
    setSelectedStaff(id);
    setSelectedSlot(null);
    setSuccess(false);
    setRefreshKey((k) => k + 1);
  };

  const handleSlotSelect = (time) => {
    if (!selectedService) {
      toast.error("Seleziona prima un servizio");
      return;
    }
    setSelectedSlot(time);
    setSuccess(false);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedService || !selectedSlot) return;
    try {
      const result = await createMutation.mutateAsync({
        date: toDateString(date),
        startTime: selectedSlot,
        serviceId: selectedService.id,
        staffId: selectedStaff,
      });
      setAssignedStaff(result?.booking?.staffName || staffLabel);
      setSuccess(true);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error("Impossibile prenotare", { description: extractError(err) });
      setConfirmOpen(false);
    }
  };

  const slotsNeeded = selectedService ? slotsNeededFor(selectedService) : 1;
  const submitting = createMutation.isPending;
  const staffLabel = selectedStaff === "any"
    ? "Primo disponibile"
    : (staff.find((s) => s.id === selectedStaff)?.name || "Operatore");

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <SiteHeader minimal />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Prenotazione</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Ciao{user?.firstName ? `, ${user.firstName}` : ""} 👋 scegli il tuo servizio
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <div>
            <h2 className="font-heading text-lg font-semibold">Servizi</h2>
            {loadingSvc ? (
              <div className="mt-4 flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {services.map((s) => {
                  const active = selectedService?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedService(s); setSelectedSlot(null); setSuccess(false); }}
                      className={[
                        "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                        active ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/50",
                      ].join(" ")}
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{s.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> {formatDuration(s.durationMinutes)} · {slotsNeededFor(s)} slot
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">€{Number(s.price).toFixed(0)}</p>
                        {active && <Check className="ml-auto mt-1 h-4 w-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold">Disponibilità</h2>
            {selectedService ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Servizio: <span className="font-medium text-foreground">{selectedService.name}</span> · occupa {slotsNeeded} slot consecutivi.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Seleziona un servizio per prenotare uno slot libero.</p>
            )}

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Operatore</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStaffChange("any")}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                    selectedStaff === "any" ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" : "border-border bg-card text-foreground hover:border-primary/50",
                  ].join(" ")}
                >
                  <Sparkles className="h-3.5 w-3.5" /> Primo disponibile
                </button>
                {staff.map((s) => {
                  const active = selectedStaff === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleStaffChange(s.id)}
                      className={[
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                        active ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30" : "border-border bg-card text-foreground hover:border-primary/50",
                      ].join(" ")}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <CalendarView
                mode="booking"
                date={date}
                onDateChange={setDate}
                refreshKey={refreshKey}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
                staffId={selectedStaff}
              />
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
              Vuoi rivedere i tuoi appuntamenti?{" "}
              <Link to="/le-mie-prenotazioni" className="font-medium text-brand hover:underline">Le mie prenotazioni →</Link>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={confirmOpen} onOpenChange={(o) => { setConfirmOpen(o); if (!o) setSuccess(false); }}>
        <DialogContent className="sm:max-w-md">
          {!success ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Scissors className="h-5 w-5 text-primary" /> Conferma la prenotazione</DialogTitle>
                <DialogDescription>Controlla i dettagli e conferma per rendere effettivo l'appuntamento.</DialogDescription>
              </DialogHeader>
              {selectedService && (
                <div className="space-y-2 rounded-xl bg-secondary/60 p-4 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Servizio</span><span className="font-medium">{selectedService.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Operatore</span><span className="font-medium">{staffLabel}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span className="font-medium capitalize">{formatDateIT(toDateString(date))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Orario</span><span className="font-medium">{selectedSlot}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Durata</span><span className="font-medium">{formatDuration(selectedService.durationMinutes)}</span></div>
                  <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Prezzo</span><span className="font-semibold text-primary">€{Number(selectedService.price).toFixed(0)}</span></div>
                </div>
              )}
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>Annulla</Button>
                <Button onClick={handleConfirm} disabled={submitting}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confermo...</> : "Conferma prenotazione"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-success animate-icon-pop motion-reduce:animate-icon-fade-in" /> Prenotazione confermata!</DialogTitle>
                <DialogDescription>Il tuo appuntamento è stato registrato. Ti abbiamo inviato una email di conferma.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-xl bg-success-soft p-4 text-sm text-success-soft-foreground">
                <p className="flex items-center gap-2"><Scissors className="h-4 w-4" /> Operatore: <strong>{assignedStaff}</strong></p>
                <p>Puoi rivedere e gestire i tuoi appuntamenti nella tua area personale.</p>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => { setConfirmOpen(false); setSelectedSlot(null); }}>Chiudi</Button>
                <Button asChild><Link to="/le-mie-prenotazioni"><CalendarDays className="mr-2 h-4 w-4" /> Le mie prenotazioni</Link></Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}