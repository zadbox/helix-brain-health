import { create } from "zustand";
import {
  FichePatient,
  AgentState,
  ChatMessage,
  AlerteClinic,
  Hypothese,
  Suggestion,
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
      const newFiche = { ...state.fiche, ...updates };

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
