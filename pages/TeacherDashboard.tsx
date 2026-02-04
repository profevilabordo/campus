
import React, { useState } from 'react';
import { COURSES, SUBJECTS, MOCK_USERS } from '../data';
import { UserRole, Unit, EnrollmentRequest, EnrollmentStatus } from '../types';
import UnitUpdatePortal from '../components/UnitUpdatePortal';

interface TeacherDashboardProps {
  units: Record<string, Unit>;
  enrollRequests: EnrollmentRequest[];
  onUpdateEnrollRequest: (id: string, status: EnrollmentStatus) => void;
  onUpdateUnit: (newUnit: Unit) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ units, enrollRequests, onUpdateEnrollRequest, onUpdateUnit }) => {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[6].id);
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'progress' | 'enrollments'>('progress');
  
  const students = MOCK_USERS.filter(u => 
    u.profile.role === UserRole.STUDENT && u.profile.course_id === selectedCourse
  );

  const pendingRequests = enrollRequests.filter(r => r.status === EnrollmentStatus.PENDING);

  const activeUnitToUpdate = updatingUnitId ? units[updatingUnitId] : null;

  return (
    <div className="space-y-10 pb-20">
      {activeUnitToUpdate && (
        <UnitUpdatePortal 
          currentUnit={activeUnitToUpdate}
          onCancel={() => setUpdatingUnitId(null)}
          onUpdate={(newUnit) => {
            onUpdateUnit(newUnit);
            setUpdatingUnitId(null);
          }}
        />
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel Docente</h1>
          <p className="text-slate-500 mt-1">Seguimiento de procesos y gestión de acceso.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {COURSES.map(c => (
              <option key={c.id} value={c.id}>
                {c.grade_level} "{c.division}" - {c.orientation || 'Técnica'}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('progress')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'progress' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Progreso Académico
        </button>
        <button 
          onClick={() => setActiveTab('enrollments')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'enrollments' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Admisiones {pendingRequests.length > 0 && <span className="bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{pendingRequests.length}</span>}
        </button>
      </div>

      {activeTab === 'enrollments' && (
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Gestión de Admisiones e Inscripciones</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estudiante / Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Asignatura</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado Actual</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enrollRequests.length > 0 ? enrollRequests.map(req => {
                  const student = MOCK_USERS.find(u => u.id === req.student_id);
                  const subject = SUBJECTS.find(s => s.id === req.subject_id);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{student?.profile.full_name || 'Desconocido'}</div>
                        <div className="text-xs text-slate-400">{student?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">{subject?.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter rounded border ${
                          req.status === EnrollmentStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          req.status === EnrollmentStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {req.status === EnrollmentStatus.PENDING ? 'Pendiente' : req.status === EnrollmentStatus.APPROVED ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === EnrollmentStatus.PENDING ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.APPROVED)}
                              className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded hover:bg-emerald-700 transition-colors"
                            >
                              Aprobar
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm("¿Seguro que querés denegar esta solicitud? Se enviará un email automático al estudiante.")) {
                                  onUpdateEnrollRequest(req.id, EnrollmentStatus.DENIED);
                                }
                              }}
                              className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold uppercase rounded hover:bg-rose-100 transition-colors"
                            >
                              Denegar
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => onUpdateEnrollRequest(req.id, EnrollmentStatus.PENDING)}
                            className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-900"
                          >
                            Resetear estado
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No hay solicitudes registradas aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'progress' && (
        <>
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Gestión de Contenidos (JSON)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(units).map((unit) => (
                <div key={unit.id} className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Unidad {unit.number}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Versión {unit.metadata?.version || '1.0.0'}</p>
                  </div>
                  <button 
                    onClick={() => setUpdatingUnitId(unit.id)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all"
                  >
                    Actualizar JSON
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estudiante</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Progreso U1</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Última Actividad</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Auto Test</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.length > 0 ? students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{student.profile.full_name}</div>
                        <div className="text-xs text-slate-400">ID: {student.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                            <div className="bg-emerald-500 h-full w-[60%]"></div>
                          </div>
                          <span className="text-xs font-bold text-slate-600">60%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">Pausas de pensamiento</div>
                        <div className="text-[10px] text-slate-400">Hoy, 14:32</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">8.5/10</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-wider">Ver Perfil</button>
                          <button className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors uppercase tracking-wider">Cargar Nota</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No hay estudiantes cargados en esta división.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
