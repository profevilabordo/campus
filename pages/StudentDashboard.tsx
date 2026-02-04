
import React from 'react';
import { User, Subject, ProgressRecord, Assessment } from '../types';
import { SUBJECTS } from '../data';

interface StudentDashboardProps {
  user: User;
  progress: ProgressRecord[];
  assessments: Assessment[];
  onSelectSubject: (id: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, progress, assessments, onSelectSubject }) => {
  const userSubjects = SUBJECTS.filter(s => s.courses.includes(user.profile.course_id || ''));

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mi Cuaderno Vivo</h1>
          <p className="text-slate-500 mt-1">Tu camino de aprendizaje y seguimiento personal.</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Curso:</span>
          <span className="ml-2 text-sm font-bold text-slate-900">{user.profile.course_id}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2">Mis Asignaturas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userSubjects.map(subject => {
              const subjectProgress = progress.filter(p => p.subject_id === subject.id);
              const percent = subject.units_count > 0 ? (subjectProgress.length / (subject.units_count * 10)) * 100 : 0; // Estimación simple
              
              return (
                <button 
                  key={subject.id}
                  onClick={() => onSelectSubject(subject.id)}
                  className="bg-white border border-slate-200 p-5 rounded-2xl text-left hover:border-slate-900 transition-all group"
                >
                  <h3 className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors mb-4">{subject.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Recorrido</span>
                      <span>{Math.round(percent)}%</span>
                    </div>
                    <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                      <div className="bg-slate-900 h-full transition-all" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2">Últimas Devoluciones</h2>
          <div className="space-y-4">
            {assessments.length > 0 ? assessments.map(assessment => (
              <div key={assessment.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{assessment.type}</span>
                  <span className="text-lg font-black text-slate-900">{assessment.grade}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">{SUBJECTS.find(s => s.id === assessment.subject_id)?.name}</h4>
                <p className="text-xs text-slate-500 serif leading-relaxed italic border-l-2 border-slate-100 pl-3">
                  "{assessment.feedback}"
                </p>
                <div className="mt-3 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                  {new Date(assessment.date).toLocaleDateString()}
                </div>
              </div>
            )) : (
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl text-center">
                <p className="text-sm text-slate-400 italic">No tenés devoluciones cargadas aún.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
