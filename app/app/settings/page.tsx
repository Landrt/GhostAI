"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Download, AlertTriangle, Check, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Notifications toggle
  const [notifyOnFail, setNotifyOnFail] = useState(true);

  // Danger zone modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // States
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
        setName(data.user.name || "");
        setEmail(data.user.email || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, newPassword }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur lors de la mise à jour.");
      }
      setProfileNotice(true);
      setPassword("");
      setNewPassword("");
      setTimeout(() => setProfileNotice(false), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/settings/export");
      if (!res.ok) throw new Error("Erreur d'export.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ghostai-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== email) {
      alert("L'adresse email saisie ne correspond pas.");
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: deleteConfirmEmail }),
      });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch (e) {
      console.error(e);
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-mark border-t-transparent rounded-full" />
        <p className="text-xs text-ink-quiet">Chargement des paramètres...</p>
      </div>
    );
  }

  const isGoogleAccount = userData?.isOAuth;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-line">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Paramètres</h1>
        <p className="text-xs text-ink-quiet mt-0.5">Gestion de ton profil, sécurité et préférences.</p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-input text-xs text-danger">
          {error}
        </div>
      )}

      {/* 1. Profil & 2. Compte */}
      <form onSubmit={handleUpdateProfile} className="bg-surface border border-line rounded-card p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-ink">Profil & Compte</h3>
          <p className="text-xs text-ink-quiet mt-0.5">Informations personnelles et authentification.</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton nom"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            disabled={true}
            helperText={isGoogleAccount ? "Compte connecté via Google (non modifiable ici)." : "Email de connexion."}
          />

          {!isGoogleAccount && (
            <div className="pt-4 border-t border-line/60 space-y-4">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider block">
                Changer de mot de passe
              </span>
              <Input
                label="Mot de passe actuel"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label="Nouveau mot de passe"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 caractères"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-line">
          {profileNotice && (
            <span className="text-xs text-confirm font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Modifications enregistrées
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit" variant="primary" size="sm" loading={savingProfile}>
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </form>

      {/* 3. Voix */}
      <div className="bg-surface border border-line rounded-card p-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ink">Profil de voix</h3>
          <p className="text-xs text-ink-quiet mt-0.5">
            Ajuste tes curseurs de style réels, tes tournures préférées et tes textes d&apos;exemples.
          </p>
        </div>
        <Link href="/app/voice">
          <Button variant="outline" size="sm" className="gap-1.5">
            <span>Gérer ton profil de voix</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* 4. Notifications */}
      <div className="bg-surface border border-line rounded-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-ink">Notifications in-app</h3>
          <p className="text-xs text-ink-quiet mt-0.5">Contrôle les avertissements d&apos;interface.</p>
        </div>

        <label className="flex items-center justify-between p-3 bg-paper rounded-input border border-line cursor-pointer">
          <span className="text-xs text-ink font-medium">
            M&apos;avertir si une génération échoue après 3 tentatives de réécriture
          </span>
          <input
            type="checkbox"
            checked={notifyOnFail}
            onChange={(e) => setNotifyOnFail(e.target.checked)}
            className="accent-mark w-4 h-4"
          />
        </label>
      </div>

      {/* 5. Confidentialité */}
      <div className="bg-surface border border-line rounded-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-ink">Confidentialité & Données</h3>
          <p className="text-xs text-ink-quiet mt-0.5">
            Tes textes et tes exemples de style t&apos;appartiennent exclusivement.
          </p>
        </div>

        <p className="text-xs text-ink-quiet leading-relaxed bg-paper p-3.5 rounded-input border border-line">
          <strong>Engagement de souveraineté :</strong> tes exemples de style et tes brouillons ne sont jamais utilisés pour entraîner un modèle d&apos;IA mutualisé entre utilisateurs. Ils restent strictement cantonnés à ton espace et à l&apos;ajustement de ta voix.
        </p>

        <Button variant="outline" size="sm" onClick={handleExportData} loading={exporting} className="gap-2">
          <Download className="w-3.5 h-3.5" />
          <span>Exporter toutes mes données (JSON)</span>
        </Button>
      </div>

      {/* 6. Abonnement */}
      <div className="bg-surface border border-line rounded-card p-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ink">Abonnement & Quotas</h3>
          <p className="text-xs text-ink-quiet mt-0.5">
            Plan actuel : <strong className="uppercase font-mono text-ink">{userData?.subscription?.plan || "FREE"}</strong>
          </p>
        </div>
        <Link href="/app/billing">
          <Button variant="outline" size="sm" className="gap-1.5">
            <span>Gérer mon abonnement</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* 7. Zone dangereuse */}
      <div className="bg-danger/5 border border-danger/20 rounded-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-danger">Zone dangereuse</h3>
          <p className="text-xs text-ink-quiet mt-0.5">
            La suppression de compte est irréversible et efface l&apos;ensemble de tes données.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Supprimer mon compte
        </Button>
      </div>

      {/* Modale confirmation suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer définitivement ton compte ?"
        description="Cette action résilie tout abonnement Stripe en cours et supprime tous tes posts, profils et données sans retour possible."
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-ink">
            Pour confirmer, saisis ton adresse email : <strong className="font-mono text-ink">{email}</strong>
          </p>

          <Input
            value={deleteConfirmEmail}
            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            placeholder={email}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              loading={deleteLoading}
              disabled={deleteConfirmEmail !== email}
            >
              Confirmer la suppression
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
