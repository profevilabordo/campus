
import React, { useState, useEffect } from 'react';
import { User, UserRole, Subject, DBUnit, ProgressRecord, Course, Unit, EnrollmentRequest, EnrollmentStatus } from './types';
import { supabase } from './supabase';
import { UNIT_CONTENT, SUBJECTS } from './data';
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
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dbUnits, setDbUnits] = useState<DBUnit[]>([]);
  const [userProgress, setUserProgress] = useState<ProgressRecord[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<EnrollmentRequest[]>([]);
  
  const [view, setView] = useState<'home' | 'subject' | 'unit' | 'teacher' | 'student'>('home');
  const [activeSubjectId, setActiveSubjectId] = useState<string | number | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  const unitsMap: Record<string, Unit> = {};
  Object.values(UNIT_CONTENT).forEach(u => unitsMap[u.id] = u);
  dbUnits.forEach(u => {
    unitsMap[u.id] = {
      id: u.id,
      subject_id: String(u.subject_id),
      number: u.unit_number,
      title: u.title,
      description: u.content_json.description,
      blocks: u.content_json.blocks,
      metadata: u.content_json.metadata,
      pdfBaseUrl: u.content_json.pdfBaseUrl,
      pdfPrintUrl: u.content_json.pdfPrintUrl
    };
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAllData(session.user);
      else setLoading(false);
    });
  }, []);

  const fetchAllData = async (user: any) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!profile) return;
      setCurrentUser({ id: user.id, email: user.email, profile });

      const { data: subs } = await supabase.from('subjects').select('*');
      const { data: units } = await supabase.from('units').select('*').order('unit_number', { ascending: true });
      
      const allSubjects = [...SUBJECTS];
      if (subs) {
        subs.forEach(s => {
          const index = allSubjects.findIndex(as => String(as.id) === String(s.id));
          if (index !== -1) allSubjects[index] = { ...allSubjects[index], ...s };
          else allSubjects.push(s);
        });
      }
      setSubjects(allSubjects);
      setDbUnits(units || []);

      const { data: enrolls } = await supabase.from('enrollments').select('*');
      if (enrolls) setEnrollRequests(enrolls as any[]);

      const { data: prog } = await supabase.from('progress').select('*').eq('user_id', user.id);
      setUserProgress(prog || []);

      setLoading(false);
    } catch (err) {
      console.error("Error cargando ecosistema:", err);
      setLoading(false);
    }
  };

  const handleEnroll = async (subjectId: string) => {
    if (!currentUser) return;
    try {
      const newRequest = {
        user_id: currentUser.id,
        subject_id: subjectId,
        status: EnrollmentStatus.PENDING
      };
      
      const { data, error } = await supabase.from('enrollments').insert(newRequest).select().single();
      if (error) throw error;
      
      if (data) setEnrollRequests([...enrollRequests, data as any]);
    } catch (err: any) {
      alert("Error al solicitar inscripción: " + err.message);
    }
  };

  const handleCancelEnroll = async (requestId: string) => {
    try {
      const { error } = await supabase.from('enrollments').delete().eq('id', requestId);
      if (error) throw error;
      setEnrollRequests(enrollRequests.filter(r => r.id !== requestId));
    } catch (err: any) {
      alert("Error al cancelar: " + err.message);
    }
  };

  const handleUpdateEnrollStatus = async (id: string, status: EnrollmentStatus) => {
    try {
      const { error } = await supabase.from('enrollments').update({ status }).eq('id', id);
      if (error) throw error;
      setEnrollRequests(enrollRequests.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      alert("Error al actualizar estado: " + err.message);
    }
  };

  const handleUpdateUnit = async (newUnit: Unit) => {
    try {
      const dbPayload = {
        id: newUnit.id,
        subject_id: isNaN(Number(newUnit.subject_id)) ? 0 : Number(newUnit.subject_id),
        unit_number: newUnit.number,
        title: newUnit.title,
        content_json: {
          description: newUnit.description,
          blocks: newUnit.blocks,
          metadata: newUnit.metadata,
          pdfBaseUrl: newUnit.pdfBaseUrl,
          pdfPrintUrl: newUnit.pdfPrintUrl
        }
      };
      const { error } = await supabase.from('units').upsert(dbPayload);
      if (error) throw error;
      const { data: units } = await supabase.from('units').select('*').order('unit_number', { ascending: true });
      setDbUnits(units || []);
      alert("Unidad guardada correctamente.");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleToggleBlockProgress = async (blockKey: string) => {
    if (!currentUser) return;
    const { data: blockMeta } = await supabase.from('blocks').select('id, course_id').eq('block_key', blockKey).single();
    if (!blockMeta) return;
    const existing = userProgress.find(p => p.block_id === blockMeta.id);
    if (existing) {
      await supabase.from('progress').delete().eq('id', existing.id);
      setUserProgress(userProgress.filter(p => p.id !== existing.id));
    } else {
      const { data } = await supabase.from('progress').insert({
        user_id: currentUser.id,
        course_id: blockMeta.course_id,
        block_id: blockMeta.id,
        status: 'completed',
        completed_at: new Date().toISOString()
      }).select().single();
      if (data) setUserProgress([...userProgress, data]);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando Ecosistema...</div>;
  if (!session) return <Auth onSession={(s) => { setSession(s); fetchAllData(s.user); }} />;

  const currentEnrollStatus = enrollRequests.find(r => 
    String(r.subject_id) === String(activeSubjectId) && 
    r.user_id === currentUser?.id
  )?.status || EnrollmentStatus.NONE;

  const isApproved = currentUser?.profile.role === UserRole.TEACHER || currentEnrollStatus === EnrollmentStatus.APPROVED;

  return (
    <Layout user={currentUser} onLogout={() => supabase.auth.signOut()}>
      {view === 'home' && (
        <CampusHome 
          userRole={currentUser?.profile.role}
          enrollRequests={enrollRequests.filter(r => r.user_id === currentUser?.id)}
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }}
          onEnroll={handleEnroll}
          onCancelEnroll={handleCancelEnroll}
        />
      )}

      {view === 'subject' && activeSubjectId && (
        <SubjectPage 
          subject={subjects.find(s => String(s.id) === String(activeSubjectId))!}
          isApproved={isApproved}
          userCourseId={currentUser?.profile.course_id}
          onSelectUnit={(id) => { setActiveUnitId(id); setView('unit'); }}
          onBack={() => setView('home')}
        />
      )}

      {view === 'unit' && activeUnitId && unitsMap[activeUnitId] && (
        <UnitPage 
          unit={unitsMap[activeUnitId]}
          progress={userProgress.map(p => ({ block_id: p.block_id, visited: true })) as any}
          onUpdateProgress={handleToggleBlockProgress}
          onBack={() => setView('subject')}
        />
      )}

      {(view === 'teacher' || view === 'student') && (
        <div className="mb-8">
          <button onClick={() => setView('home')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
             Volver al Campus
          </button>
        </div>
      )}

      {view === 'teacher' && (
        <TeacherDashboard 
          subjects={subjects}
          units={unitsMap} 
          enrollRequests={enrollRequests} 
          onUpdateEnrollRequest={handleUpdateEnrollStatus} 
          onUpdateUnit={handleUpdateUnit}
        />
      )}

      {view === 'student' && currentUser && (
        <StudentDashboard 
          user={currentUser} 
          progress={userProgress} 
          assessments={[]} 
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('subject'); }}
        />
      )}

      <div className="fixed bottom-6 right-6 no-print">
        <button 
          onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')}
          className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all border-4 border-white"
        >
          {currentUser?.profile.role === UserRole.TEACHER ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          )}
        </button>
      </div>
    </Layout>
  );
};

export default App;
