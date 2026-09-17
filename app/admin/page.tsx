"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Percent,
  BadgePercent,
  ShieldAlert,
  Activity,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Server,
} from "lucide-react";
import clsx from "clsx";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur overview:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="h-8 w-64 bg-line/40 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-line/20 rounded-card animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-line/20 rounded-card animate-pulse" />
      </div>
    );
  }

  const kpis = data?.kpis || {
    mrr: 0,
    totalUsers: 0,
    paidUsers: 0,
    conversionRate: 0,
    activeAffiliates: 0,
    totalCommissions: 0,
  };

  const chartData: Array<{ date: string; revenue: number }> = data?.chartData || [];
  const auditLogs = data?.auditLogs || [];

  // Calcul du tracé SVG pur (Zéro dépendance lourde)
  const maxRev = Math.max(...chartData.map((d) => d.revenue), 10);
  const minRev = Math.min(...chartData.map((d) => d.revenue), 0);
  const svgWidth = 800;
  const svgHeight = 200;

  const points = chartData
    .map((d, index) => {
      const x = (index / (chartData.length - 1 || 1)) * (svgWidth - 60) + 30;
      const y = svgHeight - 30 - ((d.revenue - minRev) / (maxRev - minRev || 1)) * (svgHeight - 60);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = points
    ? `${points} ${svgWidth - 30},${svgHeight} 30 neck ${svgHeight}`.replace("neck", "")
    : "";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-serif">
          Vue d&apos;ensemble de la plateforme
        </h1>
        <p className="text-xs text-ink-quiet mt-1">
          Surveillance en direct des finances, de la croissance des utilisateurs et de l&apos;activité du système.
        </p>
      </div>

      {/* 4 KPIs Financiers & Croissance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>MRR Estimé</span>
            <TrendingUp className="w-4 h-4 text-confirm" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">{kpis.mrr} $</div>
          <p className="text-[11px] text-ink-quiet">Revenus récurrents mensuels abonnés</p>
        </div>

        {/* Utilisateurs */}
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Utilisateurs Inscrits</span>
            <Users className="w-4 h-4 text-mark" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">{kpis.totalUsers}</div>
          <p className="text-[11px] text-ink-quiet">
            Dont <span className="font-semibold text-ink">{kpis.paidUsers}</span> abonnés payants
          </p>
        </div>

        {/* Taux de Conversion */}
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Taux de Conversion</span>
            <Percent className="w-4 h-4 text-warn" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">{kpis.conversionRate}%</div>
          <p className="text-[11px] text-ink-quiet">Visiteurs inscrits devenus payants</p>
        </div>

        {/* Partenaires Actifs */}
        <div className="bg-surface border border-line rounded-card p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-quiet">
            <span>Affiliés Actifs</span>
            <BadgePercent className="w-4 h-4 text-mark" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono">{kpis.activeAffiliates}</div>
          <p className="text-[11px] text-ink-quiet">
            Commissions : <span className="font-semibold text-ink">{kpis.totalCommissions} $</span>
          </p>
        </div>
      </div>

      {/* Courbe SVG des Revenus sur 30 jours */}
      <div className="bg-surface border border-line rounded-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm text-ink">Revenus Quotidiens (30 derniers jours)</h2>
            <p className="text-xs text-ink-quiet">Rendu en SVG vectoriel léger sans dépendance tierce.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-ink-quiet">
            <span className="w-2.5 h-2.5 rounded-full bg-mark inline-block" />
            Courbe de volume quotidien
          </div>
        </div>

        <div className="w-full h-56 pt-2">
          {chartData.length > 0 ? (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#127749" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#127749" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Lignes de repère horizontales discrètes */}
              <line x1="30" y1="30" x2={svgWidth - 30} y2="30" stroke="#DEDAD1" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="30" y1={svgHeight / 2} x2={svgWidth - 30} y2={svgHeight / 2} stroke="#DEDAD1" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="30" y1={svgHeight - 30} x2={svgWidth - 30} y2={svgHeight - 30} stroke="#DEDAD1" strokeWidth="1" />

              {/* Zone dégradée sous la courbe */}
              {points && (
                <polygon
                  points={`${points} ${svgWidth - 30},${svgHeight - 30} 30,${svgHeight - 30}`}
                  fill="url(#secondaryGradient)"
                />
              )}

              {/* Ligne principale */}
              {points && (
                <polyline
                  fill="none"
                  stroke="#127749"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              )}

              {/* Points de repère */}
              {chartData.map((d, index) => {
                if (index % 5 !== 0 && index !== chartData.length - 1) return null;
                const x = (index / (chartData.length - 1 || 1)) * (svgWidth - 60) + 30;
                const y = svgHeight - 30 - ((d.revenue - minRev) / (maxRev - minRev || 1)) * (svgHeight - 60);
                return (
                  <g key={index}>
                    <circle cx={x} cy={y} r="3.5" fill="#127749" />
                    <text x={x} y={svgHeight - 10} textAnchor="middle" fontSize="10" fill="#6B6660">
                      {d.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-ink-quiet">
              Données de revenus insuffisantes pour afficher la courbe.
            </div>
          )}
        </div>
      </div>

      {/* 2 Colonnes : Journal d'Audit & État des Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flux d'Audit */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-card overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-line flex items-center justify-between">
            <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-ink-quiet" />
              Journal d&apos;Audit Récent
            </h2>
            <span className="text-[11px] text-ink-quiet">Actions sensibles tracées</span>
          </div>

          {auditLogs.length > 0 ? (
            <div className="divide-y divide-line/60">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="px-6 py-3 text-xs flex items-center justify-between hover:bg-paper/40">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-ink font-semibold">{log.action}</span>
                      <span
                        className={clsx(
                          "text-[9px] px-1.5 py-0.2 rounded font-bold uppercase",
                          log.severity === "critical" && "bg-danger/15 text-danger",
                          log.severity === "warning" && "bg-warn/15 text-warn",
                          log.severity === "info" && "bg-ink/10 text-ink"
                        )}
                      >
                        {log.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-quiet">Par {log.adminEmail}</p>
                  </div>
                  <span className="text-[10px] text-ink-quiet font-mono">
                    {new Date(log.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-ink-quiet">
              Aucune action d&apos;audit enregistrée récemment.
            </div>
          )}
        </div>

        {/* État des Services */}
        <div className="bg-surface border border-line rounded-card p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-sm text-ink flex items-center gap-2">
            <Server className="w-4 h-4 text-ink-quiet" />
            État des Services
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-paper rounded-input border border-line/60">
              <span className="text-ink font-medium">Base PostgreSQL (Prisma)</span>
              <span className="flex items-center gap-1 font-semibold text-confirm">
                <CheckCircle className="w-3.5 h-3.5" />
                Opérationnel
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-paper rounded-input border border-line/60">
              <span className="text-ink font-medium">Moteur LLM (DeepSeek V3)</span>
              <span className="flex items-center gap-1 font-semibold text-confirm">
                <CheckCircle className="w-3.5 h-3.5" />
                Connecté
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-paper rounded-input border border-line/60">
              <span className="text-ink font-medium">Passerelle de Paiement</span>
              <span className="flex items-center gap-1 font-semibold text-confirm">
                <CheckCircle className="w-3.5 h-3.5" />
                Actif
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-paper rounded-input border border-line/60">
              <span className="text-ink font-medium">Authentification (Auth.js)</span>
              <span className="flex items-center gap-1 font-semibold text-confirm">
                <CheckCircle className="w-3.5 h-3.5" />
                Sécurisé
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
