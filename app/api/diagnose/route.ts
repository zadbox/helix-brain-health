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
- Inclus le code CIM-10 exact dans "codeICD10"
- Inclus dans "meshEN" 2-3 mots-clés anglais MeSH pour PubMed (ex: "acute coronary syndrome", "myocardial infarction")

FORMAT STRICT (respecte exactement cette structure):
{"hypotheses":[{"id":"h0","diagnostic":"string","codeICD10":"X00.0","meshEN":["term1","term2"],"probabilite":"haute","arguments":["arg1","arg2"],"ddx":["dd1"]},{"id":"h1","diagnostic":"string","codeICD10":"X00.1","meshEN":["term1"],"probabilite":"moyenne","arguments":["arg1"],"ddx":["dd1"]}],"suggestions":[{"id":"s0","type":"question","texte":"string"},{"id":"s1","type":"examen","texte":"string"}]}`;

export async function POST(req: NextRequest) {
  try {
    const { fiche }: { fiche: FichePatient } = await req.json();

    if (!fiche.motifPrincipal && !fiche.hmaLibre) {
      return NextResponse.json({
        hypotheses: [],
        suggestions: [{ id: "s0", type: "question", texte: "Renseignez le motif principal de consultation" }],
        references: [],
      });
    }

    const ficheResume = buildFicheResume(fiche);

    // Step 1 — Claude diagnosis
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyse et génère le JSON diagnostique:\n\n${ficheResume}`,
        },
      ],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "{}";
    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

    // Parse JSON robustly
    let result: { hypotheses: Record<string, unknown>[]; suggestions: Record<string, unknown>[] } = { hypotheses: [], suggestions: [] };
    try {
      result = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch {
          try {
            const fixed = jsonMatch[0]
              .replace(/,\s*$/, "")
              .replace(/,\s*\]/, "]")
              .replace(/,\s*\}/, "}");
            result = JSON.parse(fixed);
          } catch {
            console.error("Could not parse response:", raw.slice(0, 200));
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

    // Step 2 — PubMed using actual diagnosis terms from Claude
    const hypotheses = result.hypotheses as Array<{ diagnostic?: string; codeICD10?: string; meshEN?: string[] }>;
    const references = await fetchPubMedRefs(hypotheses, fiche);

    return NextResponse.json({ ...result, references });
  } catch (error) {
    console.error("Diagnose API error:", error);
    return NextResponse.json({ hypotheses: [], suggestions: [], references: [] }, { status: 500 });
  }
}

function buildPubMedQueryCascade(
  hypotheses: Array<{ diagnostic?: string; codeICD10?: string; meshEN?: string[] }>,
  fiche: FichePatient
): string[] {
  const mainMesh = hypotheses[0]?.meshEN?.slice(0, 2) || [];
  const mainDiag = hypotheses[0]?.diagnostic || "";

  // Population filter
  let popFilter = "";
  if (fiche.age && fiche.age < 18) popFilter = " AND (child[MeSH Terms] OR adolescent[MeSH Terms])";
  else if (fiche.age && fiche.age > 65) popFilter = " AND (aged[MeSH Terms])";

  const pubTypeStrict = " AND (\"Guideline\"[pt] OR \"Systematic Review\"[pt] OR \"Review\"[pt])";
  const pubTypeRelaxed = " AND (\"Clinical Trial\"[pt] OR \"Review\"[pt] OR \"Guideline\"[pt] OR \"Journal Article\"[pt])";

  const meshPart = mainMesh.map((t) => `"${t}"[MeSH Terms]`).join(" OR ");
  const titlePart = mainMesh.map((t) => `"${t}"[Title/Abstract]`).join(" OR ");
  const diagPart = `"${mainDiag}"[Title/Abstract]`;

  const queries: string[] = [];

  // 1. Strict: MeSH + population + review/guideline
  if (meshPart) queries.push(`(${meshPart})${popFilter}${pubTypeStrict}`);
  // 2. MeSH + review only (no population filter)
  if (meshPart) queries.push(`(${meshPart})${pubTypeStrict}`);
  // 3. Title/Abstract MeSH terms + review
  if (titlePart) queries.push(`(${titlePart})${pubTypeRelaxed}`);
  // 4. Last resort: diagnosis name in title
  queries.push(`(${diagPart})${pubTypeRelaxed}`);

  return queries;
}

async function fetchPubMedRefs(
  hypotheses: Array<{ diagnostic?: string; codeICD10?: string; meshEN?: string[] }>,
  fiche: FichePatient
): Promise<ReferenceScientifique[]> {
  if (!hypotheses.length || !hypotheses[0]?.diagnostic) return [];

  // Build queries: strict → relaxed → title-only fallback
  const queries = buildPubMedQueryCascade(hypotheses, fiche);

  try {
    let ids: string[] = [];
    for (const query of queries) {
      const searchRes = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=3&sort=relevance&retmode=json`,
        { signal: AbortSignal.timeout(6000) }
      );
      const searchData = await searchRes.json();
      ids = searchData?.esearchresult?.idlist || [];
      if (ids.length) break; // found results — stop trying
    }
    if (!ids.length) return [];

    const summaryRes = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`,
      { signal: AbortSignal.timeout(6000) }
    );
    const summaryData = await summaryRes.json();
    const resultMap = summaryData?.result || {};

    return ids
      .map((id) => {
        const art = resultMap[id];
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
