import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/api/bookingsApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Ban, Loader2, Scissors, Clock, AlertTriangle } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { formatDateIT } from "@/lib/salonConfig";
import { useSse } from "@/hooks/useSse";
import { isCancellableBooking } from "@/lib/bookingStatus";

export default function MyBookings() {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: loading, isError, refetch } = useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const res = await bookingsApi.listMine();
      return res.bookings || [];
    },
  });

  //Se l'admin conferma/cancella una prenotazione mentre l'utente ha questa pagina aperta,
  //il /notifications/stream (già usato da NotificationBell per lo stesso evento) fa da
  //trigger per invalidare la query, senza aprire un canale SSE dedicato.
  useSse("/notifications/stream", () => queryClient.invalidateQueries({ queryKey: ["myBookings"] }), true);

  const cancelMutation = useMutation({
    mutationFn: async (id) => bookingsApi.cancelMine(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["myBookings"] });
      const previous = queryClient.getQueryData(["myBookings"]);
      queryClient.setQueryData(["myBookings"], (old) => (old || []).filter((b) => b.id !== id));
      return { previous };
    },
    onError: (err, _id, context) => {
      queryClient.setQueryData(["myBookings"], context.previous);
      toast.error("Errore", { description: err.message });
    },
    onSuccess: () => toast.success("Prenotazione cancellata"),
  });

  const upcoming = bookings
    .filter((b) => ["in_attesa", "confermata", "completata"].includes(b.status))
    .sort((a, b) => (a.bookingDate + a.startTime).localeCompare(b.bookingDate + b.startTime));

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <SiteHeader minimal />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">I tuoi appuntamenti</p>
            <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Le mie prenotazioni</h1>
          </div>
          <Button asChild className="w-full sm:w-auto"><Link to="/prenota"><CalendarDays className="mr-2 h-4 w-4" /> Nuova prenotazione</Link></Button>
        </div>

        {loading ? (
            <ul className="space-y-3">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-full" />
                </li>
              ))}
            </ul>
          ) : isError ? (
            <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive-soft p-12 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
              <p className="mt-3 font-medium text-destructive-soft-foreground">Impossibile caricare le prenotazioni</p>
              <p className="text-sm text-muted-foreground">Controlla la connessione o riprova.</p>
              <Button variant="outline" className="mt-5" onClick={() => refetch()}>Riprova</Button>
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState icon={Scissors} title="Nessuna prenotazione" description="Prenota il tuo prossimo appuntamento.">
              <Button asChild className="mt-5"><Link to="/prenota">Prenota ora</Link></Button>
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                  <div>
                    <p className="font-heading text-lg font-semibold">{b.serviceName}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-brand" />
                      <span className="capitalize">{formatDateIT(b.bookingDate)}</span> · ore {b.startTime}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm">
                      <Scissors className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{b.staffName || "Primo disponibile"}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {b.status === "in_attesa" && <Badge variant="warning" className="px-3 py-1.5">In attesa</Badge>}
                    {b.status === "confermata" && <Badge variant="info" className="px-3 py-1.5">Confermata</Badge>}
                    {b.status === "completata" && <Badge variant="success" className="px-3 py-1.5">Completato</Badge>}
                    {isCancellableBooking(b.status) && (
                      <Button variant="outline" onClick={() => cancelMutation.mutate(b.id)} disabled={cancelMutation.isPending && cancelMutation.variables === b.id}>
                        {cancelMutation.isPending && cancelMutation.variables === b.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                        Cancella
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
      </main>
    </div>
  );
}