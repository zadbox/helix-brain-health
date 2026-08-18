"use client";

import { useConsultationStore } from "@/store/consultation";
import { FichePatient, MotifPrincipal } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  title,
  color = "blue",
  children,
  defaultOpen = false,
  completed = false,
  alert = false,
}: {
  id: string;
  title: string;
  icon?: React.ElementType;
  color?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  completed?: boolean;
  alert?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const colorMap: Record<string, string> = {
    blue: "border-l-[#0891B2]",
    orange: "border-l-orange-400",
    red: "border-l-red-400",
    green: "border-l-green-600",
    pink: "border-l-pink-400",
    purple: "border-l-purple-400",
    gray: "border-l-gray-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border-l-4 border border-gray-100 bg-white shadow-sm overflow-hidden transition-all",
        colorMap[color],
        alert && "border-l-red-500 ring-1 ring-red-200"
      )}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50/50"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 text-base">{title}</span>
          {completed && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
          {alert && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />}
        </div>
        {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Input Components ─────────────────────────────────────────────────────────

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-500">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  value?: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-3 py-2 text-base rounded-lg border border-gray-200 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400",
        "transition-all placeholder:text-gray-300",
        className
      )}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-base rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-gray-700"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 text-base rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-300 resize-none"
    />
  );
}

function CheckGroup({
  options,
  selected,
  onChange,
  columns = 2,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  columns?: number;
}) {
  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item]);
  };
  return (
    <div className={cn("grid gap-1.5", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          aria-pressed={selected.includes(opt)}
          onClick={() => toggle(opt)}
          className="group flex min-h-10 items-center gap-2 rounded-lg px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <div
            className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0",
              selected.includes(opt) ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-blue-400"
            )}
          >
            {selected.includes(opt) && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600 group-hover:text-gray-800">{opt}</span>
        </button>
      ))}
    </div>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div className={cn("grid gap-1.5", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          className="group flex min-h-10 items-center gap-2 rounded-lg px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          onClick={() => onChange(opt.value)}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
              value === opt.value ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-blue-400"
            )}
          >
            {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <span className="text-sm text-gray-600 group-hover:text-gray-800">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function EVASlider({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  const emojis = ["😌", "🙂", "😐", "😟", "😣", "😖", "😩", "😫", "🥵", "😱", "💀"];
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>0 — Aucune</span>
        <span>10 — Insupportable</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emojis[value ?? 0]}</span>
        <span className="text-sm font-bold text-orange-600">EVA {value ?? 0}/10</span>
      </div>
    </div>
  );
}

function optionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

// ─── Data Constants ───────────────────────────────────────────────────────────

const MOTIFS: { value: MotifPrincipal; label: string }[] = [
  { value: "douleur", label: "Douleur" },
  { value: "fievre", label: "Fièvre" },
  { value: "dyspnee", label: "Dyspnée" },
  { value: "toux", label: "Toux" },
  { value: "cephalee", label: "Céphalée" },
  { value: "vertiges", label: "Vertiges" },
  { value: "palpitations", label: "Palpitations" },
  { value: "digestif", label: "Troubles digestifs" },
  { value: "urinaire", label: "Troubles urinaires" },
  { value: "cutane", label: "Éruption cutanée" },
  { value: "orl", label: "Symptômes ORL" },
  { value: "traumatisme", label: "Traumatisme" },
  { value: "fatigue", label: "Fatigue / Asthénie" },
  { value: "autre", label: "Autre" },
];

const SIGNES_ASSOCIES = [
  "Nausées", "Vomissements", "Diarrhée", "Constipation",
  "Anorexie", "Amaigrissement", "Asthénie", "Sueurs",
  "Dyspnée", "Toux", "Rhinorrhée", "Odynophagie",
  "Dysurie", "Pollakiurie", "Œdèmes", "Éruption cutanée",
  "Céphalées", "Vertiges", "Palpitations", "Syncope",
  "Fièvre", "Saignement",
];

