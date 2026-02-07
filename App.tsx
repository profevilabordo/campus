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
          const newProf = {
            id: userId,
            full_name: email.split('@')[0],
            role: UserRole.STUDENT
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

 const handleEnroll = async (code: string) => {
  try {
    if (!currentUser) return;

    // 1) buscar materia por código
    const { data: subj, error: subjErr } = await supabase
      .from("subjects")
      .select("id")
      .eq("enrollment_code", code)
      .maybeSingle();

    if (subjErr) throw subjErr;
    if (!subj) {
      alert("Código inválido.");
      return;
    }

    // 2) insertar solicitud
    const { error } = await supabase
      .from("enrollment_requests")
      .insert({
        user_id: currentUser.id,
        subject_id: subj.id,
        status: "pending",
      });

    if (error) throw error;

    await loadUserData(currentUser.id, currentUser.email);
    alert("Solicitud enviada ✅");
  } catch (err: any) {
    alert(`Error al inscribirse: ${err.message}`);
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

  if (loading) return null;
  if (!session) return <Auth onSession={(s) => { setSession(s); loadUserData(s.user.id, s.user.email!); }} />;

  const isApproved = (sId: string) =>
    currentUser?.profile.role === UserRole.TEACHER ||
    enrollRequests.some(
      r =>
        String(r.course_id) === String(sId) &&
        r.student_id === currentUser?.id &&
        r.status === 'approved'
    );

  return (
    <Layout
      user={currentUser}
      onLogout={() => {
        supabase.auth.signOut().then(() => window.location.reload());
      }}
    >
      {view === 'home' && (
        <CampusHome
          userRole={currentUser?.profile.role}
          subjects={subjects}
          enrollRequests={enrollRequests
            .filter(r => r.student_id === currentUser?.id)
            .map(r => ({ ...r, user_id: r.student_id, subject_id: r.course_id }))}
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
          availableUnits={Object.values(unitsMap).filter((u: any) =>
            String(u.subject_id) === activeSubjectId && (u.isAvailable ?? true)
          )}
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
          subjects={subjects}
          enrollRequests={enrollRequests}     // 👈 nuevo
          onEnroll={handleEnroll}             // 👈 nuevo 
          progress={userProgress.filter(p => p.user_id === currentUser?.id)}
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

      <button
        onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')}
        className="fixed bottom-8 right-8 p-5 bg-sky-500 rounded-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all border-4 border-slate-900 group"
      >
        <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </Layout>
  );
};

export default App;
