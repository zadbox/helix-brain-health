import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FichePatient, Hypothese, ReferenceScientifique } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Fetch PubMed references via NCBI E-utilities (free, no auth) ─────────────
async function fetchPubMedReferences(query: string): Promise<ReferenceScientifique[]> {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=3&sort=relevance&retmode=json`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
    const searchData = await searchRes.json();
    const ids: string[] = searchData?.esearchresult?.idlist || [];
    if (!ids.length) return [];

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
    const summaryRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(5000) });
    const summaryData = await summaryRes.json();
    const result = summaryData?.result || {};

    return ids.map((id) => {
      const art = result[id];
      if (!art) return null;
      const auteurs = (art.authors || []).slice(0, 3).map((a: { name: string }) => a.name).join(", ");
      return {
        titre: art.title || "Sans titre",
        auteurs: auteurs || "Auteurs inconnus",
        journal: art.source || "",
        annee: art.pubdate?.split(" ")[0] || "",
        pmid: id,
        resume: "",
      } as ReferenceScientifique;
    }).filter(Boolean) as ReferenceScientifique[];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fiche, hypotheses, medecin }: { fiche: FichePatient; hypotheses: Hypothese[]; medecin: string } =
      await req.json();

    // Build PubMed query from main diagnosis
    const mainDiag = hypotheses[0]?.diagnostic || fiche.motifPrincipal || "";
    const pubmedQuery = `${mainDiag} diagnosis treatment evidence`;
    const references = await fetchPubMedReferences(pubmedQuery);

    const refsContext = references.length
      ? `\nRÉFÉRENCES SCIENTIFIQUES PUBMED (à citer en fin de rapport):\n${references.map((r, i) =>
          `[${i + 1}] ${r.auteurs}. "${r.titre}". ${r.journal} ${r.annee}. PMID:${r.pmid}`
        ).join("\n")}`
      : "";

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3500,
      system: `Tu es HELIX, assistant médical. Génère un compte rendu médical complet et professionnel en français.
RÈGLES ABSOLUES:
- AUCUN markdown: pas de #, pas de **, pas de __, pas de *, pas de tirets comme puces
- Texte brut uniquement, sections séparées par des lignes vides
- Commence chaque section par son titre en majuscules suivi d'un deux-points et d'un saut de ligne
- Pour les listes, utilise la numérotation (1. 2. 3.) ou des points simples (·)
- Si des références PubMed sont fournies, les citer avec [1], [2], [3] dans le texte quand pertinent et les lister en fin de rapport`,
      messages: [
        {
          role: "user",
          content: `Génère le compte rendu médical complet.

MÉDECIN: ${medecin}
DATE: ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

FICHE PATIENT:
${JSON.stringify(fiche, null, 2)}

HYPOTHÈSES DIAGNOSTIQUES:
${hypotheses.map((h, i) => `${i + 1}. ${h.diagnostic}${h.codeICD10 ? ` (CIM-10: ${h.codeICD10})` : ""} — probabilité: ${h.probabilite}`).join("\n")}
${refsContext}

Sections à inclure (titres en MAJUSCULES, texte brut, aucun markdown):
MOTIF DE CONSULTATION
HISTOIRE DE LA MALADIE ACTUELLE
ANTÉCÉDENTS
MODE DE VIE
EXAMEN CLINIQUE
HYPOTHÈSES DIAGNOSTIQUES
EXAMENS COMPLÉMENTAIRES RECOMMANDÉS
ORDONNANCE PROPOSÉE
CONSEILS ET SUIVI
RÉFÉRENCES SCIENTIFIQUES`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ compteRendu: text, references });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json({ compteRendu: "Erreur lors de la génération du compte rendu.", references: [] }, { status: 500 });
  }
}
