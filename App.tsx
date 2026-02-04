
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
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);
  
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [dbUnits, setDbUnits] = useState<DBUnit[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressRecord[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<EnrollmentRequest[]>([]);
  
  const [view, setView] = useState<'home' | 'subject' | 'unit' | 'teacher' | 'student'>('home');
  const [activeSubjectId, setActiveSubjectId] = useState<string | number | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  const unitsMap = useMemo(() => {
    const map: Record<string, Unit> = {};
    Object.values(UNIT_CONTENT).forEach(u => map[u.id] = u);
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
    let mounted = true;

    const init = async () => {
      // Si no hay configuración, saltamos directo a Demo
      if (!isSupabaseConfigured) {
        if (mounted) {
          setDemoMode(true);
          setCurrentUser(MOCK_USERS[1]);
          setSession({ user: MOCK_USERS[1] });
          setLoading(false);
        }
        return;
      }

      try {
        // Ponemos un timeout al fetch de sesión
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
        
        const { data: { session: curSession } }: any = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (mounted) {
          setSession(curSession);
          if (curSession) {
            await fetchRemoteData(curSession.user);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("🛡️ App: Forzando Modo Demo por fallo en red o timeout.");
        if (mounted) {
          setDemoMode(true);
          setCurrentUser(MOCK_USERS[1]);
          setSession({ user: MOCK_USERS[1] });
          setLoading(false);
        }
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  const fetchRemoteData = async (user: any) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setCurrentUser({ id: user.id, email: user.email, profile });
        if (profile.role === UserRole.TEACHER) {
          const { data: profiles } = await supabase.from('profiles').select('*');
          setAllProfiles(profiles || []);
        }
      }

      const [s, u, e, p] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('units').select('*').order('unit_number', { ascending: true }),
        supabase.from('enrollments').select('*'),
        supabase.from('progress').select('*').eq('user_id', user.id)
      ]);

      if (s.data) {
        const merged = [...SUBJECTS];
        s.data.forEach((rs: any) => {
          const idx = merged.findIndex(as => String(as.id) === String(rs.id));
          if (idx !== -1) merged[idx] = { ...merged[idx], ...rs };
          else merged.push(rs);
        });
        setSubjects(merged);
      }
      setDbUnits(u.data || []);
      setEnrollRequests(e.data || []);
      setUserProgress(p.data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#020617]">
      <div className="animate-pulse text-sky-400 font-black text-[10px] uppercase tracking-[0.5em]">Accediendo...</div>
    </div>
  );

  if (!session && !demoMode) return <Auth onSession={(s) => { setSession(s); fetchRemoteData(s.user); }} />;

  const isApproved = currentUser?.profile.role === UserRole.TEACHER || 
    enrollRequests.some(r => String(r.subject_id) === String(activeSubjectId) && r.user_id === currentUser?.id && r.status === EnrollmentStatus.APPROVED);

  return (
    <Layout user={currentUser} onLogout={() => { if(demoMode) window.location.reload(); else supabase.auth.signOut(); }}>
      {demoMode && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-amber-500 text-black text-[9px] font-black uppercase px-6 py-2 rounded-full border-4 border-[#020617] shadow-2xl">
          Modo Demo
        </div>
      )}

      {view === 'home' && (
        <CampusHome 
          userRole={currentUser?.profile.role}
          enrollRequests={enrollRequests.filter(r => r.user_id === currentUser?.id)}
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }}
          onEnroll={(id) => {
            if (demoMode) setEnrollRequests([...enrollRequests, { id: 'd'+Math.random(), user_id: currentUser!.id, subject_id: id, status: EnrollmentStatus.APPROVED }]);
          }}
          onCancelEnroll={() => {}}
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
          progress={userProgress}
          onUpdateProgress={(bid) => {
            const exists = userProgress.find(p => p.block_id === bid);
            if (exists) setUserProgress(userProgress.filter(p => p.block_id !== bid));
            else setUserProgress([...userProgress, { id: Math.random(), block_id: bid, visited: true } as any]);
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
          onUpdateEnrollRequest={(id, status) => setEnrollRequests(enrollRequests.map(r => r.id === id ? { ...r, status } : r))} 
          onUpdateUnit={(nu) => setDbUnits([...dbUnits, { id: nu.id, subject_id: 0, unit_number: nu.number, title: nu.title, content_json: nu }])}
        />
      )}

      {view === 'student' && (
        <StudentDashboard user={currentUser!} progress={userProgress} assessments={[]} onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }} />
      )}

      <div className="fixed bottom-10 right-10 no-print z-[70]">
        <button 
          onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')}
          className="p-6 rounded-2xl bg-sky-500 text-white shadow-2xl border-4 border-slate-900 hover:scale-110 transition-all"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </button>
      </div>
    </Layout>
  );
};

export default App;
