"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api";

const LEVELS = ["Niveau 1", "Niveau 2", "Niveau 3", "Adulte"];

const SEX_OPTIONS = [
  { value: "M" as const, label: "Masculin" },
  { value: "F" as const, label: "Féminin" },
];

const STATUSES = [
  { value: "ACTIVE" as const, label: "Actif" },
  { value: "PAUSED" as const, label: "En pause" },
  { value: "COMPLETED" as const, label: "Terminé" },
  { value: "ARCHIVED" as const, label: "Archivé" },
];

/**
 * Tous les champs optionnels utilisent z.string().optional() sans .default().
 * Les champs enum obligatoires (sex, status) n'utilisent PAS .default() pour éviter
 * l'incompatibilité entre le type input Zod (optionnel avec default) et le type
 * output (obligatoire) que React Hook Form + zodResolver ne réconcilie pas.
 * La valeur par défaut est fournie directement dans `defaultValues`.
 */
const schema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  sex: z.enum(["M", "F"]),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  phone: z.string().optional(),
  // union string().email() | literal("") permet un champ email optionnel avec valeur vide
  email: z.union([z.string().email("Email invalide"), z.literal("")]).optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  profession: z.string().optional(),
  educationLevel: z.string().optional(),
  maritalStatus: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  level: z.string().min(1, "Niveau requis"),
  communityId: z.string().optional(),
  guardianName: z.string().optional(),
  registrationDate: z.string().optional(),
  notes: z.string().optional(),
  // Pas de .default() ici — la valeur par défaut est dans defaultValues
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]),
});

// Le type est strictement inféré du schéma — aucun type manuel
type FormValues = z.infer<typeof schema>;

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
  initial?: Partial<FormValues & { id: string }>;
};

