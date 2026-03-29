"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, Loader2 } from "lucide-react";
import { useConsultationStore } from "@/store/consultation";
import { ReferenceScientifique } from "@/types";

// ─── Doctor profile (later: from settings) ───────────────────────────────────
const DOCTOR = {
  nom: "Dr Mohamed Alaoui",
  specialite: "Médecin Généraliste",
  inpe: "12345678",
  adresse: "Hôpital Universitaire International Cheikh Khalifa",
  adresse2: "Angle Bd Al Massira Al Khadra & Rue Abou Youssef Al Kindy",
  ville: "Casablanca 20100 — Maroc",
  tel: "+212 5 22 22 42 44",
  fax: "+212 5 22 22 42 55",
  email: "dr.alaoui@chu-khalifa.ma",
};

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReportModal({ open, onClose }: ReportModalProps) {
  const { fiche, agent } = useConsultationStore();
  const [report, setReport] = useState("");
  const [references, setReferences] = useState<ReferenceScientifique[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fiche, hypotheses: agent.hypotheses, medecin: DOCTOR.nom }),
      });
      const data = await res.json();
      setReport(data.compteRendu || "");
      setReferences(data.references || []);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const buildPrintHTML = () => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Compte Rendu — ${fiche.prenom || ""} ${fiche.nom || ""}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Noto Sans', Arial, sans-serif; font-size: 10.5pt; color: #1a1a1a; background: white; }
    .page { max-width: 210mm; margin: 0 auto; padding: 15mm 18mm 20mm; }

    /* ── LETTERHEAD ── */
    .letterhead { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2.5px solid #0891B2; margin-bottom: 12px; }
    .doctor-info { flex: 1; }
    .doctor-name { font-size: 15pt; font-weight: 700; color: #0891B2; letter-spacing: -0.3px; }
    .doctor-spec { font-size: 10pt; color: #555; font-weight: 500; margin-top: 2px; }
    .doctor-inpe { font-size: 8.5pt; color: #888; margin-top: 1px; }
    .clinic-info { text-align: right; font-size: 8.5pt; color: #555; line-height: 1.6; }
    .clinic-name { font-weight: 600; font-size: 9pt; color: #333; }

    /* ── DOCUMENT TITLE ── */
    .doc-title { text-align: center; margin: 14px 0 10px; }
    .doc-title h1 { font-size: 12pt; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #1a1a1a; }
    .doc-title .meta { font-size: 8.5pt; color: #777; margin-top: 3px; }

    /* ── PATIENT BAND ── */
    .patient-band { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 6px; padding: 8px 14px; margin-bottom: 14px; display: flex; gap: 30px; flex-wrap: wrap; }
    .patient-band .field { display: flex; flex-direction: column; }
    .patient-band .label { font-size: 7.5pt; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
    .patient-band .value { font-size: 10pt; font-weight: 600; color: #134e4a; }

    /* ── SECTIONS ── */
    .section { margin-bottom: 12px; }
    .section-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #0891B2; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 6px; }
    .section-body { font-size: 10pt; line-height: 1.65; color: #2d2d2d; white-space: pre-wrap; }

    /* ── CONSTANTES TABLE ── */
    .vitals { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
    .vital-box { border: 1px solid #e2e8f0; border-radius: 5px; padding: 5px 10px; text-align: center; min-width: 70px; }
    .vital-box .v-label { font-size: 7pt; text-transform: uppercase; color: #888; }
    .vital-box .v-value { font-size: 10.5pt; font-weight: 700; color: #1a1a1a; }

    /* ── DIAGNOSIS BOX ── */
    .diag-box { border-left: 3px solid #0891B2; padding: 6px 12px; background: #f8fdff; margin-bottom: 6px; border-radius: 0 4px 4px 0; }
    .diag-principal { font-weight: 700; font-size: 11pt; color: #0891B2; }
    .diag-dd { font-size: 9pt; color: #666; margin-top: 2px; }

    /* ── SIGNATURE ── */
    .signature { margin-top: 24px; display: flex; justify-content: flex-end; }
    .sig-box { text-align: center; }
    .sig-box .sig-label { font-size: 8.5pt; color: #888; }
    .sig-box .sig-name { font-size: 10pt; font-weight: 700; margin-top: 2px; color: #1a1a1a; }
    .sig-box .sig-line { width: 120px; border-bottom: 1px solid #ccc; margin: 30px auto 6px; }

    /* ── FOOTER ── */
    .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 7.5pt; color: #aaa; }
    .helix-badge { color: #0891B2; font-weight: 600; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 10mm 15mm; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- LETTERHEAD -->
  <div class="letterhead">
    <div class="doctor-info">
      <div class="doctor-name">${DOCTOR.nom}</div>
      <div class="doctor-spec">${DOCTOR.specialite}</div>
      <div class="doctor-inpe">N° INPE : ${DOCTOR.inpe}</div>
    </div>
    <div class="clinic-info">
      <div class="clinic-name">${DOCTOR.adresse}</div>
      <div>${DOCTOR.adresse2}</div>
      <div>${DOCTOR.ville}</div>
      <div>Tél : ${DOCTOR.tel}</div>
      <div>${DOCTOR.email}</div>
    </div>
  </div>

  <!-- DOCUMENT TITLE -->
  <div class="doc-title">
    <h1>Compte Rendu de Consultation</h1>
    <div class="meta">${dateStr} &nbsp;|&nbsp; ${timeStr}</div>
  </div>

  <!-- PATIENT BAND -->
  <div class="patient-band">
    <div class="field">
      <span class="label">Nom Prénom</span>
      <span class="value">${(fiche.nom || "—").toUpperCase()} ${fiche.prenom || ""}</span>
    </div>
    <div class="field">
      <span class="label">Âge</span>
      <span class="value">${fiche.age ? `${fiche.age} ans` : "—"}</span>
    </div>
    <div class="field">
      <span class="label">Sexe</span>
      <span class="value">${fiche.sexe === "M" ? "Masculin" : fiche.sexe === "F" ? "Féminin" : "—"}</span>
    </div>
    <div class="field">
      <span class="label">Profession</span>
      <span class="value">${fiche.profession || "—"}</span>
    </div>
  </div>

  <!-- COMPTE RENDU CONTENT -->
  ${report
    .replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .split(/\n{2,}/)
    .map((block) => {
      const isSectionTitle = /^[A-ZÀÂÇÉÈÊËÎÏÔÛÙÜÆŒ\s]{6,}:/.test(block.trim());
      if (isSectionTitle) {
        const colonIdx = block.indexOf(":");
        const title = block.slice(0, colonIdx).trim();
        const body = block.slice(colonIdx + 1).trim();
        return `<div class="section"><div class="section-title">${title}</div>${body ? `<div class="section-body">${body}</div>` : ""}</div>`;
      }
      return block.trim() ? `<div class="section-body" style="margin-bottom:10px">${block.trim()}</div>` : "";
    })
    .join("")
  }

  ${agent.hypotheses.length ? `
  <!-- HYPOTHESES -->
  <div class="section" style="margin-top:14px">
    <div class="section-title">Hypothèses Diagnostiques</div>
    ${agent.hypotheses.map((h, i) => `
    <div class="diag-box" style="margin-bottom:6px">
      <div class="diag-principal">${i === 0 ? "▶ " : ""}${h.diagnostic} <span style="font-size:8.5pt;font-weight:400;color:#888">(${h.probabilite})</span></div>
      ${h.ddx?.length ? `<div class="diag-dd">DD : ${h.ddx.join(" — ")}</div>` : ""}
    </div>`).join("")}
  </div>` : ""}

  <!-- SIGNATURE -->
  <div class="signature">
    <div class="sig-box">
      <div class="sig-label">Signature &amp; Cachet</div>
      <div class="sig-line"></div>
      <div class="sig-name">${DOCTOR.nom}</div>
      <div style="font-size:8pt;color:#888">${DOCTOR.specialite}</div>
    </div>
  </div>

  ${references.length ? `
  <!-- RÉFÉRENCES PUBMED -->
  <div class="section" style="margin-top:18px;border-top:1px solid #e2e8f0;padding-top:12px">
    <div class="section-title">Références Scientifiques — PubMed</div>
    ${references.map((r, i) => `
    <div style="font-size:8.5pt;color:#555;margin-bottom:5px;padding-left:8px">
      <span style="color:#0891B2;font-weight:700">[${i + 1}]</span>
      <strong>${r.auteurs}</strong>. "${r.titre}". <em>${r.journal}</em>${r.annee ? `, ${r.annee}` : ""}.
      ${r.pmid ? `PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/${r.pmid}" style="color:#0891B2">${r.pmid}</a>` : ""}
    </div>`).join("")}
  </div>` : ""}

  <!-- FOOTER -->
  <div class="footer">
    <span>Document confidentiel — Usage médical uniquement</span>
    <span class="helix-badge">HELIX — Health Enhanced Language Intelligence</span>
    <span>${dateStr}</span>
  </div>

</div>
</body>
</html>`;

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(buildPrintHTML());
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const handleDownload = () => {
    const html = buildPrintHTML();
    const filename = `CR_${(fiche.nom || "patient").toUpperCase()}_${fiche.prenom || ""}_${now.toISOString().split("T")[0]}.html`.replace(/\s+/g, "_");
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">Compte Rendu de Consultation</h2>
                <p className="text-xs text-gray-400 mt-0.5">{DOCTOR.nom} — {dateStr}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {!generated ? (
                <div className="text-center py-10">
                  {/* Mini preview letterhead */}
                  <div className="max-w-md mx-auto border border-gray-200 rounded-xl overflow-hidden mb-6 text-left shadow-sm">
                    <div className="bg-[#0891B2] px-5 py-3 flex justify-between items-start">
                      <div>
                        <div className="text-white font-bold text-sm">{DOCTOR.nom}</div>
                        <div className="text-cyan-200 text-xs">{DOCTOR.specialite}</div>
                      </div>
                      <div className="text-right text-cyan-100 text-xs">
                        <div className="font-medium">{DOCTOR.adresse}</div>
                        <div>{DOCTOR.tel}</div>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <div className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Compte Rendu de Consultation</div>
                      <div className="flex gap-4 text-xs text-gray-600 bg-gray-50 rounded-lg px-4 py-2.5 mb-3">
                        <span><strong>{(fiche.nom || "NOM").toUpperCase()} {fiche.prenom || "Prénom"}</strong></span>
                        <span>{fiche.age ? `${fiche.age} ans` : "— ans"}</span>
                        <span>{fiche.sexe === "M" ? "Masculin" : fiche.sexe === "F" ? "Féminin" : "—"}</span>
                      </div>
                      <div className="space-y-1.5">
                        {["Motif de consultation", "Histoire de la maladie", "Antécédents", "Examen clinique", "Hypothèses diagnostiques", "Ordonnance", "Suivi"].map(s => (
                          <div key={s} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0891B2]" />
                            <div className="text-xs text-gray-400">{s}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-2 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Document confidentiel</span>
                      <span className="text-xs font-semibold text-[#0891B2]">HELIX</span>
                    </div>
                  </div>
                  <button
                    onClick={generate}
                    disabled={loading}
                    className="px-6 py-3 bg-[#0891B2] text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-60 flex items-center gap-2 mx-auto"
                  >
                    {loading ? (
                      <><Loader2 size={17} className="animate-spin" />Génération en cours...</>
                    ) : (
                      <>Générer le Compte Rendu</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-gray-700 space-y-4">
                  {report.split(/\n{2,}/).map((block, i) => {
                    const isSectionTitle = /^[A-ZÀÂÇÉÈÊËÎÏÔÛÙÜÆŒ\s]{6,}:/.test(block.trim());
                    if (isSectionTitle) {
                      const colonIdx = block.indexOf(":");
                      const title = block.slice(0, colonIdx).trim();
                      const body = block.slice(colonIdx + 1).trim();
                      return (
                        <div key={i}>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#0891B2] border-b border-gray-200 pb-1 mb-2">{title}</div>
                          {body && <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{body}</p>}
                        </div>
                      );
                    }
                    return <p key={i} className="text-gray-700 leading-relaxed whitespace-pre-wrap">{block}</p>;
                  })}

                  {/* PubMed References */}
                  {references.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0891B2] mb-3">
                        Références Scientifiques — PubMed
                      </div>
                      <div className="space-y-2">
                        {references.map((ref, i) => (
                          <div key={i} className="flex gap-2 text-xs text-gray-600 bg-blue-50 rounded-lg px-3 py-2">
                            <span className="font-bold text-[#0891B2] shrink-0">[{i + 1}]</span>
                            <div>
                              <span className="font-medium text-gray-800">{ref.auteurs}</span>
                              {" — "}
                              <span className="italic">{ref.titre}</span>
                              {ref.journal && <span className="text-gray-500"> {ref.journal}{ref.annee ? `, ${ref.annee}` : ""}</span>}
                              {ref.pmid && (
                                <a
                                  href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-[#0891B2] underline"
                                >
                                  PMID:{ref.pmid}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {generated && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => { setGenerated(false); setReport(""); setReferences([]); }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Régénérer
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg flex items-center gap-2 hover:bg-gray-900"
                  >
                    <Download size={14} />
                    Télécharger
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-[#0891B2] text-white text-sm rounded-lg flex items-center gap-2 hover:bg-cyan-700"
                  >
                    <Printer size={14} />
                    Imprimer / PDF
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
