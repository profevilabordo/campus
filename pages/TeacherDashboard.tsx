
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
      {/* Portal de carga de JSON */}
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

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Laboratorio Docente</h1>
          <p className="text-slate-400 mt-2 serif italic text-lg">Curaduría de contenidos y seguimiento de procesos.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setIsCreatingNew(true)}
            className="px-6 py-3.5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Carga de Unidad (JSON)
          </button>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-[#1a1a1c] border-2 border-slate-800 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest focus:border-slate-400 outline-none transition-all"
          >
            <option value="">Filtrar por Curso</option>
            {COURSES.map(c => (
              <option key={c.id} value={c.id}>{c.grade_level} "{c.division}"</option>
            ))}
          </select>
        </div>
      </header>

      {/* Navegación por pestañas de alto contraste */}
      <div className="flex gap-10 border-b border-slate-800 no-print overflow-x-auto">
        {[
          { id: 'progress', label: 'Contenidos Literales' },
          { id: 'students', label: 'Seguimiento Alumnos' },
          { id: 'enrollments', label: 'Admisiones', count: pendingRequests.length }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-5 text-[11px] font-black uppercase tracking-[0.25em] transition-all border-b-4 relative ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-3 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* VISTA: CONTENIDOS */}
      {activeTab === 'progress' && (
        <div className="space-y-20">
          {subjects.filter(s => !selectedCourse || s.courses?.includes(String(selectedCourse))).map(subject => (
            <section key={subject.id} className="space-y-8">
              <div className="flex items-center justify-between border-l-4 border-slate-700 pl-6">
                <div>
                  <h3 className="font-black text-white uppercase tracking-widest text-sm">{subject.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Plan de {subject.units_count || 3} Unidades</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: Number(subject.units_count) || 3 }).map((_, i) => {
                  const unitNumber = i + 1;
                  const unitId = `${subject.id}_u${unitNumber}`;
                  const unit = units[unitId];
                  const isPublished = !!unit;
                  return (
                    <div key={unitId} className={`card-surface p-8 rounded-[2rem] flex flex-col justify-between h-72 transition-all ${isPublished ? 'shadow-2xl border-slate-700' : 'opacity-30 border-dashed'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Unidad {unitNumber}</span>
                          {isPublished && <span className="bg-emerald-900/30 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-800/50">Activa</span>}
                        </div>
                        {isPublished ? (
                          <>
                            <h4 className="font-bold text-white text-base leading-tight mb-3 line-clamp-2">{unit.title}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v{unit.metadata?.version || '1.0.0'}</p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-600 serif italic">Pendiente de carga...</p>
                        )}
                      </div>
                      <button 
                        onClick={() => { if (isPublished) setUpdatingUnitId(unitId); else setIsCreatingNew(true); }} 
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isPublished ? 'bg-slate-800 text-slate-200 hover:bg-white hover:text-black' : 'border-2 border-slate-800 text-slate-500 hover:border-white hover:text-white'}`}
                      >
                        {isPublished ? 'Actualizar JSON' : 'Cargar JSON'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* VISTA: SEGUIMIENTO ALUMNOS */}
      {activeTab === 'students' && (
        <div className="card-surface rounded-[2.5rem] overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0c0c0e] border-b border-slate-800">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Estudiante</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Curso</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Avance</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-white/5 transition-all">
                    <td className="px-10 py-8">
                      <div className="font-bold text-white text-base">{student.profile.full_name}</div>
                      <div className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">{student.email}</div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{student.profile.course_id}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="flex-1 bg-black h-2 rounded-full overflow-hidden max-w-[120px] border border-slate-800"><div className="bg-white h-full w-[25%]"></div></div>
                        <span className="text-[11px] font-black text-white">25%</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="text-[10px] font-black text-white uppercase tracking-widest border-2 border-slate-800 px-6 py-2.5 rounded-xl hover:bg-white hover:text-black transition-all">Ver Cuaderno</button>
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
        <div className="card-surface rounded-[2.5rem] overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0c0c0e] border-b border-slate-800">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Alumno</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Asignatura</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {enrollRequests.length > 0 ? enrollRequests.map(req => {
                  const student = MOCK_USERS.find(u => u.id === req.user_id);
                  const subject = subjects.find(s => String(s.id) === String(req.subject_id));
                  return (
                    <tr key={req.id}>
                      <td className="px-10 py-8">
                        <div className="font-bold text-white text-base">{student?.profile.full_name || 'Sin nombre'}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{student?.email}</div>
                      </td>
                      <td className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">{subject?.name || req.subject_id}</td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-4">
                          <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.APPROVED)} className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-500 transition-all">Aprobar</button>
                          <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.DENIED)} className="px-6 py-3 bg-rose-900/40 text-rose-400 text-[10px] font-black uppercase rounded-xl border border-rose-800/50 hover:bg-rose-900 transition-all">Rechazar</button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={3} className="px-10 py-20 text-center text-slate-600 serif italic">No hay solicitudes pendientes.</td></tr>
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
