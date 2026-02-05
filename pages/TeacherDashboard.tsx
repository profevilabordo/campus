
import React, { useState } from 'react';
import { UserRole, Unit, EnrollmentRequest, EnrollmentStatus, Subject, ProgressRecord, Profile } from '../types';
import UnitUpdatePortal from '../components/UnitUpdatePortal';

interface TeacherDashboardProps {
  subjects: Subject[];
  units: Record<string, Unit>;
  enrollRequests: EnrollmentRequest[];
  progressRecords: ProgressRecord[];
  profiles: Profile[];
  onUpdateEnrollRequest: (id: string, status: EnrollmentStatus) => void;
  onUpdateUnit: (newUnit: Unit) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  subjects, 
  units, 
  enrollRequests, 
  progressRecords,
  profiles,
  onUpdateEnrollRequest, 
  onUpdateUnit 
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'contents' | 'students' | 'enrollments'>('contents');
  
  const students = profiles.filter(p => p.role === UserRole.STUDENT);
  const pendingRequests = enrollRequests.filter(r => r.status === EnrollmentStatus.PENDING);
  const activeUnitToUpdate = updatingUnitId ? units[updatingUnitId] : null;

  return (
    <div className="space-y-16 pb-32">
      {(activeUnitToUpdate || isCreatingNew) && (
        <UnitUpdatePortal 
          currentUnit={activeUnitToUpdate}
          availableSubjects={subjects}
          onCancel={() => { setUpdatingUnitId(null); setIsCreatingNew(false); }}
          onUpdate={(newUnit) => { onUpdateUnit(newUnit); setUpdatingUnitId(null); setIsCreatingNew(false); }}
        />
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-700 pb-12">
        <div>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">Laboratorio Docente</h1>
          <p className="text-sky-400 mt-4 serif italic text-2xl">Gestión de alumnos y curaduría pedagógica.</p>
        </div>
        <button 
          onClick={() => setIsCreatingNew(true)}
          className="px-8 py-5 bg-white text-black rounded-3xl text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-sky-400 transition-all flex items-center gap-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          Inyectar Unidad (JSON)
        </button>
      </header>

      <div className="flex gap-12 border-b border-slate-700 overflow-x-auto no-print">
        {[
          { id: 'contents', label: 'Contenidos' },
          { id: 'students', label: 'Seguimiento Alumnos' },
          { id: 'enrollments', label: 'Admisiones', count: pendingRequests.length }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-6 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-4 relative whitespace-nowrap ${activeTab === tab.id ? 'border-sky-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-4 bg-rose-600 text-white text-[10px] px-3 py-1 rounded-full font-black animate-pulse">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'contents' && (
        <div className="space-y-20">
          {subjects.map(subject => (
            <section key={subject.id} className="space-y-10">
              <h3 className="font-black text-white uppercase tracking-widest text-sm bg-slate-700/50 px-6 py-2 rounded-full border border-slate-600 inline-block">{subject?.name ?? '—'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {Array.from({ length: 3 }).map((_, i) => {
                  const unitNum = i + 1;
                  const uId = `${subject.id}_u${unitNum}`;
                  const unit = units[uId];
                  return (
                    <div key={uId} className={`card-surface p-10 rounded-[2.5rem] min-h-[300px] flex flex-col justify-between transition-all group ${unit ? 'border-sky-500/50 bg-slate-800/80 shadow-2xl' : 'border-dashed border-slate-800 opacity-40 grayscale'}`}>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad {unitNum}</span>
                        <h4 className="font-bold text-white text-xl mt-4 leading-snug group-hover:text-sky-400 transition-colors">{unit?.title || "Vacía"}</h4>
                      </div>
                      <button 
                        onClick={() => { if (unit) setUpdatingUnitId(uId); else setIsCreatingNew(true); }}
                        className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${unit ? 'bg-white text-black hover:bg-sky-400' : 'border-2 border-slate-700 text-slate-500 hover:border-white hover:text-white'}`}
                      >
                        {unit ? "Editar JSON" : "Configurar"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="card-surface rounded-[2.5rem] overflow-hidden border-slate-700 bg-slate-800/50 shadow-2xl">
          <div className="p-8 border-b border-slate-700 flex justify-between items-center">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lista de Alumnos Activos</h4>
            <select 
              className="bg-slate-900 border border-slate-700 text-white text-[10px] uppercase font-bold px-4 py-2 rounded-xl outline-none"
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            >
              <option value="all">Todas las Materias</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Alumno</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Curso</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Avance Lectura</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {students.map(student => {
                const count = progressRecords.filter(p => p.user_id === student.id).length;
                const percent = Math.min(100, count * 5); // Simplificación
                return (
                  <tr key={student.id} className="hover:bg-white/5 transition-all">
                    <td className="px-10 py-10">
                      <div className="font-bold text-white text-lg">{student.full_name}</div>
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">ID: {student.id.slice(0,8)}</div>
                    </td>
                    <td className="px-10 py-10 text-center text-xs font-black text-slate-400 uppercase tracking-widest">{student.course_id || 'PENDIENTE'}</td>
                    <td className="px-10 py-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-full max-w-[140px] bg-black/40 h-2.5 rounded-full overflow-hidden border border-slate-700">
                          <div className={`h-full transition-all duration-1000 ${percent > 70 ? 'bg-emerald-500' : percent > 30 ? 'bg-sky-400' : 'bg-rose-500'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-white">{percent}% de la materia</span>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <button className="text-[9px] font-black text-white uppercase tracking-widest border-2 border-slate-600 px-6 py-3 rounded-2xl hover:bg-white hover:text-black hover:border-white transition-all">Ver Notas</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'enrollments' && (
        <div className="card-surface rounded-[2.5rem] overflow-hidden border-slate-700 bg-slate-800/50 shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Solicitante</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Materia</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Admisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {pendingRequests.map(req => {
                const student = profiles.find(p => p.id === req.user_id);
                const subject = subjects.find(s => String(s.id) === String(req.subject_id));
                return (
                  <tr key={req.id}>
                    <td className="px-10 py-10">
                      <div className="font-bold text-white text-lg">{student?.full_name || "Alumno Desconocido"}</div>
                    </td>
                    <td className="px-10 py-10 text-xs font-black text-sky-400 uppercase tracking-widest">{subject?.name || req.subject_id}</td>
                    <td className="px-10 py-10 text-right">
                      <div className="flex justify-end gap-4">
                        <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.APPROVED)} className="bg-sky-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Aprobar</button>
                        <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.DENIED)} className="bg-rose-900/40 text-rose-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-800/50">Rechazar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pendingRequests.length === 0 && (
                <tr><td colSpan={3} className="px-10 py-32 text-center text-slate-500 serif italic text-xl">Sin admisiones pendientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
