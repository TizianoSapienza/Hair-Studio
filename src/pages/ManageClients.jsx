import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Tag, Loader2, ArrowLeft } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { useAuth } from "@/lib/AuthContext";
import { formatDateIT } from "@/lib/salonConfig";

export default function ManageClients() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list()
      .then((items) => setUsers(items || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  if (user && user.role !== "admin") return <Navigate to="/" replace />;

  const clients = users.filter((u) => u.role !== "admin");

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
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">Nessun cliente</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {clients.map((u) => (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{u.full_name || "—"}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" />{u.email}</p>
                    {(u.phone || u.data?.phone) && <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" />{u.phone || u.data.phone}</p>}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    <Tag className="mr-1 h-3 w-3" />{u.role}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Registrato il {formatDateIT(u.created_date.slice(0, 10))}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}