
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
      if (!unitTitle) throw new Error("Título obligatorio.");
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
      setError(e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#161618] w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-800">
        <header className="p-8 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Editor de Estructura</h2>
            <p className="text-xs text-slate-600 mt-1 serif italic">Inyectá el contenido pedagógico literal sin procesar.</p>
          </div>
          <button onClick={onCancel} className="text-slate-600 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 p-8 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Asignatura</label>
                <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 focus:ring-1 focus:ring-slate-700 outline-none">
                  {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">N° Unidad</label>
                <input type="number" min="1" value={unitNumber} onChange={(e) => setUnitNumber(parseInt(e.target.value))} className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 focus:ring-1 focus:ring-slate-700 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Título</label>
                <input type="text" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 focus:ring-1 focus:ring-slate-700 outline-none" />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[400px]">
               <textarea 
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="flex-1 w-full bg-[#0d0d0f] text-indigo-300 border border-slate-800 rounded-2xl p-8 font-mono text-[11px] leading-relaxed focus:ring-1 focus:ring-indigo-900/50 focus:outline-none resize-none shadow-inner"
                spellCheck={false}
              ></textarea>
            </div>
          </div>

          <div className="w-full lg:w-80 p-8 flex flex-col justify-between bg-[#111113] border-l border-slate-800">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Protocolo de Carga</h3>
              <ul className="space-y-4 text-[10px] text-slate-500 serif leading-relaxed">
                <li>• No modifiques los IDs de bloques existentes para mantener el progreso del alumno.</li>
                <li>• Asegurá que el MIME type del PDF sea accesible.</li>
                <li>• Validá la coma de cierre del JSON.</li>
              </ul>
            </div>
            
            <div className="space-y-4">
               {error && <p className="text-[10px] text-rose-500 font-bold bg-rose-900/20 p-4 rounded-xl border border-rose-900/50">{error}</p>}
               <button onClick={handleValidateAndApply} className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-white transition-all">Publicar Cambios</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitUpdatePortal;
