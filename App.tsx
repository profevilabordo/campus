
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Subject, DBUnit, ProgressRecord, Unit, EnrollmentRequest, EnrollmentStatus, Profile } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { UNIT_CONTENT, SUBJECTS, MOCK_USERS } from './data';
import Layout from './components/Layout';
import Auth from './components/Auth';
import CampusHome from './pages/CampusHome';
import SubjectPage from './pages/SubjectPage';
import UnitPage from './pages/UnitPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);
  
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [dbUnits, setDbUnits] = useState<DBUnit[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressRecord[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<EnrollmentRequest[]>([]);
  
  const [view, setView] = useState<'home' | 'subject' | 'unit' | 'teacher' | 'student'>('home');
  const [activeSubjectId, setActiveSubjectId] = useState<string | number | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  // Mapeo inteligente de unidades (Estático + DB)
  const unitsMap = useMemo(() => {
    const map: Record<string, Unit> = {};
    // Primero cargamos el contenido estático por defecto
    Object.values(UNIT_CONTENT).forEach(u => map[u.id] = u);
    // Luego sobreescribimos con lo que venga de la base de datos si existe
    dbUnits.forEach(u => {
      map[u.id] = {
        id: u.id,
        subject_id: String(u.subject_id),
        number: u.unit_number,
        title: u.title,
        description: u.content_json?.description || '',
        blocks: u.content_json?.blocks || [],
        metadata: u.content_json?.metadata || { version: "1.0", updated_at: new Date().toISOString() },
        pdfBaseUrl: u.content_json?.pdfBaseUrl,
        pdfPrintUrl: u.content_json?.pdfPrintUrl
      };
    });
    return map;
  }, [dbUnits]);

  useEffect(() => {
    const initApp = async () => {
      if (!isSupabaseConfigured) {
        console.warn("⚠️ Supabase no configurado. Iniciando en MODO DEMO LOCAL.");
        setDemoMode(true);
        // En modo demo, usamos el primer usuario mock como sesión activa
        const mockUser = MOCK_USERS[1]; // Profesor por defecto para facilitar pruebas
        setCurrentUser(mockUser);
        setSession({ user: mockUser });
        setLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession) {
          await fetchAllData(currentSession.user);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError("Error de inicialización: " + err.message);
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const fetchAllData = async (user: any) => {
    try {
      // 1. Perfil del usuario actual
      const { data: profile, error: profErr } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profErr) throw profErr;
      setCurrentUser({ id: user.id, email: user.email, profile });

      // 2. Si es docente, bajar perfiles
      if (profile.role === UserRole.TEACHER) {
        const { data: profiles } = await supabase.from('profiles').select('*');
        setAllProfiles(profiles || []);
      }

      // 3. Paralelizar carga de datos restantes
      const [subsRes, unitsRes, enrollsRes, progRes] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('units').select('*').order('unit_number', { ascending: true }),
        supabase.from('enrollments').select('*'),
        supabase.from('progress').select('*').eq('user_id', user.id)
      ]);

      if (subsRes.data) {
        const merged = [...SUBJECTS];
        subsRes.data.forEach(s => {
          const idx = merged.findIndex(as => String(as.id) === String(s.id));
          if (idx !== -1) merged[idx] = { ...merged[idx], ...s };
          else merged.push(s);
        });
        setSubjects(merged);
      }

      setDbUnits(unitsRes.data || []);
      setEnrollRequests(enrollsRes.data || []);
      setUserProgress(progRes.data || []);
      setLoading(false);
    } catch (err: any) {
      console.error("Error cargando el laboratorio:", err);
      setError("La conexión con el Campus falló. " + err.message);
      setLoading(false);
    }
  };

  const handleEnroll = async (subjectId: string) => {
    if (demoMode) {
      alert("En Modo Demo, las inscripciones se aprueban instantáneamente.");
      setEnrollRequests([...enrollRequests, { id: Math.random().toString(), user_id: currentUser!.id, subject_id: subjectId, status: EnrollmentStatus.APPROVED }]);
      return;
    }
    try {
      const { error } = await supabase.from('enrollments').insert({
        user_id: currentUser!.id,
        subject_id: subjectId,
        status: EnrollmentStatus.PENDING
      });
      if (error) throw error;
      const { data: enrolls } = await supabase.from('enrollments').select('*');
      setEnrollRequests(enrolls || []);
      alert("Solicitud de acceso enviada.");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#0f172a] text-white">
      <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden mb-8">
        <div className="w-1/2 h-full bg-sky-500 animate-[loading_1.5s_infinite_ease-in-out]"></div>
      </div>
      <p className="font-black uppercase tracking-[0.4em] text-[10px] text-sky-400 animate-pulse">Iniciando Ecosistema...</p>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
    </div>
  );

  // Si hay error pero no estamos en demo mode, mostramos pantalla de diagnóstico
  if (error && !demoMode) return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#020617] text-white p-10 text-center">
      <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mb-10">
        <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Terminal de Diagnóstico</h2>
      <p className="text-slate-400 serif italic max-w-md mb-10 leading-relaxed">{error}</p>
      <div className="flex gap-4">
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-sky-400 transition-all">Reintentar</button>
        <button onClick={() => { setError(null); setDemoMode(true); }} className="px-8 py-4 bg-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:text-white transition-all">Forzar Modo Demo</button>
      </div>
    </div>
  );

  if (!session && !demoMode) return <Auth onSession={(s) => { setSession(s); fetchAllData(s.user); }} />;

  const currentEnrollStatus = enrollRequests.find(r => 
    String(r.subject_id) === String(activeSubjectId) && 
    r.user_id === currentUser?.id
  )?.status || EnrollmentStatus.NONE;

  const isApproved = currentUser?.profile.role === UserRole.TEACHER || currentEnrollStatus === EnrollmentStatus.APPROVED;

  return (
    <Layout user={currentUser} onLogout={() => { 
      if (demoMode) { window.location.reload(); } 
      else { supabase.auth.signOut(); }
    }}>
      {demoMode && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] no-print">
          <span className="bg-amber-500 text-black text-[9px] font-black uppercase px-6 py-2 rounded-full shadow-2xl border-4 border-[#0f172a]">Modo Demo Local Activo</span>
        </div>
      )}

      {view === 'home' && (
        <CampusHome 
          userRole={currentUser?.profile.role}
          enrollRequests={enrollRequests.filter(r => r.user_id === currentUser?.id)}
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }}
          onEnroll={handleEnroll}
          onCancelEnroll={async (id) => {
             if (demoMode) { setEnrollRequests(enrollRequests.filter(r => r.id !== id)); }
             else { await supabase.from('enrollments').delete().eq('id', id); setEnrollRequests(enrollRequests.filter(r => r.id !== id)); }
          }}
        />
      )}

      {view === 'subject' && activeSubjectId && (
        <SubjectPage 
          subject={subjects.find(s => String(s.id) === String(activeSubjectId))!}
          isApproved={isApproved}
          userCourseId={currentUser?.profile.course_id}
          availableUnits={Object.values(unitsMap).filter(u => String(u.subject_id) === String(activeSubjectId))}
          onSelectUnit={(id) => { setActiveUnitId(id); setView('unit'); }}
          onBack={() => setView('home')}
        />
      )}

      {view === 'unit' && activeUnitId && unitsMap[activeUnitId] && (
        <UnitPage 
          unit={unitsMap[activeUnitId]}
          progress={userProgress.filter(p => p.user_id === currentUser?.id)}
          onUpdateProgress={async (blockId) => {
            const existing = userProgress.find(p => p.block_id === blockId && p.user_id === currentUser?.id);
            if (existing) {
              if (!demoMode) await supabase.from('progress').delete().eq('id', existing.id);
              setUserProgress(userProgress.filter(p => p.id !== existing.id));
            } else {
              const newProg = { id: Math.random(), user_id: currentUser!.id, block_id: blockId, subject_id: String(activeSubjectId), visited: true, status: 'completed', completed_at: new Date().toISOString(), course_id: 0 };
              if (!demoMode) {
                const { data } = await supabase.from('progress').insert({ user_id: currentUser!.id, block_id: blockId, subject_id: String(activeSubjectId), visited: true }).select().single();
                if (data) setUserProgress([...userProgress, data]);
              } else {
                setUserProgress([...userProgress, newProg as any]);
              }
            }
          }} 
          onBack={() => setView('subject')}
        />
      )}

      {view === 'teacher' && (
        <TeacherDashboard 
          subjects={subjects}
          units={unitsMap} 
          enrollRequests={enrollRequests} 
          progressRecords={userProgress}
          profiles={demoMode ? MOCK_USERS.map(u => u.profile) : allProfiles}
          onUpdateEnrollRequest={async (id, status) => {
            if (!demoMode) await supabase.from('enrollments').update({ status }).eq('id', id);
            setEnrollRequests(enrollRequests.map(r => r.id === id ? { ...r, status } : r));
          }} 
          onUpdateUnit={(unit) => {
            // En demo mode, solo actualizamos el map local. En real, llamamos a handleUpdateUnit de App
            if (demoMode) {
              setDbUnits([...dbUnits, { id: unit.id, subject_id: Number(unit.subject_id), unit_number: unit.number, title: unit.title, content_json: unit }]);
              alert("Unidad simulada en memoria local.");
            } else {
              // Lógica de persistencia real
              supabase.from('units').upsert({
                id: unit.id,
                subject_id: isNaN(Number(unit.subject_id)) ? 0 : Number(unit.subject_id),
                unit_number: unit.number,
                title: unit.title,
                content_json: unit
              }).then(() => {
                supabase.from('units').select('*').then(res => setDbUnits(res.data || []));
                alert("Cuaderno guardado en la nube.");
              });
            }
          }}
        />
      )}

      {view === 'student' && currentUser && (
        <StudentDashboard 
          user={currentUser} 
          progress={userProgress.filter(p => p.user_id === currentUser?.id)} 
          assessments={[]} 
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }}
        />
      )}

      {/* Control Maestro: Accesos Directos */}
      <div className="fixed bottom-10 right-10 no-print z-[70] flex flex-col gap-4">
        {currentUser?.profile.role === UserRole.TEACHER && (
          <button 
            onClick={() => setView('teacher')}
            className={`p-6 rounded-2xl shadow-2xl transition-all border-4 border-slate-900 group ${view === 'teacher' ? 'bg-white text-black scale-110' : 'bg-sky-500 text-white hover:scale-105'}`}
            title="Laboratorio Docente"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </button>
        )}
        <button 
          onClick={() => setView('home')}
          className={`p-6 rounded-2xl shadow-2xl transition-all border-4 border-slate-900 group ${view === 'home' ? 'bg-white text-black scale-110' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          title="Ecosistema Principal"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
      </div>
    </Layout>
  );
};

export default App;
