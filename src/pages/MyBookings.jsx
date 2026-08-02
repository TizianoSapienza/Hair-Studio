import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CalendarDays, Ban, Loader2, Scissors, Clock } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { formatDateIT } from "@/lib/salonConfig";

export default function MyBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const items = await base44.entities.Booking.list("-date");
      return items || [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => base44.functions.invoke("CancelBooking", { booking_id: id }),
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

  // Aggiornamento real-time della lista prenotazioni
  useEffect(() => {
    const unsub = base44.entities.Booking.subscribe(() => { queryClient.invalidateQueries({ queryKey: ["myBookings"] }); });
    return unsub;
  }, [queryClient]);

  const upcoming = bookings
    .filter((b) => b.status === "booked" || b.status === "confirmed" || b.status === "completed")
    .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));

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
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <Scissors className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">Nessuna prenotazione</p>
              <p className="text-sm text-muted-foreground">Prenota il tuo prossimo appuntamento.</p>
              <Button asChild className="mt-5"><Link to="/prenota">Prenota ora</Link></Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                  <div>
                    <p className="font-heading text-lg font-semibold">{b.service_name}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-brand" />
                      <span className="capitalize">{formatDateIT(b.date)}</span> · ore {b.start_time}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm">
                      <Scissors className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{b.staff_name || "Primo disponibile"}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {b.status === "booked" && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">In attesa</span>
                    )}
                    {b.status === "confirmed" && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">Confermata</span>
                    )}
                    {b.status === "completed" && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">Completato</span>
                    )}
                    {b.status !== "completed" && (
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