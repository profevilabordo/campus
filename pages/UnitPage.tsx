
import React from 'react';
import { Unit, ProgressRecord } from '../types';
import BlockCard from '../components/BlockCard';

interface UnitPageProps {
  unit: Unit;
  progress: ProgressRecord[];
  onUpdateProgress: (blockId: string) => void;
  onBack: () => void;
}

const UnitPage: React.FC<UnitPageProps> = ({ unit, progress, onUpdateProgress, onBack }) => {
  const visitedIds = progress.filter(p => p.visited).map(p => p.block_id);
  const totalBlocks = unit.blocks.length;
  const visitedCount = visitedIds.length;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="pb-32">
      <div className="fixed top-16 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">Economía / Unidad {unit.number}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-slate-900 h-full transition-all duration-500" 
                style={{ width: `${(visitedCount / totalBlocks) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap hidden sm:block">
              Recorrido: {visitedCount} de {totalBlocks}
            </span>
            <div className="flex gap-1">
              <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" title="Descargar PDF">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
              <button onClick={() => window.print()} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors" title="Imprimir">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 space-y-8">
        <header className="space-y-4 py-8 border-b border-slate-100">
          <button onClick={onBack} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-colors no-print">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Volver a la Materia
          </button>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">Unidad {unit.number}: {unit.title}</h1>
            </div>
            {unit.metadata && (
              <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Actualizada el {formatDate(unit.metadata.updated_at)} <span className="text-slate-300 mx-1">/</span> v{unit.metadata.version}
              </div>
            )}
            <p className="text-lg text-slate-500 serif italic mt-4 leading-relaxed">
              {unit.description}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-full border border-amber-100 text-xs font-medium no-print">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Podés avanzar, volver y continuar cuando quieras. No hace falta hacerlo todo de una.
            </div>
          </div>
        </header>

        <section className="max-w-3xl mx-auto">
          {unit.blocks.map((block, index) => (
            <BlockCard 
              key={block.id}
              index={index}
              block={block}
              isVisited={visitedIds.includes(block.id)}
              onToggleVisit={() => onUpdateProgress(block.id)}
            />
          ))}
        </section>

        <section className="max-w-3xl mx-auto pt-12 text-center border-t border-slate-100 no-print">
          <div className="inline-flex items-center gap-3 text-slate-400 group cursor-pointer hover:text-slate-800 transition-colors" onClick={onBack}>
             <span className="h-px w-8 bg-slate-200 group-hover:bg-slate-800 transition-all"></span>
             <span className="text-sm font-medium uppercase tracking-widest">Fin del recorrido de la unidad</span>
             <span className="h-px w-8 bg-slate-200 group-hover:bg-slate-800 transition-all"></span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UnitPage;
