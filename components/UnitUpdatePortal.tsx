
import React, { useState, useEffect } from 'react';
import { Unit, BlockContent, Subject } from '../types';
import { SUBJECTS } from '../data';

interface UnitUpdatePortalProps {
  currentUnit: Unit | null; // Puede ser null si es una unidad nueva
  availableSubjects: Subject[];
  onUpdate: (newUnit: Unit) => void;
  onCancel: () => void;
}

const UnitUpdatePortal: React.FC<UnitUpdatePortalProps> = ({ currentUnit, availableSubjects, onUpdate, onCancel }) => {
  // Estados para los campos de la tabla 'units'
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(currentUnit?.subject_id || String(availableSubjects[0]?.id || ''));
  const [unitNumber, setUnitNumber] = useState<number>(currentUnit?.number || 1);
  const [unitTitle, setUnitTitle] = useState<string>(currentUnit?.title || '');
  
  // El JSON solo contendrá la parte "pedagógica" (description, blocks, metadata)
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
          description: "Descripción de la nueva unidad...",
          pdfBaseUrl: "#",
          pdfPrintUrl: "#",
          metadata: { version: "1.0.0", updated_at: new Date().toISOString() },
          blocks: []
        }, null, 2)
  );

  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    idsInmutables: false,
    noBorrarBloques: false,
    metadataActualizada: false,
  });

  const handleValidateAndApply = () => {
    try {
      const pedagogicalContent = JSON.parse(jsonText);
      
      if (!unitTitle) throw new Error("La unidad debe tener un título.");
      if (!pedagogicalContent.blocks || !Array.isArray(pedagogicalContent.blocks)) {
        throw new Error("La estructura de bloques en el JSON no es válida.");
      }

      // Reconstruimos el objeto Unit completo para la UI y la DB
      const finalUnit: Unit = {
        id: `${selectedSubjectId}_u${unitNumber}`, // ID compuesto para la PK
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

  const isReady = checklist.idsInmutables && checklist.noBorrarBloques && checklist.metadataActualizada;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh]">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentUnit ? `Editando Unidad ${currentUnit.number}` : 'Cargar Nueva Unidad'}
            </h2>
            <p className="text-sm text-slate-500">Definí la asignatura y el contenido pedagógico.</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 flex flex-col p-6 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Asignatura</label>
                <select 
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Número de Unidad</label>
                <input 
                  type="number"
                  min="1"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Título de la Unidad</label>
                <input 
                  type="text"
                  placeholder="Ej: Sistemas Económicos"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Contenido Pedagógico (JSON)</h3>
              <textarea 
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setError(null);
                }}
                className="flex-1 w-full bg-slate-900 text-emerald-400 border border-slate-800 rounded-2xl p-6 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none shadow-inner"
                spellCheck={false}
              ></textarea>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
          </div>

          <div className="w-full md:w-80 p-6 space-y-6 flex-shrink-0 bg-slate-50/50 overflow-y-auto">
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Validación de Docente</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white transition-colors">
                  <input 
                    type="checkbox" 
                    checked={checklist.idsInmutables}
                    onChange={(e) => setChecklist({...checklist, idsInmutables: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs text-slate-600 leading-tight group-hover:text-slate-900">Confirmé la asignatura y el número de unidad correctos.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white transition-colors">
                  <input 
                    type="checkbox" 
                    checked={checklist.noBorrarBloques}
                    onChange={(e) => setChecklist({...checklist, noBorrarBloques: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs text-slate-600 leading-tight group-hover:text-slate-900">Verifiqué que los IDs de bloques en el JSON sean coherentes.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white transition-colors">
                  <input 
                    type="checkbox" 
                    checked={checklist.metadataActualizada}
                    onChange={(e) => setChecklist({...checklist, metadataActualizada: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs text-slate-600 leading-tight group-hover:text-slate-900">Actualicé la versión en el metadata del JSON.</span>
                </label>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-200 space-y-3">
              <button 
                onClick={handleValidateAndApply}
                disabled={!isReady}
                className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isReady ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {currentUnit ? 'Actualizar Unidad' : 'Publicar Nueva Unidad'}
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitUpdatePortal;
