import { FichePatient } from "@/types";
import fs from "fs";
import path from "path";

interface SkillRegistryEntry {
  id: string;
  name: string;
  priority: string;
  status: string;
  path: string;
  triggers: string[];
  description: string;
}

interface SkillsRegistry {
  version: string;
  project: string;
  skills: SkillRegistryEntry[];
}

// Load active skills from registry
function loadRegistry(): SkillsRegistry {
  try {
    const registryPath = path.join(process.cwd(), "skills", "skills-registry.json");
    const raw = fs.readFileSync(registryPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { version: "1.0", project: "Brain Health", skills: [] };
  }
}

// Read a skill's SKILL.md
function readSkillMd(skillPath: string): string {
  try {
    const fullPath = path.join(process.cwd(), "skills", skillPath.replace("./", ""), "SKILL.md");
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return "";
  }
}

// Select relevant skills based on the patient fiche
export function selectRelevantSkills(fiche: FichePatient): string {
  const registry = loadRegistry();
  const activeSkills = registry.skills.filter((s) => s.status === "active");

  const relevantSkills: string[] = [];

  for (const skill of activeSkills) {
    // Skip UI/UX skill for medical context
    if (skill.id === "ui-ux-pro-max") continue;

    let relevant = false;

    // Always include generaliste and compte-rendu
    if (skill.id === "skill-generaliste" || skill.id === "skill-compte-rendu" || skill.id === "skill-ordonnance" || skill.id === "skill-medicaments-ma") {
      relevant = true;
    }

    // Urgences — if any critical vital
    if (skill.id === "skill-urgences") {
      const c = fiche.constantes;
      if (
        c &&
        ((c.temperature ?? 0) > 40 ||
          (c.taSystolique ?? 0) > 180 ||
          (c.taSystolique ?? 999) < 90 ||
          (c.spo2 ?? 100) < 94 ||
          (c.fc ?? 0) > 120 ||
          (c.fr ?? 0) > 25)
      ) {
        relevant = true;
      }
    }

    // Cardiologie
    if (skill.id === "skill-cardiologie") {
      if (
        fiche.motifPrincipal === "douleur" ||
        fiche.motifPrincipal === "palpitations" ||
        fiche.motifPrincipal === "dyspnee" ||
        fiche.antecedentsMedicaux?.some((a) =>
          ["Coronaropathie", "Insuffisance cardiaque", "ACFA"].includes(a)
        )
      ) {
        relevant = true;
      }
    }

    // Pneumologie
    if (skill.id === "skill-pneumologie") {
      if (
        fiche.motifPrincipal === "toux" ||
        fiche.motifPrincipal === "dyspnee" ||
        fiche.antecedentsMedicaux?.some((a) => ["BPCO", "Asthme", "Tuberculose"].includes(a))
      ) {
        relevant = true;
      }
    }

    // Infectiologie
    if (skill.id === "skill-infectiologie") {
      if (
        fiche.motifPrincipal === "fievre" ||
        (fiche.constantes?.temperature ?? 0) > 38.5
      ) {
        relevant = true;
      }
    }

    if (relevant) {
      relevantSkills.push(`### ${skill.name}\n${skill.description}`);
    }
  }

  return relevantSkills.length > 0
    ? `\n\nSKILLS MÉDICAUX ACTIFS:\n${relevantSkills.join("\n\n")}`
    : "";
}
