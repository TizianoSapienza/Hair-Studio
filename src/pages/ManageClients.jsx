import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { clientsApi } from "@/api/contentApi";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Tag, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AdminHeader from "@/components/layout/AdminHeader";
import { formatDateIT } from "@/lib/salonConfig";

export default function ManageClients() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadIdRef = useRef(0);

  useEffect(() => {
    const myId = ++loadIdRef.current;
    clientsApi.adminList()
      .then((res) => { if (myId === loadIdRef.current) setUsers(res.users || []); })
      .catch(() => { if (myId === loadIdRef.current) setUsers([]); })
      .finally(() => { if (myId === loadIdRef.current) setLoading(false); });
  }, []);

  const clients = useMemo(() => users.filter((u) => u.role !== "admin"), [users]);

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Clienti</h1>
          <p className="mt-1 text-sm text-muted-foreground">{loading ? "—" : `${clients.length} clienti registrati.`}</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : clients.length === 0 ? (
          <EmptyState icon={Users} title="Nessun cliente" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {clients.map((u) => (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{u.firstName ? `${u.firstName} ${u.lastName}` : "—"}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" />{u.email}</p>
                    {u.phone && <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" />{u.phone}</p>}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    <Tag className="mr-1 h-3 w-3" />{u.role}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Registrato il {formatDateIT(u.createdAt.slice(0, 10))}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}