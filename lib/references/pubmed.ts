import { ReferenceScientifique } from "@/types";

const PUBMED_API_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const PUBMED_TIMEOUT_MS = 6_000;
const PMID_PATTERN = /^\d+$/;

interface PubMedAuthor {
  name?: string;
}

interface PubMedSummary {
  title?: string;
  authors?: PubMedAuthor[];
  source?: string;
  pubdate?: string;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(PUBMED_TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`PubMed request failed with status ${response.status}`);
  }

  return response.json();
}

function normalizeQueries(queries: string | string[]): string[] {
  return (Array.isArray(queries) ? queries : [queries])
    .map((query) => query.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export async function fetchPubMedReferences(
  queries: string | string[],
  limit = 3
): Promise<ReferenceScientifique[]> {
  const normalizedQueries = normalizeQueries(queries);
  if (!normalizedQueries.length) return [];

  try {
    let ids: string[] = [];

    for (const query of normalizedQueries) {
      const searchUrl =
        `${PUBMED_API_BASE}/esearch.fcgi?db=pubmed` +
        `&term=${encodeURIComponent(query)}` +
        `&retmax=${Math.max(1, Math.min(limit, 10))}&sort=relevance&retmode=json`;
      const searchData = (await fetchJson(searchUrl)) as {
        esearchresult?: { idlist?: unknown };
      };
      const rawIds = searchData.esearchresult?.idlist;
      ids = Array.isArray(rawIds)
        ? rawIds.filter((id): id is string => typeof id === "string" && PMID_PATTERN.test(id))
        : [];
      if (ids.length) break;
    }

    if (!ids.length) return [];

    const summaryUrl =
      `${PUBMED_API_BASE}/esummary.fcgi?db=pubmed` +
      `&id=${ids.join(",")}&retmode=json`;
    const summaryData = (await fetchJson(summaryUrl)) as {
      result?: Record<string, PubMedSummary>;
    };
    const resultMap = summaryData.result || {};

    return ids.flatMap((id) => {
      const article = resultMap[id];
      if (!article) return [];

      return [
        {
          titre: article.title?.trim() || "Sans titre",
          auteurs:
            article.authors
              ?.slice(0, 3)
              .map((author) => author.name?.trim())
              .filter((name): name is string => Boolean(name))
              .join(", ") || "Auteurs non renseignés",
          journal: article.source?.trim() || "",
          annee: article.pubdate?.split(" ")[0] || "",
          pmid: id,
        },
      ];
    });
  } catch {
    return [];
  }
}
