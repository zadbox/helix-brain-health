import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FichePatient, ChatMessage } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es Brain Health, un agent IA médical collaboratif. Tu assistes un médecin en temps réel lors d'une consultation.
Tu as accès à la fiche patient complète et peux répondre à des questions médicales, remplir des champs de la fiche sur instruction, et fournir des recommandations.

TES 4 MODES:
1. QUESTION LIBRE: Réponds à toute question médicale du médecin
2. REMPLISSAGE FICHE: Si le médecin dicte des infos patient (ex: "Le patient a de la fièvre depuis 3j, 38.8°C avec frissons"), extrais les données et mets à jour la fiche
3. VALIDATION: Confirme ou infirme les hypothèses du médecin
4. COMPTE RENDU: Génère un résumé ou compte rendu complet si demandé

FORMAT DE RÉPONSE JSON:
{
  "reponse": "Ta réponse médicale en français, claire et concise",
  "ficheUpdate": {
    // Champs à mettre à jour dans la fiche (null si aucun update)
    // Ex: "hmaFievre": {"temperature": 38.8, "duree": "3 jours", "frissons": true}
  },
  "type": "reponse|ficheUpdate|compteRendu|ordonnance"
}

RÈGLES:
- Réponds en français médical clair
- Sois précis et actionnable
- AUCUN markdown dans "reponse": pas de **, pas de ##, pas de __, texte brut uniquement
- Pour les listes: utilise des numéros (1. 2.) ou des points simples (·), jamais de tirets markdown
- Pour les ordonnances: inclure DCI, posologie, durée
- Pour le compte rendu: format structuré (Motif, HMA, Antécédents, Constantes, Examen, Hypothèses, Ordonnance, Suivi)
- Ne remplace jamais le jugement clinique du médecin
- Signale les RED FLAGS immédiatement
- Adapte au contexte médical`;

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      fiche,
      history,
    }: { message: string; fiche: FichePatient; history: ChatMessage[] } = await req.json();

    const ficheContext = buildFicheContext(fiche);
    const historyMessages = history.slice(-10).map((m) => ({
      role: m.role === "medecin" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: `${SYSTEM_PROMPT}\n\nFICHE PATIENT ACTUELLE:\n${ficheContext}`,
      messages: [
        ...historyMessages,
        { role: "user", content: message },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    }

    // Fallback: return text as plain response
    return NextResponse.json({ reponse: text, type: "reponse", ficheUpdate: null });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reponse: "Une erreur s'est produite. Veuillez réessayer.", type: "reponse", ficheUpdate: null },
      { status: 500 }
    );
  }
}

function buildFicheContext(fiche: FichePatient): string {
  return JSON.stringify(fiche, null, 2);
}
