
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
    <div className="space-y-12 pb-20">
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

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/50 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Laboratorio Docente</h1>
          <p className="text-slate-500 mt-2 serif italic">Gestión de contenidos literales y seguimiento de procesos críticos.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsCreatingNew(true)}
            className="px-5 py-2.5 bg-slate-100 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-white transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Nueva Unidad (JSON)
          </button>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-[#161618] border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-700"
          >
            <option value="">Todos los cursos</option>
            {COURSES.map(c => (
              <option key={c.id} value={c.id}>
                {c.grade_level} "{c.division}" - {c.orientation || 'Técnica'}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Navegación por pestañas sobrias */}
      <div className="flex gap-8 border-b border-slate-800/50 no-print overflow-x-auto">
        <button 
          onClick={() => setActiveTab('progress')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${activeTab === 'progress' ? 'border-slate-100 text-slate-100' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
        >
          Ecosistema de Contenidos
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${activeTab === 'students' ? 'border-slate-100 text-slate-100' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
        >
          Seguimiento de Alumnos
        </button>
        <button 
          onClick={() => setActiveTab('enrollments')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'enrollments' ? 'border-slate-100 text-slate-100' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
        >
          Admisiones {pendingRequests.length > 0 && <span className="bg-amber-600 text-[#0a0a0c] text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">{pendingRequests.length}</span>}
        </button>
      </div>

      {/* VISTA: CONTENIDOS (Carga de JSON) */}
      {activeTab === 'progress' && (
        <div className="space-y-16">
          {subjects.filter(s => !selectedCourse || s.courses?.includes(String(selectedCourse))).map(subject => (
            <section key={subject.id} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-200 uppercase tracking-widest text-[11px]">{subject.name}</h3>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Plan de {subject.units_count || 3} Unidades</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: Number(subject.units_count) || 3 }).map((_, i) => {
                  const unitNumber = i + 1;
                  const unitId = `${subject.id}_u${unitNumber}`;
                  const unit = units[unitId];
                  const isPublished = !!unit;
                  return (
                    <div key={unitId} className={`relative glass-panel p-8 rounded-3xl flex flex-col justify-between h-64 transition-all ${isPublished ? 'bg-[#161618] border-slate-800 shadow-2xl' : 'bg-transparent border-dashed border-slate-800 opacity-40'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isPublished ? 'text-indigo-400' : 'text-slate-600'}`}>Unidad {unitNumber}</span>
                          {isPublished && <span className="px-2 py-0.5 bg-emerald-900/20 text-emerald-400 text-[8px] font-black uppercase rounded border border-emerald-800/50">Disponible</span>}
                        </div>
                        {isPublished ? (
                          <>
                            <h4 className="font-bold text-slate-200 text-sm leading-relaxed mb-2 line-clamp-2">{unit.title}</h4>
                            <div className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase">Versión {unit.metadata?.version || '1.0.0'}</div>
                          </>
                        ) : (
                          <p className="text-xs text-slate-600 serif italic py-4">Esperando carga de estructura JSON...</p>
                        )}
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-800/50">
                        <button 
                          onClick={() => { if (isPublished) setUpdatingUnitId(unitId); else setIsCreatingNew(true); }} 
                          className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPublished ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-100 hover:text-slate-900' : 'bg-transparent border border-slate-800 text-slate-600 hover:border-slate-400 hover:text-slate-400'}`}
                        >
                          {isPublished ? 'Actualizar JSON' : 'Cargar Estructura'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {subjects.length === 0 && (
            <div className="text-center py-20 bg-[#161618] rounded-3xl border border-dashed border-slate-800">
               <p className="text-slate-600 serif italic">No se encontraron asignaturas activas en este curso.</p>
            </div>
          )}
        </div>
      )}

      {/* VISTA: SEGUIMIENTO ALUMNOS */}
      {activeTab === 'students' && (
        <section className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800/50">
            <h3 className="font-black text-slate-200 uppercase tracking-widest text-[11px]">Avance de los Estudiantes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111113] border-b border-slate-800">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Estudiante</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Curso</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Estado Recorrido</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-200 text-sm">{student.profile.full_name}</div>
                      <div className="text-[10px] text-slate-600">{student.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{student.profile.course_id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-900 h-1 rounded-full overflow-hidden max-w-[100px]"><div className="bg-slate-200 h-full w-[15%]"></div></div>
                        <span className="text-[10px] font-black text-slate-400">15%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-[9px] font-black text-slate-200 hover:text-white uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-lg transition-all">Ver Cuaderno</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* VISTA: ADMISIONES */}
      {activeTab === 'enrollments' && (
        <section className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-slate-800/50">
            <h3 className="font-black text-slate-200 uppercase tracking-widest text-[11px]">Gestión de Solicitudes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111113] border-b border-slate-800">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Alumno</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Asignatura</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {enrollRequests.map(req => {
                  const student = MOCK_USERS.find(u => u.id === req.user_id);
                  const subject = subjects.find(s => String(s.id) === String(req.subject_id));
                  return (
                    <tr key={req.id}>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-200 text-sm">{student?.profile.full_name || 'Sin identificar'}</div>
                        <div className="text-[10px] text-slate-600">{student?.email}</div>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{subject?.name || req.subject_id}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.APPROVED)} className="px-4 py-2 bg-emerald-900/20 text-emerald-400 text-[9px] font-black uppercase rounded-lg border border-emerald-800/50 hover:bg-emerald-900/40 transition-all">Aprobar</button>
                          <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.DENIED)} className="px-4 py-2 bg-rose-900/20 text-rose-400 text-[9px] font-black uppercase rounded-lg border border-rose-800/50 hover:bg-rose-900/40 transition-all">Rechazar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default TeacherDashboard;
