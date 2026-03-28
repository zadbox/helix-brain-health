"use client";

import { useState } from "react";
import Image from "next/image";
import { ProgressBar } from "@/components/consultation/ProgressBar";
import { FichePatientForm } from "@/components/consultation/FichePatient";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { ReportModal } from "@/components/consultation/ReportModal";
import { useConsultationStore } from "@/store/consultation";
import { RotateCcw } from "lucide-react";

export default function ConsultationPage() {
  const [reportOpen, setReportOpen] = useState(false);
  const { resetFiche } = useConsultationStore();

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* Top Bar — Branding + Reset */}
      <div className="bg-slate-900 text-white px-4 py-1 flex items-center justify-between flex-shrink-0 no-print">
        <div className="flex items-center gap-3">
          <Image
            src="/BGEN-BLUE.jpeg"
            alt="Brain Health"
            width={36}
            height={36}
            className="rounded-md object-contain"
          />
          <span className="font-bold text-sm tracking-tight">BRAIN HEALTH</span>
          <span className="text-slate-500 text-xs">|</span>
          <span className="text-slate-400 text-xs">Health Enhanced Language Intelligence</span>
          <span className="text-blue-400 text-xs font-semibold tracking-widest">HELIX</span>
        </div>
        <button
          onClick={resetFiche}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw size={12} />
          Nouvelle consultation
        </button>
      </div>

      {/* Progress Bar */}
      <div className="no-print">
        <ProgressBar onFinish={() => setReportOpen(true)} />
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden no-print">

        {/* Left Pane — Fiche Patient */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 overflow-hidden">
          <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Fiche Patient</span>
            <span className="text-xs text-gray-400">Sections interactives</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-light">
            <FichePatientForm />
          </div>
        </div>

        {/* Right Pane — Agent IA */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <AgentPanel onReportRequest={() => setReportOpen(true)} />
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
