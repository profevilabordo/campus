import React, { useMemo, useState } from 'react';
import { Unit, Subject } from '../types';

interface UnitUpdatePortalProps {
  currentUnit: Unit | null;
  availableSubjects: Subject[];
  onUpdate: (newUnit: Unit) => void;
  onCancel: () => void;
}

const UnitUpdatePortal: React.FC<UnitUpdatePortalProps> = ({
  currentUnit,
  availableSubjects,
  onUpdate,
  onCancel
}) => {
  // ✅ Nunca asumimos que viene array
  const safeSubjects = useMemo(
    () => (Array.isArray(availableSubjects) ? availableSubjects.filter(Boolean) : []),
    [availableSubjects]
  );

  const initialSubjectId =
    String(currentUnit?.subject_id ?? safeSubjects[0]?.id ?? '');

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [unitNumber, setUnitNumber] = useState<number>(currentUnit?.number || 1);
  const [unitTitle, setUnitTitle] = useState<string>(currentUnit?.title || '');

  const [jsonText, setJsonText] = useState<string>(() => {
    // Guardamos dentro del textarea SOLO el "content_json" editable
    // (description, blocks, metadata, pdfBaseUrl, pdfPrintUrl)
    if (currentUnit) {
      return JSON.stringify(
        {
          description: currentUnit.description ?? '',
          pdfBaseUrl: currentUnit.pdfBaseUrl ?? '#',
          pdfPrintUrl: currentUnit.pdfPrintUrl ?? '#',
          metadata: currentUnit.metadata ?? { version: '1.0.0', updated_at: new Date().toISOString(), change_note: '' },
          blocks: Array.isArray(currentUnit.blocks) ? currentUnit.blocks : []
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        description: 'Descripción de la unidad...',
        pdfBaseUrl: '#',
        pdfPrintUrl: '#',
        metadata: { version: '1.0.0', updated_at: new Date().toISOString(), change_note: 'Creación inicial' },
        blocks: []
      },
      null,
      2
    );
  });

  const [error, setError] = useState<string | null>(null);

  const handleValidateAndApply = () => {
    setError(null);

    // Validaciones mínimas (pero sin explotar)
    if (!selectedSubjectId) {
      setError('Seleccioná una materia antes de publicar.');
      return;
    }
    if (!unitTitle.trim()) {
      setError('Título de unidad obligatorio.');
      return;
    }
    if (!Number.isFinite(unitNumber) || unitNumber < 1) {
      setError('El número de unidad debe ser un entero >= 1.');
      return;
    }

    try {
      const content = JSON.parse(jsonText);

      // Blindaje suave del contenido
      const description = typeof content?.description === 'string' ? content.description : '';
      const pdfBaseUrl = typeof content?.pdfBaseUrl === 'string' ? content.pdfBaseUrl : '#';
      const pdfPrintUrl = typeof content?.pdfPrintUrl === 'string' ? content.pdfPrintUrl : '#';

      const metadata =
        content?.metadata && typeof content.metadata === 'object'
          ? {
              version: String(content.metadata.version ?? '1.0.0'),
              updated_at: String(content.metadata.updated_at ?? new Date().toISOString()),
              change_note: String(content.metadata.change_note ?? '')
            }
          : { version: '1.0.0', updated_at: new Date().toISOString(), change_note: '' };

      const blocks = Array.isArray(content?.blocks) ? content.blocks : [];

      // ✅ ID estable (si estoy editando, conservo id)
      const unitId = currentUnit?.id ?? `${selectedSubjectId}-u${unitNumber}`;

      const finalUnit: Unit = {
        id: unitId,
        subject_id: String(selectedSubjectId),
        number: unitNumber,
        title: unitTitle,
        description,
        blocks,
        metadata,
        pdfBaseUrl,
        pdfPrintUrl
      };

      onUpdate(finalUnit);
    } catch (e: any) {
      setError('Error en JSON: ' + (e?.message || 'JSON inválido'));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[150] flex items-center justify-center p-6">
      <div className="bg-[#1e293b] w-full max-w-7xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] border border-slate-700 overflow-hidden">
        <header className="p-8 border-b border-slate-700 flex items-center justify-between flex-shrink-0 bg-slate-900/40">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Configurador de Cuaderno</h2>
            <p className="text-xs text-sky-400 mt-1 font-bold uppercase tracking-widest italic">
              Edición directa de la estructura pedagógica
            </p>
          </div>
          <button onClick={onCancel} className="bg-slate-800 text-slate-400 hover:text-white p-2 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* IZQUIERDA */}
          <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-slate-900/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Materia</label>

                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
                >
                  {safeSubjects.length === 0 ? (
                    <option value="">(No hay materias cargadas)</option>
                  ) : (
                    safeSubjects.map((s) => (
                      <option key={String(s.id)} value={String(s.id)}>
                        {s.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unidad N°</label>
                <input
                  type="number"
                  min={1}
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(parseInt(e.target.value || '1', 10))}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Título Público</label>
                <input
                  type="text"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[450px]">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="flex-1 w-full bg-[#0a0f1d] text-sky-200 border-2 border-slate-800 rounded-2xl p-8 font-mono text-xs leading-relaxed focus:border-sky-500/50 outline-none resize-none shadow-inner"
                spellCheck={false}
              />
            </div>
          </div>

          {/* DERECHA */}
          <div className="w-full lg:w-80 p-8 flex flex-col justify-between bg-slate-900/40 border-l border-slate-700">
            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Guía de Carga</h3>
              <p className="text-[10px] text-slate-500 serif leading-relaxed italic">
                Asegurate de que el JSON sea válido. Cada bloque debe tener un ID único para no romper el progreso del alumno.
                <br />
                Tip: si agregás un campo nuevo (ej: <b>topics</b> en MAPA), no pasa nada: la web lo puede usar para renderizar.
              </p>
            </div>

            <div className="space-y-4 pt-10">
              {error && (
                <p className="text-[10px] text-rose-200 font-bold bg-rose-950/30 p-4 rounded-xl border border-rose-900/40">
                  {error}
                </p>
              )}

              <button
                onClick={handleValidateAndApply}
                className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
              >
                Publicar cambios
              </button>

              <button
                onClick={onCancel}
                className="w-full py-4 bg-slate-900 text-slate-200 border border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitUpdatePortal;
