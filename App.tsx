
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
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [dbUnits, setDbUnits] = useState<DBUnit[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<EnrollmentRequest[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressRecord[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

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
        if (!isSupabaseConfigured) throw new Error("Supabase no configurado");
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) {
          setSession(s);
          await loadUserData(s.user.id, s.user.email!);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.warn("🛡️ App: Entrando en Modo Demo por falta de config o sesión.");
        setDemoMode(true);
        setCurrentUser(MOCK_USERS[1]);
        setSession({ user: MOCK_USERS[1] });
        setLoading(false);
      } finally {
        const l = document.getElementById('fallback-loader');
        if (l) { l.style.opacity = '0'; setTimeout(() => l.remove(), 300); }
      }
    };
    init();
  }, []);

  const loadUserData = async (userId: string, email: string) => {
    try {
      const { data: prof, error: profErr } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (profErr) {
        console.error("❌ Perfil no encontrado:", profErr.message);
        // Crear perfil básico si no existe
        const newProf = { id: userId, full_name: email.split('@')[0], role: UserRole.STUDENT };
        await supabase.from('profiles').upsert(newProf);
        setCurrentUser({ id: userId, email, profile: newProf as any });
      } else {
        setCurrentUser({ id: userId, email, profile: prof });
      }

      const isTeacher = prof?.role === UserRole.TEACHER;

      // Carga condicional: Docente ve TODO, Alumno ve lo SUYO
      const queries = [
        supabase.from('subjects').select('*'),
        supabase.from('units').select('*'),
        supabase.from('enrollments').select('*'), // El docente necesita ver todas las solicitudes
        isTeacher 
          ? supabase.from('progress').select('*') 
          : supabase.from('progress').select('*').eq('user_id', userId),
        isTeacher 
          ? supabase.from('assessments').select('*')
          : supabase.from('assessments').select('*').eq('student_id', userId)
      ];

      const results = await Promise.all(queries);
      
      if (results[0].data?.length) setSubjects(results[0].data);
      if (results[1].data?.length) setDbUnits(results[1].data);
      setEnrollRequests(results[2].data || []);
      setUserProgress(results[3].data || []);
      setAssessments(results[4].data || []);

      if (isTeacher) {
        const { data: ps } = await supabase.from('profiles').select('*');
        setAllProfiles(ps || []);
      }

      setLoading(false);
    } catch (err) {
      console.error("❌ Error crítico en carga de datos:", err);
      setLoading(false);
    }
  };

  const handleEnroll = async (sId: string) => {
    try {
      if (demoMode) {
        setEnrollRequests(prev => [...prev, { id: 'd'+Math.random(), user_id: currentUser!.id, subject_id: sId, status: EnrollmentStatus.PENDING }]);
        return;
      }
      const { error } = await supabase.from('enrollments').upsert({ user_id: currentUser!.id, subject_id: sId, status: EnrollmentStatus.PENDING });
      if (error) throw error;
      await loadUserData(currentUser!.id, currentUser!.email);
    } catch (err: any) {
      console.error("❌ Error al solicitar inscripción:", err.message);
      alert("No se pudo enviar la solicitud. Verifique su conexión.");
    }
  };

  const handleUpdateEnrollRequest = async (id: string, status: EnrollmentStatus) => {
    if (demoMode) {
      setEnrollRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      return;
    }
    const { error } = await supabase.from('enrollments').update({ status }).eq('id', id);
    if (error) console.error("❌ Error actualizando inscripción:", error.message);
    else await loadUserData(currentUser!.id, currentUser!.email);
  };

  const handleUpdateUnit = async (nu: Unit) => {
    if (demoMode) {
      setDbUnits(prev => {
        const filtered = prev.filter(u => u.id !== nu.id);
        return [...filtered, { id: nu.id, subject_id: nu.subject_id, unit_number: nu.number, title: nu.title, content_json: nu } as any];
      });
      return;
    }
    const { error } = await supabase.from('units').upsert({ 
      id: nu.id, 
      subject_id: nu.subject_id, 
      unit_number: nu.number, 
      title: nu.title, 
      content_json: nu 
    });
    if (error) console.error("❌ Error guardando unidad:", error.message);
    else await loadUserData(currentUser!.id, currentUser!.email);
  };

  const handleUpdateProgress = async (blockId: string) => {
    const existing = userProgress.find(p => p.block_id === blockId && p.user_id === currentUser?.id);
    if (demoMode) {
      if (existing) setUserProgress(prev => prev.filter(p => p.id !== existing.id));
      else setUserProgress(prev => [...prev, { id: Math.random(), block_id: blockId, visited: true, user_id: currentUser!.id } as any]);
      return;
    }

    if (existing) {
      const { error } = await supabase.from('progress').delete().eq('id', existing.id);
      if (!error) await loadUserData(currentUser!.id, currentUser!.email);
    } else {
      const { error } = await supabase.from('progress').insert({ 
        user_id: currentUser!.id, 
        block_id: blockId, 
        subject_id: activeSubjectId,
        visited: true 
      });
      if (!error) await loadUserData(currentUser!.id, currentUser!.email);
    }
  };

  if (loading) return null;
  if (!session && !demoMode) return <Auth onSession={(s) => { setSession(s); loadUserData(s.user.id, s.user.email!); }} />;

  const isApproved = (sId: string) => 
    currentUser?.profile.role === UserRole.TEACHER || 
    enrollRequests.some(r => String(r.subject_id) === String(sId) && r.user_id === currentUser?.id && r.status === EnrollmentStatus.APPROVED);

  return (
    <Layout user={currentUser} onLogout={() => { if(demoMode) window.location.reload(); else supabase.auth.signOut(); }}>
      {demoMode && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-amber-500 text-black text-[10px] font-black px-4 py-1 rounded-full border-2 border-slate-900 shadow-2xl">ENTORNO DEMO</div>}
      
      {view === 'home' && (
        <CampusHome 
          userRole={currentUser?.profile.role} 
          enrollRequests={enrollRequests.filter(r => r.user_id === currentUser?.id)} 
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }} 
          onEnroll={handleEnroll} 
          onCancelEnroll={() => {}} 
        />
      )}
      
      {view === 'subject' && activeSubjectId && (
        <SubjectPage 
          subject={subjects.find(s => String(s.id) === activeSubjectId)!} 
          isApproved={isApproved(activeSubjectId)} 
          userCourseId={currentUser?.profile.course_id} 
          availableUnits={Object.values(unitsMap).filter(u => u.subject_id === activeSubjectId)} 
          onSelectUnit={(id) => { setActiveUnitId(id); setView('unit'); }} 
          onBack={() => setView('home')} 
        />
      )}
      
      {view === 'unit' && activeUnitId && (
        <UnitPage 
          unit={unitsMap[activeUnitId]} 
          progress={userProgress.filter(p => p.user_id === currentUser?.id)} 
          onUpdateProgress={handleUpdateProgress} 
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
          onUpdateEnrollRequest={handleUpdateEnrollRequest} 
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

      <button 
        onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')} 
        className="fixed bottom-6 right-6 p-4 bg-sky-500 rounded-2xl shadow-xl z-50 hover:scale-110 active:scale-95 transition-all border-4 border-slate-900"
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </Layout>
  );
};

export default App;
