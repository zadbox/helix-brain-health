import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FichePatient, Hypothese } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { fiche, hypotheses, medecin }: { fiche: FichePatient; hypotheses: Hypothese[]; medecin: string } =
      await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: `Tu es HELIX, assistant médical. Génère un compte rendu médical complet et professionnel en français.
RÈGLES ABSOLUES:
- AUCUN markdown: pas de #, pas de **, pas de __, pas de *, pas de tirets comme puces
- Texte brut uniquement, sections séparées par des lignes vides
- Commence chaque section par son titre en majuscules suivi d'un deux-points et d'un saut de ligne
- Pour les listes, utilise la numérotation (1. 2. 3.) ou des points simples (·)`,
      messages: [
        {
          role: "user",
          content: `Génère le compte rendu médical complet.

MÉDECIN: ${medecin}
DATE: ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

FICHE PATIENT:
${JSON.stringify(fiche, null, 2)}

HYPOTHÈSES DIAGNOSTIQUES:
${hypotheses.map((h, i) => `${i + 1}. ${h.diagnostic} (probabilité: ${h.probabilite})`).join("\n")}

Sections à inclure (titres en MAJUSCULES, texte brut, aucun markdown):
MOTIF DE CONSULTATION
HISTOIRE DE LA MALADIE ACTUELLE
ANTÉCÉDENTS
MODE DE VIE
EXAMEN CLINIQUE
HYPOTHÈSES DIAGNOSTIQUES
EXAMENS COMPLÉMENTAIRES RECOMMANDÉS
ORDONNANCE PROPOSÉE
CONSEILS ET SUIVI`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ compteRendu: text });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json({ compteRendu: "Erreur lors de la génération du compte rendu." }, { status: 500 });
  }
}
