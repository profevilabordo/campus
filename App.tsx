
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, UserRole, Subject, DBUnit, ProgressRecord, Unit, EnrollmentRequest, EnrollmentStatus, Profile, Assessment } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { SUBJECTS, MOCK_USERS, UNIT_CONTENT } from './data';
import Layout from './components/Layout';
import Auth from './components/Auth';
import CampusHome from './pages/CampusHome';
import SubjectPage from './pages/SubjectPage';
import UnitPage from './pages/UnitPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

const TIMEOUT_MS = 10000;

// Fix: Use function keyword instead of arrow function for generics to avoid TSX ambiguity
async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT_${label}`)), TIMEOUT_MS)
    ),
  ]);
}

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);
  
  const isFetchingProfile = useRef(false);
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [dbUnits, setDbUnits] = useState<DBUnit[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressRecord[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const [view, setView] = useState<'home' | 'subject' | 'unit' | 'teacher' | 'student'>('home');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  // Fix: useMemo result typing
  const unitsMap = useMemo(() => {
    const map: Record<string, Unit> = { ...UNIT_CONTENT };
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

  const removeLoader = () => {
    const l = document.getElementById('fallback-loader');
    if (l) { 
      l.style.opacity = '0'; 
      setTimeout(() => l.remove(), 400); 
    }
  };

  // Fix: Define handleUpdateUnit function which was missing
  const handleUpdateUnit = async (newUnit: Unit) => {
    if (demoMode) {
      const exists = dbUnits.find(u => u.id === newUnit.id);
      if (exists) {
        setDbUnits(dbUnits.map(u => u.id === newUnit.id ? { ...u, title: newUnit.title, content_json: newUnit } as any : u));
      } else {
        setDbUnits([...dbUnits, { 
          id: newUnit.id, 
          subject_id: Number(newUnit.subject_id) || 0, 
          unit_number: newUnit.number, 
          title: newUnit.title, 
          content_json: newUnit 
        } as any]);
      }
      return;
    }
    try {
      const { error: updateError } = await supabase.from('units').upsert({
        id: newUnit.id,
        subject_id: newUnit.subject_id,
        unit_number: newUnit.number,
        title: newUnit.title,
        content_json: newUnit
      });
      if (updateError) throw updateError;
      if (currentUser) {
        await loadUserData(currentUser.id, currentUser.email);
      }
    } catch (err: any) {
      alert("Error al actualizar unidad: " + err.message);
    }
  };

  const loadUserData = async (userId: string, email: string) => {
    if (isFetchingProfile.current) return;
    isFetchingProfile.current = true;

    try {
      const { data: prof, error: profError } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).single(),
        "AUTH_PROFILE_SELECT"
      );

      let finalProfile: Profile;

      if (profError) {
        if (profError.code === 'PGRST116') {
          console.log("AUTH_PROFILE_NOT_FOUND: Creating basic student profile...");
          const newProf = { 
            id: userId, 
            full_name: email.split('@')[0], 
            role: UserRole.STUDENT 
          };
          const { error: upsertError } = await withTimeout(
            supabase.from('profiles').upsert(newProf),
            "AUTH_PROFILE_UPSERT"
          );
          if (upsertError) {
            console.error("AUTH_PROFILE_UPSERT_FAILED", upsertError);
            throw upsertError;
          }
          finalProfile = newProf as any;
        } else {
          console.error("AUTH_PROFILE_SELECT_FAILED", profError);
          throw profError;
        }
      } else {
        const normalizedRole = (prof.role || UserRole.STUDENT).toLowerCase() as UserRole;
        finalProfile = { ...prof, role: normalizedRole };
      }

      setCurrentUser({ id: userId, email, profile: finalProfile });
      const isTeacher = finalProfile.role === UserRole.TEACHER;

      const fetchSafe = async (label: string, query: any) => {
        try {
          const { data, error: fetchErr } = await withTimeout(query, label);
          if (fetchErr) {
            console.warn(`${label}_FAILED_NON_CRITICAL`, fetchErr.message);
            return [];
          }
          return data || [];
        } catch (e: any) {
          console.warn(`${label}_TIMEOUT_NON_CRITICAL`, e.message);
          return [];
        }
      };

      const [subjs, unts, enrl, prog, asss, profs] = await Promise.all([
        fetchSafe('FETCH_SUBJECTS', supabase.from('subjects').select('*')),
        fetchSafe('FETCH_UNITS', supabase.from('units').select('*')),
        fetchSafe('FETCH_ENROLLMENTS', supabase.from('enrollment_requests').select('*')),
        fetchSafe('FETCH_PROGRESS', isTeacher ? supabase.from('progress').select('*') : supabase.from('progress').select('*').eq('user_id', userId)),
        fetchSafe('FETCH_ASSESSMENTS', isTeacher ? supabase.from('assessments').select('*') : supabase.from('assessments').select('*').eq('student_id', userId)),
        isTeacher ? fetchSafe('FETCH_PROFILES', supabase.from('profiles').select('*')) : Promise.resolve([])
      ]);

      if (subjs.length) setSubjects(subjs);
      setDbUnits(unts);
      setEnrollRequests(enrl);
      setUserProgress(prog);
      setAssessments(asss);
      setAllProfiles(profs);

    } catch (err: any) {
      console.error("❌ LOAD_USER_DATA_CRITICAL_FAIL:", err.message);
      setError(`Error de sincronización: ${err.message}. Por favor, reintentá.`);
    } finally {
      isFetchingProfile.current = false;
      setLoading(false);
      removeLoader();
    }
  };

useEffect(() => {
  console.log("🟦 APP_USEEFFECT_START", { isSupabaseConfigured });

  // 🔥 CORTA-SPINNER: si en 12s no terminó, muestro error y saco loader sí o sí
  const hardStop = setTimeout(() => {
    console.error("🟥 HARD_STOP_LOADING: no terminó init en 12s");
    setError("La app quedó colgada en sincronización. Abrí consola (F12) y copiá el primer error rojo.");
    setLoading(false);
    removeLoader();
  }, 12000);

  const init = async () => {
    try {
      console.log("🟦 INIT_START");
      const { data, error: sessionError } = await withTimeout(supabase.auth.getSession(), "AUTH_SESSION");
      console.log("🟦 AUTH_SESSION_RETURNED", { hasSession: !!data?.session, sessionError });

      if (sessionError) throw sessionError;

      const s = data?.session;
      if (s) {
        console.log("🟦 SESSION_OK", { userId: s.user?.id, email: s.user?.email });
        setSession(s);
        await loadUserData(s.user.id, s.user.email!);
        console.log("🟩 LOAD_USER_DATA_DONE");
      } else if (!isSupabaseConfigured) {
        throw new Error("DEMO_REQUIRED");
      } else {
        console.log("🟦 NO_SESSION");
        setLoading(false);
        removeLoader();
      }
    } catch (e: any) {
      console.error("🛡️ INIT_FAILED:", e?.message || e);
      if (e.message === "DEMO_REQUIRED" || !isSupabaseConfigured) {
        setDemoMode(true);
        const demoUser = MOCK_USERS[1];
        setCurrentUser(demoUser);
        setSession({ user: demoUser });
        setLoading(false);
        removeLoader();
      } else {
        setError(e?.message || String(e));
        setLoading(false);
        removeLoader();
      }
    } finally {
      clearTimeout(hardStop);
      console.log("🟦 INIT_FINALLY");
    }
  };

  init();
}, []);


  const handleEnroll = async (sId: string, code?: string) => {
    try {
      if (!currentUser) return;
      if (demoMode) {
        setEnrollRequests([...enrollRequests, { 
          id: 'd'+Math.random(), 
          student_id: currentUser.id, 
          course_id: sId, 
          status: EnrollmentStatus.PENDING 
        }]);
        return;
      }
      const { error: enrollErr } = await withTimeout(
        supabase.from('enrollment_requests').upsert({ 
          student_id: currentUser.id, 
          course_id: sId,
          enrollment_code: code || '',
          status: 'pending' 
        }),
        "ENROLLMENT_INSERT"
      );
      if (enrollErr) throw enrollErr;
      await loadUserData(currentUser.id, currentUser.email);
    } catch (err: any) {
      console.error("ENROLLMENT_FAILED", err.message);
      alert(`Error al inscribirse: ${err.message}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-white font-black text-2xl uppercase tracking-tighter">Error de Conexión</h1>
          <p className="text-slate-400 serif italic">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-sky-400 transition-all">Reintentar</button>
        </div>
      </div>
    );
  }

  if (loading) return null;
  if (!session && !demoMode) return <Auth onSession={(s) => { setSession(s); loadUserData(s.user.id, s.user.email!); }} />;

  const isApproved = (sId: string) => 
    currentUser?.profile.role === UserRole.TEACHER || 
    enrollRequests.some(r => String(r.course_id) === String(sId) && r.student_id === currentUser?.id && r.status === 'approved');

  return (
    <Layout user={currentUser} onLogout={() => { if(demoMode) window.location.reload(); else supabase.auth.signOut().then(() => window.location.reload()); }}>
      {demoMode && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-sky-500 text-black text-[10px] font-black px-4 py-1 rounded-full border-2 border-slate-900 shadow-2xl">MODO DEMO</div>}
      
      {view === 'home' && (
        <CampusHome 
          userRole={currentUser?.profile.role} 
          enrollRequests={enrollRequests.filter(r => r.student_id === currentUser?.id).map(r => ({ ...r, user_id: r.student_id, subject_id: r.course_id }))} 
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }} 
          onEnroll={(id) => handleEnroll(id)} 
          onCancelEnroll={() => {}} 
        />
      )}
      
      {view === 'subject' && activeSubjectId && (
        <SubjectPage 
          subject={subjects.find(s => String(s.id) === activeSubjectId)!} 
          isApproved={isApproved(activeSubjectId)} 
          userCourseId={currentUser?.profile.course_id} 
          availableUnits={Object.values(unitsMap).filter(u => String(u.subject_id) === activeSubjectId)} 
          onSelectUnit={(id) => { setActiveUnitId(id); setView('unit'); }} 
          onBack={() => setView('home')} 
        />
      )}
      
      {view === 'unit' && activeUnitId && (
        <UnitPage 
          unit={unitsMap[activeUnitId]} 
          progress={userProgress.filter(p => p.user_id === currentUser?.id)} 
          onUpdateProgress={() => {}} 
          onBack={() => setView('subject')} 
        />
      )}
      
      {view === 'teacher' && (
        <TeacherDashboard 
          subjects={subjects} 
          units={unitsMap} 
          enrollRequests={enrollRequests.map(r => ({ ...r, user_id: r.student_id, subject_id: r.course_id }))} 
          progressRecords={userProgress} 
          profiles={allProfiles} 
          onUpdateEnrollRequest={async (id, status) => {
            await supabase.from('enrollment_requests').update({ status }).eq('id', id);
            if (currentUser) {
              await loadUserData(currentUser.id, currentUser.email);
            }
          }} 
          onUpdateUnit={handleUpdateUnit} 
        />
      )}
      
      {view === 'student' && (
        <StudentDashboard 
          user={currentUser!} 
          progress={userProgress.filter(p => p.user_id === currentUser?.id)} 
          assessments={assessments} 
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }} 
        />
      )}

      <button onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')} className="fixed bottom-8 right-8 p-5 bg-sky-500 rounded-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all border-4 border-slate-900 group">
        <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </button>
    </Layout>
  );
};

export default App;
