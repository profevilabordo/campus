import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Subject, DBUnit, ProgressRecord, Unit, EnrollmentRequest, EnrollmentStatus, Profile } from './types';
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
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [dbUnits, setDbUnits] = useState<DBUnit[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<EnrollmentRequest[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressRecord[]>([]);

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
        if (!isSupabaseConfigured) throw new Error("No config");
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) {
          setSession(s);
          await loadUserData(s.user.id, s.user.email!);
        }
      } catch (e) {
        console.warn("🛡️ App: Fallback a Modo Demo.");
        setDemoMode(true);
        setCurrentUser(MOCK_USERS[1]);
        setSession({ user: MOCK_USERS[1] });
      } finally {
        setLoading(false);
        const l = document.getElementById('fallback-loader');
        if (l) { l.style.opacity = '0'; setTimeout(() => l.remove(), 300); }
      }
    };
    init();
  }, []);

  const loadUserData = async (userId: string, email: string) => {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (prof) {
      setCurrentUser({ id: userId, email, profile: prof });
      if (prof.role === UserRole.TEACHER) {
        const { data: ps } = await supabase.from('profiles').select('*');
        setAllProfiles(ps || []);
      }
    }
    const [subjs, unts, enrl, prog] = await Promise.all([
      supabase.from('subjects').select('*'),
      supabase.from('units').select('*'),
      supabase.from('enrollments').select('*'),
      supabase.from('progress').select('*').eq('user_id', userId)
    ]);
    if (subjs.data?.length) setSubjects(subjs.data);
    if (unts.data?.length) setDbUnits(unts.data);
    setEnrollRequests(enrl.data || []);
    setUserProgress(prog.data || []);
  };

  const handleEnroll = async (sId: string) => {
    if (demoMode) {
      setEnrollRequests([...enrollRequests, { id: 'd'+Math.random(), user_id: currentUser!.id, subject_id: sId, status: EnrollmentStatus.PENDING }]);
      return;
    }
    const { error } = await supabase.from('enrollments').insert({ user_id: currentUser!.id, subject_id: sId, status: 'pending' });
    if (error) console.error("Enroll error:", error);
    else loadUserData(currentUser!.id, currentUser!.email);
  };

  if (loading) return null;
  if (!session && !demoMode) return <Auth onSession={(s) => { setSession(s); loadUserData(s.user.id, s.user.email!); }} />;

  const isApproved = (sId: string) => 
    currentUser?.profile.role === UserRole.TEACHER || 
    enrollRequests.some(r => String(r.subject_id) === String(sId) && r.status === EnrollmentStatus.APPROVED);

  return (
    <Layout user={currentUser} onLogout={() => { if(demoMode) window.location.reload(); else supabase.auth.signOut(); }}>
      {demoMode && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-amber-500 text-black text-[10px] font-black px-4 py-1 rounded-full border-2 border-slate-900">MODO DEMO</div>}
      
      {view === 'home' && <CampusHome userRole={currentUser?.profile.role} enrollRequests={enrollRequests} onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }} onEnroll={handleEnroll} onCancelEnroll={() => {}} />}
      
      {view === 'subject' && activeSubjectId && <SubjectPage subject={subjects.find(s => String(s.id) === activeSubjectId)!} isApproved={isApproved(activeSubjectId)} userCourseId={currentUser?.profile.course_id} availableUnits={Object.values(unitsMap).filter(u => u.subject_id === activeSubjectId)} onSelectUnit={(id) => { setActiveUnitId(id); setView('unit'); }} onBack={() => setView('home')} />}
      
      {view === 'unit' && activeUnitId && <UnitPage unit={unitsMap[activeUnitId]} progress={userProgress} onUpdateProgress={(bid) => { /* logic */ }} onBack={() => setView('subject')} />}
      
      {view === 'teacher' && <TeacherDashboard subjects={subjects} units={unitsMap} enrollRequests={enrollRequests} progressRecords={userProgress} profiles={demoMode ? MOCK_USERS.map(u => u.profile) : allProfiles} onUpdateEnrollRequest={(id, status) => { /* logic */ }} onUpdateUnit={(nu) => setDbUnits([...dbUnits, { id: nu.id, subject_id: 0, unit_number: nu.number, title: nu.title, content_json: nu } as any])} />}
      
      {view === 'student' && <StudentDashboard user={currentUser!} progress={userProgress} assessments={[]} onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }} />}

      <button onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')} className="fixed bottom-6 right-6 p-4 bg-sky-500 rounded-2xl shadow-xl z-50">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </button>
    </Layout>
  );
};

export default App;
