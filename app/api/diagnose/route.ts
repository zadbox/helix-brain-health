import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FichePatient, ReferenceScientifique } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es HELIX, agent IA médical (Health Enhanced Language Intelligence). Tu analyses la fiche patient et retournes UNIQUEMENT un JSON valide et complet.

RÈGLES:
- JSON UNIQUEMENT, aucun texte avant ou après
- Maximum 3 hypothèses, maximum 4 suggestions — sois concis
- Chaque champ "arguments" et "ddx" : maximum 3 items courts
- Réponds en français médical
- Inclus le code CIM-10 exact pour chaque hypothèse dans le champ "codeICD10"

FORMAT STRICT (respecte exactement cette structure):
{"hypotheses":[{"id":"h0","diagnostic":"string","codeICD10":"X00.0","probabilite":"haute","arguments":["arg1","arg2"],"ddx":["dd1"]},{"id":"h1","diagnostic":"string","codeICD10":"X00.1","probabilite":"moyenne","arguments":["arg1"],"ddx":["dd1"]}],"suggestions":[{"id":"s0","type":"question","texte":"string"},{"id":"s1","type":"examen","texte":"string"}]}`;

export async function POST(req: NextRequest) {
  try {
    const { fiche }: { fiche: FichePatient } = await req.json();

    if (!fiche.motifPrincipal && !fiche.hmaLibre) {
      return NextResponse.json({
        hypotheses: [],
        suggestions: [{ id: "s0", type: "question", texte: "Renseignez le motif principal de consultation" }],
      });
    }

    const ficheResume = buildFicheResume(fiche);
    const pubmedQuery = `${fiche.motifPrincipal || ""} ${fiche.hmaLibre || ""} diagnosis treatment`.trim();

    // Run Claude diagnosis + PubMed fetch in parallel
    const [response, references] = await Promise.all([
      client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyse et génère le JSON diagnostique:\n\n${ficheResume}`,
        },
      ],
    }),
      fetchPubMedRefs(pubmedQuery),
    ]);

    const text = response.content[0].type === "text" ? response.content[0].text.trim() : "{}";

    // Parse JSON robustly
    let result: { hypotheses: Record<string, unknown>[]; suggestions: Record<string, unknown>[] } = { hypotheses: [], suggestions: [] };
    try {
      // Try direct parse first
      result = JSON.parse(text);
    } catch {
      // Extract JSON block from markdown or partial response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch {
          // Last resort: try to fix truncated JSON by closing open brackets
          try {
            const fixed = jsonMatch[0]
              .replace(/,\s*$/, "")
              .replace(/,\s*\]/, "]")
              .replace(/,\s*\}/, "}");
            result = JSON.parse(fixed);
          } catch {
            console.error("Could not parse response:", text.slice(0, 200));
          }
        }
      }
    }

    result.hypotheses = (result.hypotheses || []).map((h: Record<string, unknown>, i: number) => ({
      id: `h${i}`,
      ...h,
    }));
    result.suggestions = (result.suggestions || []).map((s: Record<string, unknown>, i: number) => ({
      id: `s${i}`,
      ...s,
    }));

    return NextResponse.json({ ...result, references });
  } catch (error) {
    console.error("Diagnose API error:", error);
    return NextResponse.json({ hypotheses: [], suggestions: [], references: [] }, { status: 500 });
  }
}

async function fetchPubMedRefs(query: string): Promise<ReferenceScientifique[]> {
  try {
    const searchRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=3&sort=relevance&retmode=json`,
      { signal: AbortSignal.timeout(6000) }
    );
    const searchData = await searchRes.json();
    const ids: string[] = searchData?.esearchresult?.idlist || [];
    if (!ids.length) return [];

    const summaryRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`,
      { signal: AbortSignal.timeout(6000) }
    );
    const summaryData = await summaryRes.json();
    const result = summaryData?.result || {};

    return ids
      .map((id) => {
        const art = result[id];
        if (!art) return null;
        return {
          titre: art.title || "Sans titre",
          auteurs: (art.authors || []).slice(0, 3).map((a: { name: string }) => a.name).join(", ") || "—",
          journal: art.source || "",
          annee: (art.pubdate || "").split(" ")[0] || "",
          pmid: id,
        } as ReferenceScientifique;
      })
      .filter(Boolean) as ReferenceScientifique[];
  } catch {
    return [];
  }
}

function buildFicheResume(fiche: FichePatient): string {
  const parts: string[] = [];

  if (fiche.age || fiche.sexe) {
    parts.push(`Patient: ${fiche.age || "?"}ans, ${fiche.sexe === "M" ? "H" : fiche.sexe === "F" ? "F" : "?"}`);
  }
  if (fiche.motifPrincipal) {
    parts.push(`Motif: ${fiche.motifPrincipal}${fiche.motifLibre ? ` (${fiche.motifLibre})` : ""}`);
  }
  if (fiche.hmaDouleur) {
    const d = fiche.hmaDouleur;
    parts.push(`Douleur: ${d.type || "?"}, EVA ${d.eva ?? "?"}/10, ${d.localisation || "?"}, irrad: ${d.irradiation || "non"}, évol: ${d.evolution || "?"}`);
  }
  if (fiche.hmaFievre) {
    const f = fiche.hmaFievre;
    parts.push(`Fièvre: ${f.temperature || "?"}°C, ${f.duree || "?"}, frissons: ${f.frissons ? "oui" : "non"}`);
  }
  if (fiche.hmaLibre) parts.push(`HMA: ${fiche.hmaLibre}`);
  if (fiche.signesAssocies?.length) parts.push(`Signes: ${fiche.signesAssocies.join(", ")}`);
  if (fiche.antecedentsMedicaux?.length) parts.push(`Atcd: ${fiche.antecedentsMedicaux.join(", ")}`);
  if (fiche.antecedentsFamiliaux?.length) parts.push(`Fam: ${fiche.antecedentsFamiliaux.join(", ")}`);
  if (fiche.constantes) {
    const c = fiche.constantes;
    const vals = [
      c.temperature && `T${c.temperature}°C`,
      c.taSystolique && `TA${c.taSystolique}/${c.taDiastolique ?? "?"}`,
      c.fc && `FC${c.fc}`,
      c.fr && `FR${c.fr}`,
      c.spo2 && `SpO2${c.spo2}%`,
    ].filter(Boolean).join(" ");
    if (vals) parts.push(`Constantes: ${vals}`);
  }
  if (fiche.tabac) parts.push(`Tabac: ${fiche.tabacPA || "?"} PA`);
  if (fiche.allergies?.length) parts.push(`Allergies: ${fiche.allergies.join(", ")}`);
  if (fiche.traitementsCours) parts.push(`Ttt: ${fiche.traitementsCours}`);

  return parts.join(" | ");
}
