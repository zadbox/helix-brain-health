"use client";

import { useConsultationStore } from "@/store/consultation";
import { ChatMessage, FichePatient } from "@/types";
import { generateId, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Send, ChevronDown, ChevronUp, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

// ─── Speech Recognition Hook ──────────────────────────────────────────────────

function useSpeechRecognition(onUpdate: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");
  const sessionFinalRef = useRef("");
  // Stable ref for the callback — avoids recreating recognition on each render
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      let newFinal = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) newFinal += t + " ";
        else interim += t;
      }
      if (newFinal) sessionFinalRef.current += newFinal;
      const full = (baseTextRef.current + sessionFinalRef.current + interim).trim();
      onUpdateRef.current(full);
    };

    rec.onend = () => {
      baseTextRef.current = (baseTextRef.current + sessionFinalRef.current).trimStart();
      sessionFinalRef.current = "";
      setListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      // "no-speech" is not a fatal error — just stop gracefully
      if (e.error !== "no-speech") console.warn("Speech error:", e.error);
      setListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, []); // run once — stable forever

  const toggle = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      sessionFinalRef.current = "";
      try {
        rec.start();
        setListening(true);
      } catch {
        // Already started — abort and restart
        rec.abort();
        setTimeout(() => { rec.start(); setListening(true); }, 200);
      }
    }
  }, [listening]);

  const resetBase = useCallback(() => {
    baseTextRef.current = "";
    sessionFinalRef.current = "";
  }, []);

  return { listening, supported, toggle, resetBase };
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-700 shrink-0">
        <Image src="/icone-b.png" alt="Agent" width={28} height={28} className="object-cover w-full h-full" />
      </div>
      <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"
            style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Alerts Zone ──────────────────────────────────────────────────────────────

