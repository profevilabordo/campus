import React, { useState } from 'react';
import { supabase } from '../supabase';

interface AuthProps {
  onSession: (session: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onSession }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        alert('Revisá tu email para confirmar el registro.');
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.session) onSession(data.session);
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4">
            CV
          </div>
          <h1 className="text-2xl font-black text-white">Bienvenido al Campus</h1>
          <p className="text-slate-400 text-sm mt-2">Ingresá tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600
                         focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 focus:outline-none transition-all"
              placeholder="tu@colegio.edu.ar"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600
                         focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/40 text-rose-200 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs
                       bg-white text-black hover:opacity-90 transition-all shadow-lg
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isSignUp ? (
              'Crear cuenta'
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isSignUp ? '¿Ya tenés cuenta? Ingresá acá' : '¿Sos nuevo? Registrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
