import { create } from "zustand";
import {
  FichePatient,
  AgentState,
  ChatMessage,
  AlerteClinic,
  Hypothese,
  Suggestion,
  ReferenceScientifique,
} from "@/types";
import { checkConstantes, generateId } from "@/lib/utils";

interface ConsultationStore {
  fiche: FichePatient;
  agent: AgentState;
  startTime: Date;
  progression: number;

  // Fiche actions
  updateFiche: (updates: Partial<FichePatient>) => void;
  resetFiche: () => void;

  // Agent actions
  setHypotheses: (hypotheses: Hypothese[]) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  setReferences: (references: ReferenceScientifique[]) => void;
  setIsAnalyzing: (v: boolean) => void;
  setIsTyping: (v: boolean) => void;
  addMessage: (msg: ChatMessage) => void;
  markSuggestionDone: (id: string) => void;
  setOrdonnanceSuggree: (text: string) => void;
}

const initialFiche: FichePatient = {
  dateConsultation: new Date().toISOString().split("T")[0],
  signesAssocies: [],
  antecedentsMedicaux: [],
  antecedentsFamiliaux: [],
  allergies: [],
  examenClinique: {},
};

const initialAgent: AgentState = {
  alertes: [],
  hypotheses: [],
  suggestions: [],
  references: [],
  messages: [],
  isAnalyzing: false,
  isTyping: false,
};

function calcProgression(fiche: FichePatient): number {
  const checks = [
    !!(fiche.nom && fiche.prenom && fiche.age && fiche.sexe),
    !!fiche.motifPrincipal,
    !!(fiche.signesAssocies && fiche.signesAssocies.length > 0),
    !!(fiche.antecedentsMedicaux && fiche.antecedentsMedicaux.length >= 0),
    !!(fiche.constantes && Object.values(fiche.constantes).some((v) => v !== undefined)),
    !!(fiche.examenClinique && Object.keys(fiche.examenClinique).length > 0),
    !!(fiche.notesLibres || fiche.traitementsCours),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export const useConsultationStore = create<ConsultationStore>((set, get) => ({
  fiche: initialFiche,
  agent: initialAgent,
  startTime: new Date(),
  progression: 0,

  updateFiche: (updates) => {
    set((state) => {
      // Deep merge nested objects so partial updates don't wipe existing fields
      const NESTED_KEYS: (keyof FichePatient)[] = ["hmaDouleur", "hmaFievre", "constantes", "examenClinique"];
      const merged = { ...updates };
      for (const key of NESTED_KEYS) {
        if (updates[key] && state.fiche[key]) {
          (merged as Record<string, unknown>)[key] = {
            ...(state.fiche[key] as object),
            ...(updates[key] as object),
          };
        }
      }
      const newFiche = { ...state.fiche, ...merged };

      // Auto-check constantes for alerts
      let alertes = state.agent.alertes;
      if (updates.constantes) {
        alertes = checkConstantes({ ...state.fiche.constantes, ...updates.constantes });
      }

      return {
        fiche: newFiche,
        progression: calcProgression(newFiche),
        agent: { ...state.agent, alertes },
      };
    });
  },

  resetFiche: () =>
    set({ fiche: initialFiche, agent: initialAgent, startTime: new Date(), progression: 0 }),

  setHypotheses: (hypotheses) =>
    set((state) => ({ agent: { ...state.agent, hypotheses } })),

  setSuggestions: (suggestions) =>
    set((state) => ({ agent: { ...state.agent, suggestions } })),

  setReferences: (references) =>
    set((state) => ({ agent: { ...state.agent, references } })),

  setIsAnalyzing: (isAnalyzing) =>
    set((state) => ({ agent: { ...state.agent, isAnalyzing } })),

  setIsTyping: (isTyping) =>
    set((state) => ({ agent: { ...state.agent, isTyping } })),

  addMessage: (msg) =>
    set((state) => ({
      agent: { ...state.agent, messages: [...state.agent.messages, msg] },
    })),

  markSuggestionDone: (id) =>
    set((state) => ({
      agent: {
        ...state.agent,
        suggestions: state.agent.suggestions.map((s) =>
          s.id === id ? { ...s, done: true } : s
        ),
      },
    })),

  setOrdonnanceSuggree: (text) =>
    set((state) => ({ agent: { ...state.agent, ordonnanceSuggree: text } })),
}));
