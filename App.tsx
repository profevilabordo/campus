import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  UserRole,
  Subject,
  DBUnit,
  ProgressRecord,
  Unit,
  EnrollmentStatus,
  Profile,
  Assessment
} from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import Layout from './components/Layout';
import Auth from './components/Auth';
import CampusHome from './pages/CampusHome';
import SubjectPage from './pages/SubjectPage';
import UnitPage from './pages/UnitPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CompleteProfile from './pages/CompleteProfile';



const TIMEOUT_MS = 10000;

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT_${label}`)), TIMEOUT_MS)
    ),
  ]);
}

const App: React.FC = () => {
  const isProfileComplete = (p: any) => {
  return (
    p &&
    String(p.first_name || '').trim() &&
    String(p.last_name || '').trim() &&
    String(p.dni || '').trim() &&
    p.birth_date &&
    String(p.address || '').trim() &&
    String(p.city || '').trim()
  );
};

  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  // ✅ Guard: si no hay config, no llamamos supabase
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full card-surface p-6 rounded-2xl">
          <h1 className="text-white font-black text-xl uppercase tracking-tight mb-2">Config requerida</h1>
          <p className="text-slate-300 text-sm">
            Supabase no está configurado. Revisá las variables de entorno en Vercel (URL y ANON KEY).
          </p>
        </div>
      </div>
    );
  }

  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFetchingProfile = useRef(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dbUnits, setDbUnits] = useState<DBUnit[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressRecord[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const [view, setView] = useState<'home' | 'subject' | 'unit' | 'teacher' | 'student'>('home');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  const unitsMap = useMemo(() => {
    const map: Record<string, Unit> = {};

    (dbUnits || []).forEach((row: any) => {
      const raw = row?.content_json ?? {};
      const unitId = raw.id ?? row.id;
      if (!unitId) return;

      const subjectId = raw.subject_id ?? row.subject_id;
      const number = raw.number ?? row.number;
      const title = raw.title ?? row.title;

      map[String(unitId)] = {
        id: String(unitId),
        subject_id: String(subjectId),
        number: Number(number) || 0,
        title: String(title || ''),
        description: raw.description || '',
        isAvailable: raw.isAvailable ?? true,
        pdfBaseUrl: raw.pdfBaseUrl || '#',
        pdfPrintUrl: raw.pdfPrintUrl || '#',
        metadata:
          raw.metadata || {
            version: '1.0.0',
            updated_at: new Date().toISOString(),
            change_note: ''
          },
        blocks: raw.blocks || []
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

  const handleUpdateUnit = async (newUnit: Unit) => {
    try {
      const { error: updateError } = await supabase.from('units').upsert({
        id: newUnit.id,
        subject_id: newUnit.subject_id,
        number: newUnit.number,
        title: newUnit.title,
        content_json: newUnit
      });

      if (updateError) throw updateError;

      if (currentUser) {
        await loadUserData(currentUser.id, currentUser.email);
      }
    } catch (err: any) {
      alert('Error al actualizar unidad: ' + err.message);
    }
  };

  const loadUserData = async (userId: string, email: string) => {
    if (isFetchingProfile.current) return;
    isFetchingProfile.current = true;

    try {
      const profRes = await withTimeout(
        supabase.from('profiles').select('*').eq('id', userId).single(),
        'AUTH_PROFILE_SELECT'
      );
      const { data: prof, error: profError } = profRes as unknown as { data: any; error: any };

      let finalProfile: Profile;

      if (profError) {
        if (profError.code === 'PGRST116') {
          const newProf: any = {
  id: userId,
  role: UserRole.STUDENT,      // ✅ fijo, nadie lo elige

  // ✅ nuevos campos de perfil (se completan luego)
  first_name: '',
  last_name: '',
  dni: '',
  birth_date: null,            // lo completan en "Completar Perfil"
  address: '',
  city: '',
  phone: null,

  // si tu Profile tiene course_id:
  course_id: null
};


          const upsertRes = await withTimeout(
            supabase.from('profiles').upsert(newProf),
            'AUTH_PROFILE_UPSERT'
          );
          const { error: upsertError } = upsertRes as unknown as { error: any };

          if (upsertError) throw upsertError;
          finalProfile = newProf as any;
        } else {
          throw profError;
        }
      } else {
        const normalizedRole = (prof.role || UserRole.STUDENT).toLowerCase() as UserRole;
        finalProfile = { ...prof, role: normalizedRole };
      }

      setCurrentUser({ id: userId, email, profile: finalProfile });
      const isTeacher = finalProfile.role === UserRole.TEACHER;

      const needsProfile = !isTeacher && !isProfileComplete(finalProfile);

if (needsProfile) {
  setView('profile');
}


      const fetchSafe = async (label: string, query: any) => {
        try {
          const fetchRes = await withTimeout(query, label);
          const { data, error: fetchErr } = fetchRes as unknown as { data: any; error: any };
          if (fetchErr) return [];
          return data || [];
        } catch {
          return [];
        }
      };

      const [subjs, unts, enrl, prog, asss, profs] = await Promise.all([
        fetchSafe('FETCH_SUBJECTS', supabase.from('subjects').select('*')),
        fetchSafe('FETCH_UNITS', supabase.from('units').select('*')),
        fetchSafe('FETCH_ENROLLMENTS', supabase.from('enrollment_requests').select('*')),
        fetchSafe(
          'FETCH_PROGRESS',
          isTeacher
            ? supabase.from('progress').select('*')
            : supabase.from('progress').select('*').eq('user_id', userId)
        ),
        fetchSafe(
          'FETCH_ASSESSMENTS',
          isTeacher
            ? supabase.from('assessments').select('*')
            : supabase.from('assessments').select('*').eq('student_id', userId)
        ),
        isTeacher ? fetchSafe('FETCH_PROFILES', supabase.from('profiles').select('*')) : Promise.resolve([])
      ]);

      // opcional: filtra "Economía" genérica
      if (subjs.length) {
        const cleaned = subjs.filter((s: any) => {
          const name = String(s?.name ?? '').trim().toLowerCase();
          return name !== 'economía' && name !== 'economia';
        });
        setSubjects(cleaned as any);
      } else {
        setSubjects([]);
      }

      setDbUnits(unts as any);
      setEnrollRequests(enrl);
      setUserProgress(prog);
      setAssessments(asss);
      setAllProfiles(profs);

    } catch (err: any) {
      setError(`Error de sincronización: ${err.message}. Por favor, reintentá.`);
    } finally {
      isFetchingProfile.current = false;
      setLoading(false);
      removeLoader();
    }
  };

  useEffect(() => {
    const hardStop = setTimeout(() => {
      setError('La app quedó colgada en sincronización. Abrí consola (F12) y copiá el primer error rojo.');
      setLoading(false);
      removeLoader();
    }, 12000);

    const init = async () => {
      try {
        const sessionRes = await withTimeout(supabase.auth.getSession(), 'AUTH_SESSION');
        const { data, error: sessionError } = sessionRes as unknown as { data: any; error: any };
        if (sessionError) throw sessionError;

        const s = data?.session;
        if (s) {
          setSession(s);
          await loadUserData(s.user.id, s.user.email!);
        } else {
          setLoading(false);
          removeLoader();
        }
      } catch (e: any) {
        setError(e?.message || String(e));
        setLoading(false);
        removeLoader();
      } finally {
        clearTimeout(hardStop);
      }
    };

    init();
  }, []);

 // 👉 Solicitar inscripción
const handleEnroll = async (subjectId: string) => {
  if (!currentUser) return;

  // 1️⃣ Feedback inmediato en UI (optimistic update)
  setEnrollRequests(prev => {
    const already = prev.some(r =>
      String(r.user_id) === String(currentUser.id) &&
      String(r.subject_id) === String(subjectId)
    );
    if (already) return prev;

    return [
      ...prev,
      {
        id: 'local-' + Math.random().toString(16).slice(2),
        user_id: currentUser.id,
        subject_id: Number(subjectId),
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];
  });

  setToast('✅ Solicitud recibida. En breve serás notificado.');

  try {
    const payload = {
      user_id: currentUser.id,
      subject_id: Number(subjectId),
      status: 'pending'
    };

    const { error } = await supabase
      .from('enrollment_requests')
      .upsert(payload, { onConflict: 'user_id,subject_id' });

    if (error) throw error;

    // sincroniza con BD real
    await loadUserData(currentUser.id, currentUser.email);

  } catch (err: any) {
    console.error('ENROLL_FAILED', err?.message);

    // revertir optimistic update si falla
    setEnrollRequests(prev =>
      prev.filter(r =>
        !(String(r.user_id) === String(currentUser.id) &&
          String(r.subject_id) === String(subjectId))
      )
    );

    setToast('❌ No se pudo enviar la solicitud.');
  }
};


// 👉 Cancelar inscripción
const handleCancelEnroll = async (requestId: string) => {
  if (!currentUser) return;

  // 1️⃣ Actualización inmediata en UI
  setEnrollRequests(prev =>
    prev.filter(r => String(r.id) !== String(requestId))
  );

  try {
    const { error } = await supabase
      .from('enrollment_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;

    await loadUserData(currentUser.id, currentUser.email);

  } catch (err: any) {
    alert('Error al cancelar solicitud: ' + err.message);
  }
};

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-white font-black text-2xl uppercase tracking-tighter">Error de Conexión</h1>
          <p className="text-slate-400 serif italic">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-sky-400 transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
const BootScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* glow suave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(99,102,241,0.10),transparent_50%)]" />

      <div className="relative min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.18)]">
            <div className="w-8 h-8 rounded-full border-4 border-sky-500/30 border-t-sky-400 animate-spin" />
          </div>

          <div className="space-y-2">
            <div className="text-white font-black text-xl tracking-tight">
              Cargando Campus…
            </div>
            <div className="text-slate-400 text-sm serif italic">
              Sincronizando materias y permisos
            </div>
          </div>

          <div className="w-[260px] mx-auto h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full w-1/2 bg-sky-500 animate-pulse" />
          </div>

          <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
            Cuaderno Vivo
          </div>
        </div>
      </div>
    </div>
  );
};
const [minLoaderDone, setMinLoaderDone] = useState(false);

useEffect(() => {
  const t = setTimeout(() => setMinLoaderDone(true), 900);
  return () => clearTimeout(t);
}, []);


if (loading || !minLoaderDone) return <BootScreen />;


  if (!session) return <Auth onSession={(s) => { setSession(s); loadUserData(s.user.id, s.user.email!); }} />;

  const isApproved = (sId: string) =>
  currentUser?.profile.role === UserRole.TEACHER ||
  enrollRequests.some(
    r =>
      String(r.subject_id) === String(sId) &&
      String(r.user_id) === String(currentUser?.id) &&
      r.status === 'approved'
  );


  return (
  <Layout
    user={currentUser}
    onLogout={() => {
      // si no hay supabase configurado, evitamos crashear
      try {
        supabase.auth.signOut().then(() => window.location.reload());
      } catch {
        window.location.reload();
      }
    }}
  >
    {view === 'home' && (
     <CampusHome
  userRole={currentUser?.profile.role}
  userId={currentUser?.id}
  subjects={subjects}
  enrollRequests={enrollRequests}
  onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }}
  onEnroll={(id) => handleEnroll(id)}
  onCancelEnroll={handleCancelEnroll}   // 👈 ESTA ES LA CLAVE
/>


    )}

    {view === 'subject' && activeSubjectId && (
      <SubjectPage
        subject={subjects.find(s => String(s.id) === String(activeSubjectId))!}
        isApproved={isApproved(String(activeSubjectId))}
        userCourseId={currentUser?.profile.course_id}
        availableUnits={Object.values(unitsMap).filter((u: any) =>
          String(u.subject_id) === String(activeSubjectId) && (u.isAvailable ?? true)
        )}
        onSelectUnit={(id) => { setActiveUnitId(String(id)); setView('unit'); }}
        onBack={() => setView('home')}
      />
    )}

    {view === 'unit' && activeUnitId && (
      <UnitPage
        unit={unitsMap[String(activeUnitId)]}
        progress={userProgress.filter(p => String(p.user_id) === String(currentUser?.id))}
        onUpdateProgress={() => {}}
        onBack={() => setView('subject')}
      />
    )}

    {view === 'teacher' && (
      <TeacherDashboard
        subjects={subjects}
        units={unitsMap}
        enrollRequests={enrollRequests}   // ✅ sin map raro
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
{view === 'profile' && (
  <CompleteProfile
    user={currentUser!}
    onComplete={async () => {
      if (currentUser) {
        await loadUserData(currentUser.id, currentUser.email);
          }
        setView('student');
}}

  />
)}

    {view === 'student' && (
      <StudentDashboard
        user={currentUser!}
        subjects={subjects}
        enrollRequests={enrollRequests}   // ✅ real
        onEnroll={handleEnroll}           // ✅ real
        progress={userProgress.filter(p => String(p.user_id) === String(currentUser?.id))}
        assessments={assessments}
        onSelectSubject={(id) => {
          const raw = String(id);
          const isNumeric = /^\d+$/.test(raw);

          if (isNumeric) {
            setActiveSubjectId(raw);
            setView('subject');
            return;
          }

          const normalize = (s: string) =>
            s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

          const wanted = normalize(raw);
          const found = subjects.find((s: any) => normalize(String(s.name || '')) === wanted);

          if (!found) {
            setActiveSubjectId(raw);
            setView('subject');
            return;
          }

          setActiveSubjectId(String(found.id));
          setView('subject');
        }}
      />
    )}

    {/* FAB switch teacher/student */}
    <button
      onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')}
      className="fixed bottom-8 right-8 p-5 bg-sky-500 rounded-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all border-4 border-slate-900 group"
    >
      <svg
  className="w-8 h-8 text-white group-hover:rotate-12 transition-transform"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2.5"
    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  />
</svg>

    </button>

    {/* Toast */}
    {toast && (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-sky-500 text-black font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl shadow-2xl border-4 border-slate-900 z-[999]">
        ✅ {toast}
      </div>
    )}
  </Layout>
);

};

export default App;
