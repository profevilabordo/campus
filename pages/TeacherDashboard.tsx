
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
    <div className="space-y-10 pb-20">
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

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel Docente</h1>
          <p className="text-slate-500 mt-1">Gestión del ecosistema pedagógico y seguimiento de procesos.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsCreatingNew(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Carga Libre (JSON)
          </button>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Todos los cursos</option>
            {COURSES.map(c => (
              <option key={c.id} value={c.id}>
                {c.grade_level} "{c.division}" - {c.orientation || 'Común'}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <div className="flex border-b border-slate-200 no-print overflow-x-auto">
        <button 
          onClick={() => setActiveTab('progress')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'progress' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Ecosistema de Contenidos
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === 'students' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Seguimiento de Alumnos
        </button>
        <button 
          onClick={() => setActiveTab('enrollments')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'enrollments' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Admisiones {pendingRequests.length > 0 && <span className="bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{pendingRequests.length}</span>}
        </button>
      </div>

      {/* VISTA: CONTENIDOS (Carga de JSON) */}
      {activeTab === 'progress' && (
        <div className="space-y-12">
          {subjects.filter(s => !selectedCourse || s.courses?.includes(String(selectedCourse))).map(subject => (
            <section key={subject.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">{subject.name}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Plan de {subject.units_count || 3} Unidades</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: Number(subject.units_count) || 3 }).map((_, i) => {
                  const unitNumber = i + 1;
                  const unitId = `${subject.id}_u${unitNumber}`;
                  const unit = units[unitId];
                  const isPublished = !!unit;
                  return (
                    <div key={unitId} className={`relative border p-6 rounded-3xl flex flex-col justify-between h-56 transition-all ${isPublished ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-dashed border-slate-200 opacity-60'}`}>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isPublished ? 'text-indigo-500' : 'text-slate-400'}`}>Unidad {unitNumber}</span>
                          {isPublished && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase rounded-md border border-emerald-100">Publicada</span>}
                        </div>
                        {isPublished ? (
                          <>
                            <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2 line-clamp-2">{unit.title}</h4>
                            <div className="flex items-baseline gap-2"><span className="text-xs font-bold text-slate-400 tracking-widest">v{unit.metadata?.version || '1.0.0'}</span></div>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400 italic py-4">Pendiente de carga de contenido JSON.</p>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-50">
                        <button onClick={() => { if (isPublished) setUpdatingUnitId(unitId); else setIsCreatingNew(true); }} className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isPublished ? 'bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'}`}>
                          {isPublished ? 'Actualizar JSON' : 'Cargar Unidad'}
                        </button>
                      </div>
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
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Lista de Alumnos y Avance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estudiante</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Curso</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Avance</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{student.profile.full_name}</div>
                      <div className="text-[10px] text-slate-400">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{student.profile.course_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden max-w-[80px]"><div className="bg-slate-900 h-full w-[10%]"></div></div>
                        <span className="text-[10px] font-bold text-slate-600">10%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-bold text-slate-900 hover:underline uppercase tracking-widest">Ver Perfil</button>
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
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Gestión de Inscripciones</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estudiante</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Asignatura</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enrollRequests.map(req => {
                  const student = MOCK_USERS.find(u => u.id === req.user_id);
                  const subject = subjects.find(s => String(s.id) === String(req.subject_id));
                  return (
                    <tr key={req.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{student?.profile.full_name || 'Estudiante'}</div>
                        <div className="text-[10px] text-slate-400">{student?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{subject?.name || req.subject_id}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.APPROVED)} className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-bold uppercase rounded">Aprobar</button>
                          <button onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.DENIED)} className="px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase rounded border border-rose-100">Denegar</button>
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
