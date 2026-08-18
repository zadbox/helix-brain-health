import { describe, expect, it } from "vitest";
import { fichePatientSchema, reportRequestSchema } from "@/lib/api-validation";

describe("fichePatientSchema", () => {
  it("rejette une constante physiologiquement hors limites techniques", () => {
    const result = fichePatientSchema.safeParse({
      constantes: { spo2: 140 },
    });

    expect(result.success).toBe(false);
  });

  it("conserve les négations explicites", () => {
    const result = fichePatientSchema.parse({
      tabac: false,
      alcool: false,
      hmaFievre: { frissons: false },
    });

    expect(result.tabac).toBe(false);
    expect(result.alcool).toBe(false);
    expect(result.hmaFievre?.frissons).toBe(false);
  });
});

describe("reportRequestSchema", () => {
  it("initialise les listes optionnelles de la passerelle de rapport", () => {
    const result = reportRequestSchema.parse({
      fiche: {},
      hypotheses: [],
      medecin: "Médecin responsable",
    });

    expect(result.suggestions).toEqual([]);
    expect(result.alertes).toEqual([]);
  });
});