export const CatechumenForm = ({ onSuccess, onCancel, initial }: Props) => {
  const { accessToken } = useAuthStore();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!initial?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initial?.firstName ?? "",
      lastName: initial?.lastName ?? "",
      // Valeur par défaut explicite — correspond exactement au type z.enum(["M","F"])
      sex: initial?.sex ?? "M",
      birthDate: initial?.birthDate ?? "",
      birthPlace: initial?.birthPlace ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      address: initial?.address ?? "",
      neighborhood: initial?.neighborhood ?? "",
      profession: initial?.profession ?? "",
      educationLevel: initial?.educationLevel ?? "",
      maritalStatus: initial?.maritalStatus ?? "",
      fatherName: initial?.fatherName ?? "",
      motherName: initial?.motherName ?? "",
      emergencyContact: initial?.emergencyContact ?? "",
      emergencyPhone: initial?.emergencyPhone ?? "",
      level: initial?.level ?? "Niveau 1",
      communityId: initial?.communityId ?? "",
      guardianName: initial?.guardianName ?? "",
      registrationDate:
        initial?.registrationDate ?? new Date().toISOString().split("T")[0],
      notes: initial?.notes ?? "",
      // Valeur par défaut explicite — correspond exactement au type enum
      status: initial?.status ?? "ACTIVE",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setDocFiles((prev) => [...prev, ...files]);
  };

  const submit = form.handleSubmit(async (values) => {
    if (!accessToken) {
      toast.error("Vous devez être connecté pour effectuer cette action.");
      return;
    }

    const endpoint = isEdit
      ? `${API_URL}/catechumens/${initial!.id}`
      : `${API_URL}/catechumens`;
    const method = isEdit ? "PATCH" : "POST";

    const body = {
      ...values,
      birthDate: values.birthDate
        ? new Date(values.birthDate).toISOString()
        : undefined,
      registrationDate: values.registrationDate
        ? new Date(values.registrationDate).toISOString()
        : undefined,
      // Envoyer undefined si vide pour ne pas passer une chaîne vide au backend
      email: values.email || undefined,
      communityId: values.communityId || undefined,
    };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        toast.error(err?.error ?? "Erreur lors de l'enregistrement.");
        return;
      }

      toast.success(
        isEdit ? "Catéchumène mis à jour." : "Catéchumène enregistré avec succès."
      );
      onSuccess?.();
    } catch {
      toast.error("Impossible de joindre le serveur.");
    }
  });

  const errors = form.formState.errors;

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* ── Identité ─────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Identité
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Nom <span className="text-destructive">*</span>
            </label>
            <Input placeholder="Nom de famille" {...form.register("lastName")} />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Prénom <span className="text-destructive">*</span>
            </label>
            <Input placeholder="Prénom" {...form.register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Sexe <span className="text-destructive">*</span>
            </label>
            <select
              {...form.register("sex")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {SEX_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Date de naissance</label>
            <Input type="date" {...form.register("birthDate")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Lieu de naissance</label>
            <Input placeholder="Ville / village" {...form.register("birthPlace")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Situation matrimoniale</label>
            <Input
              placeholder="Célibataire, marié(e)…"
              {...form.register("maritalStatus")}
            />
          </div>
        </div>
      </fieldset>

      {/* ── Coordonnées ──────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Coordonnées
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Téléphone</label>
            <Input placeholder="+229 …" {...form.register("phone")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="email@exemple.com"
              {...form.register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Adresse</label>
            <Input placeholder="Adresse complète" {...form.register("address")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Quartier</label>
            <Input placeholder="Quartier / secteur" {...form.register("neighborhood")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Profession</label>
            <Input placeholder="Métier, occupation" {...form.register("profession")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Niveau d'études</label>
            <Input
              placeholder="Primaire, secondaire, universitaire…"
              {...form.register("educationLevel")}
            />
          </div>
        </div>
      </fieldset>

      {/* ── Famille & Urgence ────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Famille &amp; Contact d&apos;urgence
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nom du père</label>
            <Input placeholder="Nom complet du père" {...form.register("fatherName")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Nom de la mère</label>
            <Input placeholder="Nom complet de la mère" {...form.register("motherName")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tuteur / Responsable légal</label>
            <Input
              placeholder="Nom du tuteur (si mineur)"
              {...form.register("guardianName")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Personne à contacter</label>
            <Input placeholder="Nom complet" {...form.register("emergencyContact")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Téléphone d&apos;urgence</label>
            <Input placeholder="+229 …" {...form.register("emergencyPhone")} />
          </div>
        </div>
      </fieldset>

      {/* ── Parcours catéchétique ────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Parcours catéchétique
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Niveau <span className="text-destructive">*</span>
            </label>
            <select
              {...form.register("level")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            {errors.level && (
              <p className="text-xs text-destructive">{errors.level.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Statut</label>
            <select
              {...form.register("status")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Date d&apos;inscription</label>
            <Input type="date" {...form.register("registrationDate")} />
          </div>
        </div>
      </fieldset>

      {/* ── Photo ────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Photo
        </legend>
        <div className="flex items-center gap-4">
          {photoPreview && (
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Aperçu photo"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {photoPreview ? "Changer la photo" : "Ajouter une photo"}
          </Button>
        </div>
      </fieldset>

      {/* ── Documents ────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pièces justificatives
        </legend>
        <div className="space-y-2">
          {docFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span className="truncate text-sm">{f.name}</span>
              <button
                type="button"
                onClick={() =>
                  setDocFiles((prev) => prev.filter((_, j) => j !== i))
                }
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
          <input
            ref={docInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleDocChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => docInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Ajouter des documents
          </Button>
        </div>
      </fieldset>

      {/* ── Observations ─────────────────────────────────── */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Observations
        </legend>
        <textarea
          rows={4}
          placeholder="Notes internes, remarques du responsable…"
          {...form.register("notes")}
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </fieldset>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEdit ? "Mettre à jour" : "Enregistrer le catéchumène"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
};
