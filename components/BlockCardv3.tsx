import React, { useMemo, useState } from 'react';
import { BlockContent } from '../types';
import { BLOCK_STYLES } from '../constants';

interface BlockCardProps {
  block: BlockContent;
  index: number;
  isVisited: boolean;
  onToggleVisit: () => void;
}

const BlockCard: React.FC<BlockCardProps> = ({ block, index, isVisited, onToggleVisit }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  const type = String((block as any)?.type ?? '').toUpperCase(); // ✅ normaliza tipo
  const styles =
    (BLOCK_STYLES as any)[type] ?? {
      color: 'bg-slate-700/40',
      label: type || 'BLOQUE',
      icon: (
        <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" />
        </svg>
      )
    };

  // ✅ MAPA: soporta map_items (nuevo) o topics (viejo)
  const mapaItems = useMemo(() => {
    const mi = (block as any)?.map_items;
    if (Array.isArray(mi) && mi.length) return mi;

    const topics = (block as any)?.topics;
    if (Array.isArray(topics) && topics.length) {
      // adaptamos topics → estructura parecida a map_items
      return topics.map((t: any, i: number) => ({
        id: t?.id ?? `t${i + 1}`,
        label: t?.title ?? `Tema ${i + 1}`,
        minutes: t?.minutes,
        target: t?.target,
        note: t?.note
      }));
    }
    return [];
  }, [block]);

  return (
    <div
      className={`mb-4 border rounded-2xl overflow-hidden transition-all duration-200
      bg-slate-900/40 border-slate-800
      ${isOpen ? 'ring-1 ring-slate-700 shadow-2xl' : 'hover:bg-white/5'}`}
    >
      {/* HEADER */}
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${styles.color} flex-shrink-0`}>
            {styles.icon}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Paso {index + 1}</span>

              {isVisited && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  Recorrido
                </span>
              )}
            </div>

            <h3 className="font-bold text-white leading-tight">{(block as any)?.title ?? '(Sin título)'}</h3>
          </div>
        </div>

        <svg
          className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* BODY */}
      {isOpen && (
        <div className="px-5 pb-6 pt-0">
          <div className="max-w-none">
            {/* ✅ CONTENT SIEMPRE visible (fallback si viene vacío) */}
            <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
              {String((block as any)?.content ?? '').trim() || '—'}
            </div>

            {/* ✅ UMBRAL: prompts + connection_task */}
            {Array.isArray((block as any)?.prompts) && (block as any).prompts.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preguntas para abrir</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {(block as any).prompts.map((p: any, i: number) => (
                    <li key={p?.id ?? i} className="flex gap-3">
                      <span className="text-slate-500">{i + 1}.</span>
                      <span>{p?.question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(block as any)?.connection_task?.prompt && (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conexión con la realidad</div>
                <div className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">
                  {(block as any).connection_task.prompt}
                </div>
              </div>
            )}

            {/* ✅ MAPA: map_items / topics */}
            {type === 'MAPA' && mapaItems.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hoja de ruta</div>

                <div className="mt-4 space-y-3">
                  {mapaItems.map((m: any, i: number) => (
                    <div key={m?.id ?? i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-bold text-white leading-snug">{m?.label ?? `Paso ${i + 1}`}</div>
                        {m?.minutes != null && (
                          <div className="text-[10px] font-black uppercase tracking-widest text-sky-200 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                            ~{m.minutes} min
                          </div>
                        )}
                      </div>

                      {m?.note && <div className="mt-2 text-xs text-slate-300">{m.note}</div>}

                      {m?.target && (
                        <div className="mt-2 text-xs text-slate-400">
                          Objetivo: <span className="text-slate-300">{m.target}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {Array.isArray((block as any)?.habits_checklist) && (block as any).habits_checklist.length > 0 && (
                  <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/20 p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Checklist de hábitos</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {(block as any).habits_checklist.map((h: string, i: number) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-emerald-400">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ✅ NUCLEO: activities */}
            {type === 'NUCLEO' && Array.isArray((block as any)?.activities) && (block as any).activities.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actividades (con el PDF abierto)</div>

                <div className="mt-4 space-y-4">
                  {(block as any).activities.map((a: any, i: number) => (
                    <div key={a?.id ?? i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-bold text-white leading-snug">{a?.title ?? `Actividad ${i + 1}`}</div>
                        {a?.kind && (
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-500/10 border border-slate-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                            {a.kind}
                          </div>
                        )}
                      </div>

                      {a?.instructions && (
                        <div className="mt-2 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {a.instructions}
                        </div>
                      )}

                      {Array.isArray(a?.questions) && a.questions.length > 0 && (
                        <ul className="mt-3 space-y-2 text-sm text-slate-200">
                          {a.questions.map((q: any, qi: number) => (
                            <li key={q?.id ?? qi} className="flex gap-3">
                              <span className="text-slate-500">{qi + 1}.</span>
                              <span>{q?.prompt}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {a?.text && <div className="mt-3 text-sm text-slate-200 whitespace-pre-wrap">{a.text}</div>}

                      {Array.isArray(a?.bank) && a.bank.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {a.bank.map((w: string, wi: number) => (
                            <span
                              key={wi}
                              className="text-xs text-slate-200 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-full"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ SENALES: signals */}
            {type === 'SENALES' && Array.isArray((block as any)?.signals) && (block as any).signals.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Señales clave</div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(block as any).signals.map((s: any, i: number) => (
                    <div key={s?.id ?? i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-lg">{s?.icon ?? '🎯'}</div>
                        <div>
                          <div className="text-sm font-bold text-white">{s?.concept}</div>
                          <div className="mt-1 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{s?.why}</div>
                          {s?.pdf_ref && (
                            <div className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">Ref: {s.pdf_ref}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ SABIAS: facts */}
            {type === 'SABIAS' && Array.isArray((block as any)?.facts) && (block as any).facts.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">¿Lo sabías?</div>

                <div className="mt-4 space-y-3">
                  {(block as any).facts.map((f: any, i: number) => (
                    <div key={f?.id ?? i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-lg">{f?.icon ?? '💡'}</div>
                        <div>
                          <div className="text-sm font-bold text-white">{f?.title}</div>
                          <div className="mt-2 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{f?.text}</div>
                          {f?.connect && <div className="mt-2 text-xs text-slate-200 whitespace-pre-wrap">{f.connect}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(block as any)?.reflection?.prompt && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/20 p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Micro-reflexión</div>
                    <div className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">{(block as any).reflection.prompt}</div>
                  </div>
                )}
              </div>
            )}

            {/* ✅ DEBUG (temporal): si querés ver qué llega realmente */}
            {/* <pre className="mt-4 text-xs text-slate-500 whitespace-pre-wrap">{JSON.stringify(block, null, 2)}</pre> */}
          </div>

          {/* FOOTER */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
            <label className="flex items-center gap-2 cursor-pointer group no-print">
              <input
                type="checkbox"
                checked={isVisited}
                onChange={onToggleVisit}
                className="w-5 h-5 rounded border-slate-600 bg-slate-950 text-sky-500 focus:ring-sky-500/30 transition-colors"
              />
              <span className="text-sm font-medium text-slate-400 group-hover:text-white">Marcar como realizado</span>
            </label>

            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{styles.label}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockCard;
