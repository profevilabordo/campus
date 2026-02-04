
import React, { useState } from 'react';
import { Unit, BlockContent } from '../types';

interface UnitUpdatePortalProps {
  currentUnit: Unit;
  onUpdate: (newUnit: Unit) => void;
  onCancel: () => void;
}

const UnitUpdatePortal: React.FC<UnitUpdatePortalProps> = ({ currentUnit, onUpdate, onCancel }) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(currentUnit, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    idsInmutables: false,
    noBorrarBloques: false,
    metadataActualizada: false,
  });

  const handleValidateAndApply = () => {
    try {
      const parsed: Unit = JSON.parse(jsonText);
      
      // Basic validation
      if (parsed.id !== currentUnit.id) throw new Error("El unit_id debe ser inmutable.");
      if (!parsed.blocks || !Array.isArray(parsed.blocks)) throw new Error("La estructura de bloques no es válida.");
      
      // Check for missing block IDs that might exist in progress (simulated check)
      const currentIds = currentUnit.blocks.map(b => b.id);
      const newIds = parsed.blocks.map(b => b.id);
      const deletedIds = currentIds.filter(id => !newIds.includes(id));
      
      if (deletedIds.length > 0) {
        if (!window.confirm(`Advertencia: Se detectó que faltan ${deletedIds.length} bloques antiguos. Borrar bloques puede causar pérdida de progreso en los alumnos. ¿Deseas continuar?`)) {
          return;
        }
      }

      // Check if version was bumped
      if (parsed.metadata?.version === currentUnit.metadata?.version) {
        if (!window.confirm("La versión del JSON es igual a la actual. ¿Estás seguro de que quieres sobreescribir sin cambiar la versión?")) {
          return;
        }
      }

      onUpdate(parsed);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const isReady = checklist.idsInmutables && checklist.noBorrarBloques && checklist.metadataActualizada;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Actualizar Unidad {currentUnit.number}</h2>
            <p className="text-sm text-slate-500">Reemplazar contenido mediante archivo JSON</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 flex flex-col p-6 border-b md:border-b-0 md:border-r border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Contenido JSON</h3>
            <textarea 
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError(null);
              }}
              className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none"
              spellCheck={false}
            ></textarea>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg">
                Error de validación: {error}
              </div>
            )}
          </div>

          <div className="w-full md:w-80 p-6 space-y-6 flex-shrink-0 bg-slate-50/50 overflow-y-auto">
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Checklist de Seguridad</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={checklist.idsInmutables}
                    onChange={(e) => setChecklist({...checklist, idsInmutables: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-600 leading-tight group-hover:text-slate-900">Confirmé que los IDs de los bloques existentes no cambiaron.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={checklist.noBorrarBloques}
                    onChange={(e) => setChecklist({...checklist, noBorrarBloques: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-600 leading-tight group-hover:text-slate-900">No borré bloques que los alumnos ya pudieron haber trabajado.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={checklist.metadataActualizada}
                    onChange={(e) => setChecklist({...checklist, metadataActualizada: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-sm text-slate-600 leading-tight group-hover:text-slate-900">Actualicé la versión y la nota de cambios en el metadata.</span>
                </label>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-200 space-y-3">
              <button 
                onClick={handleValidateAndApply}
                disabled={!isReady}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${isReady ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Aplicar Nueva Versión
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Descartar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitUpdatePortal;
