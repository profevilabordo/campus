
import React, { useState } from 'react';
import { COURSES, SUBJECTS, MOCK_USERS, UNIT_CONTENT } from '../data';
import { UserRole, Unit } from '../types';
import UnitUpdatePortal from '../components/UnitUpdatePortal';

interface TeacherDashboardProps {
  units: Record<string, Unit>;
  onUpdateUnit: (newUnit: Unit) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ units, onUpdateUnit }) => {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[6].id); // 4D
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null);
  // Fix: Access role and course_id through the profile property
  const students = MOCK_USERS.filter(u => u.profile.role === UserRole.STUDENT && u.profile.course_id === selectedCourse);

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
          <p className="text-slate-500 mt-1">Seguimiento de procesos, notas y devoluciones.</p>
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
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar CSV
          </button>
        </div>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Gestión de Contenidos (JSON)</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Fix: Explicitly type 'unit' as 'Unit' to avoid 'unknown' property access errors */}
          {Object.values(units).map((unit: Unit) => (
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
                    {/* Fix: Access full_name via profile property */}
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Cargar Devolución Grupal</h3>
          <p className="text-sm text-slate-500 mb-4">Este mensaje será visible para todos los alumnos del curso seleccionado.</p>
          <textarea 
            placeholder="Escribí aquí tu orientación pedagógica para el grupo..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
          ></textarea>
          <div className="mt-4 flex justify-end">
            <button className="px-6 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">Guardar Borrador</button>
            <button className="ml-3 px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors">Publicar</button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Resumen de Asignatura</h3>
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Unidades Activas:</span>
              <span className="font-bold text-slate-900">1 de 3</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Promedio General Auto Tests:</span>
              <span className="font-bold text-slate-900">7.2</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">TPs Pendientes de Corrección:</span>
              <span className="font-bold text-slate-900">12</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;
