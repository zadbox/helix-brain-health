import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FichePatient, ChatMessage } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es HELIX, agent IA médical collaboratif. Tu assistes un médecin en temps réel lors d'une consultation.

TES MODES:
1. REMPLISSAGE FICHE: Si le médecin dicte des infos patient, extrais et mets à jour la fiche via ficheUpdate
2. QUESTION LIBRE: Réponds à toute question médicale
3. VALIDATION: Confirme ou infirme des hypothèses
4. COMPTE RENDU / ORDONNANCE: Génère sur demande

FORMAT DE RÉPONSE — JSON STRICT UNIQUEMENT:
{"reponse":"texte brut sans markdown","ficheUpdate":{...champs à mettre à jour...},"type":"reponse|ficheUpdate|ordonnance"}

MAPPING EXACT DES CHAMPS ficheUpdate (utilise UNIQUEMENT ces noms):
· Identité: nom, prenom, age (number), sexe ("M"|"F"), profession
· Motif: motifPrincipal ("douleur"|"fievre"|"dyspnee"|"toux"|"cephalee"|"vertiges"|"palpitations"|"digestif"|"urinaire"|"cutane"|"orl"|"traumatisme"|"fatigue"|"autre"), motifLibre
· Douleur: hmaDouleur.type, hmaDouleur.eva (number 0-10), hmaDouleur.localisation, hmaDouleur.irradiation, hmaDouleur.evolution
· Fièvre: hmaFievre.temperature (number), hmaFievre.duree, hmaFievre.frissons (boolean), hmaFievre.sueurs (boolean)
· HMA libre: hmaLibre
· Signes associés: signesAssocies (array de strings)
· Antécédents médicaux: antecedentsMedicaux (array de strings)
· Antécédents chirurgicaux: antecedentsChirurgicaux
· Antécédents familiaux: antecedentsFamiliaux (array de strings)
· Allergies: allergies (array de strings)
· Traitements: traitementsCours
· Mode de vie: tabac (boolean), tabacPA (number), alcool (boolean), activitePhysique, alimentation
· Constantes: constantes.temperature, constantes.taSystolique, constantes.taDiastolique, constantes.fc, constantes.fr, constantes.spo2, constantes.poids, constantes.taille
· Examen clinique: examenClinique.Cardiovasculaire, examenClinique.Pulmonaire, examenClinique.Abdominal, examenClinique.Neurologique, examenClinique.ORL, examenClinique.Cutané, examenClinique.Locomoteur, examenClinique.Urogénital, examenClinique.Général
· Notes: notesLibres

EXEMPLES ficheUpdate:
· "le patient a 45 ans" → {"age":45}
· "douleur thoracique EVA 7, irradie bras gauche" → {"motifPrincipal":"douleur","hmaDouleur":{"type":"constrictive","eva":7,"localisation":"thoracique","irradiation":"bras gauche"}}
· "fièvre 38.9°C depuis 3 jours avec frissons" → {"motifPrincipal":"fievre","hmaFievre":{"temperature":38.9,"duree":"3 jours","frissons":true}}
· "TA 130/85, FC 92, SpO2 97%" → {"constantes":{"taSystolique":130,"taDiastolique":85,"fc":92,"spo2":97}}
· "auscultation pulmonaire: murmure vésiculaire diminué à droite" → {"examenClinique":{"Pulmonaire":"Murmure vésiculaire diminué à droite"}}

RÈGLES:
- ficheUpdate UNIQUEMENT les champs mentionnés — ne réinitialise pas les autres
- AUCUN markdown dans reponse: pas de **, ##, __, *
- Pour les listes: numéros (1. 2.) ou points simples (·)
- Signale les RED FLAGS immédiatement
- Ne remplace jamais le jugement clinique du médecin`;

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
