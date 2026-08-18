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
import { calculeProgression, checkConstantes } from "@/lib/utils";

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

const createInitialFiche = (): FichePatient => ({
  dateConsultation: new Date().toISOString().split("T")[0],
  signesAssocies: [],
  antecedentsMedicaux: [],
  antecedentsFamiliaux: [],
  allergies: [],
  examenClinique: {},
});

const createInitialAgent = (): AgentState => ({
  alertes: [],
  hypotheses: [],
  suggestions: [],
  references: [],
  messages: [],
  isAnalyzing: false,
  isTyping: false,
});

export const useConsultationStore = create<ConsultationStore>((set) => ({
  fiche: createInitialFiche(),
  agent: createInitialAgent(),
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
        progression: calculeProgression(newFiche),
        agent: { ...state.agent, alertes },
      };
    });
  },

  resetFiche: () =>
    set({ fiche: createInitialFiche(), agent: createInitialAgent(), startTime: new Date(), progression: 0 }),

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
