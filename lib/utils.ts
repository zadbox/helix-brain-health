import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlerteClinic, Constantes } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Vital Signs Alert Logic ──────────────────────────────────────────────────

export function checkConstantes(constantes: Constantes): AlerteClinic[] {
  const alertes: AlerteClinic[] = [];

  if (constantes.temperature !== undefined) {
    if (constantes.temperature > 38.5) {
      alertes.push({
        id: generateId(),
        niveau: "warning",
        parametre: "Température",
        valeur: constantes.temperature,
        message: `Fièvre : ${constantes.temperature}°C`,
        action: "Activer bloc fièvre, envisager bilan infectieux",
      });
    }
    if (constantes.temperature >= 40) {
      alertes.push({
        id: generateId(),
        niveau: "urgent",
        parametre: "Température",
        valeur: constantes.temperature,
        message: `Hyperthermie sévère : ${constantes.temperature}°C`,
        action: "Urgence — refroidissement et bilan immédiat",
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
        action: "Traitement antihypertenseur d'urgence",
      });
    } else if (constantes.taSystolique > 160) {
      alertes.push({
        id: generateId(),
        niveau: "warning",
        parametre: "TA Systolique",
        valeur: constantes.taSystolique,
        message: `HTA stade 2 : ${constantes.taSystolique} mmHg`,
        action: "Optimiser traitement antihypertenseur",
      });
    }
    if (constantes.taSystolique < 90) {
      alertes.push({
        id: generateId(),
        niveau: "urgent",
        parametre: "TA Systolique",
        valeur: constantes.taSystolique,
        message: `Hypotension : ${constantes.taSystolique} mmHg`,
        action: "Chercher état de choc — remplissage vasculaire",
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
      action: "Évaluer oxygénothérapie — rechercher cause respiratoire",
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
        action: "ECG — rechercher tachycardie",
      });
    }
    if (constantes.fc < 50) {
      alertes.push({
        id: generateId(),
        niveau: "warning",
        parametre: "Fréquence Cardiaque",
        valeur: constantes.fc,
        message: `Bradycardie : ${constantes.fc} bpm`,
        action: "ECG — évaluer bradycardie",
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
      action: "Détresse respiratoire — évaluation urgente",
    });
  }

  return alertes;
}

// ─── Completion Score ─────────────────────────────────────────────────────────

export function calculeProgression(fiche: Partial<import("@/types").FichePatient>): number {
  const checks = [
    !!(fiche.nom && fiche.prenom && fiche.age && fiche.sexe),
    !!fiche.motifPrincipal,
    !!(fiche.signesAssocies && fiche.signesAssocies.length > 0),
    !!(fiche.antecedentsMedicaux !== undefined),
    !!(fiche.constantes && Object.keys(fiche.constantes).length > 0),
    !!(fiche.examenClinique && Object.keys(fiche.examenClinique).length > 0),
    !!(fiche.notesLibres || fiche.traitementsCours),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
