
import React from 'react';
import { Subject, Unit } from '../types';

interface SubjectPageProps {
  subject: Subject;
  isApproved: boolean;
  userCourseId?: string;
  availableUnits: Unit[];
  onSelectUnit: (unitId: string) => void;
  onBack: () => void;
}

const SubjectPage: React.FC<SubjectPageProps> = ({ subject, isApproved, userCourseId, availableUnits, onSelectUnit, onBack }) => {
  const orientationNote = userCourseId && subject.orientation_notes ? subject.orientation_notes[userCourseId] : null;

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-6">
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white flex items-center gap-3 transition-colors no-print">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          Regresar al Ecosistema
        </button>
        <div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tight">{subject?.name ?? '—'}</h1>
          <p className="text-xl text-slate-400 serif italic mt-4">Trayectoria pedagógica y materiales de estudio.</p>
        </div>
      </header>

      {!isApproved && (
        <div className="card-surface p-12 rounded-[2.5rem] text-center space-y-6 border-amber-900/30 bg-amber-900/10 shadow-2xl">
          <div className="w-20 h-20 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto border border-amber-800/50">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Acceso en proceso</h3>
            <p className="text-slate-400 mt-4 serif italic leading-relaxed">Todavía no habilitamos tu Cuaderno Vivo para esta asignatura. Verificá con el docente si tu inscripción fue procesada.</p>
            <button onClick={onBack} className="mt-8 px-10 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Regresar</button>
          </div>
        </div>
      )}

      {isApproved && (
        <>
          {orientationNote && (
            <div className="bg-sky-500/10 border border-sky-500/20 p-8 rounded-[2rem] shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-3">Nota Docente a tu Curso</h4>
              <p className="text-sky-100 serif text-lg leading-relaxed">{orientationNote}</p>
            </div>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Recorrido por Unidades</h2>
              
              <div className="space-y-6">
                {availableUnits.length > 0 ? availableUnits.sort((a,b) => a.number - b.number).map(unit => (
                  <button 
                    key={unit.id}
                    onClick={() => onSelectUnit(unit.id)}
                    className="w-full text-left card-surface p-8 rounded-[2.5rem] hover:border-white transition-all flex items-center justify-between group shadow-xl"
                  >
                    <div className="flex items-center gap-8">
                      <span className="text-5xl font-black text-slate-700/50 group-hover:text-sky-400 transition-colors">
                        {unit.number.toString().padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="font-bold text-2xl text-white leading-tight group-hover:translate-x-1 transition-transform">{unit.title}</h3>
                        <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest italic">v{unit.metadata?.version || '1.0.0'}</p>
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-full border-2 border-slate-700 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:border-white transition-all shadow-lg">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                )) : (
                  <div className="py-20 text-center border-2 border-dashed border-slate-700 rounded-[2.5rem]">
                    <p className="text-slate-500 serif italic text-lg">No hay unidades publicadas todavía para esta materia.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-10 no-print">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Biblioteca de Apoyo</h2>
              <div className="card-surface p-10 rounded-[2.5rem] space-y-8 shadow-2xl">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Materiales Oficiales</p>
                  {availableUnits.map(u => (
                    <div key={u.id} className="space-y-3 pb-6 border-b border-slate-700/50 last:border-0 last:pb-0">
                      <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Unidad {u.number}</p>
                      <a href={u.pdfBaseUrl || "#"} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest text-slate-300">
                        <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                        PDF Teórico
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default SubjectPage;