const ANTECEDENTS_MEDICAUX = [
  "HTA", "Diabète type 2", "Diabète type 1", "Obésité",
  "Coronaropathie", "Insuffisance cardiaque", "ACFA", "AVC/AIT",
  "BPCO", "Asthme", "Tuberculose", "Hépatite B/C",
  "IRC", "Néphropathie", "Dyslipidémie", "Hypothyroïdie",
  "Hyperthyroïdie", "Cancer", "Dépression", "Épilepsie",
  "Polyarthrite rhumatoïde", "Lupus",
];

const ANTECEDENTS_FAMILIAUX = [
  "Diabète", "HTA", "Coronaropathie", "AVC",
  "Cancer colorectal", "Cancer du sein", "Cancer de la prostate",
  "Maladies auto-immunes", "Maladies psychiatriques",
];

const APPAREILS_EXAMEN: { key: string; label: string; placeholder: string; color: string; findings: string[] }[] = [
  { key: "Cardiovasculaire", label: "Cardio-vasculaire", color: "bg-red-100 text-red-700 border-red-200",
    placeholder: "Notes complémentaires...",
    findings: ["B1B2 normaux", "Tachycardie", "Bradycardie", "Souffle systolique", "Souffle diastolique", "HTA", "Hypotension", "IC droite", "IC gauche", "Pouls faibles"] },
  { key: "Pulmonaire", label: "Pulmonaire / Respiratoire", color: "bg-sky-100 text-sky-700 border-sky-200",
    placeholder: "Notes complémentaires...",
    findings: ["MV normal", "Râles crépitants", "Sibilants", "Ronchus", "Diminution MV", "Douleur pleurale", "SpO2 basse", "Dyspnée"] },
  { key: "Abdominal", label: "Abdominal / Digestif", color: "bg-amber-100 text-amber-700 border-amber-200",
    placeholder: "Notes complémentaires...",
    findings: ["Abdomen souple", "Douleur à la palpation", "Défense", "Contracture", "Hépatomégalie", "Splénomégalie", "Masse palpable", "BHA diminués"] },
  { key: "Neurologique", label: "Neurologique", color: "bg-purple-100 text-purple-700 border-purple-200",
    placeholder: "Notes complémentaires...",
    findings: [
      "Conscience normale", "Somnolence", "Confusion", "Coma",
      "GCS 15/15", "Désorientation T/L/E",
      "Déficit moteur", "Déficit sensitif", "Hémiparésie", "Hémiplégie",
      "ROT normaux", "ROT diminués", "ROT vifs", "Babinski +",
      "Raideur méningée", "Kernig +", "Brudzinski +",
      "Ataxie", "Dysmétrie", "Nystagmus",
      "Troubles du langage", "Aphasie", "Dysarthrie",
      "PC II–XII normaux", "Ptosis", "Diplopie", "Paralysie faciale",
      "Troubles de la marche", "Tremblements",
    ] },
  { key: "Ophtalmologique", label: "Ophtalmologique", color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    placeholder: "Notes complémentaires...",
    findings: [
      "AV normale", "BAV", "Flou visuel", "Diplopie",
      "Fond d'œil normal", "Papilledème", "Atrophie optique", "Hémorragies rétiniennes",
      "Champ visuel normal", "Hémianopsie", "Quadranopsie",
      "Pupilles isocores-réactives", "Anisocorie", "Mydriase", "Myosis",
      "Ptosis", "Nystagmus", "Paralysie oculomotrice",
    ] },
  { key: "Psychiatrique", label: "Psychiatrique / Cognitif", color: "bg-pink-100 text-pink-700 border-pink-200",
    placeholder: "Notes complémentaires...",
    findings: [
      "Orienté T/L/E", "Désorientation temporelle", "Désorientation spatiale",
      "Mémoire immédiate normale", "Troubles mémoire immédiate",
      "Mémoire récente normale", "Troubles mémoire récente",
      "Mémoire ancienne préservée", "Troubles mémoire ancienne",
      "Attention normale", "Troubles attentionnels",
      "Langage normal", "Aphasie", "Manque du mot",
      "Humeur normale", "Dépression", "Anxiété", "Euphorie",
      "Comportement adapté", "Agitation", "Apathie", "Désinhibition",
      "Jugement conservé", "Jugement altéré",
      "MMSE normal (≥27)", "MMSE léger (21-26)", "MMSE modéré (11-20)", "MMSE sévère (≤10)",
      "Hallucinations", "Idées délirantes",
    ] },
  { key: "ORL", label: "ORL / Tête & Cou", color: "bg-teal-100 text-teal-700 border-teal-200",
    placeholder: "Notes complémentaires...",
    findings: ["Oropharynx normal", "Amygdales inflammées", "Otite", "Adénopathies", "Goitre", "Sinusite", "Déviation septale"] },
  { key: "Cutané", label: "Cutané / Téguments", color: "bg-orange-100 text-orange-700 border-orange-200",
    placeholder: "Notes complémentaires...",
    findings: ["Peau normale", "Ictère", "Cyanose", "Pâleur", "Éruption", "Œdèmes", "Lésion suspecte", "Cicatrice"] },
  { key: "Locomoteur", label: "Locomoteur / Ostéo-articulaire", color: "bg-lime-100 text-lime-700 border-lime-200",
    placeholder: "Notes complémentaires...",
    findings: ["Mobilité normale", "Douleur articulaire", "Tuméfaction", "Limitation d'amplitude", "Déficit musculaire", "Déformation"] },
  { key: "Urogénital", label: "Uro-génital / Rénal", color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    placeholder: "Notes complémentaires...",
    findings: ["Fosses lombaires libres", "Douleur lombaire", "Globe vésical", "Dysurie", "Hématurie"] },
  { key: "Général", label: "État général", color: "bg-gray-100 text-gray-700 border-gray-200",
    placeholder: "Notes complémentaires...",
    findings: ["Bon état général", "Altération EG", "Fièvre", "Asthénie", "Amaigrissement", "Déshydratation"] },
];

