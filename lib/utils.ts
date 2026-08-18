import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlerteClinic, Constantes } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return globalThis.crypto.randomUUID();
}

// ─── Vital Signs Alert Logic ──────────────────────────────────────────────────

export function checkConstantes(constantes: Constantes): AlerteClinic[] {
  const alertes: AlerteClinic[] = [];

  if (constantes.temperature !== undefined) {
    if (constantes.temperature >= 40) {
      alertes.push({
        id: generateId(),
        niveau: "urgent",
        parametre: "Température",
        valeur: constantes.temperature,
        message: `Hyperthermie sévère : ${constantes.temperature}°C`,
        action: "Évaluation médicale immédiate selon le protocole d’urgence de l’établissement",
      });
    } else if (constantes.temperature > 38.5) {
      alertes.push({
        id: generateId(),
        niveau: "warning",
        parametre: "Température",
        valeur: constantes.temperature,
        message: `Fièvre : ${constantes.temperature}°C`,
        action: "Confirmer la mesure et évaluer la tolérance clinique ainsi qu’un foyer infectieux",
      });
    }
  }

  if (constantes.taSystolique !== undefined) {
    if (constantes.taSystolique > 180) {
      alertes.push({
        id: generateId(),
        niveau: "urgent",
        parametre: "TA Systolique",
        valeur: constantes.taSystolique,
        message: `HTA urgence : ${constantes.taSystolique} mmHg`,
        action: "Recontrôler la mesure et rechercher une atteinte d’organe cible en urgence",
      });
    } else if (constantes.taSystolique > 160) {
      alertes.push({
        id: generateId(),
        niveau: "warning",
        parametre: "TA Systolique",
        valeur: constantes.taSystolique,
        message: `HTA stade 2 : ${constantes.taSystolique} mmHg`,
        action: "Confirmer sur plusieurs mesures et réévaluer la prise en charge cardiovasculaire",
      });
    }
    if (constantes.taSystolique < 90) {
      alertes.push({
        id: generateId(),
        niveau: "urgent",
        parametre: "TA Systolique",
        valeur: constantes.taSystolique,
        message: `Hypotension : ${constantes.taSystolique} mmHg`,
        action: "Confirmer la mesure et rechercher immédiatement des signes d’hypoperfusion",
      });
    }
  }

  if (constantes.spo2 !== undefined && constantes.spo2 < 94) {
    alertes.push({
      id: generateId(),
      niveau: "urgent",
      parametre: "SpO2",
      valeur: constantes.spo2,
      message: `Désaturation : SpO2 ${constantes.spo2}%`,
      action: "Confirmer la mesure, rechercher une détresse respiratoire et appliquer le protocole local",
    });
  }

  if (constantes.fc !== undefined) {
    if (constantes.fc > 120) {
      alertes.push({
        id: generateId(),
        niveau: "warning",
        parametre: "Fréquence Cardiaque",
        valeur: constantes.fc,
        message: `Tachycardie : ${constantes.fc} bpm`,
        action: "Confirmer la fréquence, réaliser un ECG et rechercher une mauvaise tolérance",
      });
    }
    if (constantes.fc < 50) {
      alertes.push({
        id: generateId(),
        niveau: "warning",
        parametre: "Fréquence Cardiaque",
        valeur: constantes.fc,
        message: `Bradycardie : ${constantes.fc} bpm`,
        action: "Confirmer la fréquence, réaliser un ECG et rechercher une mauvaise tolérance",
      });
    }
  }

  if (constantes.fr !== undefined && constantes.fr > 25) {
    alertes.push({
      id: generateId(),
      niveau: "urgent",
      parametre: "Fréquence Respiratoire",
      valeur: constantes.fr,
      message: `Polypnée : ${constantes.fr}/min`,
      action: "Rechercher une détresse respiratoire et procéder à une évaluation urgente",
    });
  }

  return alertes;
}

// ─── Completion Score ─────────────────────────────────────────────────────────

export function calculeProgression(fiche: Partial<import("@/types").FichePatient>): number {
  const checks = [
    !!(fiche.nom && fiche.prenom && fiche.age !== undefined && fiche.sexe),
    !!fiche.motifPrincipal,
    !!(fiche.signesAssocies && fiche.signesAssocies.length > 0),
    !!(
      fiche.antecedentsMedicaux?.length ||
      fiche.antecedentsChirurgicaux ||
      fiche.antecedentsFamiliaux?.length
    ),
    !!(
      fiche.constantes &&
      Object.values(fiche.constantes).some((value) => value !== undefined)
    ),
    !!(
      fiche.examenClinique &&
      Object.values(fiche.examenClinique).some((value) => value.trim())
    ),
    !!(fiche.notesLibres || fiche.traitementsCours),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
