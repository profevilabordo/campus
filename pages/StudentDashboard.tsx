import React from 'react';
import { User, Subject, ProgressRecord, Assessment } from '../types';

interface StudentDashboardProps {
  user: User;
  subjects: Subject[];
  progress: ProgressRecord[];
  assessments: Assessment[];
  enrollRequests: any[]; // usa any por compatibilidad (si querés lo tipamos perfecto)
  onSelectSubject: (id: string) => void;
  onEnroll: (subjectId: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  subjects,
  progress,
  assessments,
  enrollRequests,
  onSelectSubject,
  onEnroll
}) => {
  const userCourseId = user.profile.course_id || '';

  const userSubjects = subjects.filter(s => s.courses?.includes(userCourseId));

  const getRequestForSubject = (subjectId: any) =>
    enrollRequests.find(r =>
      String(r.subject_id) === String(subjectId) &&
      String(r.user_id) === String(user.id)
    );

  const cardBase =
    'group relative rounded-[2.5rem] p-10 border transition-all duration-300 text-left overflow-hidden';

  const styleApproved =
    'border-sky-500 bg-slate-900/80 shadow-2xl hover:shadow-sky-500/30 hover:border-sky-400 cursor-pointer ' +
    'ring-2 ring-sky-500/30 hover:ring-sky-400/60 hover:-translate-y-1';

  const stylePending =
    'border-yellow-400/40 bg-slate-900/55 shadow-xl opacity-85 cursor-not-allowed';

  const styleLocked =
    'border-slate-700 bg-slate-900/35 shadow-lg opacity-55 cursor-not-allowed';

  const badgeClass = (approved: boolean, pending: boolean) => {
    if (approved) return 'text-sky-400 bg-sky-400/10 border border-sky-400/20';
    if (pending) return 'text-yellow-300 bg-yellow-300/10 border border-yellow-300/20';
    return 'text-slate-400 bg-slate-400/10 border border-slate-400/10';
  };

  const badgeText = (approved: boolean, pending: boolean) => {
    if (approved) return 'ACTIVA';
    if (pending) return 'PENDIENTE';
    return 'DISPONIBLE';
  };

  const ctaText = (approved: boolean, pending: boolean) => {
    if (approved) return 'CONTINUAR';
    if (pending) return 'SOLICITUD EN REVISIÓN';
    return 'SOLICITAR ACCESO';
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Mi Cuaderno Vivo</h1>
          <p className="text-slate-400 mt-1 serif italic">Tu camino de aprendizaje y seguimiento personal.</p>
        </div>

        <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Curso Actual</span>
          <div className="text-sky-400 font-bold tracking-widest">{userCourseId || 'Sin asignar'}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column */}
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
              Mis Asignaturas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userSubjects.map(subject => {
              const req = getRequestForSubject(subject.id);
              const approved = req?.status === 'approved';
              const pending = req?.status === 'pending';

              const subjectProgress = progress.filter(
                p => String(p.subject_id) === String(subject.id)
              );

              const unitsCount = subject.units_count || 3;
              const percent = Math.min(100, (subjectProgress.length / (unitsCount * 5)) * 100);

              const cardStyle = approved ? styleApproved : pending ? stylePending : styleLocked;

              return (
                <div
                  key={subject.id}
                  className={`${cardBase} ${cardStyle}`}
                  onClick={() => {
                    if (approved) onSelectSubject(String(subject.id));
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && approved) onSelectSubject(String(subject.id));
                  }}
                >
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-8">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full ${badgeClass(
                        approved,
                        pending
                      )}`}
                    >
                      {badgeText(approved, pending)}
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-500 bg-sky-500/10 px-4 py-1 rounded-full">
                      {unitsCount} UNIDADES
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-3xl font-black leading-tight transition-colors ${
                      approved ? 'text-white group-hover:text-sky-300' : 'text-white'
                    }`}
                  >
                    {subject?.name ?? '—'}
                  </h3>

                  <div className="h-px bg-slate-700/70 my-8"></div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>Recorrido de lectura</span>
                      <span className="text-white">{Math.round(percent)}%</span>
                    </div>

                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-sky-500 h-full transition-all duration-700 shadow-[0_0_14px_rgba(56,189,248,0.35)]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-10 flex items-center justify-between">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest ${
                        approved ? 'text-slate-300 group-hover:text-white' : pending ? 'text-yellow-300' : 'text-slate-500'
                      }`}
                    >
                      {ctaText(approved, pending)}
                    </span>

                    {!approved && !pending ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnroll(String(subject.id));
                        }}
                        className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all"
                      >
                        Solicitar
                      </button>
                    ) : (
                      <span
                        className={`text-xl transition-transform ${
                          approved ? 'text-sky-400 group-hover:translate-x-2' : pending ? 'text-yellow-300' : 'text-slate-600'
                        }`}
                      >
                        →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right column */}
        <section className="space-y-8">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">
            Últimas Devoluciones
          </h2>

          <div className="space-y-6">
            {assessments.length > 0 ? (
              assessments.map(assessment => (
                <div key={assessment.id} className="card-surface p-8 rounded-[2rem] border-slate-800 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-400/10 px-3 py-1 rounded-full">
                      {assessment.type}
                    </span>
                    <span className="text-2xl font-black text-white">{assessment.grade}</span>
                  </div>

                  <h4 className="font-bold text-white text-sm mb-4 leading-snug">
                    {subjects.find(s => String(s.id) === String(assessment.subject_id))?.name}
                  </h4>

                  <p className="text-xs text-slate-400 serif leading-relaxed italic border-l-2 border-slate-700 pl-4 py-1">
                    "{assessment.feedback}"
                  </p>

                  <div className="mt-6 text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(assessment.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
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
