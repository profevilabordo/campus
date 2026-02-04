
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
  id: string; // uuid de auth.users
  full_name: string;
  role: UserRole;
  course_id?: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  profile: Profile;
}

export interface School {
  id: string;
  name: string;
  level: string;
}

export interface EnrollmentRequest {
  id: string;
  user_id: string; // Cambiado de student_id a user_id
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

export interface Course {
  id: string | number;
  school_id: string | number;
  grade_level?: string;
  grade_level_id?: string; 
  division: string;
  orientation?: string;
  name?: string;
  year_label?: string;
  is_active?: boolean;
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
  content_json: UnitPedagogicalContent;
}

export interface UnitPedagogicalContent {
  description: string;
  pdfBaseUrl: string;
  pdfPrintUrl: string;
  blocks: BlockPedagogicalContent[];
  metadata: {
    version: string;
    updated_at: string;
  };
}

export type BlockPedagogicalContent = BlockContent;

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
