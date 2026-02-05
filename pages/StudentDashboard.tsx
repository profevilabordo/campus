import React, { useState } from 'react';
import { User, Subject, ProgressRecord, Assessment } from '../types';
import { SUBJECTS } from '../data';

interface StudentDashboardProps {
  user: User;
  progress: ProgressRecord[];
  assessments: Assessment[];
  onSelectSubject: (id: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, progress, assessments, onSelectSubject }) => {
  const [enrollCode, setEnrollCode] = useState('');
  const userSubjects = SUBJECTS.filter(s => s.courses?.includes(user.profile.course_id || ''));

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Mi Cuaderno Vivo</h1>
          <p className="text-slate-400 mt-1 serif italic">Tu camino de aprendizaje y seguimiento personal.</p>
        </div>
        <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Curso Actual</span>
          <div className="text-sky-400 font-bold tracking-widest">{user.profile.course_id || 'Sin asignar'}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Mis Asignaturas</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userSubjects.map(subject => {
              const subjectProgress = progress.filter(p => String(p.subject_id) === String(subject.id));
              const unitsCount = subject.units_count || 3;
              const percent = Math.min(100, (subjectProgress.length / (unitsCount * 5)) * 100);
              
              return (
                <button 
                  key={subject.id}
                  onClick={() => onSelectSubject(String(subject.id))}
                  className="card-surface p-8 rounded-[2rem] text-left hover:border-white transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <h3 className="font-black text-white text-xl mb-6 leading-tight group-hover:text-sky-400 transition-colors">{subject?.name ?? '—'}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Recorrido de lectura</span>
                        <span className="text-white">{Math.round(percent)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-sky-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] mt-10">
            <h3 className="text-white font-black text-lg mb-4 uppercase tracking-tighter">Inscribirse a Materia</h3>
            <p className="text-slate-500 text-xs serif italic mb-6">Ingresá el código proporcionado por tu docente para solicitar acceso.</p>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="CÓDIGO-MATERIA"
                value={enrollCode}
                onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
                className="flex-1 bg-black/50 border border-slate-700 rounded-xl px-4 text-white font-mono text-sm tracking-widest outline-none focus:border-sky-500"
              />
              <button className="bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all">Solicitar</button>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Últimas Devoluciones</h2>
          <div className="space-y-6">
            {assessments.length > 0 ? assessments.map(assessment => (
              <div key={assessment.id} className="card-surface p-8 rounded-[2rem] border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-400/10 px-3 py-1 rounded-full">{assessment.type}</span>
                  <span className="text-2xl font-black text-white">{assessment.grade}</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-4 leading-snug">{SUBJECTS.find(s => s.id === assessment.subject_id)?.name}</h4>
                <p className="text-xs text-slate-400 serif leading-relaxed italic border-l-2 border-slate-700 pl-4 py-1">
                  "{assessment.feedback}"
                </p>
                <div className="mt-6 text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(assessment.date).toLocaleDateString()}
                </div>
              </div>
            )) : (
              <div className="bg-slate-900/30 border-2 border-dashed border-slate-800 p-12 rounded-[2rem] text-center">
                <p className="text-sm text-slate-600 italic serif">No tenés devoluciones cargadas aún.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
