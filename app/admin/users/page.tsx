"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Ban,
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  UserCheck,
} from "lucide-react";
import clsx from "clsx";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (planFilter !== "all") params.set("plan", planFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Erreur fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, planFilter, statusFilter]);

  const handleToggleSuspend = async (user: any) => {
    if (!confirm(`Voulez-vous vraiment ${user.isSuspended ? "réactiver" : "suspendre"} cet utilisateur ?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "toggle_suspend",
          value: !user.isSuspended,
        }),
      });

      if (res.ok) {
        await fetchUsers();
        if (selectedUser?.id === user.id) {
          setSelectedUser({ ...selectedUser, isSuspended: !user.isSuspended });
        }
      }
    } catch (err) {
      console.error("Erreur toggle suspend:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlan = async (userId: string, newPlan: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "change_plan",
          value: newPlan,
        }),
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Erreur change plan:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdmin = async (user: any) => {
    if (!confirm(`Modifier les droits administrateur pour ${user.email} ?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "toggle_admin",
          value: !user.isAdmin,
        }),
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Erreur toggle admin:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
            Gestion des Utilisateurs
          </h1>
          <p className="text-xs text-ink-quiet mt-1">
            Recherchez, suspendez ou surclassez les comptes abonnés.
          </p>
        </div>
        <span className="text-xs font-mono text-ink-quiet">
          Total : {users.length} utilisateur(s)
        </span>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="bg-surface border border-line rounded-card p-4 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-quiet absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-line rounded-input text-xs text-ink bg-paper focus:outline-hidden focus:border-mark font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="border border-line rounded-input px-3 py-2 text-xs text-ink bg-paper focus:outline-hidden"
          >
            <option value="all">Toutes formules</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="promax">Pro Max</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-line rounded-input px-3 py-2 text-xs text-ink bg-paper focus:outline-hidden"
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
          </select>
        </div>
      </div>

      {/* Table des Utilisateurs */}
      <div className="bg-surface border border-line rounded-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-ink-quiet animate-pulse">
            Chargement des utilisateurs...
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-paper border-b border-line text-ink-quiet font-medium">
                <tr>
                  <th className="px-5 py-3">Utilisateur</th>
                  <th className="px-5 py-3">Formule</th>
                  <th className="px-5 py-3">Posts Créés</th>
                  <th className="px-5 py-3">Parrainé Par</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {users.map((u) => {
                  const plan = u.subscription?.plan || "free";
                  return (
                    <tr key={u.id} className="hover:bg-paper/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-paper border border-line flex items-center justify-center text-[10px] font-bold text-ink-quiet">
                            {u.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-ink flex items-center gap-1.5">
                              <span>{u.name || "Sans nom"}</span>
                              {u.isAdmin && (
                                <span className="bg-mark-light text-mark text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-ink-quiet">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <select
                          value={plan}
                          onChange={(e) => handleChangePlan(u.id, e.target.value)}
                          disabled={actionLoading}
                          className="bg-paper border border-line rounded px-2 py-1 text-[11px] font-semibold text-ink uppercase tracking-wider"
                        >
                          <option value="free">FREE</option>
                          <option value="pro">PRO</option>
                          <option value="promax">PRO MAX</option>
                        </select>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-ink">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <FileText className="w-3.5 h-3.5 text-ink-quiet" />
                          {u._count?.posts || 0}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {u.referredByPartner ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-mark bg-mark-light/60 px-2 py-0.5 rounded">
                            {u.referredByPartner.code}
                          </span>
                        ) : (
                          <span className="text-[11px] text-ink-quiet font-mono">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                            u.isSuspended ? "bg-danger/15 text-danger" : "bg-confirm/15 text-confirm"
                          )}
                        >
                          {u.isSuspended ? "Suspendu" : "Actif"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleSuspend(u)}
                          disabled={actionLoading}
                          className={clsx(
                            "px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer",
                            u.isSuspended
                              ? "bg-confirm/10 text-confirm hover:bg-confirm/20"
                              : "bg-danger/10 text-danger hover:bg-danger/20"
                          )}
                        >
                          {u.isSuspended ? "Réactiver" : "Suspendre"}
                        </button>

                        <button
                          onClick={() => handleToggleAdmin(u)}
                          disabled={actionLoading}
                          title={u.isAdmin ? "Révoquer admin" : "Promouvoir admin"}
                          className="p-1 text-ink-quiet hover:text-mark rounded transition-colors cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-ink-quiet">
            Aucun utilisateur ne correspond à vos critères.
          </div>
        )}
      </div>
    </div>
  );
}
