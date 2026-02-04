
import React, { useState } from 'react';
import { COURSES, MOCK_USERS } from '../data';
import { UserRole, Unit, EnrollmentRequest, EnrollmentStatus, Subject } from '../types';
import UnitUpdatePortal from '../components/UnitUpdatePortal';

interface TeacherDashboardProps {
  subjects: Subject[];
  units: Record<string, Unit>;
  enrollRequests: EnrollmentRequest[];
  onUpdateEnrollRequest: (id: string, status: EnrollmentStatus) => void;
  onUpdateUnit: (newUnit: Unit) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ subjects, units, enrollRequests, onUpdateEnrollRequest, onUpdateUnit }) => {
  const [selectedCourse, setSelectedCourse] = useState<string | number>('');
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'enrollments' | 'students'>('progress');
  
  const students = MOCK_USERS.filter(u => 
    u.profile.role === UserRole.STUDENT && (!selectedCourse || u.profile.course_id === String(selectedCourse))
  );

  const pendingRequests = enrollRequests.filter(r => r.status === EnrollmentStatus.PENDING);
  const activeUnitToUpdate = updatingUnitId ? units[updatingUnitId] : null;

  return (
    <div className="space-y-12 pb-32">
      {(activeUnitToUpdate || isCreatingNew) && (
        <UnitUpdatePortal 
          currentUnit={activeUnitToUpdate}
          availableSubjects={subjects}
          onCancel={() => {
            setUpdatingUnitId(null);
            setIsCreatingNew(false);
          }}
          onUpdate={(newUnit) => {
            onUpdateUnit(newUnit);
            setUpdatingUnitId(null);
            setIsCreatingNew(false);
          }}
        />
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-700 pb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Laboratorio Docente</h1>
          <p className="text-slate-400 mt-2 serif italic text-xl">Gestión de recorridos y curaduría pedagógica.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setIsCreatingNew(true)}
            className="px-8 py-4 bg-white text-[#0f172a] rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0_15px_35px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Carga de Unidad (JSON)
          </button>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-800 border-2 border-slate-700 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest focus:border-sky-400 outline-none transition-all shadow-xl"
          >
            <option value="">Filtrar Cursos</option>
            {COURSES.map(c => (
              <option key={c.id} value={c.id}>{c.grade_level} "{c.division}"</option>
            ))}
          </select>
        </div>
      </header>

      {/* Pestañas de Navegación con mejor contraste */}
      <div className="flex gap-12 border-b border-slate-700 no-print overflow-x-auto">
        {[
          { id: 'progress', label: 'Contenidos de Unidad' },
          { id: 'students', label: 'Progreso de Alumnos' },
          { id: 'enrollments', label: 'Nuevas Admisiones', count: pendingRequests.length }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-5 text-[11px] font-black uppercase tracking-[0.25em] transition-all border-b-4 relative ${activeTab === tab.id ? 'border-sky-400 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-3 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* VISTA: CONTENIDOS */}
      {activeTab === 'progress' && (
        <div className="space-y-24">
          {subjects.filter(s => !selectedCourse || s.courses?.includes(String(selectedCourse))).map(subject => (
            <section key={subject.id} className="space-y-10">
              <div className="flex items-center gap-4 border-l-4 border-sky-500 pl-6">
                <div>
                  <h3 className="font-black text-white uppercase tracking-widest text-lg">{subject.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan Maestro: {subject.units_count || 3} Unidades</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {Array.from({ length: Number(subject.units_count) || 3 }).map((_, i) => {
                  const unitNumber = i + 1;
                  const unitId = `${subject.id}_u${unitNumber}`;
                  const unit = units[unitId];
                  const isPublished = !!unit;
                  return (
                    <div key={unitId} className={`card-surface p-10 rounded-[2.5rem] flex flex-col justify-between h-80 transition-all shadow-2xl ${isPublished ? 'bg-slate-800 border-slate-700' : 'opacity-40 grayscale border-dashed'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-8">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">U. {unitNumber}</span>
                          {isPublished && <span className="bg-sky-500/20 text-sky-400 text-[9px] font-black px-4 py-1.5 rounded-full border border-sky-400/50">Disponible</span>}
                        </div>
                        {isPublished ? (
                          <>
                            <h4 className="font-bold text-white text-lg leading-tight mb-4 line-clamp-2">{unit.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">v{unit.metadata?.version || '1.0.0'}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 serif italic mt-4">Esperando configuración de unidad...</p>
                        )}
                      </div>
                      <button 
                        onClick={() => { if (isPublished) setUpdatingUnitId(unitId); else setIsCreatingNew(true); }} 
                        className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isPublished ? 'bg-slate-700 text-white hover:bg-white hover:text-black shadow-lg' : 'border-2 border-slate-700 text-slate-400 hover:border-white hover:text-white'}`}
                      >
                        {isPublished ? 'Actualizar Cuaderno' : 'Cargar Estructura'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* VISTA: PROGRESO */}
      {activeTab === 'students' && (
        <div className="card-surface rounded-[2.5rem] overflow-hidden border-slate-700 bg-slate-800 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700">
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Estudiante</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Curso</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Avance</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-white/5 transition-all">
                    <td className="px-12 py-10">
                      <div className="font-bold text-white text-lg">{student.profile.full_name}</div>
                      <div className="text-xs text-slate-500 font-medium tracking-wide mt-2">{student.email}</div>
                    </td>
                    <td className="px-12 py-10">
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{student.profile.course_id}</span>
                    </td>
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-8">
                        <div className="flex-1 bg-black/40 h-3 rounded-full overflow-hidden max-w-[150px] border border-slate-700"><div className="bg-sky-400 h-full w-[35%]" style={{boxShadow: '0 0 10px rgba(56,189,248,0.5)'}}></div></div>
                        <span className="text-xs font-black text-white">35%</span>
                      </div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <button className="text-[10px] font-black text-white uppercase tracking-widest border-2 border-slate-700 px-8 py-3 rounded-xl hover:bg-sky-500 hover:border-sky-500 transition-all shadow-md">Seguimiento</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA: ADMISIONES */}
      {activeTab === 'enrollments' && (
        <div className="card-surface rounded-[2.5rem] overflow-hidden border-slate-700 bg-slate-800 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700">
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Alumno</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Materia</th>
                  <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {enrollRequests.length > 0 ? enrollRequests.map(req => {
                  const student = MOCK_USERS.find(u => u.id === req.user_id);
                  const subject = subjects.find(s => String(s.id) === String(req.subject_id));
                  return (
                    <tr key={req.id}>
                      <td className="px-12 py-10">
                        <div className="font-bold text-white text-lg">{student?.profile.full_name || 'Sin identificar'}</div>
                        <div className="text-xs text-slate-500 mt-2">{student?.email}</div>
                      </td>
                      <td className="px-12 py-10 text-xs font-black text-slate-300 uppercase tracking-widest">{subject?.name || req.subject_id}</td>
                      <td className="px-12 py-10 text-right">
                        <div className="flex justify-end gap-6">
                          <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.APPROVED)} className="px-8 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all">Habilitar</button>
                          <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.DENIED)} className="px-8 py-4 bg-rose-900/40 text-rose-400 text-[10px] font-black uppercase rounded-2xl border border-rose-800/50 hover:bg-rose-900 transition-all">Rechazar</button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={3} className="px-12 py-24 text-center text-slate-500 serif italic text-lg">No hay admisiones por procesar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