// ─── Auto-resize Textarea ─────────────────────────────────────────────────────

function AutoTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full px-3 py-2 text-base rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-gray-300 resize-none overflow-hidden leading-relaxed"
    />
  );
}

// ─── Examen Clinique Panel ─────────────────────────────────────────────────────

function ExamenCliniquePanel({
  examenClinique,
  onChange,
}: {
  examenClinique: Record<string, string> | undefined;
  onChange: (v: Record<string, string>) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const getValue = (key: string) => examenClinique?.[key] ?? "";
  const setValue = (key: string, val: string) =>
    onChange({ ...examenClinique, [key]: val });

  const toggleFinding = (key: string, finding: string) => {
    const current = getValue(key);
    const lines = current.split("\n").map((l) => l.trim()).filter(Boolean);
    const isActive = lines.includes(finding);
    const next = isActive
      ? lines.filter((l) => l !== finding).join("\n")
      : [...lines.filter((l) => l !== "Normal"), finding].join("\n");
    setValue(key, next);
  };

  const setNormal = (key: string) => setValue(key, "Normal");

  const filledCount = APPAREILS_EXAMEN.filter((a) => getValue(a.key).trim()).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">
          {filledCount}/{APPAREILS_EXAMEN.length} appareils renseignés
        </span>
        <button
          onClick={() => setShowAll((s) => !s)}
          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
        >
          {showAll ? "Replier tout" : "Déplier tout"}
        </button>
      </div>

      {APPAREILS_EXAMEN.map((appareil) => {
        const val = getValue(appareil.key);
        const isFilled = val.trim().length > 0;
        const isOpen = showAll || expanded[appareil.key] || isFilled;
        const activeFindings = val.split("\n").map((l) => l.trim()).filter(Boolean);
        const isNormal = val.trim() === "Normal";

        return (
          <div
            key={appareil.key}
            className={cn(
              "rounded-xl border transition-all overflow-hidden",
              isFilled ? "border-gray-200 bg-white shadow-sm" : "border-gray-100 bg-gray-50/50"
            )}
          >
            {/* Row header */}
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 text-left"
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [appareil.key]: !prev[appareil.key] }))
              }
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0", appareil.color)}>
                  {appareil.label}
                </span>
                {isFilled && !isOpen && (
                  <span className="text-xs text-gray-500 truncate">{activeFindings.join(", ")}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {isFilled && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
                {isOpen
                  ? <ChevronUp size={13} className="text-gray-400" />
                  : <ChevronDown size={13} className="text-gray-400" />}
              </div>
            </button>

            {/* Interactive panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2">
                    {/* Normal button + findings chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {/* Normal */}
                      <button
                        type="button"
                        onClick={() => setNormal(appareil.key)}
                        className={cn(
                          "min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                          isNormal
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white border-green-300 text-green-600 hover:bg-green-50"
                        )}
                      >
                        ✓ Normal
                      </button>
                      {/* Finding chips */}
                      {appareil.findings.map((f) => {
                        const active = activeFindings.includes(f);
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => toggleFinding(appareil.key, f)}
                            className={cn(
                              "min-h-9 rounded-full border px-3 py-1.5 text-xs transition-all",
                              active
                                ? "bg-red-100 border-red-400 text-red-700 font-semibold"
                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                            )}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                    {/* Free text */}
                    <AutoTextarea
                      value={isNormal ? "" : activeFindings.filter((f) => !appareil.findings.includes(f) && f !== "Normal").join("\n")}
                      onChange={(v) => {
                        const chipLines = activeFindings.filter((f) => appareil.findings.includes(f));
                        const combined = [...chipLines, ...v.split("\n").map((l) => l.trim()).filter(Boolean)].join("\n");
                        setValue(appareil.key, combined || (isNormal ? "Normal" : ""));
                      }}
                      placeholder={appareil.placeholder}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FichePatientForm() {
  const { fiche, updateFiche } = useConsultationStore();
  const u = useCallback(
    (key: keyof FichePatient, val: unknown) => updateFiche({ [key]: val } as Partial<FichePatient>),
    [updateFiche]
  );

  const hasConstantAlert =
    fiche.constantes &&
    ((fiche.constantes.temperature ?? 0) > 38.5 ||
      (fiche.constantes.taSystolique ?? 0) > 180 ||
      (fiche.constantes.taSystolique ?? 999) < 90 ||
      (fiche.constantes.spo2 ?? 100) < 94 ||
      (fiche.constantes.fc ?? 0) > 120 ||
      (fiche.constantes.fc ?? 999) < 50 ||
      (fiche.constantes.fr ?? 0) > 25);

  return (
    <div className="space-y-3 pb-6">

      {/* 1 — Identité */}
      <Section
        id="identite"
        title="1. Identité du Patient"
       
        color="blue"
        defaultOpen
        completed={!!(fiche.nom && fiche.prenom && fiche.age !== undefined && fiche.sexe)}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Prénom" required>
            <Input value={fiche.prenom} onChange={(v) => u("prenom", v)} placeholder="Prénom" />
          </Field>
          <Field label="Nom" required>
            <Input value={fiche.nom} onChange={(v) => u("nom", v)} placeholder="Nom de famille" />
          </Field>
          <Field label="Âge" required>
            <Input value={fiche.age} onChange={(v) => u("age", optionalNumber(v))} type="number" placeholder="Âge" />
          </Field>
          <Field label="Sexe" required>
            <Select
              value={fiche.sexe}
              onChange={(v) => u("sexe", v)}
              options={[{ value: "M", label: "Masculin" }, { value: "F", label: "Féminin" }]}
              placeholder="— Choisir —"
            />
          </Field>
          <Field label="Profession">
            <Input value={fiche.profession} onChange={(v) => u("profession", v)} placeholder="Profession" />
          </Field>
          <Field label="Date de consultation">
            <Input value={fiche.dateConsultation} onChange={(v) => u("dateConsultation", v)} type="date" />
          </Field>
        </div>
      </Section>

      {/* 2 — Motif Principal */}
      <Section
        id="motif"
        title="2. Motif Principal de Consultation"
       
        color="blue"
        defaultOpen
        completed={!!fiche.motifPrincipal}
      >
        <Field label="Motif principal" required>
          <div className="grid grid-cols-2 gap-1.5">
            {MOTIFS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => u("motifPrincipal", m.value)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left",
                  fiche.motifPrincipal === m.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Précision / Description libre">
          <Input value={fiche.motifLibre} onChange={(v) => u("motifLibre", v)} placeholder="Précisez le motif..." />
        </Field>
      </Section>

      {/* 3 — HMA Douleur (conditionnel) */}
      <AnimatePresence>
        {fiche.motifPrincipal === "douleur" && (
          <motion.div
            key="hma-douleur"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Section id="hma-douleur" title="3. HMA — Douleur (PQRST)" color="orange" defaultOpen>
              <Field label="Type de douleur">
                <Select
                  value={fiche.hmaDouleur?.type}
                  onChange={(v) => updateFiche({ hmaDouleur: { ...fiche.hmaDouleur, type: v } })}
                  options={[
                    { value: "mecanique", label: "Mécanique — aggravée à l'effort, soulagée au repos" },
                    { value: "inflammatoire", label: "Inflammatoire — nocturne, dérouillage matinal" },
                    { value: "neuropathique", label: "Neuropathique — brûlure, décharges, allodynie" },
                    { value: "vasculaire", label: "Vasculaire — pulsatile, battements" },
                    { value: "viscérale", label: "Viscérale — profonde, diffuse, mal localisée" },
                    { value: "projetée", label: "Projetée — irradie à distance de la source" },
                    { value: "constrictive", label: "Constrictive / en étau" },
                    { value: "brulure", label: "Brûlure superficielle" },
                    { value: "pique", label: "Piqûre / coup de poignard" },
                    { value: "torsion", label: "Torsion / crampe" },
                    { value: "pesanteur", label: "Pesanteur / lourdeur" },
                    { value: "colique", label: "Colique — paroxystique, ondulante" },
                    { value: "psychogene", label: "Psychogène / somatoforme" },
                    { value: "mixte", label: "Mixte — plusieurs composantes" },
                    { value: "autre", label: "Autre" },
                  ]}
                  placeholder="Type de douleur"
                />
              </Field>
              <Field label="Intensité (EVA)">
                <EVASlider
                  value={fiche.hmaDouleur?.eva}
                  onChange={(v) => updateFiche({ hmaDouleur: { ...fiche.hmaDouleur, eva: v } })}
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Localisation">
                  <Input
                    value={fiche.hmaDouleur?.localisation}
                    onChange={(v) => updateFiche({ hmaDouleur: { ...fiche.hmaDouleur, localisation: v } })}
                    placeholder="Ex: thorax gauche, épigastre..."
                  />
                </Field>
                <Field label="Irradiation">
                  <Input
                    value={fiche.hmaDouleur?.irradiation}
                    onChange={(v) => updateFiche({ hmaDouleur: { ...fiche.hmaDouleur, irradiation: v } })}
                    placeholder="Ex: bras gauche, mâchoire..."
                  />
                </Field>
                <Field label="Évolution">
                  <Select
                    value={fiche.hmaDouleur?.evolution}
                    onChange={(v) => updateFiche({ hmaDouleur: { ...fiche.hmaDouleur, evolution: v } })}
                    options={[
                      { value: "permanente", label: "Permanente / continue" },
                      { value: "intermittente", label: "Intermittente / crises" },
                      { value: "progressive", label: "Progressive" },
                      { value: "regressive", label: "Régressive" },
                      { value: "stable", label: "Stable" },
                    ]}
                    placeholder="Évolution"
                  />
                </Field>
                <Field label="Facteurs déclenchants">
                  <Input
                    value={fiche.hmaDouleur?.facteursDeclenchants}
                    onChange={(v) => updateFiche({ hmaDouleur: { ...fiche.hmaDouleur, facteursDeclenchants: v } })}
                    placeholder="Effort, repas, stress..."
                  />
                </Field>
              </div>
              <Field label="Facteurs calmants / aggravants">
                <Input
                  value={fiche.hmaDouleur?.facteursCalmantsAggravants}
                  onChange={(v) => updateFiche({ hmaDouleur: { ...fiche.hmaDouleur, facteursCalmantsAggravants: v } })}
                  placeholder="Position antalgique, nitrés, antiacides..."
                />
              </Field>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 — HMA Fièvre (conditionnel) */}
      <AnimatePresence>
        {fiche.motifPrincipal === "fievre" && (
          <motion.div
            key="hma-fievre"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Section id="hma-fievre" title="3. HMA — Fièvre" color="red" defaultOpen>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Température mesurée (°C)">
                  <Input
                    type="number"
                    value={fiche.hmaFievre?.temperature}
                    onChange={(v) => updateFiche({ hmaFievre: { ...fiche.hmaFievre, temperature: optionalNumber(v) } })}
                    placeholder="38.5"
                  />
                </Field>
                <Field label="Durée">
                  <Input
                    value={fiche.hmaFievre?.duree}
                    onChange={(v) => updateFiche({ hmaFievre: { ...fiche.hmaFievre, duree: v } })}
                    placeholder="Ex: 3 jours"
                  />
                </Field>
                <Field label="Mode d'installation">
                  <Select
                    value={fiche.hmaFievre?.mode}
                    onChange={(v) => updateFiche({ hmaFievre: { ...fiche.hmaFievre, mode: v } })}
                    options={[
                      { value: "brutal", label: "Brutal / Soudain" },
                      { value: "progressif", label: "Progressif" },
                    ]}
                    placeholder="Mode d'installation"
                  />
                </Field>
              </div>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fiche.hmaFievre?.frissons ?? false}
                    onChange={(e) => updateFiche({ hmaFievre: { ...fiche.hmaFievre, frissons: e.target.checked } })}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-sm text-gray-700">Frissons</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fiche.hmaFievre?.sueurs ?? false}
                    onChange={(e) => updateFiche({ hmaFievre: { ...fiche.hmaFievre, sueurs: e.target.checked } })}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-sm text-gray-700">Sueurs nocturnes</span>
                </label>
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 — HMA générique (autres motifs) */}
      <AnimatePresence>
        {fiche.motifPrincipal && fiche.motifPrincipal !== "douleur" && fiche.motifPrincipal !== "fievre" && (
          <motion.div
            key="hma-libre"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Section id="hma-libre" title="3. Histoire de la Maladie Actuelle" color="blue" defaultOpen>
              <Field label="Description chronologique">
                <Textarea
                  value={fiche.hmaLibre}
                  onChange={(v) => u("hmaLibre", v)}
                  placeholder="Décrivez l'histoire de la maladie actuelle (début, évolution, signes associés...)"
                  rows={4}
                />
              </Field>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 — Signes associés */}
      <Section
        id="signes"
        title="4. Signes Associés"
       
        color="purple"
        completed={!!(fiche.signesAssocies?.length)}
      >
        <CheckGroup
          options={SIGNES_ASSOCIES}
          selected={fiche.signesAssocies ?? []}
          onChange={(v) => u("signesAssocies", v)}
          columns={2}
        />
      </Section>

      {/* 5 — Antécédents médicaux */}
      <Section
        id="atcd"
        title="5. Antécédents Médicaux & Chirurgicaux"
       
        color="gray"
        completed={!!(fiche.antecedentsMedicaux?.length || fiche.antecedentsChirurgicaux)}
      >
        <CheckGroup
          options={ANTECEDENTS_MEDICAUX}
          selected={fiche.antecedentsMedicaux ?? []}
          onChange={(v) => u("antecedentsMedicaux", v)}
          columns={2}
        />
        <Field label="Antécédents chirurgicaux">
          <Textarea
            value={fiche.antecedentsChirurgicaux}
            onChange={(v) => u("antecedentsChirurgicaux", v)}
            placeholder="Chirurgies, hospitalisations antérieures..."
            rows={2}
          />
        </Field>
      </Section>

      {/* 5b — Gynéco (conditionnel femme) */}
      <AnimatePresence>
        {fiche.sexe === "F" && (
          <motion.div
            key="gyneco"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Section id="gyneco" title="5b. Antécédents Gynéco-Obstétricaux" color="pink">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Grossesses (G)">
                  <Input type="number" value={fiche.grossesses} onChange={(v) => u("grossesses", optionalNumber(v))} placeholder="0" />
                </Field>
                <Field label="Parités (P)">
                  <Input type="number" value={fiche.parites} onChange={(v) => u("parites", optionalNumber(v))} placeholder="0" />
                </Field>
                <Field label="DDR (Dernières règles)">
                  <Input type="date" value={fiche.ddr} onChange={(v) => u("ddr", v)} />
                </Field>
                <Field label="Cycles">
                  <Select
                    value={fiche.cyclesReguliers !== undefined ? (fiche.cyclesReguliers ? "oui" : "non") : ""}
                    onChange={(v) => u("cyclesReguliers", v === "oui")}
                    options={[{ value: "oui", label: "Réguliers" }, { value: "non", label: "Irréguliers" }]}
                    placeholder="Cycles menstruels"
                  />
                </Field>
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6 — Allergies & Traitements */}
      <Section id="allergies" title="6. Allergies & Traitements en cours" color="orange">
        <Field label="Allergies connues">
          <CheckGroup
            options={["Pénicilline", "Aspirine", "AINS", "Iode", "Latex", "Aliments", "Autre"]}
            selected={fiche.allergies ?? []}
            onChange={(v) => u("allergies", v)}
            columns={3}
          />
        </Field>
        <Field label="Détail allergie">
          <Input value={fiche.allergieDetail} onChange={(v) => u("allergieDetail", v)} placeholder="Précisez la/les allergie(s)" />
        </Field>
        <Field label="Traitements en cours">
          <Textarea
            value={fiche.traitementsCours}
            onChange={(v) => u("traitementsCours", v)}
            placeholder="Médicaments actuels, posologies..."
            rows={2}
          />
        </Field>
      </Section>

      {/* 7 — Mode de vie */}
      <Section id="lifestyle" title="7. Mode de Vie" color="green">
        <div className="flex gap-6 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={fiche.tabac ?? false} onChange={(e) => u("tabac", e.target.checked)} className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">Tabagisme</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={fiche.alcool ?? false} onChange={(e) => u("alcool", e.target.checked)} className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">Alcool</span>
          </label>
        </div>
        {fiche.tabac && (
          <Field label="Paquets-Année (PA)">
            <Input type="number" value={fiche.tabacPA} onChange={(v) => u("tabacPA", optionalNumber(v))} placeholder="Ex: 20 PA" />
          </Field>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Activité physique">
            <RadioGroup
              value={fiche.activitePhysique}
              onChange={(v) => u("activitePhysique", v)}
              options={[
                { value: "sedentaire", label: "Sédentaire" },
                { value: "faible", label: "Faible (marche)" },
                { value: "moderee", label: "Modérée (3x/sem)" },
                { value: "intense", label: "Intense (sportif)" },
              ]}
              columns={2}
            />
          </Field>
          <Field label="Alimentation">
            <RadioGroup
              value={fiche.alimentation}
              onChange={(v) => u("alimentation", v)}
              options={[
                { value: "equilibree", label: "Équilibrée" },
                { value: "hypercalorique", label: "Hypercalorique" },
                { value: "hypocalorique", label: "Pauvre / insuffisante" },
                { value: "traditionnelle", label: "Traditionnelle" },
              ]}
              columns={2}
            />
          </Field>
        </div>
      </Section>

      {/* 8 — Antécédents familiaux */}
      <Section id="atcd-fam" title="8. Antécédents Familiaux" color="gray">
        <CheckGroup
          options={ANTECEDENTS_FAMILIAUX}
          selected={fiche.antecedentsFamiliaux ?? []}
          onChange={(v) => u("antecedentsFamiliaux", v)}
          columns={3}
        />
      </Section>

      {/* 9 — Constantes vitales */}
      <Section
        id="constantes"
        title="9. Constantes Vitales"
       
        color="blue"
        alert={hasConstantAlert}
        completed={!!(fiche.constantes && Object.values(fiche.constantes).some((v) => v !== undefined))}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Température (°C)">
            <Input
              type="number"
              value={fiche.constantes?.temperature}
              onChange={(v) =>
                updateFiche({ constantes: { ...fiche.constantes, temperature: optionalNumber(v) } })
              }
              placeholder="37.0"
              className={cn((fiche.constantes?.temperature ?? 0) > 38.5 && "border-red-400 bg-red-50")}
            />
          </Field>
          <Field label="TA Systolique (mmHg)">
            <Input
              type="number"
              value={fiche.constantes?.taSystolique}
              onChange={(v) =>
                updateFiche({ constantes: { ...fiche.constantes, taSystolique: optionalNumber(v) } })
              }
              placeholder="120"
              className={cn(
                ((fiche.constantes?.taSystolique ?? 0) > 180 || (fiche.constantes?.taSystolique ?? 999) < 90) &&
                  "border-red-400 bg-red-50"
              )}
            />
          </Field>
          <Field label="TA Diastolique (mmHg)">
            <Input
              type="number"
              value={fiche.constantes?.taDiastolique}
              onChange={(v) =>
                updateFiche({ constantes: { ...fiche.constantes, taDiastolique: optionalNumber(v) } })
              }
              placeholder="80"
            />
          </Field>
          <Field label="FC (bpm)">
            <Input
              type="number"
              value={fiche.constantes?.fc}
              onChange={(v) =>
                updateFiche({ constantes: { ...fiche.constantes, fc: optionalNumber(v) } })
              }
              placeholder="70"
              className={cn(
                ((fiche.constantes?.fc ?? 0) > 120 || (fiche.constantes?.fc ?? 999) < 50) && "border-orange-400 bg-orange-50"
              )}
            />
          </Field>
          <Field label="FR (/min)">
            <Input
              type="number"
              value={fiche.constantes?.fr}
              onChange={(v) =>
                updateFiche({ constantes: { ...fiche.constantes, fr: optionalNumber(v) } })
              }
              placeholder="16"
              className={cn((fiche.constantes?.fr ?? 0) > 25 && "border-red-400 bg-red-50")}
            />
          </Field>
          <Field label="SpO2 (%)">
            <Input
              type="number"
              value={fiche.constantes?.spo2}
              onChange={(v) =>
                updateFiche({ constantes: { ...fiche.constantes, spo2: optionalNumber(v) } })
              }
              placeholder="98"
              className={cn((fiche.constantes?.spo2 ?? 100) < 94 && "border-red-400 bg-red-50")}
            />
          </Field>
          <Field label="Poids (kg)">
            <Input
              type="number"
              value={fiche.constantes?.poids}
              onChange={(v) => updateFiche({ constantes: { ...fiche.constantes, poids: optionalNumber(v) } })}
              placeholder="70"
            />
          </Field>
          <Field label="Taille (cm)">
            <Input
              type="number"
              value={fiche.constantes?.taille}
              onChange={(v) => updateFiche({ constantes: { ...fiche.constantes, taille: optionalNumber(v) } })}
              placeholder="170"
            />
          </Field>
        </div>
      </Section>

      {/* 10 — Examen clinique */}
      <Section
        id="examen"
        title="10. Examen Clinique"
        color="blue"
        completed={!!(fiche.examenClinique && Object.values(fiche.examenClinique).some(v => v?.trim()))}
      >
        <ExamenCliniquePanel
          examenClinique={fiche.examenClinique}
          onChange={(v) => updateFiche({ examenClinique: v })}
        />
      </Section>

      {/* 11 — Notes libres */}
      <Section id="notes" title="11. Notes Libres du Médecin" color="gray">
        <Textarea
          value={fiche.notesLibres}
          onChange={(v) => u("notesLibres", v)}
          placeholder="Notes personnelles, observations complémentaires, éléments importants non couverts..."
          rows={4}
        />
      </Section>
    </div>
  );
}
