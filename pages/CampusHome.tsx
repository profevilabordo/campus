
import React, { useState } from 'react';
import { SUBJECTS, SCHOOLS } from '../data';

interface CampusHomeProps {
  onSelectSubject: (id: string) => void;
}

const CampusHome: React.FC<CampusHomeProps> = ({ onSelectSubject }) => {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <div className="space-y-12 pb-20">
      <section className="text-center py-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Campus · Cuaderno Vivo</h1>
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-lg text-slate-600 serif italic leading-relaxed">
            "Este no es un sitio para descargar archivos. Es un lugar para aprender a leer, a pensar críticamente y a construir un recorrido propio."
          </p>
          <div className="h-1 w-20 bg-slate-200 mx-auto rounded-full"></div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto space-y-4 no-print">
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button 
            onClick={() => setShowHowTo(!showHowTo)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-700">Cómo usar este Campus</span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showHowTo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showHowTo && (
            <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed space-y-3 border-t border-slate-100 pt-4">
              <p>1. Entrá a tu materia y seleccioná la unidad activa.</p>
              <p>2. Descargá el <strong>PDF Base</strong>; es tu texto central de estudio.</p>
              <p>3. Recorré los bloques en orden. Cada uno tiene una función: el Umbral te prepara, el Núcleo te guía en el PDF, las Pausas te invitan a pensar.</p>
              <p>4. No corras. Marcá tus avances y volvé cuando necesites.</p>
            </div>
          )}
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Si necesitás imprimir</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Cada unidad tiene una versión diseñada específicamente para impresión, con márgenes amplios y tipografía legible para facilitar la toma de notas a mano. Buscá el botón "Descargar Unidad Imprimible".
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Mis Asignaturas</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBJECTS.map((subject) => (
            <button 
              key={subject.id}
              onClick={() => onSelectSubject(subject.id)}
              className="group bg-white border border-slate-200 p-6 rounded-2xl text-left hover:border-slate-400 hover:shadow-md transition-all flex flex-col justify-between h-48"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-900 transition-colors"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600">{subject.units_count} Unidades</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors leading-snug">{subject.name}</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 group-hover:text-slate-500 font-medium">Ver programa y contenidos</span>
                <svg className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CampusHome;
