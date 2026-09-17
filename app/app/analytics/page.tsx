"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import clsx from "clsx";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<number>(90);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?days=${period}`);
      if (!res.ok) throw new Error("Erreur de chargement.");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement des métriques.");
    } finally {
      setLoading(false);
    }
  };

  const hasEnoughData = (data?.postsGenerated ?? 0) >= 5;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Analytics</h1>
          <p className="text-xs text-ink-quiet mt-0.5">
            Suivi de la régularité et de la fidélité de tes écrits dans le temps.
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center bg-surface border border-line rounded p-0.5 text-xs">
          {[
            { label: "30 jours", value: 30 },
            { label: "90 jours", value: 90 },
            { label: "365 jours", value: 365 },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value)}
              className={clsx(
                "px-3 py-1.5 rounded transition-colors font-medium",
                period === item.value
                  ? "bg-paper text-ink font-semibold"
                  : "text-ink-quiet hover:text-ink"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface border border-line rounded-card" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-surface border border-line rounded-card text-center space-y-3">
          <p className="text-sm text-danger">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            Réessayer
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 4 StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Posts générés"
              value={data?.postsGenerated ?? 0}
              subtext={`Sur les ${period} derniers jours`}
            />
            <StatCard
              label="Posts finalisés"
              value={data?.postsCompleted ?? 0}
              subtext="Prêts à être publiés"
            />
            <StatCard
              label="Moyenne Voice Match"
              value={data?.avgVoiceMatch !== null ? `${data.avgVoiceMatch}%` : "-"}
              subtext="Fidélité au profil de voix"
            />
            <StatCard
              label="Qualité moyenne"
              value={data?.avgQuality !== null ? `${data.avgQuality}%` : "-"}
              subtext="Score composite multi-juges"
            />
          </div>

          {/* Graphiques ou Empty State (< 5 posts) */}
          {!hasEnoughData ? (
            <div className="bg-surface border border-line rounded-card p-12 text-center space-y-3 max-w-lg mx-auto my-6">
              <span className="text-2xl block">📊</span>
              <h3 className="text-base font-bold text-ink">Pas encore assez de données</h3>
              <p className="text-xs text-ink-quiet leading-relaxed">
                Il te faut au moins 5 posts générés pour afficher des courbes et des tendances fiables. Continue à créer des posts pour enrichir tes métriques.
              </p>
              <div className="pt-2">
                <Link href="/app/create">
                  <Button variant="secondary" size="sm">
                    Créer un post
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Graphique 1 : Évolution Voice Consistency */}
              <div className="bg-surface border border-line rounded-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-line/60">
                  <h4 className="text-sm font-bold text-ink">Consistance de voix dans le temps</h4>
                  <span className="text-[11px] text-ink-quiet">Score Voice Match (%)</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.voiceConsistencyOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD1" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#6B6660"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => val.slice(5)}
                      />
                      <YAxis
                        stroke="#6B6660"
                        fontSize={11}
                        domain={[50, 100]}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#DEDAD1",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Voice Match"
                        stroke="#127749"
                        strokeWidth={2}
                        dot={{ fill: "#127749", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique 2 : Posts créés dans le temps */}
              <div className="bg-surface border border-line rounded-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-line/60">
                  <h4 className="text-sm font-bold text-ink">Volume de posts créés</h4>
                  <span className="text-[11px] text-ink-quiet">Nombre de créations</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.postsCreatedOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD1" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#6B6660"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => val.slice(5)}
                      />
                      <YAxis
                        stroke="#6B6660"
                        fontSize={11}
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#DEDAD1",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Posts"
                        stroke="#211D1A"
                        strokeWidth={2}
                        dot={{ fill: "#211D1A", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
