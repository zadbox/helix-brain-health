"use client";

import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Clipboard,
  Download,
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { useConsultationStore } from "@/store/consultation";
import {
  type CompteRenduMedical,
  type FichePatient,
  type ReferenceScientifique,
} from "@/types";
import { PRACTICE_PROFILE as DOCTOR } from "@/config/practice";

const PROBABILITY_LABELS = {
  haute: "Probabilité haute",
  moyenne: "Probabilité moyenne",
  faible: "Probabilité faible",
} as const;

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

interface ReportSectionProps {
  number: string;
  title: string;
  children: ReactNode;
  className?: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

function formatReportDate(dateValue: string | undefined, fallback: Date): string {
  const reportDate = dateValue ? new Date(`${dateValue}T12:00:00`) : fallback;
  const safeDate = Number.isNaN(reportDate.getTime()) ? fallback : reportDate;
  return safeDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isCompteRenduMedical(value: unknown): value is CompteRenduMedical {
  if (!value || typeof value !== "object") return false;
  const report = value as Partial<CompteRenduMedical>;

  return (
    typeof report.motifConsultation === "string" &&
    typeof report.histoireMaladie === "string" &&
    typeof report.syntheseClinique === "string" &&
    typeof report.conclusion === "string" &&
    Boolean(report.antecedents && typeof report.antecedents === "object") &&
    Array.isArray(report.signesAssocies) &&
    Array.isArray(report.allergies) &&
    Array.isArray(report.modeVie) &&
    Array.isArray(report.constantes) &&
    Array.isArray(report.examenClinique) &&
    Array.isArray(report.hypothesesDiagnostiques) &&
    Array.isArray(report.examensComplementaires) &&
    Array.isArray(report.priseEnCharge) &&
    Array.isArray(report.conseilsSuivi) &&
    Array.isArray(report.pointsVigilance)
  );
}

function ReportSection({ number, title, children, className = "" }: ReportSectionProps) {
  return (
    <section className={`break-inside-avoid ${className}`}>
      <div className="mb-3 flex items-center gap-3 border-b border-slate-200 pb-2">
        <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-cyan-700">
          {number}
        </span>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-800">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function EmptyValue({ children = "Non renseigné." }: { children?: ReactNode }) {
  return <p className="italic text-slate-400">{children}</p>;
}

function ClinicalList({
  items,
  emptyLabel = "Aucun élément renseigné.",
}: {
  items: string[];
  emptyLabel?: string;
}) {
  if (!items.length) return <EmptyValue>{emptyLabel}</EmptyValue>;

  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-cyan-700" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function IdentityField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-xs font-semibold text-slate-800">{value || "—"}</dd>
    </div>
  );
}

function ReportDocument({
  report,
  references,
  fiche,
  generatedAt,
}: {
  report: CompteRenduMedical;
  references: ReferenceScientifique[];
  fiche: FichePatient;
  generatedAt: Date;
}) {
  const dateStr = formatReportDate(fiche.dateConsultation, generatedAt);
  const timeStr = generatedAt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const patientName =
    [fiche.nom?.toUpperCase(), fiche.prenom].filter(Boolean).join(" ") || "Patient non identifié";

  return (
    <article className="mx-auto w-full max-w-[210mm] overflow-hidden bg-white text-[13px] leading-[1.65] text-slate-700 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
      <header className="border-t-[6px] border-cyan-700 px-5 pb-5 pt-6 sm:px-10 sm:pt-8">
        <div className="flex flex-col justify-between gap-5 border-b-2 border-cyan-700 pb-5 sm:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-700 text-white">
                <Stethoscope size={18} />
              </span>
              <div>
                <p className="text-lg font-bold tracking-tight text-cyan-800">{DOCTOR.nom}</p>
                <p className="text-[11px] font-medium text-slate-500">{DOCTOR.specialite}</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
              N° INPE : {DOCTOR.inpe}
            </p>
          </div>
          <div className="text-[10px] leading-relaxed text-slate-500 sm:max-w-[290px] sm:text-right">
            <p className="font-bold text-slate-700">{DOCTOR.adresse}</p>
            <p>{DOCTOR.adresse2}</p>
            <p>{DOCTOR.ville}</p>
            <p>
              Tél. {DOCTOR.tel} · {DOCTOR.email}
            </p>
          </div>
        </div>

        <div className="py-6 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Document médical confidentiel
          </p>
          <h2 className="mt-2 text-xl font-bold uppercase tracking-[0.13em] text-slate-900">
            Compte rendu de consultation
          </h2>
          <p className="mt-1.5 text-[10px] text-slate-400">
            Établi le {dateStr} à {timeStr}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border border-slate-200 bg-slate-50 px-5 py-4 sm:grid-cols-5">
          <div className="col-span-2">
            <IdentityField label="Patient" value={patientName} />
          </div>
          <IdentityField label="Âge" value={fiche.age !== undefined ? `${fiche.age} ans` : "—"} />
          <IdentityField
            label="Sexe"
            value={fiche.sexe === "M" ? "Masculin" : fiche.sexe === "F" ? "Féminin" : "—"}
          />
          <IdentityField label="Profession" value={fiche.profession || "—"} />
        </dl>
      </header>

      <div className="space-y-8 px-5 pb-8 sm:px-10">
        <ReportSection number="01" title="Motif et histoire de la maladie">
          <div className="grid gap-5 sm:grid-cols-[0.9fr_2.1fr]">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Motif de consultation
              </p>
              <p className="font-semibold text-slate-900">{report.motifConsultation}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Histoire de la maladie actuelle
              </p>
              <p className="whitespace-pre-wrap">{report.histoireMaladie}</p>
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Signes fonctionnels et associés
            </p>
            <ClinicalList items={report.signesAssocies} emptyLabel="Aucun signe associé renseigné." />
          </div>
        </ReportSection>

        <ReportSection number="02" title="Antécédents, allergies et mode de vie">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Antécédents médicaux
              </p>
              <ClinicalList
                items={report.antecedents.medicaux}
                emptyLabel="Aucun antécédent médical renseigné."
              />
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Antécédents chirurgicaux
              </p>
              <p>{report.antecedents.chirurgicaux}</p>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Antécédents familiaux
              </p>
              <ClinicalList
                items={report.antecedents.familiaux}
                emptyLabel="Aucun antécédent familial renseigné."
              />
            </div>
            {fiche.sexe === "F" && (
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Antécédents gynéco-obstétricaux
                </p>
                <p>{report.antecedents.gynecoObstetricaux}</p>
              </div>
            )}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Allergies
              </p>
              <ClinicalList items={report.allergies} emptyLabel="Aucune allergie renseignée." />
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Traitements en cours
              </p>
              <p className="whitespace-pre-wrap">{report.traitementsEnCours}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Mode de vie
              </p>
              <ClinicalList items={report.modeVie} emptyLabel="Mode de vie non renseigné." />
            </div>
          </div>
        </ReportSection>

        <ReportSection number="03" title="Examen clinique">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Constantes vitales et paramètres anthropométriques
          </p>
          {report.constantes.length ? (
            <div className="mb-6 grid grid-cols-2 border-l border-t border-slate-200 sm:grid-cols-4">
              {report.constantes.map((constante) => (
                <div
                  key={constante.label}
                  className={`border-b border-r border-slate-200 px-3 py-3 ${
                    constante.alerte ? "bg-amber-50" : "bg-white"
                  }`}
                >
                  <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    {constante.alerte && <AlertTriangle size={11} className="text-amber-600" />}
                    {constante.label}
                  </p>
                  <p className="mt-1 font-mono text-[12px] font-bold text-slate-800">
                    {constante.valeur}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6 border border-dashed border-slate-200 px-4 py-3">
              <EmptyValue>Constantes non renseignées.</EmptyValue>
            </div>
          )}

          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Examen par appareil
          </p>
          {report.examenClinique.length ? (
            <div className="border-t border-slate-200">
              {report.examenClinique.map((examen) => (
                <div
                  key={examen.appareil}
                  className="grid gap-1 border-b border-slate-200 py-3 sm:grid-cols-[160px_1fr] sm:gap-5"
                >
                  <p className="font-semibold text-slate-800">{examen.appareil}</p>
                  <p className="whitespace-pre-wrap">{examen.constatations}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 px-4 py-3">
              <EmptyValue>Examen clinique non renseigné.</EmptyValue>
            </div>
          )}
        </ReportSection>

        <ReportSection number="04" title="Synthèse clinique">
          <p className="whitespace-pre-wrap">{report.syntheseClinique}</p>
        </ReportSection>

        <ReportSection number="05" title="Orientation diagnostique">
          {report.hypothesesDiagnostiques.length ? (
            <div className="space-y-4">
              {report.hypothesesDiagnostiques.map((hypothese, index) => (
                <div
                  key={`${hypothese.diagnostic}-${index}`}
                  className="border-l-[3px] border-cyan-700 bg-slate-50 px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-bold text-slate-900">
                      {index + 1}. {hypothese.diagnostic}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-700">
                      {PROBABILITY_LABELS[hypothese.probabilite]}
                      {hypothese.codeICD10 ? ` · CIM-10 ${hypothese.codeICD10}` : ""}
                    </p>
                  </div>
                  {hypothese.arguments.length > 0 && (
                    <p className="mt-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Arguments : </span>
                      {hypothese.arguments.join(" ; ")}
                    </p>
                  )}
                  {hypothese.diagnosticsDifferentiels.length > 0 && (
                    <p className="mt-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">
                        Diagnostics différentiels :{" "}
                      </span>
                      {hypothese.diagnosticsDifferentiels.join(" ; ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyValue>Aucune hypothèse diagnostique documentée.</EmptyValue>
          )}
        </ReportSection>

        <ReportSection number="06" title="Examens complémentaires et prise en charge">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Examens complémentaires proposés
              </p>
              <ClinicalList
                items={report.examensComplementaires}
                emptyLabel="Aucun examen complémentaire proposé."
              />
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Prise en charge proposée
              </p>
              <ClinicalList
                items={report.priseEnCharge}
                emptyLabel="Aucune prise en charge documentée."
              />
            </div>
          </div>
        </ReportSection>

        <ReportSection number="07" title="Suivi et éléments de vigilance">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Conseils et suivi
              </p>
              <ClinicalList
                items={report.conseilsSuivi}
                emptyLabel="Modalités de suivi non renseignées."
              />
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Points de vigilance
              </p>
              <ClinicalList
                items={report.pointsVigilance}
                emptyLabel="Aucun point de vigilance spécifique documenté."
              />
            </div>
          </div>
        </ReportSection>

        <section className="break-inside-avoid border border-cyan-200 bg-cyan-50/70 px-5 py-5">
          <div className="mb-3 flex items-center gap-2 text-cyan-800">
            <ShieldCheck size={17} />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em]">Conclusion</h3>
          </div>
          <p className="font-medium leading-relaxed text-slate-800">{report.conclusion}</p>
        </section>

        <div className="flex justify-end pt-3">
          <div className="w-52 text-center">
            <p className="text-[10px] font-medium text-slate-400">Signature et cachet</p>
            <div className="h-14 border-b border-slate-300" />
            <p className="mt-2 font-bold text-slate-800">{DOCTOR.nom}</p>
            <p className="text-[10px] text-slate-400">{DOCTOR.specialite}</p>
          </div>
        </div>

        {references.length > 0 && (
          <section className="border-t border-slate-200 pt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Annexe — Références scientifiques
            </p>
            <ol className="space-y-2 text-[10px] leading-relaxed text-slate-500">
              {references.map((reference, index) => (
                <li key={`${reference.pmid || reference.titre}-${index}`}>
                  <span className="font-bold text-cyan-700">[{index + 1}] </span>
                  <span className="font-semibold text-slate-600">{reference.auteurs}. </span>
                  <span>{reference.titre}. </span>
                  <span className="italic">{reference.journal}</span>
                  {reference.annee ? `, ${reference.annee}.` : "."}
                  {reference.pmid && /^\d+$/.test(reference.pmid) && (
                    <>
                      {" "}
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-700 underline underline-offset-2"
                      >
                        PMID {reference.pmid}
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <footer className="flex flex-col justify-between gap-1 border-t border-slate-200 bg-slate-50 px-5 py-3 text-[9px] text-slate-400 sm:flex-row sm:px-10">
        <span>Document confidentiel — Usage médical uniquement</span>
        <span className="font-semibold text-cyan-700">
          HELIX · Assistance à la rédaction, validation médicale requise
        </span>
      </footer>
    </article>
  );
}

function renderHtmlList(items: string[], emptyLabel: string): string {
  if (!items.length) return `<p class="empty">${escapeHtml(emptyLabel)}</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderPrintSection(number: string, title: string, content: string): string {
  return `
    <section class="section">
      <div class="section-heading"><span>${escapeHtml(number)}</span><h2>${escapeHtml(title)}</h2></div>
      ${content}
    </section>`;
}

function buildPrintHTML(
  report: CompteRenduMedical,
  references: ReferenceScientifique[],
  fiche: FichePatient,
  generatedAt: Date
): string {
  const dateStr = formatReportDate(fiche.dateConsultation, generatedAt);
  const timeStr = generatedAt.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const patientName =
    [fiche.nom?.toUpperCase(), fiche.prenom].filter(Boolean).join(" ") || "Patient non identifié";
  const sexe =
    fiche.sexe === "M" ? "Masculin" : fiche.sexe === "F" ? "Féminin" : "Non renseigné";

  const antecedentsHtml = `
    <div class="two-columns">
      <div><h3>Antécédents médicaux</h3>${renderHtmlList(report.antecedents.medicaux, "Aucun antécédent médical renseigné.")}</div>
      <div><h3>Antécédents chirurgicaux</h3><p>${escapeHtml(report.antecedents.chirurgicaux)}</p></div>
      <div><h3>Antécédents familiaux</h3>${renderHtmlList(report.antecedents.familiaux, "Aucun antécédent familial renseigné.")}</div>
      ${
        fiche.sexe === "F"
          ? `<div><h3>Antécédents gynéco-obstétricaux</h3><p>${escapeHtml(report.antecedents.gynecoObstetricaux)}</p></div>`
          : ""
      }
      <div><h3>Allergies</h3>${renderHtmlList(report.allergies, "Aucune allergie renseignée.")}</div>
      <div><h3>Traitements en cours</h3><p>${escapeHtml(report.traitementsEnCours)}</p></div>
      <div class="full"><h3>Mode de vie</h3>${renderHtmlList(report.modeVie, "Mode de vie non renseigné.")}</div>
    </div>`;

  const constantesHtml = report.constantes.length
    ? `<div class="vitals">${report.constantes
        .map(
          (constante) => `
          <div class="vital ${constante.alerte ? "alert" : ""}">
            <span>${escapeHtml(constante.label)}</span>
            <strong>${escapeHtml(constante.valeur)}</strong>
          </div>`
        )
        .join("")}</div>`
    : '<p class="empty boxed">Constantes non renseignées.</p>';

  const examenHtml = report.examenClinique.length
    ? `<div class="exam-table">${report.examenClinique
        .map(
          (examen) => `
          <div class="exam-row">
            <strong>${escapeHtml(examen.appareil)}</strong>
            <p>${escapeHtml(examen.constatations)}</p>
          </div>`
        )
        .join("")}</div>`
    : '<p class="empty boxed">Examen clinique non renseigné.</p>';

  const hypothesesHtml = report.hypothesesDiagnostiques.length
    ? report.hypothesesDiagnostiques
        .map(
          (hypothese, index) => `
          <div class="diagnosis">
            <div class="diagnosis-head">
              <strong>${index + 1}. ${escapeHtml(hypothese.diagnostic)}</strong>
              <span>${escapeHtml(PROBABILITY_LABELS[hypothese.probabilite])}${
                hypothese.codeICD10 ? ` · CIM-10 ${escapeHtml(hypothese.codeICD10)}` : ""
              }</span>
            </div>
            ${
              hypothese.arguments.length
                ? `<p><b>Arguments :</b> ${hypothese.arguments.map(escapeHtml).join(" ; ")}</p>`
                : ""
            }
            ${
              hypothese.diagnosticsDifferentiels.length
                ? `<p><b>Diagnostics différentiels :</b> ${hypothese.diagnosticsDifferentiels
                    .map(escapeHtml)
                    .join(" ; ")}</p>`
                : ""
            }
          </div>`
        )
        .join("")
    : '<p class="empty">Aucune hypothèse diagnostique documentée.</p>';

  const referencesHtml = references.length
    ? `
      <section class="references">
        <h2>Annexe — Références scientifiques</h2>
        <ol>${references
          .map(
            (reference) => `
            <li><b>${escapeHtml(reference.auteurs)}.</b> ${escapeHtml(reference.titre)}.
            <i>${escapeHtml(reference.journal)}</i>${reference.annee ? `, ${escapeHtml(reference.annee)}` : ""}.
            ${
              reference.pmid && /^\d+$/.test(reference.pmid)
                ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}">PMID ${reference.pmid}</a>`
                : ""
            }</li>`
          )
          .join("")}</ol>
      </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Compte rendu — ${escapeHtml(patientName)}</title>
  <style>
    * { box-sizing: border-box; }
    @page { size: A4; margin: 12mm 15mm 14mm; }
    body { margin: 0; background: #fff; color: #334155; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.55; }
    .page { max-width: 180mm; margin: 0 auto; }
    .letterhead { display: flex; justify-content: space-between; gap: 20px; border-top: 5px solid #0e7490; border-bottom: 2px solid #0e7490; padding: 12px 0 11px; }
    .doctor-name { color: #155e75; font-size: 16pt; font-weight: 700; }
    .doctor-specialty { color: #64748b; font-size: 9pt; margin-top: 1px; }
    .inpe { color: #94a3b8; font-size: 7.5pt; font-weight: 600; letter-spacing: .08em; margin-top: 8px; text-transform: uppercase; }
    .clinic { max-width: 86mm; color: #64748b; font-size: 7.8pt; line-height: 1.5; text-align: right; }
    .clinic strong { color: #334155; }
    .document-title { padding: 16px 0 14px; text-align: center; }
    .document-title small { color: #0e7490; font-size: 7pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
    .document-title h1 { color: #0f172a; font-size: 15pt; letter-spacing: .1em; margin: 4px 0 2px; text-transform: uppercase; }
    .document-title p { color: #94a3b8; font-size: 7.5pt; margin: 0; }
    .identity { background: #f8fafc; border: 1px solid #e2e8f0; display: grid; grid-template-columns: 2fr .7fr .8fr 1.2fr; margin-bottom: 18px; padding: 10px 12px; }
    .identity div { padding-right: 8px; }
    .identity span { color: #94a3b8; display: block; font-size: 6.8pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
    .identity strong { color: #1e293b; display: block; font-size: 8.5pt; margin-top: 2px; }
    .section { break-inside: avoid; margin: 0 0 18px; }
    .section-heading { align-items: center; border-bottom: 1px solid #e2e8f0; display: flex; gap: 9px; margin-bottom: 8px; padding-bottom: 5px; }
    .section-heading span { color: #0e7490; font-family: monospace; font-size: 7pt; font-weight: 700; letter-spacing: .12em; }
    .section-heading h2, .references h2 { color: #1e293b; font-size: 8pt; letter-spacing: .1em; margin: 0; text-transform: uppercase; }
    h3 { color: #64748b; font-size: 7pt; letter-spacing: .07em; margin: 0 0 4px; text-transform: uppercase; }
    p { margin: 0; white-space: pre-wrap; }
    ul { margin: 0; padding-left: 15px; }
    li { margin-bottom: 3px; }
    .two-columns { display: grid; gap: 12px 25px; grid-template-columns: 1fr 1fr; }
    .two-columns .full { grid-column: 1 / -1; }
    .history { display: grid; gap: 22px; grid-template-columns: .85fr 2fr; }
    .associated { margin-top: 10px; }
    .empty { color: #94a3b8; font-style: italic; }
    .boxed { border: 1px dashed #e2e8f0; padding: 8px 10px; }
    .vitals { display: grid; grid-template-columns: repeat(4, 1fr); margin-bottom: 12px; }
    .vital { border: 1px solid #e2e8f0; margin: -1px 0 0 -1px; padding: 7px 8px; }
    .vital.alert { background: #fffbeb; }
    .vital span { color: #94a3b8; display: block; font-size: 6.5pt; font-weight: 700; text-transform: uppercase; }
    .vital strong { color: #1e293b; display: block; font-family: monospace; font-size: 8.5pt; margin-top: 2px; }
    .subheading { color: #64748b; font-size: 7pt; font-weight: 700; letter-spacing: .07em; margin: 10px 0 6px; text-transform: uppercase; }
    .exam-table { border-top: 1px solid #e2e8f0; }
    .exam-row { border-bottom: 1px solid #e2e8f0; display: grid; gap: 15px; grid-template-columns: 38mm 1fr; padding: 7px 0; }
    .exam-row strong { color: #334155; }
    .diagnosis { background: #f8fafc; border-left: 3px solid #0e7490; margin-bottom: 7px; padding: 8px 10px; }
    .diagnosis-head { display: flex; justify-content: space-between; gap: 10px; }
    .diagnosis-head strong { color: #0f172a; }
    .diagnosis-head span { color: #0e7490; font-size: 6.5pt; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
    .diagnosis p { color: #64748b; font-size: 8pt; margin-top: 3px; }
    .conclusion { background: #ecfeff; border: 1px solid #a5f3fc; break-inside: avoid; margin-top: 4px; padding: 12px 14px; }
    .conclusion h2 { color: #155e75; font-size: 8pt; letter-spacing: .1em; margin: 0 0 6px; text-transform: uppercase; }
    .conclusion p { color: #1e293b; font-weight: 600; }
    .signature { display: flex; justify-content: flex-end; margin: 20px 0 16px; }
    .signature div { text-align: center; width: 48mm; }
    .signature span { color: #94a3b8; font-size: 7pt; }
    .signature .line { border-bottom: 1px solid #cbd5e1; height: 17mm; }
    .signature strong { color: #334155; display: block; margin-top: 4px; }
    .references { border-top: 1px solid #e2e8f0; break-before: auto; margin-top: 15px; padding-top: 10px; }
    .references ol { color: #64748b; font-size: 7pt; padding-left: 14px; }
    .references a { color: #0e7490; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; color: #94a3b8; display: flex; font-size: 6.5pt; justify-content: space-between; margin-top: 14px; padding: 7px 8px; }
    .footer strong { color: #0e7490; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { max-width: none; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="letterhead">
      <div>
        <div class="doctor-name">${escapeHtml(DOCTOR.nom)}</div>
        <div class="doctor-specialty">${escapeHtml(DOCTOR.specialite)}</div>
        <div class="inpe">N° INPE : ${escapeHtml(DOCTOR.inpe)}</div>
      </div>
      <div class="clinic">
        <strong>${escapeHtml(DOCTOR.adresse)}</strong><br />
        ${escapeHtml(DOCTOR.adresse2)}<br />
        ${escapeHtml(DOCTOR.ville)}<br />
        Tél. ${escapeHtml(DOCTOR.tel)} · ${escapeHtml(DOCTOR.email)}
      </div>
    </header>

    <div class="document-title">
      <small>Document médical confidentiel</small>
      <h1>Compte rendu de consultation</h1>
      <p>Établi le ${escapeHtml(dateStr)} à ${escapeHtml(timeStr)}</p>
    </div>

    <div class="identity">
      <div><span>Patient</span><strong>${escapeHtml(patientName)}</strong></div>
      <div><span>Âge</span><strong>${fiche.age !== undefined ? `${escapeHtml(fiche.age)} ans` : "—"}</strong></div>
      <div><span>Sexe</span><strong>${escapeHtml(sexe)}</strong></div>
      <div><span>Profession</span><strong>${escapeHtml(fiche.profession || "—")}</strong></div>
    </div>

    ${renderPrintSection(
      "01",
      "Motif et histoire de la maladie",
      `<div class="history">
        <div><h3>Motif de consultation</h3><p><b>${escapeHtml(report.motifConsultation)}</b></p></div>
        <div><h3>Histoire de la maladie actuelle</h3><p>${escapeHtml(report.histoireMaladie)}</p></div>
      </div>
      <div class="associated"><h3>Signes fonctionnels et associés</h3>${renderHtmlList(report.signesAssocies, "Aucun signe associé renseigné.")}</div>`
    )}

    ${renderPrintSection("02", "Antécédents, allergies et mode de vie", antecedentsHtml)}

    ${renderPrintSection(
      "03",
      "Examen clinique",
      `<div class="subheading">Constantes vitales et paramètres anthropométriques</div>
       ${constantesHtml}
       <div class="subheading">Examen par appareil</div>
       ${examenHtml}`
    )}

    ${renderPrintSection(
      "04",
      "Synthèse clinique",
      `<p>${escapeHtml(report.syntheseClinique)}</p>`
    )}

    ${renderPrintSection("05", "Orientation diagnostique", hypothesesHtml)}

    ${renderPrintSection(
      "06",
      "Examens complémentaires et prise en charge",
      `<div class="two-columns">
        <div><h3>Examens complémentaires proposés</h3>${renderHtmlList(report.examensComplementaires, "Aucun examen complémentaire proposé.")}</div>
        <div><h3>Prise en charge proposée</h3>${renderHtmlList(report.priseEnCharge, "Aucune prise en charge documentée.")}</div>
      </div>`
    )}

    ${renderPrintSection(
      "07",
      "Suivi et éléments de vigilance",
      `<div class="two-columns">
        <div><h3>Conseils et suivi</h3>${renderHtmlList(report.conseilsSuivi, "Modalités de suivi non renseignées.")}</div>
        <div><h3>Points de vigilance</h3>${renderHtmlList(report.pointsVigilance, "Aucun point de vigilance spécifique documenté.")}</div>
      </div>`
    )}

    <section class="conclusion">
      <h2>Conclusion</h2>
      <p>${escapeHtml(report.conclusion)}</p>
    </section>

    <div class="signature">
      <div>
        <span>Signature et cachet</span>
        <div class="line"></div>
        <strong>${escapeHtml(DOCTOR.nom)}</strong>
        <span>${escapeHtml(DOCTOR.specialite)}</span>
      </div>
    </div>

    ${referencesHtml}

    <footer class="footer">
      <span>Document confidentiel — Usage médical uniquement</span>
      <strong>HELIX · Assistance à la rédaction, validation médicale requise</strong>
    </footer>
  </main>
</body>
</html>`;
}

function buildPlainText(
  report: CompteRenduMedical,
  fiche: FichePatient,
  generatedAt: Date
): string {
  const list = (items: string[], emptyLabel: string) =>
    items.length ? items.map((item) => `• ${item}`).join("\n") : emptyLabel;
  const hypotheses = report.hypothesesDiagnostiques.length
    ? report.hypothesesDiagnostiques
        .map(
          (hypothese, index) =>
            `${index + 1}. ${hypothese.diagnostic} — ${PROBABILITY_LABELS[hypothese.probabilite]}${
              hypothese.codeICD10 ? ` — CIM-10 ${hypothese.codeICD10}` : ""
            }${
              hypothese.arguments.length
                ? `\nArguments : ${hypothese.arguments.join(" ; ")}`
                : ""
            }${
              hypothese.diagnosticsDifferentiels.length
                ? `\nDiagnostics différentiels : ${hypothese.diagnosticsDifferentiels.join(" ; ")}`
                : ""
            }`
        )
        .join("\n\n")
    : "Aucune hypothèse diagnostique documentée.";
  const examens = report.examenClinique.length
    ? report.examenClinique
        .map((examen) => `${examen.appareil} : ${examen.constatations}`)
        .join("\n")
    : "Examen clinique non renseigné.";
  const constantes = report.constantes.length
    ? report.constantes.map((item) => `${item.label} : ${item.valeur}`).join(" ; ")
    : "Constantes non renseignées.";
  const patientName =
    [fiche.nom?.toUpperCase(), fiche.prenom].filter(Boolean).join(" ") || "Patient non identifié";

  return `${DOCTOR.nom}
${DOCTOR.specialite} — INPE ${DOCTOR.inpe}

COMPTE RENDU DE CONSULTATION
${formatReportDate(fiche.dateConsultation, generatedAt)}

PATIENT
${patientName} — ${fiche.age !== undefined ? `${fiche.age} ans` : "Âge non renseigné"} — ${
    fiche.sexe === "M" ? "Masculin" : fiche.sexe === "F" ? "Féminin" : "Sexe non renseigné"
  }

MOTIF DE CONSULTATION
${report.motifConsultation}

HISTOIRE DE LA MALADIE ACTUELLE
${report.histoireMaladie}

SIGNES ASSOCIÉS
${list(report.signesAssocies, "Aucun signe associé renseigné.")}

ANTÉCÉDENTS
Médicaux :
${list(report.antecedents.medicaux, "Aucun antécédent médical renseigné.")}
Chirurgicaux : ${report.antecedents.chirurgicaux}
Familiaux :
${list(report.antecedents.familiaux, "Aucun antécédent familial renseigné.")}
${fiche.sexe === "F" ? `Gynéco-obstétricaux : ${report.antecedents.gynecoObstetricaux}\n` : ""}
Allergies :
${list(report.allergies, "Aucune allergie renseignée.")}
Traitements en cours : ${report.traitementsEnCours}
Mode de vie :
${list(report.modeVie, "Mode de vie non renseigné.")}

EXAMEN CLINIQUE
Constantes : ${constantes}
${examens}

SYNTHÈSE CLINIQUE
${report.syntheseClinique}

ORIENTATION DIAGNOSTIQUE
${hypotheses}

EXAMENS COMPLÉMENTAIRES PROPOSÉS
${list(report.examensComplementaires, "Aucun examen complémentaire proposé.")}

PRISE EN CHARGE PROPOSÉE
${list(report.priseEnCharge, "Aucune prise en charge documentée.")}

CONSEILS ET SUIVI
${list(report.conseilsSuivi, "Modalités de suivi non renseignées.")}

POINTS DE VIGILANCE
${list(report.pointsVigilance, "Aucun point de vigilance spécifique documenté.")}

CONCLUSION
${report.conclusion}

Document confidentiel — Validation médicale requise.`;
}

export function ReportModal({ open, onClose }: ReportModalProps) {
  const { fiche, agent } = useConsultationStore();
  const [report, setReport] = useState<CompteRenduMedical | null>(null);
  const [references, setReferences] = useState<ReferenceScientifique[]>([]);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const previewDate = formatReportDate(fiche.dateConsultation, new Date());

  const generate = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fiche,
          hypotheses: agent.hypotheses,
          suggestions: agent.suggestions,
          alertes: agent.alertes,
          ordonnanceSuggree: agent.ordonnanceSuggree,
          medecin: DOCTOR.nom,
        }),
      });
      const data = (await response.json()) as {
        compteRendu?: unknown;
        references?: ReferenceScientifique[];
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || data.error || "La génération du compte rendu a échoué.");
      }
      if (!isCompteRenduMedical(data.compteRendu)) {
        throw new Error("Le format du compte rendu reçu est incomplet.");
      }

      setReport(data.compteRendu);
      setReferences(Array.isArray(data.references) ? data.references : []);
      setGeneratedAt(new Date());
    } catch (generationError) {
      setReport(null);
      setReferences([]);
      setGeneratedAt(null);
      setError(
        generationError instanceof Error
          ? generationError.message
          : "La génération du compte rendu a échoué."
      );
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    setReport(null);
    setReferences([]);
    setGeneratedAt(null);
    setError(null);
    setCopied(false);
  };

  const handlePrint = () => {
    if (!report || !generatedAt) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Le navigateur a bloqué l’ouverture de la fenêtre d’impression.");
      return;
    }
    printWindow.document.write(buildPrintHTML(report, references, fiche, generatedAt));
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  const handleDownload = () => {
    if (!report || !generatedAt) return;
    const html = buildPrintHTML(report, references, fiche, generatedAt);
    const filenameBase =
      sanitizeFilename(
        `CR_${fiche.nom || "patient"}_${fiche.prenom || ""}_${generatedAt
          .toISOString()
          .slice(0, 10)}`
      ) || "compte_rendu";
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filenameBase}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!report || !generatedAt) return;
    try {
      await navigator.clipboard.writeText(buildPlainText(report, fiche, generatedAt));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("La copie dans le presse-papiers n’est pas disponible.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-0 backdrop-blur-[2px] sm:p-4"
          onClick={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            initial={{ scale: 0.98, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-100 shadow-2xl sm:h-[94vh] sm:max-w-6xl sm:rounded-xl"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 sm:flex">
                  <FileText size={18} />
                </span>
                <div className="min-w-0">
                  <h1
                    id="report-modal-title"
                    className="truncate text-sm font-bold text-slate-900 sm:text-base"
                  >
                    Compte rendu de consultation
                  </h1>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {DOCTOR.nom} · {previewDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer le compte rendu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {!report ? (
                <div className="flex min-h-full items-center justify-center px-4 py-8 sm:px-8">
                  <div className="w-full max-w-lg">
                    <div className="border-t-4 border-cyan-700 bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                        <div>
                          <p className="text-base font-bold text-cyan-800">{DOCTOR.nom}</p>
                          <p className="text-xs text-slate-500">{DOCTOR.specialite}</p>
                        </div>
                        <p className="hidden text-right text-[10px] leading-relaxed text-slate-400 sm:block">
                          {DOCTOR.adresse}
                          <br />
                          {DOCTOR.ville}
                        </p>
                      </div>
                      <div className="py-6 text-center">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                          Document médical confidentiel
                        </p>
                        <p className="mt-2 text-sm font-bold uppercase tracking-[0.13em] text-slate-800">
                          Compte rendu de consultation
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                        <div className="col-span-2">
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">
                            Patient
                          </span>
                          <strong className="text-slate-700">
                            {[fiche.nom?.toUpperCase(), fiche.prenom].filter(Boolean).join(" ") ||
                              "Patient non identifié"}
                          </strong>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-400">
                            Âge
                          </span>
                          <strong className="text-slate-700">
                            {fiche.age !== undefined ? `${fiche.age} ans` : "—"}
                          </strong>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2 text-[11px] text-slate-500">
                        {[
                          "Motif et anamnèse",
                          "Antécédents",
                          "Constantes",
                          "Examen clinique",
                          "Synthèse",
                          "Orientation diagnostique",
                          "Prise en charge",
                          "Conclusion",
                        ].map((section) => (
                          <div key={section} className="flex items-center gap-2">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-cyan-700" />
                            {section}
                          </div>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        className="mt-4 flex gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={generate}
                      disabled={loading}
                      className="mx-auto mt-6 flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-cyan-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Préparation du document…
                        </>
                      ) : (
                        <>
                          <FileText size={17} />
                          {error ? "Réessayer" : "Générer le compte rendu"}
                        </>
                      )}
                    </button>
                    <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-400">
                      Toutes les rubriques sont générées à partir des données de la consultation.
                      <br />
                      Une validation médicale reste requise avant signature.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-0 py-0 sm:px-6 sm:py-7 lg:px-10">
                  <ReportDocument
                    report={report}
                    references={references}
                    fiche={fiche}
                    generatedAt={generatedAt || new Date()}
                  />
                </div>
              )}
            </div>

            {report && generatedAt && (
              <footer className="safe-bottom flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={regenerate}
                    className="min-h-10 text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-800"
                  >
                    Régénérer
                  </button>
                  <span className="hidden items-center gap-1.5 text-[10px] text-slate-400 lg:flex">
                    <ShieldCheck size={13} className="text-cyan-700" />
                    Données structurées · validation médicale requise
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 sm:px-4 sm:text-sm"
                  >
                    {copied ? <Check size={15} className="text-emerald-600" /> : <Clipboard size={15} />}
                    {copied ? "Copié" : "Copier"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-900 sm:px-4 sm:text-sm"
                  >
                    <Download size={15} />
                    Télécharger
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-cyan-800 sm:px-4 sm:text-sm"
                  >
                    <Printer size={15} />
                    Imprimer / PDF
                  </button>
                </div>
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
