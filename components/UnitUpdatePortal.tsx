
import React, { useState } from 'react';
import { Unit, Subject } from '../types';

interface UnitUpdatePortalProps {
  currentUnit: Unit | null;
  availableSubjects: Subject[];
  onUpdate: (newUnit: Unit) => void;
  onCancel: () => void;
}

const UnitUpdatePortal: React.FC<UnitUpdatePortalProps> = ({ currentUnit, availableSubjects, onUpdate, onCancel }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(currentUnit?.subject_id || String(availableSubjects[0]?.id || ''));
  const [unitNumber, setUnitNumber] = useState<number>(currentUnit?.number || 1);
  const [unitTitle, setUnitTitle] = useState<string>(currentUnit?.title || '');
  
  const [jsonText, setJsonText] = useState(
    currentUnit 
      ? JSON.stringify({ 
          description: currentUnit.description, 
          blocks: currentUnit.blocks, 
          metadata: currentUnit.metadata,
          pdfBaseUrl: currentUnit.pdfBaseUrl,
          pdfPrintUrl: currentUnit.pdfPrintUrl
        }, null, 2)
      : JSON.stringify({
          description: "Descripción de la unidad...",
          pdfBaseUrl: "#",
          pdfPrintUrl: "#",
          metadata: { version: "1.0.0", updated_at: new Date().toISOString() },
          blocks: []
        }, null, 2)
  );

  const [error, setError] = useState<string | null>(null);

  const handleValidateAndApply = () => {
    try {
      const pedagogicalContent = JSON.parse(jsonText);
      if (!unitTitle) throw new Error("Título de unidad obligatorio.");
      const finalUnit: Unit = {
        id: `${selectedSubjectId}_u${unitNumber}`,
        subject_id: selectedSubjectId,
        number: unitNumber,
        title: unitTitle,
        description: pedagogicalContent.description,
        blocks: pedagogicalContent.blocks,
        metadata: pedagogicalContent.metadata,
        pdfBaseUrl: pedagogicalContent.pdfBaseUrl,
        pdfPrintUrl: pedagogicalContent.pdfPrintUrl
      };
      onUpdate(finalUnit);
    } catch (e: any) {
      setError("Error en JSON: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
      <div className="bg-[#1e293b] w-full max-w-7xl rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col max-h-[92vh] border border-slate-700 overflow-hidden">
        <header className="p-10 border-b border-slate-700 flex items-center justify-between flex-shrink-0 bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Configurador de Cuaderno</h2>
            <p className="text-xs text-sky-400 mt-2 font-bold uppercase tracking-widest">Modo Edición Literal de Contenidos</p>
          </div>
          <button onClick={onCancel} className="bg-slate-800 text-slate-400 hover:text-white p-3 rounded-full transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 p-10 space-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Materia Destino</label>
                <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:border-sky-500 outline-none transition-all shadow-inner">
                  {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Número de Unidad</label>
                <input type="number" min="1" value={unitNumber} onChange={(e) => setUnitNumber(parseInt(e.target.value))} className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:border-sky-500 outline-none transition-all shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título Público</label>
                <input type="text" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} placeholder="Ej: Introducción a la Macroeconomía" className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:border-sky-500 outline-none transition-all shadow-inner" />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[500px]">
               <textarea 
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="flex-1 w-full bg-[#0c1220] text-sky-300 border-2 border-slate-800 rounded-[2rem] p-10 font-mono text-xs leading-relaxed focus:border-sky-900/50 focus:outline-none resize-none shadow-2xl"
                spellCheck={false}
              ></textarea>
            </div>
          </div>

          <div className="w-full lg:w-96 p-10 flex flex-col justify-between bg-slate-900/30 border-l border-slate-700">
            <div className="space-y-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Guía de Inyección</h3>
              <div className="space-y-6 text-[11px] text-slate-500 serif leading-relaxed bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <p>• Los bloques deben seguir la estructura literal del JSON docente.</p>
                <p>• Verificá que los enlaces a los PDFs sean válidos.</p>
                <p>• Los cambios son inmediatos tras la publicación.</p>
              </div>
            </div>
            
            <div className="space-y-6 pt-10">
               {error && <p className="text-[11px] text-rose-400 font-bold bg-rose-950/40 p-6 rounded-2xl border border-rose-900/50 animate-bounce">{error}</p>}
               <button onClick={handleValidateAndApply} className="w-full py-6 bg-white text-[#0f172a] rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all">Publicar en el Campus</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitUpdatePortal;
