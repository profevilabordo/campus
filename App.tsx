
import React, { useState, useEffect } from 'react';
import { User, UserRole, Subject, Unit, ProgressRecord, Profile, Assessment, EnrollmentRequest, EnrollmentStatus } from './types';
import { SUBJECTS, UNIT_CONTENT } from './data';
import { supabase } from './supabase';
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
  
  const [units, setUnits] = useState<Record<string, Unit>>(UNIT_CONTENT);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [enrollRequests, setEnrollRequests] = useState<EnrollmentRequest[]>([]);
  
  const [view, setView] = useState<'home' | 'subject' | 'unit' | 'teacher' | 'student'>('home');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user);
      else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile || error) {
        const newProfile: Profile = {
          id: authUser.id,
          role: UserRole.STUDENT,
          full_name: authUser.email.split('@')[0],
          course_id: 'eeso206-4d'
        };
        const { data: createdProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select()
          .single();
        
        if (insertError) throw insertError;
        profile = createdProfile;
      }

      setCurrentUser({
        id: authUser.id,
        email: authUser.email,
        profile: profile as Profile
      });

      fetchUserData(authUser.id, profile.role);

      // Si es docente, no forzamos la vista de dashboard para que pueda navegar las materias desde el home
      if (profile.role === UserRole.TEACHER) {
        setView('home');
      } else {
        setView('home');
      }

    } catch (err) {
      console.error("Error al gestionar el perfil del usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string, role: UserRole) => {
    const { data: progressData } = await supabase.from('progress').select('*').eq('user_id', userId);
    if (progressData) setProgress(progressData);

    const { data: assessmentData } = await supabase.from('assessments').select('*').eq('user_id', userId);
    if (assessmentData) setAssessments(assessmentData);

    // Fetch Enrollments
    if (role === UserRole.TEACHER) {
      const { data: reqs } = await supabase.from('enroll_requests').select('*');
      if (reqs) setEnrollRequests(reqs);
    } else {
      const { data: reqs } = await supabase.from('enroll_requests').select('*').eq('student_id', userId);
      if (reqs) setEnrollRequests(reqs);
    }
  };

  const handleEnrollRequest = async (subjectId: string) => {
    if (!currentUser) return;
    
    // Evitar solicitudes duplicadas locales
    if (enrollRequests.some(r => r.subject_id === subjectId && r.student_id === currentUser.id)) return;

    const newRequest: Partial<EnrollmentRequest> = {
      student_id: currentUser.id,
      subject_id: subjectId,
      status: EnrollmentStatus.PENDING,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from('enroll_requests').insert(newRequest).select().single();
      if (error) throw error;
      if (data) {
        setEnrollRequests(prev => [...prev, data]);
      }
    } catch (err) {
      console.error("Error al solicitar inscripción:", err);
      alert("No se pudo procesar la solicitud. Por favor intenta de nuevo.");
    }
  };

  const handleCancelEnrollRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from('enroll_requests').delete().eq('id', requestId);
      if (error) throw error;
      setEnrollRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error("Error al cancelar solicitud:", err);
    }
  };

  const handleUpdateEnrollRequest = async (requestId: string, status: EnrollmentStatus) => {
    if (!currentUser) return;
    
    const { data, error } = await supabase
      .from('enroll_requests')
      .update({ 
        status, 
        decided_at: new Date().toISOString(),
        decided_by: currentUser.id 
      })
      .eq('id', requestId)
      .select()
      .single();

    if (data) {
      setEnrollRequests(enrollRequests.map(r => r.id === requestId ? data : r));
      
      if (status === EnrollmentStatus.DENIED) {
        try {
          await supabase.functions.invoke('notify-denial', {
            body: { requestId, studentId: data.student_id, subjectId: data.subject_id }
          });
        } catch (e) {
          console.warn("Fallo el envío de email, pero el estado se actualizó igual.", e);
        }
      }
    }
  };

  const handleUpdateProgress = async (blockId: string) => {
    if (!currentUser || !activeUnitId) return;
    
    const activeUnit = units[activeUnitId];
    const existing = progress.find(p => p.unit_id === activeUnitId && p.block_id === blockId);
    
    const newRecord: Partial<ProgressRecord> = {
      user_id: currentUser.id,
      subject_id: activeUnit.subject_id,
      unit_id: activeUnitId,
      block_id: blockId,
      visited: !existing,
      completed: !existing,
      timestamp: new Date().toISOString()
    };

    try {
      if (existing) {
        await supabase.from('progress').delete().eq('id', existing.id);
        setProgress(progress.filter(p => p.id !== existing.id));
      } else {
        const { data, error } = await supabase.from('progress').insert(newRecord).select().single();
        if (data) setProgress([...progress, data]);
      }
    } catch (err) {
      console.error("Error al actualizar progreso en BD:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('home');
    setActiveSubject(null);
    setActiveUnitId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verificando Credenciales...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onSession={(s) => setSession(s)} />;
  }

  const activeUnit = activeUnitId ? units[activeUnitId] : null;

  const renderContent = () => {
    if (currentUser?.profile.role === UserRole.TEACHER && view === 'teacher') {
      return (
        <TeacherDashboard 
          units={units} 
          enrollRequests={enrollRequests}
          onUpdateEnrollRequest={handleUpdateEnrollRequest}
          onUpdateUnit={(u) => setUnits(prev => ({...prev, [u.id]: u}))} 
        />
      );
    }

    if (view === 'student') {
      return (
        <StudentDashboard 
          user={currentUser!} 
          progress={progress} 
          assessments={assessments} 
          onSelectSubject={(id) => {
            setActiveSubject(SUBJECTS.find(s => s.id === id) || null);
            setView('subject');
          }} 
        />
      );
    }

    switch (view) {
      case 'home':
        return (
          <CampusHome 
            userRole={currentUser?.profile.role}
            enrollRequests={enrollRequests}
            onSelectSubject={(id) => {
              setActiveSubject(SUBJECTS.find(s => s.id === id) || null);
              setView('subject');
            }} 
            onEnroll={handleEnrollRequest}
            onCancelEnroll={handleCancelEnrollRequest}
          />
        );
      case 'subject':
        const subjectRequest = enrollRequests.find(r => r.subject_id === activeSubject?.id);
        const isApproved = (subjectRequest?.status === EnrollmentStatus.APPROVED) || (currentUser?.profile.role === UserRole.TEACHER);
        
        return activeSubject ? (
          <SubjectPage 
            subject={activeSubject} 
            isApproved={isApproved}
            userCourseId={currentUser?.profile.course_id}
            onSelectUnit={(unitId) => {
              if (!isApproved) return;
              setActiveUnitId(unitId);
              setView('unit');
            }}
            onBack={() => setView('home')}
          />
        ) : null;
      case 'unit':
        return activeUnit ? (
          <UnitPage 
            unit={activeUnit} 
            progress={progress.filter(p => p.unit_id === activeUnitId)}
            onUpdateProgress={handleUpdateProgress}
            onBack={() => setView('subject')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout}
      title={view === 'unit' ? activeUnit?.title : view === 'subject' ? activeSubject?.name : undefined}
    >
      <div className="no-print mb-8 flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Conectado como {currentUser?.profile.role}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView(currentUser?.profile.role === UserRole.TEACHER ? 'teacher' : 'student')}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-slate-800 transition-colors"
          >
            {currentUser?.profile.role === UserRole.TEACHER ? 'Dashboard Docente' : 'Mi Seguimiento'}
          </button>
          
          {view !== 'home' && (
             <button 
              onClick={() => setView('home')}
              className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-200 transition-colors"
            >
              Inicio Campus
            </button>
          )}
        </div>
      </div>

      {renderContent()}
    </Layout>
  );
};

export default App;
