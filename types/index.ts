// ─── Patient & Consultation Types ────────────────────────────────────────────

export type Sexe = "M" | "F";

export type MotifPrincipal =
  | "douleur"
  | "fievre"
  | "dyspnee"
  | "toux"
  | "cephalee"
  | "vertiges"
  | "palpitations"
  | "digestif"
  | "urinaire"
  | "cutane"
  | "orl"
  | "traumatisme"
  | "fatigue"
  | "autre";

export interface Constantes {
  temperature?: number;
  taSystolique?: number;
  taDiastolique?: number;
  fc?: number;
  fr?: number;
  spo2?: number;
  poids?: number;
  taille?: number;
}

export interface HMADouleur {
  type?: string;
  eva?: number;
  localisation?: string;
  irradiation?: string;
  evolution?: string;
  facteursDeclenchants?: string;
  facteursCalmantsAggravants?: string;
}

export interface HMAFievre {
  temperature?: number;
  duree?: string;
  mode?: string;
  frissons?: boolean;
  sueurs?: boolean;
}

export interface FichePatient {
  // Section 1 — Identité
  nom?: string;
  prenom?: string;
  age?: number;
  sexe?: Sexe;
  profession?: string;
  dateConsultation?: string;

  // Section 2 — Motif principal
  motifPrincipal?: MotifPrincipal;
  motifLibre?: string;

  // Section 3 — HMA conditionnelle
  hmaDouleur?: HMADouleur;
  hmaFievre?: HMAFievre;
  hmaLibre?: string;

  // Section 4 — Signes associés
  signesAssocies?: string[];

  // Section 5 — Antécédents médicaux
  antecedentsMedicaux?: string[];
  antecedentsChirurgicaux?: string;

  // Section 5b — Gynéco (si femme)
  grossesses?: number;
  parites?: number;
  ddr?: string;
  cyclesReguliers?: boolean;

  // Section 6 — Allergies & Traitements
  allergies?: string[];
  allergieDetail?: string;
  traitementsCours?: string;

  // Section 7 — Mode de vie
  tabac?: boolean;
  tabacPA?: number;
  alcool?: boolean;
  activitePhysique?: string;
  alimentation?: string;

  // Section 8 — Antécédents familiaux
  antecedentsFamiliaux?: string[];

  // Section 9 — Constantes
  constantes?: Constantes;

  // Section 10 — Examen clinique
  examenClinique?: Record<string, string>;

  // Section 11 — Notes libres
  notesLibres?: string;
}

// ─── AI Agent Types ───────────────────────────────────────────────────────────

export type AlerteNiveau = "urgent" | "warning" | "info";

export interface AlerteClinic {
  id: string;
  niveau: AlerteNiveau;
  message: string;
  parametre?: string;
  valeur?: number;
  action?: string;
}

export interface Hypothese {
  id: string;
  diagnostic: string;
  probabilite: "haute" | "moyenne" | "faible";
  score?: number;
  arguments?: string[];
  ddx?: string[];
}

export interface Suggestion {
  id: string;
  type: "question" | "examen" | "action";
  texte: string;
  done?: boolean;
}

export type MessageRole = "medecin" | "agent";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  ficheUpdate?: Partial<FichePatient>;
}

export interface AgentState {
  alertes: AlerteClinic[];
  hypotheses: Hypothese[];
  suggestions: Suggestion[];
  messages: ChatMessage[];
  isAnalyzing: boolean;
  isTyping: boolean;
  ordonnanceSuggree?: string;
}

// ─── Progress Bar Types ───────────────────────────────────────────────────────

export interface EtapeConsultation {
  id: string;
  label: string;
  completed: boolean;
  fields: (keyof FichePatient)[];
}
