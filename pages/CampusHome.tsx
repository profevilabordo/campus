
import React, { useState } from 'react';
import { SUBJECTS } from '../data';
import { EnrollmentRequest, EnrollmentStatus, UserRole } from '../types';

interface CampusHomeProps {
  userRole?: UserRole;
  enrollRequests: EnrollmentRequest[];
  onSelectSubject: (id: string) => void;
  onEnroll: (subjectId: string) => void;
  onCancelEnroll: (requestId: string) => void;
}

const CampusHome: React.FC<CampusHomeProps> = ({ 
  userRole, 
  enrollRequests, 
  onSelectSubject, 
  onEnroll, 
  onCancelEnroll 
}) => {
  const [showHowTo, setShowHowTo] = useState(false);
  const isTeacher = userRole === UserRole.TEACHER;

  const getStatus = (subjectId: string | number): EnrollmentRequest | { status: EnrollmentStatus } | undefined => {
    const sId = String(subjectId);
    if (isTeacher) return { status: EnrollmentStatus.APPROVED };
    return enrollRequests.find(r => String(r.subject_id) === sId);
  };

  return (
    <div className="space-y-16 pb-32">
      <section className="text-center py-12">
        <h1 className="text-5xl sm:text-6xl font-black text-white mb-8 tracking-tighter">Campus · Cuaderno Vivo</h1>
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-xl text-slate-400 serif italic leading-relaxed">
            "Este no es un sitio para descargar archivos. Es un lugar para aprender a leer y construir un recorrido propio."
          </p>
          <div className="h-1.5 w-24 bg-white/10 mx-auto rounded-full"></div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto no-print">
        <div className="card-surface rounded-3xl overflow-hidden shadow-2xl">
          <button 
            onClick={() => setShowHowTo(!showHowTo)}
            className="w-full px-8 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-all"
          >
            <span className="font-black text-slate-200 uppercase tracking-widest text-xs">Instrucciones de Uso</span>
            <svg className={`w-6 h-6 text-slate-500 transition-transform ${showHowTo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showHowTo && (
            <div className="px-8 pb-8 text-sm text-slate-400 leading-relaxed space-y-4 border-t border-slate-800 pt-6 serif">
              <p>1. <strong>Inscribite</strong> a las materias de tu división.</p>
              <p>2. Una vez que el docente apruebe tu acceso, el cuaderno se desbloqueará.</p>
              <p>3. Usá el <strong>PDF Base</strong> como eje central de lectura.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">Ecosistema de Asignaturas</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SUBJECTS.map((subject) => {
            const req = getStatus(subject.id);
            const status = req?.status || EnrollmentStatus.NONE;
            const canEnter = status === EnrollmentStatus.APPROVED || isTeacher;

            return (
              <div 
                key={subject.id}
                className={`group relative card-surface rounded-[2rem] p-8 transition-all flex flex-col justify-between h-64 ${canEnter ? 'hover:border-white hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] cursor-pointer' : 'opacity-60 grayscale'}`}
                onClick={() => canEnter && onSelectSubject(String(subject.id))}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{subject.units_count} Unidades</span>
                    <div className="flex gap-2">
                      {status === EnrollmentStatus.PENDING && (
                        <span className="px-3 py-1 bg-amber-900/30 text-amber-400 text-[9px] font-black uppercase rounded-full border border-amber-800/50 animate-pulse">Pendiente</span>
                      )}
                      {status === EnrollmentStatus.APPROVED && (
                        <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-[9px] font-black uppercase rounded-full border border-emerald-800/50">Habilitado</span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight tracking-tight group-hover:translate-x-1 transition-transform">{subject.name}</h3>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800/50">
                  {isTeacher || status === EnrollmentStatus.APPROVED ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isTeacher ? 'Gestionar' : 'Ingresar'}</span>
                      <svg className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  ) : (
                    <>
                      {status === EnrollmentStatus.NONE && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEnroll(String(subject.id)); }}
                          className="w-full py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                        >
                          Solicitar Acceso
                        </button>
                      )}
                      {status === EnrollmentStatus.PENDING && (
                        <div className="flex flex-col items-center">
                          <p className="text-[10px] text-amber-500 serif italic mb-3">En revisión...</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); if (req && 'id' in req) onCancelEnroll(req.id); }}
                            className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-rose-500 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CampusHome;
