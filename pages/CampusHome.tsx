
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
    <div className="space-y-20 pb-40">
      <section className="text-center py-16">
        <h1 className="text-6xl sm:text-7xl font-black text-white mb-10 tracking-tighter leading-none">Campus <span className="text-sky-400">·</span> Cuaderno Vivo</h1>
        <div className="max-w-2xl mx-auto space-y-8">
          <p className="text-2xl text-slate-400 serif italic leading-relaxed">
            "No consumimos información. Recorremos conocimiento."
          </p>
          <div className="h-1 w-32 bg-sky-500 mx-auto rounded-full shadow-[0_0_20px_rgba(56,189,248,0.5)]"></div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {SUBJECTS.map((subject) => {
          const req = getStatus(subject.id);
          const status = req?.status || EnrollmentStatus.NONE;
          const canEnter = status === EnrollmentStatus.APPROVED || isTeacher;

          return (
            <div 
              key={subject.id}
              className={`group relative card-surface rounded-[3rem] p-10 transition-all flex flex-col justify-between h-80 border-2 ${canEnter ? 'border-slate-700 hover:border-sky-500 cursor-pointer hover:-translate-y-2' : 'border-slate-800 opacity-40 grayscale'}`}
              onClick={() => canEnter && onSelectSubject(String(subject.id))}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-500 bg-sky-500/10 px-4 py-1.5 rounded-full">{subject.units_count || 0} Unidades</span>
                  <div className="flex gap-2">
                    {status === EnrollmentStatus.PENDING && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase rounded-full border border-amber-500/30">Pendiente</span>
                    )}
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white leading-tight tracking-tight mb-4">{subject.name}</h3>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-700/50">
                {isTeacher || status === EnrollmentStatus.APPROVED ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest group-hover:text-white">{isTeacher ? 'ADMINISTRAR' : 'INGRESAR'}</span>
                    <svg className="w-6 h-6 text-sky-500 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                ) : (
                  <>
                    {status === EnrollmentStatus.NONE && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEnroll(String(subject.id)); }}
                        className="w-full py-5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-sky-400 transition-colors shadow-2xl shadow-black/40"
                      >
                        Solicitar Acceso
                      </button>
                    )}
                    {status === EnrollmentStatus.PENDING && (
                      <div className="flex flex-col items-center">
                        <p className="text-[11px] text-amber-500 font-bold mb-4 uppercase tracking-widest">En Revisión...</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if (req && 'id' in req) onCancelEnroll(req.id); }}
                          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors"
                        >
                          Cancelar Solicitud
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default CampusHome;
