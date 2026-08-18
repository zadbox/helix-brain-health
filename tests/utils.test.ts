import { describe, expect, it } from "vitest";
import { calculeProgression, checkConstantes } from "@/lib/utils";

describe("checkConstantes", () => {
  it("produit une seule alerte urgente pour une hyperthermie sévère", () => {
    const alertes = checkConstantes({ temperature: 40 });

    expect(alertes).toHaveLength(1);
    expect(alertes[0]).toMatchObject({
      niveau: "urgent",
      parametre: "Température",
      valeur: 40,
    });
  });

  it("signale une désaturation", () => {
    const alertes = checkConstantes({ spo2: 91 });

    expect(alertes).toHaveLength(1);
    expect(alertes[0].niveau).toBe("urgent");
    expect(alertes[0].message).toContain("91%");
  });
});

describe("calculeProgression", () => {
  it("accepte l’âge zéro comme une valeur renseignée", () => {
    const progression = calculeProgression({
      nom: "Test",
      prenom: "Patient",
      age: 0,
      sexe: "F",
    });

    expect(progression).toBe(14);
  });

  it("ignore les objets cliniques vides", () => {
    const progression = calculeProgression({
      constantes: {},
      examenClinique: { Général: "" },
    });

    expect(progression).toBe(0);
  });
});
