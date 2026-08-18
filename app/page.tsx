"use client";

import { useState } from "react";
import Image from "next/image";
import { ProgressBar } from "@/components/consultation/ProgressBar";
import { FichePatientForm } from "@/components/consultation/FichePatient";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { ReportModal } from "@/components/consultation/ReportModal";
import { useConsultationStore } from "@/store/consultation";
import { cn } from "@/lib/utils";
import { Bot, ClipboardList, RotateCcw } from "lucide-react";

type MobileTab = "fiche" | "agent";

export default function ConsultationPage() {
  const [reportOpen, setReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>("fiche");
  const { resetFiche, agent } = useConsultationStore();

  const startNewConsultation = () => {
    resetFiche();
    setActiveTab("fiche");
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50">

      {/* Top Bar — Branding + Reset */}
      <div className="no-print flex flex-shrink-0 items-center justify-between bg-slate-900 px-3 py-1.5 text-white sm:px-4 sm:py-1">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/BGEN-BLUE.jpeg"
            alt="Brain Health"
            width={36}
            height={36}
            className="h-9 w-9 rounded-md object-contain"
          />
          <span className="truncate text-sm font-bold tracking-tight">BRAIN HEALTH</span>
          <span className="hidden text-xs text-slate-500 sm:inline">|</span>
          <span className="hidden text-xs text-slate-400 lg:inline">Health Enhanced Language Intelligence</span>
          <span className="text-blue-400 text-xs font-semibold tracking-widest">HELIX</span>
        </div>
        <button
          type="button"
          onClick={startNewConsultation}
          aria-label="Démarrer une nouvelle consultation"
          className="ml-3 flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:min-h-0 sm:px-0"
        >
          <RotateCcw size={12} />
          <span className="hidden sm:inline">Nouvelle consultation</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="no-print">
        <ProgressBar onFinish={() => setReportOpen(true)} />
      </div>

      <nav className="no-print grid h-12 flex-shrink-0 grid-cols-2 border-b border-slate-200 bg-white p-1 md:hidden" aria-label="Vue de consultation">
        <button
          type="button"
          onClick={() => setActiveTab("fiche")}
          aria-pressed={activeTab === "fiche"}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
            activeTab === "fiche" ? "bg-cyan-50 text-cyan-800" : "text-slate-500"
          )}
        >
          <ClipboardList size={16} />
          Fiche patient
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("agent")}
          aria-pressed={activeTab === "agent"}
          className={cn(
            "relative flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
            activeTab === "agent" ? "bg-slate-900 text-white" : "text-slate-500"
          )}
        >
          <Bot size={16} />
          Agent HELIX
          {agent.hypotheses.length > 0 && activeTab !== "agent" && (
            <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-cyan-500" aria-label="Nouvelles hypothèses" />
          )}
        </button>
      </nav>

      {/* Main Split Layout */}
      <div className="no-print flex min-h-0 flex-1 overflow-hidden">

        {/* Left Pane — Fiche Patient */}
        <div className={cn(
          "min-w-0 flex-1 flex-col overflow-hidden border-r border-gray-200 md:flex md:w-1/2 md:flex-none",
          activeTab === "fiche" ? "flex" : "hidden"
        )}>
          <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Fiche Patient</span>
            <span className="text-xs text-gray-400">Sections interactives</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-light">
            <FichePatientForm />
          </div>
        </div>

        {/* Right Pane — Agent IA */}
        <div className={cn(
          "min-w-0 flex-1 flex-col overflow-hidden md:flex md:w-1/2 md:flex-none",
          activeTab === "agent" ? "flex" : "hidden"
        )}>
          <AgentPanel onReportRequest={() => setReportOpen(true)} />
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
