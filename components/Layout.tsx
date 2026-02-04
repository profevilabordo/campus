
import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-bold text-xl tracking-tight text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center text-xs">CV</span>
              Campus <span className="text-slate-400 font-light">·</span> Cuaderno Vivo
            </a>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-800">{user.profile.full_name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {user.profile.role === UserRole.TEACHER ? 'Docente' : 'Alumno'}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block"></div>
                <button 
                  onClick={onLogout}
                  className="text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700 transition-colors"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
        {(title || subtitle) && (
          <div className="bg-slate-50 border-b border-slate-200 py-3 px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-sm font-semibold text-slate-700">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 no-print">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Campus · Cuaderno Vivo</p>
          <p className="text-sm text-slate-500 italic serif">"No es un repositorio, es un camino de lectura."</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
