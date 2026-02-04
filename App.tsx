
import React, { useState, useEffect } from 'react';
import { User, UserRole, Subject, DBUnit, ProgressRecord, Unit, EnrollmentRequest, EnrollmentStatus } from './types';
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
      const allSubjects = [...SUBJECTS];
      if (subs) {
        subs.forEach(s => {
          const index = allSubjects.findIndex(as => String(as.id) === String(s.id));
          if (index !== -1) allSubjects[index] = { ...allSubjects[index], ...s };
          else allSubjects.push(s);
        });
      }
      setSubjects(allSubjects);

      const { data: units } = await supabase.from('units').select('*').order('unit_number', { ascending: true });
      setDbUnits(units || []);

      const { data: enrolls } = await supabase.from('enrollments').select('*');
      setEnrollRequests(enrolls || []);

      const { data: prog } = await supabase.from('progress').select('*').eq('user_id', user.id);
      setUserProgress(prog || []);

      setLoading(false);
    } catch (err) {
      console.error("Error cargando Campus:", err);
      setLoading(false);
    }
  };

  const handleEnroll = async (subjectId: string) => {
    if (!currentUser) return;
    try {
      // Intentamos insertar. Si falla por permisos, el error se captura.
      const { error } = await supabase.from('enrollments').insert({
        user_id: currentUser.id,
        subject_id: subjectId,
        status: EnrollmentStatus.PENDING
      });
      
      if (error) {
        // Manejo específico si la columna user_id fallara (aunque es la correcta)
        console.error("Error en DB:", error);
        throw error;
      }
      
      // Actualizamos estado local inmediatamente
      const { data: enrolls } = await supabase.from('enrollments').select('*');
      setEnrollRequests(enrolls || []);
      alert("Solicitud de inscripción enviada con éxito.");
    } catch (err: any) {
      alert("No se pudo enviar la solicitud: " + err.message);
    }
  };

  const handleCancelEnroll = async (requestId: string) => {
    try {
      await supabase.from('enrollments').delete().eq('id', requestId);
      setEnrollRequests(enrollRequests.filter(r => r.id !== requestId));
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateEnrollStatus = async (id: string, status: EnrollmentStatus) => {
    try {
      const { error } = await supabase.from('enrollments').update({ status }).eq('id', id);
      if (error) throw error;
      setEnrollRequests(enrollRequests.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      alert("Error actualizando admisión: " + err.message);
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
      alert("Cuaderno actualizado satisfactoriamente.");
    } catch (err: any) {
      alert("Error al guardar JSON: " + err.message);
    }
  };

  const handleToggleBlockProgress = async (blockKey: string) => {
    // Lógica de marcado de bloques
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#0f172a] text-slate-100 gap-4">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-white rounded-full animate-spin"></div>
      <p className="font-black uppercase tracking-[0.3em] text-[10px]">Iniciando Laboratorio...</p>
    </div>
  );

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
          progress={userProgress}
          onUpdateProgress={handleToggleBlockProgress}
          onBack={() => setView('subject')}
        />
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

      <div className="fixed bottom-10 right-10 no-print z-[70]">
        <button 
          onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')}
          className="bg-sky-500 text-white p-5 rounded-full shadow-[0_0_40px_rgba(56,189,248,0.3)] hover:scale-110 active:scale-95 transition-all border-4 border-[#0f172a] group"
        >
          {currentUser?.profile.role === UserRole.TEACHER ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          )}
        </button>
      </div>
    </Layout>
  );
};

export default App;
