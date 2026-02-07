import React from "react";
import { Unit, ProgressRecord } from "../types";
import BlockCard from "../components/BlockCard";
import ProgressBar from "../components/ProgressBar";

interface UnitPageProps {
  unit: Unit;
  progress: ProgressRecord[];
  onUpdateProgress: (blockId: string) => void;
  onBack: () => void;
}

const UnitPage: React.FC<UnitPageProps> = ({ unit, progress, onUpdateProgress, onBack }) => {
  const visitedSet = new Set(
  progress
    .filter((p) => p.visited)
    .map((p) => String(p.block_id))
);


  // ✅ Blindaje + orden por "order"
  const safeBlocks = Array.isArray((unit as any).blocks) ? (unit as any).blocks : [];
  const sortedBlocks = [...safeBlocks].sort((a: any, b: any) => (a?.order ?? 999) - (b?.order ?? 999));

  const totalBlocks = sortedBlocks.length || 1;
const visitedCount = visitedSet.size;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // ✅ PDF download (usa pdfBaseUrl / pdfPrintUrl si existen)
  const handleDownloadPdf = () => {
    const url = (unit as any)?.pdfBaseUrl || (unit as any)?.pdfPrintUrl;
    if (!url || url === "#") {
      alert("Todavía no hay un PDF configurado para esta unidad.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="pb-32">
      {/* ✅ Topbar integrada al modo oscuro (sin gris) */}
      <div className="fixed top-16 left-0 right-0 z-40 no-print bg-slate-950/55 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 truncate">
                Unidad {unit.number} / {unit.title}
              </span>
            </div>

            {/* ✅ Barra finita con glow (azul → verde al completar) */}
            <div className="relative h-[3px] w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={[
                  "h-full rounded-full transition-all duration-700",
                  visitedCount >= totalBlocks
                    ? "bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.9)]"
                    : "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.7)]",
                ].join(" ")}
                style={{ width: `${(visitedCount / totalBlocks) * 100}%` }}
              />
              <div
                className={[
                  "absolute inset-0 blur-md opacity-50 transition-all duration-700",
                  visitedCount >= totalBlocks ? "bg-emerald-400" : "bg-blue-400",
                ].join(" ")}
                style={{ width: `${(visitedCount / totalBlocks) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white/70 whitespace-nowrap hidden sm:block">
              Recorrido: {visitedCount} de {totalBlocks}
            </span>

            <div className="flex gap-1">
              <button
                onClick={handleDownloadPdf}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Descargar PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>

              <button
                onClick={() => window.print()}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Imprimir"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 space-y-8">
        <header className="space-y-4 py-8 border-b border-white/5">
          <button
            onClick={onBack}
            className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-2 transition-colors no-print"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la Materia
          </button>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              {/* ✅ Título visible + glow azul sutil */}
              <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_22px_rgba(59,130,246,0.55)] leading-tight">
                Unidad {unit.number}: {unit.title}
              </h1>
            </div>

            {unit.metadata && (
              <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/55">
                Actualizada el {formatDate(unit.metadata.updated_at)} <span className="text-white/25 mx-1">/</span> v
                {unit.metadata.version}
              </div>
            )}

            <p className="text-lg text-white/70 serif italic mt-4 leading-relaxed">{unit.description}</p>

            {/* ✅ Tip box (se ve mejor en oscuro) */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100/10 text-amber-200 rounded-full border border-amber-200/15 text-xs font-medium no-print">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Podés avanzar, volver y continuar cuando quieras. No hace falta hacerlo todo de una.
            </div>

            {/* ✅ Barra grande pro debajo del título (la que ya hiciste) */}
            <ProgressBar visitedCount={visitedCount} totalBlocks={totalBlocks} />
          </div>
        </header>

        <section className="max-w-3xl mx-auto">
  {sortedBlocks.map((block: any, index: number) => {
    const blockId = String(block?.id ?? "");

    return (
      <BlockCard
        key={blockId || index}
        index={index}
        block={block}
        isVisited={blockId ? visitedSet.has(blockId) : false}
        onToggleVisit={() => {
          console.log("[UnitPage] click toggle ->", { blockId, had: visitedSet.has(blockId) });
          if (!blockId) {
            alert("Este bloque no tiene id. No se puede marcar como realizado.");
            return;
          }
          onUpdateProgress(blockId);
        }}
      />
    );
  })}
</section>


        <section className="max-w-3xl mx-auto pt-12 text-center border-t border-white/5 no-print">
          <div
            className="inline-flex items-center gap-3 text-white/50 group cursor-pointer hover:text-white transition-colors"
            onClick={onBack}
          >
            <span className="h-px w-8 bg-white/15 group-hover:bg-white/70 transition-all" />
            <span className="text-sm font-medium uppercase tracking-widest">Fin del recorrido de la unidad</span>
            <span className="h-px w-8 bg-white/15 group-hover:bg-white/70 transition-all" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default UnitPage;
