
import React, { useState } from 'react';
import { SUBJECTS } from '../data';
import { EnrollmentRequest, EnrollmentStatus } from '../types';

interface CampusHomeProps {
  enrollRequests: EnrollmentRequest[];
  onSelectSubject: (id: string) => void;
  onEnroll: (subjectId: string) => void;
  onCancelEnroll: (requestId: string) => void;
}

const CampusHome: React.FC<CampusHomeProps> = ({ enrollRequests, onSelectSubject, onEnroll, onCancelEnroll }) => {
  const [showHowTo, setShowHowTo] = useState(false);

  const getStatus = (subjectId: string) => {
    return enrollRequests.find(r => r.subject_id === subjectId);
  };

  return (
    <div className="space-y-12 pb-20">
      <section className="text-center py-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Campus · Cuaderno Vivo</h1>
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-lg text-slate-600 serif italic leading-relaxed">
            "Este no es un sitio para descargar archivos. Es un lugar para aprender a leer, a pensar críticamente y a construir un recorrido propio."
          </p>
          <div className="h-1 w-20 bg-slate-200 mx-auto rounded-full"></div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto space-y-4 no-print">
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button 
            onClick={() => setShowHowTo(!showHowTo)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-700">Cómo usar este Campus</span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showHowTo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showHowTo && (
            <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed space-y-3 border-t border-slate-100 pt-4">
              <p>1. <strong>Solicitá inscripción</strong> a las materias que te corresponden este año.</p>
              <p>2. Una vez aprobada por el docente, podrás acceder a los contenidos.</p>
              <p>3. Descargá el <strong>PDF Base</strong>; es tu texto central de estudio.</p>
              <p>4. Recorré los bloques en orden. No corras.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Explorar Asignaturas</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBJECTS.map((subject) => {
            const req = getStatus(subject.id);
            const status = req?.status || EnrollmentStatus.NONE;

            return (
              <div 
                key={subject.id}
                className={`group relative bg-white border rounded-2xl p-6 transition-all flex flex-col justify-between h-56 ${status === EnrollmentStatus.APPROVED ? 'border-slate-200 hover:border-slate-400 hover:shadow-md cursor-pointer' : 'border-slate-100'}`}
                onClick={() => status === EnrollmentStatus.APPROVED && onSelectSubject(subject.id)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{subject.units_count} Unidades</span>
                    {status === EnrollmentStatus.PENDING && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-tighter rounded border border-amber-100 animate-pulse">Pendiente</span>
                    )}
                    {status === EnrollmentStatus.DENIED && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-tighter rounded border border-rose-100">Rechazada</span>
                    )}
                    {status === EnrollmentStatus.APPROVED && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-tighter rounded border border-emerald-100">Aprobada</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 leading-snug">{subject.name}</h3>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50">
                  {status === EnrollmentStatus.NONE && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEnroll(subject.id); }}
                      className="w-full py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Solicitar Inscripción
                    </button>
                  )}
                  {status === EnrollmentStatus.PENDING && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-amber-600 italic leading-tight">Tu solicitud está siendo revisada. En breve vas a recibir una respuesta.</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onCancelEnroll(req!.id); }}
                        className="text-[10px] font-bold text-slate-400 uppercase hover:text-rose-500 transition-colors"
                      >
                        Cancelar solicitud
                      </button>
                    </div>
                  )}
                  {status === EnrollmentStatus.DENIED && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-rose-500 leading-tight">Solicitud rechazada. Revisá si elegiste la materia correcta.</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEnroll(subject.id); }}
                        className="w-full py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Solicitar nuevamente
                      </button>
                    </div>
                  )}
                  {status === EnrollmentStatus.APPROVED && (
                    <div className="flex items-center justify-between group">
                      <span className="text-xs font-bold text-slate-900">Ingresar</span>
                      <svg className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
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
