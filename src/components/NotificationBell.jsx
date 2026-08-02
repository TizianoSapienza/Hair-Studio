import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/AuthContext";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "adesso";
  if (min === 1) return "1 minuto fa";
  if (min < 60) return `${min} minuti fa`;
  const h = Math.floor(min / 60);
  if (h === 1) return "1 ora fa";
  if (h < 24) return `${h} ore fa`;
  const d = Math.floor(h / 24);
  if (d === 1) return "1 giorno fa";
  if (d < 30) return `${d} giorni fa`;
  return new Date(dateStr).toLocaleDateString("it-IT");
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const unread = items.filter((n) => !n.letta).length;

  const loadingRef = useRef(false);
  const load = async () => {
    if (!user || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const list = await base44.entities.Notification.filter({ user_id: user.id }, "-created_date", 20);
      setItems(list || []);
    } catch (e) {} finally { loadingRef.current = false; }
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.Notification.subscribe(() => { load(); });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markRead = async (n) => {
    try {
      await base44.entities.Notification.update(n.id, { letta: true });
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, letta: true } : x)));
    } catch (e) {}
  };

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    setBusy(true);
    try {
      await base44.entities.Notification.updateMany({ user_id: user.id, letta: false }, { $set: { letta: true } });
      setItems((prev) => prev.map((x) => ({ ...x, letta: true })));
    } catch (e) {} finally { setBusy(false); }
  };

  const handleClick = async (n) => {
    if (!n.letta) await markRead(n);
    setOpen(false);
    if (n.booking_id) {
      navigate(user?.role === "admin" ? "/admin" : "/le-mie-prenotazioni");
    }
  };

  const trigger = (
    <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifiche">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Button>
  );

  const panel = (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <p className="text-sm font-semibold">Notifiche</p>
        {unread > 0 && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={markAllRead} disabled={busy}>
            {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="mr-1 h-3.5 w-3.5" />}
            Segna tutte lette
          </Button>
        )}
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {items.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">Nessuna notifica</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => handleClick(n)} className="flex w-full items-start gap-2.5 px-3 py-3 text-left transition-colors hover:bg-accent/50">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.letta ? "bg-transparent" : "bg-primary"}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${n.letta ? "text-muted-foreground" : "font-medium text-foreground"}`}>{n.messaggio}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.created_date)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="mx-auto max-w-md">
          <DrawerHeader className="text-left"><DrawerTitle>Notifiche</DrawerTitle></DrawerHeader>
          <div className="px-4 pb-6">{panel}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">{panel}</PopoverContent>
    </Popover>
  );
}