"use client";

import { useConsultationStore } from "@/store/consultation";
import { FichePatient } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Clock, User } from "lucide-react";

const ETAPES = [
  { label: "Identité", short: "ID" },
  { label: "Motif", short: "MC" },
  { label: "Symptômes", short: "Sym" },
  { label: "Antécédents", short: "Atcd" },
  { label: "Constantes", short: "Ctes" },
  { label: "Examen", short: "Exm" },
  { label: "Conclusion", short: "Fin" },
];

function getStepCompleted(fiche: FichePatient, stepIdx: number): boolean {
  switch (stepIdx) {
    case 0: return !!(fiche.nom && fiche.prenom && fiche.age && fiche.sexe);
    case 1: return !!fiche.motifPrincipal;
    case 2: return !!(fiche.signesAssocies && fiche.signesAssocies.length > 0);
    case 3: return !!(fiche.antecedentsMedicaux);
    case 4: return !!(fiche.constantes && Object.values(fiche.constantes).some((v) => v !== undefined));
    case 5: return !!(fiche.examenClinique && Object.keys(fiche.examenClinique).length > 0);
    case 6: return !!(fiche.notesLibres || fiche.traitementsCours);
    default: return false;
  }
}

interface ProgressBarProps {
  onFinish: () => void;
}

export function ProgressBar({ onFinish }: ProgressBarProps) {
  const { fiche, progression, startTime } = useConsultationStore();

  const elapsedMin = Math.floor((Date.now() - startTime.getTime()) / 60000);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-4 py-2 flex items-center gap-4 flex-shrink-0">
      {/* Patient info */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white">
          <User size={14} />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">
            {fiche.prenom || fiche.nom
              ? `${fiche.prenom || ""} ${fiche.nom || ""}`.trim()
              : "Nouveau patient"}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={10} />
            <span>{elapsedMin}min</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1 flex-1 justify-center">
        {ETAPES.map((step, i) => {
          const completed = getStepCompleted(fiche, i);
          const isActive = !completed && (i === 0 || getStepCompleted(fiche, i - 1));
          return (
            <div key={step.label} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                  completed
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : isActive
                    ? "bg-brand-blue text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {completed ? <Check size={10} className="shrink-0" /> : <span className="w-3 text-center">{i + 1}</span>}
                <span className="hidden lg:inline">{step.label}</span>
                <span className="lg:hidden">{step.short}</span>
              </div>
              {i < ETAPES.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5 mx-0.5",
                    completed ? "bg-green-300" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progression + finish button */}
      <div className="flex items-center gap-3 min-w-[160px] justify-end">
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-blue rounded-full transition-all duration-500"
              style={{ width: `${progression}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600">{progression}%</span>
        </div>
        <button
          onClick={onFinish}
          disabled={progression < 70}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            progression >= 70
              ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          Terminer
        </button>
      </div>
    </header>
  );
}
