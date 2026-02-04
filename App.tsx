import React, { useState, useEffect, useMemo } from 'react';
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

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);
  
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [dbUnits, setDbUnits] = useState<DBUnit[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<EnrollmentRequest[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressRecord[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const [view, setView] = useState<'home' | 'subject' | 'unit' | 'teacher' | 'student'>('home');
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

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

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) {
          setSession(s);
          await loadUserData(s.user.id, s.user.email!);
        } else if (!isSupabaseConfigured) {
          throw new Error("Demo");
        }
      } catch (e) {
        console.error("🛡️ Fallback a Modo Demo");
        setDemoMode(true);
        setCurrentUser(MOCK_USERS[1]); // Profesor por defecto en demo para ver paneles
        setSession({ user: MOCK_USERS[1] });
      } finally {
        setLoading(false);
        const l = document.getElementById('fallback-loader');
        if (l) { l.style.opacity = '0'; setTimeout(() => l.remove(), 400); }
      }
    };
    init();
  }, []);

  const loadUserData = async (userId: string, email: string) => {
    try {
      // 1. Perfil
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (prof) {
        setCurrentUser({ id: userId, email, profile: prof });
      } else {
        const newProf = { id: userId, full_name: email.split('@')[0], role: UserRole.STUDENT };
        await supabase.from('profiles').upsert(newProf);
        setCurrentUser({ id: userId, email, profile: newProf as any });
      }

      // 2. Carga paralela resiliente
      const fetchTable = async (table: string, query: any) => {
        try {
          const { data } = await query;
          return data || [];
        } catch (e) {
          console.error(`Error cargando tabla ${table}:`, e);
          return [];
        }
      };

      const isTeacher = (prof?.role || UserRole.STUDENT) === UserRole.TEACHER;

      const [subjs, unts, enrl, prog, asss, profs] = await Promise.all([
        fetchTable('subjects', supabase.from('subjects').select('*')),
        fetchTable('units', supabase.from('units').select('*')),
        fetchTable('enrollments', supabase.from('enrollments').select('*')),
        fetchTable('progress', isTeacher ? supabase.from('progress').select('*') : supabase.from('progress').select('*').eq('user_id', userId)),
        fetchTable('assessments', isTeacher ? supabase.from('assessments').select('*') : supabase.from('assessments').select('*').eq('student_id', userId)),
        isTeacher ? fetchTable('profiles', supabase.from('profiles').select('*')) : Promise.resolve([])
      ]);

      if (subjs.length) setSubjects(subjs);
      setDbUnits(unts);
      setEnrollRequests(enrl);
      setUserProgress(prog);
      setAssessments(asss);
      setAllProfiles(profs);

    } catch (err) {
      console.error("❌ loadUserData crash:", err);
    }
  };

  const handleEnroll = async (sId: string) => {
    if (demoMode) {
      setEnrollRequests([...enrollRequests, { id: 'd'+Math.random(), user_id: currentUser!.id, subject_id: sId, status: EnrollmentStatus.PENDING }]);
      return;
    }
    const { error } = await supabase.from('enrollments').upsert({ user_id: currentUser!.id, subject_id: sId, status: EnrollmentStatus.PENDING });
    if (error) console.error("Enroll fail:", error.message);
    else loadUserData(currentUser!.id, currentUser!.email);
  };

  const handleUpdateEnrollRequest = async (id: string, status: EnrollmentStatus) => {
    if (demoMode) {
      setEnrollRequests(enrollRequests.map(r => r.id === id ? { ...r, status } : r));
      return;
    }
    await supabase.from('enrollments').update({ status }).eq('id', id);
    loadUserData(currentUser!.id, currentUser!.email);
  };

  const handleUpdateUnit = async (nu: Unit) => {
    if (demoMode) {
      setDbUnits([...dbUnits.filter(u => u.id !== nu.id), { id: nu.id, subject_id: Number(nu.subject_id), unit_number: nu.number, title: nu.title, content_json: nu } as any]);
      return;
    }
    await supabase.from('units').upsert({ id: nu.id, subject_id: nu.subject_id, unit_number: nu.number, title: nu.title, content_json: nu });
    loadUserData(currentUser!.id, currentUser!.email);
  };

  if (loading) return null;
  if (!session && !demoMode) return <Auth onSession={(s) => { setSession(s); loadUserData(s.user.id, s.user.email!); }} />;

  const isApproved = (sId: string) => 
    currentUser?.profile.role === UserRole.TEACHER || 
    enrollRequests.some(r => String(r.subject_id) === String(sId) && r.user_id === currentUser?.id && r.status === EnrollmentStatus.APPROVED);

  return (
    <Layout user={currentUser} onLogout={() => { if(demoMode) window.location.reload(); else supabase.auth.signOut().then(() => window.location.reload()); }}>
      {demoMode && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-sky-500 text-black text-[10px] font-black px-4 py-1 rounded-full border-2 border-slate-900 shadow-2xl">MODO DEMO</div>}
      
      {view === 'home' && <CampusHome userRole={currentUser?.profile.role} enrollRequests={enrollRequests.filter(r => r.user_id === currentUser?.id)} onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }} onEnroll={handleEnroll} onCancelEnroll={() => {}} />}
      
      {view === 'subject' && activeSubjectId && <SubjectPage subject={subjects.find(s => String(s.id) === activeSubjectId)!} isApproved={isApproved(activeSubjectId)} userCourseId={currentUser?.profile.course_id} availableUnits={Object.values(unitsMap).filter(u => String(u.subject_id) === activeSubjectId)} onSelectUnit={(id) => { setActiveUnitId(id); setView('unit'); }} onBack={() => setView('home')} />}
      
      {view === 'unit' && activeUnitId && <UnitPage unit={unitsMap[activeUnitId]} progress={userProgress.filter(p => p.user_id === currentUser?.id)} onUpdateProgress={() => {}} onBack={() => setView('subject')} />}
      
      {view === 'teacher' && <TeacherDashboard subjects={subjects} units={unitsMap} enrollRequests={enrollRequests} progressRecords={userProgress} profiles={demoMode ? MOCK_USERS.map(u => u.profile) : allProfiles} onUpdateEnrollRequest={handleUpdateEnrollRequest} onUpdateUnit={handleUpdateUnit} />}
      
      {view === 'student' && <StudentDashboard user={currentUser!} progress={userProgress.filter(p => p.user_id === currentUser?.id)} assessments={assessments} onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }} />}

      <button onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')} className="fixed bottom-8 right-8 p-5 bg-sky-500 rounded-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all border-4 border-slate-900 group">
        <svg className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </button>
    </Layout>
  );
};

export default App;
