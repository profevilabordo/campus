
import React from 'react';
import { Subject } from '../types';

interface SubjectPageProps {
  subject: Subject;
  isApproved: boolean;
  userCourseId?: string;
  onSelectUnit: (unitId: string) => void;
  onBack: () => void;
}

const SubjectPage: React.FC<SubjectPageProps> = ({ subject, isApproved, userCourseId, onSelectUnit, onBack }) => {
  const orientationNote = userCourseId && subject.orientation_notes ? subject.orientation_notes[userCourseId] : null;

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-4">
        <button onClick={onBack} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-colors no-print">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Volver al Home
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">{subject.name}</h1>
          <p className="text-lg text-slate-500 serif italic mt-2">Sentido y recorrido pedagógico de la asignatura.</p>
        </div>
      </header>

      {!isApproved && (
        <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-800">Acceso Restringido</h3>
            <p className="text-sm text-slate-500 mt-2">Todavía no tenés acceso a los contenidos de esta materia. Tu solicitud de inscripción debe ser aprobada por el docente.</p>
            <button onClick={onBack} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">Volver al Home</button>
          </div>
        </div>
      )}

      {isApproved && (
        <>
          {orientationNote && (
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Nota de Orientación</h4>
              <p className="text-indigo-800 serif leading-relaxed">{orientationNote}</p>
            </div>
          )}

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2">Estructura de Unidades</h2>
              
              <div className="space-y-4">
                <button 
                  onClick={() => onSelectUnit("economia_1")}
                  className="w-full text-left bg-white border border-slate-200 p-6 rounded-2xl hover:border-slate-900 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-4xl font-black text-slate-100 group-hover:text-slate-900 transition-colors">01</span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-slate-900">Sistemas Económicos y Escasez</h3>
                      <p className="text-sm text-slate-500 mt-1">Disponible ahora</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-6 no-print">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2">Descargas Rápidas</h2>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidad 1</p>
                  <a href="#" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                    PDF Base Teórico
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                    Unidad Imprimible
                  </a>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default SubjectPage;