function AlertesZone() {
  const { agent } = useConsultationStore();

  if (!agent.alertes.length) return null;

  return (
    <div className="px-4 pt-3 space-y-2">
      {agent.alertes.map((alerte) => (
        <motion.div
          key={alerte.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "rounded-lg px-3 py-2 flex items-start gap-2 text-xs",
            alerte.niveau === "urgent"
              ? "bg-red-900/40 border border-red-500/50 text-red-200"
              : "bg-orange-900/30 border border-orange-500/40 text-orange-200"
          )}
        >
          <span className={cn("shrink-0 text-xs font-bold mt-0.5", alerte.niveau === "urgent" ? "text-red-400" : "text-orange-400")}>
            {alerte.niveau === "urgent" ? "⚠" : "!"}
          </span>
          <div>
            <div className="font-semibold">{alerte.message}</div>
            {alerte.action && <div className="text-slate-400 mt-0.5">{alerte.action}</div>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Hypotheses Panel ─────────────────────────────────────────────────────────

function HypothesesPanel() {
  const { agent } = useConsultationStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const probColors = {
    haute: "bg-red-500",
    moyenne: "bg-orange-500",
    faible: "bg-yellow-500",
  };

  const probLabels = { haute: "Haute", moyenne: "Moyenne", faible: "Faible" };

  if (!agent.hypotheses.length) {
    return (
      <div className="px-4 py-3">
        <div className="text-xs text-slate-500 italic">
          Renseignez le motif et les symptômes pour obtenir des hypothèses diagnostiques...
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-2">
      {agent.hypotheses.slice(0, 5).map((h) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-700/50 rounded-xl border border-slate-600/50 overflow-hidden"
        >
          <button
            className="w-full flex items-center justify-between px-3 py-2.5 text-left"
            onClick={() => setExpanded(expanded === h.id ? null : h.id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn("w-2 h-2 rounded-full shrink-0", probColors[h.probabilite])} />
              <span className="text-sm font-medium text-white truncate">{h.diagnostic}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {h.codeICD10 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-600 text-slate-300 font-mono">
                  {h.codeICD10}
                </span>
              )}
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full text-white font-semibold",
                  probColors[h.probabilite]
                )}
              >
                {probLabels[h.probabilite]}
              </span>
              {expanded === h.id ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
            </div>
          </button>

          <AnimatePresence>
            {expanded === h.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-2">
                  {h.arguments?.length ? (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Arguments :</div>
                      <ul className="space-y-0.5">
                        {h.arguments.map((arg, i) => (
                          <li key={i} className="text-xs text-slate-300 flex gap-1">
                            <span className="text-green-400">✓</span> {arg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {h.ddx?.length ? (
                    <div>
                      <div className="text-xs text-slate-400 mb-1">DD à éliminer :</div>
                      <div className="flex flex-wrap gap-1">
                        {h.ddx.map((d, i) => (
                          <span key={i} className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Suggestions Panel ────────────────────────────────────────────────────────

function SuggestionsPanel() {
  const { agent, markSuggestionDone } = useConsultationStore();

  if (!agent.suggestions.length) return null;

  const typeLabel = { question: "Q", examen: "Ex", action: "!" };
  const typeColor = { question: "text-blue-400", examen: "text-purple-400", action: "text-yellow-400" };

  return (
    <div className="px-4 space-y-1.5">
      {agent.suggestions.filter((s) => !s.done).slice(0, 5).map((s) => {
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 bg-slate-700/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-700/60 transition-colors"
            onClick={() => markSuggestionDone(s.id)}
          >
            <span className={cn("shrink-0 text-xs font-bold mt-0.5 w-4 text-center", typeColor[s.type])}>{typeLabel[s.type]}</span>
            <span className="text-xs text-slate-300">{s.texte}</span>
            <CheckCheck size={12} className="text-slate-600 shrink-0 ml-auto mt-0.5" />
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── References Panel ─────────────────────────────────────────────────────────

function ReferencesPanel() {
  const { agent } = useConsultationStore();
  const [open, setOpen] = useState(false);

  if (!agent.references?.length) return null;

  return (
    <div className="px-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-blue-900/20 border border-blue-500/20 rounded-xl px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-400">PubMed</span>
          <span className="text-sm font-medium text-blue-300">Références scientifiques</span>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">{agent.references.length}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-800/60 rounded-b-xl border border-t-0 border-blue-500/20 px-3 py-3 space-y-3">
              {agent.references.map((ref, i) => (
                <div key={ref.pmid || i} className="border-l-2 border-blue-500/40 pl-3">
                  <div className="text-xs font-medium text-slate-200 leading-snug">{ref.titre}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{ref.auteurs}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {ref.journal && (
                      <span className="text-xs text-slate-500 italic">{ref.journal}{ref.annee ? `, ${ref.annee}` : ""}</span>
                    )}
                    {ref.pmid && (
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
                      >
                        PMID:{ref.pmid}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ordonnance Panel ─────────────────────────────────────────────────────────

function OrdonnancePanel() {
  const { agent } = useConsultationStore();
  const [open, setOpen] = useState(false);

  if (!agent.ordonnanceSuggree) return null;

  return (
    <div className="px-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-green-900/30 border border-green-600/30 rounded-xl px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-green-400">Rx</span>
          <span className="text-sm font-medium text-green-300">Ordonnance suggérée</span>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-800 rounded-b-xl border border-t-0 border-green-600/20 px-4 py-3">
              <pre className="text-xs text-green-200 whitespace-pre-wrap font-mono leading-relaxed">
                {agent.ordonnanceSuggree}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chat Interface ───────────────────────────────────────────────────────────

const QUICK_CHIPS = [
  { label: "Résumer", prompt: "Fais un résumé de la consultation en cours" },
  { label: "Ordonnance", prompt: "Propose une ordonnance adaptée au diagnostic le plus probable" },
  { label: "Compte rendu", prompt: "Génère le compte rendu complet de consultation" },
  { label: "Urgence ?", prompt: "Y a-t-il des signes de gravité ou d'urgence dans ce tableau clinique ?" },
];

interface ChatInterfaceProps {
  onReportRequest: () => void;
}

export function AgentPanel({ onReportRequest }: ChatInterfaceProps) {
  const { fiche, agent, addMessage, setIsTyping, setHypotheses, setSuggestions, setReferences, updateFiche, setOrdonnanceSuggree } =
    useConsultationStore();
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSpeechUpdate = useCallback((text: string) => {
    setInput(text);
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
    }
  }, []);
  const { listening, supported: speechSupported, toggle: toggleMic, resetBase } = useSpeechRecognition(handleSpeechUpdate);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.messages, agent.isTyping]);

  // Auto-analyze fiche on changes (debounced)
  const analyzeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyzeFiche = useCallback(async (currentFiche: FichePatient) => {
    if (!currentFiche.motifPrincipal) return;
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fiche: currentFiche }),
      });
      const data = await res.json();
      if (data.hypotheses) setHypotheses(data.hypotheses);
      if (data.suggestions) setSuggestions(data.suggestions);
      if (data.references) setReferences(data.references);
    } catch (_) {}
  }, [setHypotheses, setSuggestions, setReferences]);

  useEffect(() => {
    if (analyzeRef.current) clearTimeout(analyzeRef.current);
    analyzeRef.current = setTimeout(() => analyzeFiche(fiche), 1500);
    return () => { if (analyzeRef.current) clearTimeout(analyzeRef.current); };
  }, [fiche, analyzeFiche]);

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || isLoading) return;
    setInput("");
    resetBase();
    if (inputRef.current) inputRef.current.style.height = "auto";

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "medecin",
      content: messageText,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setIsTyping(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          fiche,
          history: agent.messages.slice(-10),
        }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: generateId(),
        role: "agent",
        content: data.reponse || "Je n'ai pas pu générer une réponse.",
        timestamp: new Date(),
        ficheUpdate: data.ficheUpdate,
      };
      addMessage(agentMsg);

      // Apply fiche updates from agent — expand dot-notation keys if any
      if (data.ficheUpdate && Object.keys(data.ficheUpdate).length > 0) {
        const expanded: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(data.ficheUpdate)) {
          if (key.includes(".")) {
            const [parent, child] = key.split(".");
            expanded[parent] = { ...(expanded[parent] as object || {}), [child]: val };
          } else {
            expanded[key] = val;
          }
        }
        updateFiche(expanded as Partial<import("@/types").FichePatient>);
      }

      // If ordonnance
      if (data.type === "ordonnance" && data.reponse) {
        setOrdonnanceSuggree(data.reponse);
      }

      // If compte rendu requested
      if (messageText.toLowerCase().includes("compte rendu")) {
        onReportRequest();
      }
    } catch (_) {
      addMessage({
        id: generateId(),
        role: "agent",
        content: "Erreur de connexion. Vérifiez votre clé API Anthropic.",
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  }, [input, isLoading, fiche, agent.messages, addMessage, setIsTyping, updateFiche, setOrdonnanceSuggree, onReportRequest]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden">

      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-700">
              <Image src="/icone-b.png" alt="Brain Health Agent" width={36} height={36} className="object-cover w-full h-full" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">HELIX</div>
            <div className="text-xs text-green-400">Agent Actif — Brain Health</div>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          {agent.isAnalyzing ? (
            <span className="text-blue-400 animate-pulse">Analyse en cours...</span>
          ) : (
            `${agent.hypotheses.length} hypothèse${agent.hypotheses.length !== 1 ? "s" : ""}`
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* Alertes */}
        <AlertesZone />

        {/* Hypotheses */}
        {(agent.hypotheses.length > 0 || !agent.isTyping) && (
          <div className="mt-3">
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hypothèses Diagnostiques</span>
            </div>
            <HypothesesPanel />
          </div>
        )}

        {/* Suggestions */}
        {agent.suggestions.filter((s) => !s.done).length > 0 && (
          <div className="mt-4">
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggestions</span>
            </div>
            <SuggestionsPanel />
          </div>
        )}

        {/* Références PubMed */}
        {agent.references?.length > 0 && (
          <div className="mt-4">
            <ReferencesPanel />
          </div>
        )}

        {/* Ordonnance */}
        {agent.ordonnanceSuggree && (
          <div className="mt-4">
            <OrdonnancePanel />
          </div>
        )}

        {/* Chat Messages */}
        {agent.messages.length > 0 && (
          <div className="mt-4 px-4 space-y-3 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-xs text-slate-500">Conversation</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            {agent.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex items-end gap-2", msg.role === "medecin" ? "flex-row-reverse" : "flex-row")}
              >
                {msg.role === "agent" && (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-700 shrink-0">
                    <Image src="/icone-b.png" alt="Agent" width={28} height={28} className="object-cover w-full h-full" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === "medecin"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-700 text-slate-100 rounded-bl-sm"
                  )}
                >
                  <p className="leading-relaxed whitespace-pre-wrap text-xs">{msg.content}</p>
                  {msg.ficheUpdate && Object.keys(msg.ficheUpdate).length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-green-400">
                      <CheckCheck size={11} />
                      <span>Fiche mise à jour</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "text-xs mt-1",
                      msg.role === "medecin" ? "text-blue-200 text-right" : "text-slate-500"
                    )}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {agent.isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Welcome image — shown when no messages */}
        {agent.messages.length === 0 && !agent.isTyping && (
          <div className="px-4 mt-4">
            <div className="rounded-xl overflow-hidden border border-slate-700/50">
              <Image
                src="/brain-cover.png"
                alt="Brain Health"
                width={600}
                height={200}
                className="w-full object-cover max-h-36"
              />
            </div>
          </div>
        )}

        {/* Show typing if no messages yet */}
        {agent.messages.length === 0 && agent.isTyping && (
          <div className="px-4 mt-4">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Quick chips */}
      <div className="px-4 py-2 border-t border-slate-700 flex gap-1.5 overflow-x-auto flex-shrink-0">
        {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => sendMessage(chip.prompt)}
              disabled={isLoading}
              className="px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
      </div>

      {/* Chat Input */}
      <div className="px-4 py-3 border-t border-slate-700 flex-shrink-0">
        {/* Recording indicator */}
        {listening && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400">Écoute en cours... parlez maintenant</span>
          </div>
        )}
        <div className={cn(
          "flex gap-2 items-center bg-slate-800 rounded-xl border px-3 py-2 transition-colors",
          listening ? "border-red-500/60" : "border-slate-600"
        )}>
          {/* Mic button */}
          {speechSupported && (
            <button
              onClick={toggleMic}
              disabled={isLoading}
              title={listening ? "Arrêter l'écoute" : "Dicter par microphone"}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0",
                listening
                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
              )}
            >
              {listening ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
              )}
            </button>
          )}
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={listening ? "Parlez..." : "Posez une question ou dictez une info patient..."}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none resize-none overflow-y-auto leading-relaxed py-0.5"
            style={{ maxHeight: "140px" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0",
              input.trim() && !isLoading
                ? "bg-blue-500 hover:bg-blue-400 text-white"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            )}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
