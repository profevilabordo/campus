
export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export enum EnrollmentStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied'
}

export interface Profile {
  id: string;
  role: string;
  first_name?: string;
  last_name?: string;
  dni?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  phone?: string;
}


export interface User {
  id: string;
  email: string;
  profile: Profile;
}

export interface EnrollmentRequest {
  id: string;
  user_id: string; 
  subject_id: string;
  status: EnrollmentStatus;
}

export interface Assessment {
  id: string;
  student_id: string;
  subject_id: string | number;
  type: string;
  grade: string;
  feedback: string;
  date: string;
}

// Fixed: Added missing School interface to support SCHOOLS array in data.ts
export interface School {
  id: string;
  name: string;
  level: string;
}

export interface Course {
  id: string | number;
  school_id: string | number;
  grade_level?: string;
  grade_level_id?: string; 
  division: string;
  orientation?: string;
  name?: string;
}

export interface Subject {
  id: string | number;
  name: string;
  units_count?: number;
  courses?: string[];
  orientation_notes?: Record<string, string>;
}

export interface Unit {
  id: string;
  subject_id: string;
  number: number;
  title: string;
  description: string;
  isAvailable?: boolean;
  pdfBaseUrl?: string;
  pdfPrintUrl?: string;
  metadata: {
    version: string;
    updated_at: string;
    change_note?: string;
  };
  blocks: BlockContent[];
}

export interface BlockContent {
  id: string; 
  type: BlockType;
  title: string;
  content: string;
  counts_for_progress: boolean;
  questions?: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export interface DBUnit {
  id: string;
  subject_id: number;
  unit_number: number;
  title: string;
  content_json: any;
}

export enum BlockType {
  UMBRAL = 'UMBRAL',
  MAPA = 'MAPA',
  NUCLEO = 'NUCLEO',
  SENALES = 'SENALES',
  PAUSAS = 'PAUSAS',
  TRAMPAS = 'TRAMPAS',
  SABIAS = 'SABIAS',
  CRUCES = 'CRUCES',
  RELECTURA = 'RELECTURA',
  EMOCIONAL = 'EMOCIONAL',
  AUTOTEST = 'AUTOTEST',
  CIERRE = 'CIERRE'
}

export interface ProgressRecord {
  id: number;
  course_id: number;
  block_id: any; 
  user_id: string;
  status: string;
  completed_at: string;
  visited?: boolean; 
  subject_id?: string | number; 
}
// ============================================
// TIPOS ACTUALIZADOS DE BASE DE DATOS
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          role: 'student' | 'teacher' | null;
          dni: string | null;
          birth_date: string | null;
          address: string | null;
          city: string | null;
          phone: string | null;
          created_at: string;
        };
      };
      courses: {
        Row: {
          id: number;
          name: string;
          year_label: string;
          school: string;
          academic_year: number;
          enrollment_code: string;
          is_active: boolean;
          created_at: string;
          school_id: number | null;
          grade_level_id: number | null;
          division: string | null;
          shift: string | null;
        };
      };
      blocks: {
        Row: {
          id: number;
          course_id: number;
          unit_number: number;
          title: string;
          block_key: string;
          kind: 'content' | 'challenge' | 'didyouknow' | 'activity' | 'assessment';
          sort_order: number;
          is_active: boolean;
          created_at: string;
          external_id: string | null;
        };
      };
      progress: {
        Row: {
          id: number;
          user_id: string;
          course_id: number;
          block_id: number;
          unit_id: string;
          status: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      enrollments: {
        Row: {
          id: number;
          course_id: number;
          user_id: string;
          status: string;
          enrolled_at: string;
        };
      };
      enrollment_requests: {
        Row: {
          id: string;
          user_id: string;
          subject_id: number;
          status: string;
          created_at: string;
        };
      };
      units: {
        Row: {
          id: string;
          subject_id: string;
          number: number;
          title: string;
          content_json: any;
          updated_at: string;
        };
      };
    };
  };
}

// Aliases para mantener compatibilidad con código existente
export type DBProfile = Database['public']['Tables']['profiles']['Row'];
export type DBCourse = Database['public']['Tables']['courses']['Row'];
export type DBBlock = Database['public']['Tables']['blocks']['Row'];
export type DBProgress = Database['public']['Tables']['progress']['Row'];
export type DBEnrollment = Database['public']['Tables']['enrollments']['Row'];
export type DBEnrollmentRequest = Database['public']['Tables']['enrollment_requests']['Row'];