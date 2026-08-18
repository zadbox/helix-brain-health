import { z } from "zod";

const shortText = z.string().trim().max(300);
const longText = z.string().trim().max(12_000);
const textList = z.array(z.string().trim().min(1).max(160)).max(80);

const constantsSchema = z.object({
  temperature: z.number().min(25).max(50).optional(),
  taSystolique: z.number().min(30).max(350).optional(),
  taDiastolique: z.number().min(20).max(250).optional(),
  fc: z.number().min(15).max(300).optional(),
  fr: z.number().min(2).max(100).optional(),
  spo2: z.number().min(0).max(100).optional(),
  poids: z.number().min(0.2).max(700).optional(),
  taille: z.number().min(20).max(280).optional(),
});

const painSchema = z.object({
  type: shortText.optional(),
  eva: z.number().min(0).max(10).optional(),
  localisation: shortText.optional(),
  irradiation: shortText.optional(),
  evolution: shortText.optional(),
  facteursDeclenchants: shortText.optional(),
  facteursCalmantsAggravants: shortText.optional(),
});

const feverSchema = z.object({
  temperature: z.number().min(25).max(50).optional(),
  duree: shortText.optional(),
  mode: shortText.optional(),
  frissons: z.boolean().optional(),
  sueurs: z.boolean().optional(),
});

export const fichePatientSchema = z.object({
  nom: shortText.optional(),
  prenom: shortText.optional(),
  age: z.number().int().min(0).max(130).optional(),
  sexe: z.enum(["M", "F"]).optional(),
  profession: shortText.optional(),
  dateConsultation: z.string().trim().max(20).optional(),
  motifPrincipal: z.enum([
    "douleur", "fievre", "dyspnee", "toux", "cephalee", "vertiges", "palpitations",
    "digestif", "urinaire", "cutane", "orl", "traumatisme", "fatigue", "autre",
  ]).optional(),
  motifLibre: longText.optional(),
  hmaDouleur: painSchema.optional(),
  hmaFievre: feverSchema.optional(),
  hmaLibre: longText.optional(),
  signesAssocies: textList.optional(),
  antecedentsMedicaux: textList.optional(),
  antecedentsChirurgicaux: longText.optional(),
  grossesses: z.number().int().min(0).max(30).optional(),
  parites: z.number().int().min(0).max(30).optional(),
  ddr: z.string().trim().max(20).optional(),
  cyclesReguliers: z.boolean().optional(),
  allergies: textList.optional(),
  allergieDetail: longText.optional(),
  traitementsCours: longText.optional(),
  tabac: z.boolean().optional(),
  tabacPA: z.number().min(0).max(500).optional(),
  alcool: z.boolean().optional(),
  activitePhysique: shortText.optional(),
  alimentation: shortText.optional(),
  antecedentsFamiliaux: textList.optional(),
  constantes: constantsSchema.optional(),
  examenClinique: z.record(z.string().max(100), z.string().trim().max(8_000)).optional(),
  notesLibres: longText.optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(8_000),
  fiche: fichePatientSchema,
  history: z.array(z.object({
    role: z.enum(["medecin", "agent"]),
    content: z.string().trim().min(1).max(8_000),
  })).max(10),
});

export const diagnoseRequestSchema = z.object({
  fiche: fichePatientSchema,
});

export const reportRequestSchema = z.object({
  fiche: fichePatientSchema,
  hypotheses: z.array(z.object({
    diagnostic: z.string().trim().min(1).max(500),
    probabilite: z.enum(["haute", "moyenne", "faible"]),
    codeICD10: z.string().trim().max(30).optional(),
    arguments: z.array(z.string().trim().min(1).max(500)).max(8).optional(),
    ddx: z.array(z.string().trim().min(1).max(500)).max(8).optional(),
  })).max(5),
  suggestions: z.array(z.object({
    type: z.enum(["question", "examen", "action"]),
    texte: z.string().trim().min(1).max(1_000),
    done: z.boolean().optional(),
  })).max(12).default([]),
  alertes: z.array(z.object({
    niveau: z.enum(["urgent", "warning", "info"]),
    message: z.string().trim().min(1).max(1_000),
    parametre: z.string().trim().max(160).optional(),
    valeur: z.number().optional(),
    action: z.string().trim().max(1_000).optional(),
  })).max(12).default([]),
  ordonnanceSuggree: longText.optional(),
  medecin: z.string().trim().min(1).max(160),
});

export const diagnosisResultSchema = z.object({
  hypotheses: z.array(z.object({
    id: z.string().trim().max(80).optional(),
    diagnostic: z.string().trim().min(1).max(500),
    codeICD10: z.string().trim().max(30).optional(),
    meshEN: z.array(z.string().trim().min(1).max(120)).max(5).optional(),
    probabilite: z.enum(["haute", "moyenne", "faible"]),
    score: z.number().min(0).max(1).optional(),
    arguments: z.array(z.string().trim().min(1).max(500)).max(5).optional(),
    ddx: z.array(z.string().trim().min(1).max(500)).max(5).optional(),
  })).max(5),
  suggestions: z.array(z.object({
    id: z.string().trim().max(80).optional(),
    type: z.enum(["question", "examen", "action"]),
    texte: z.string().trim().min(1).max(1_000),
    done: z.boolean().optional(),
  })).max(8),
});

export function invalidRequestResponse() {
  return {
    error: "invalid_request",
    message: "Les données envoyées sont invalides ou dépassent les limites autorisées.",
  };
}
