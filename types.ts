
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

// Added User interface to be used in Layout, App and Auth components
export interface User {
  id: string;
  email: string;
  profile: Profile;
}

// Added School interface for data.ts mocks
export interface School {
  id: string;
  name: string;
  level: string;
}

// Added EnrollmentRequest interface for CampusHome and TeacherDashboard
export interface EnrollmentRequest {
  id: string;
  student_id: string;
  subject_id: string;
  status: EnrollmentStatus;
}

// Added Assessment interface for StudentDashboard
export interface Assessment {
  id: string;
  student_id: string;
  subject_id: string | number;
  type: string;
  grade: string;
  feedback: string;
  date: string;
}

// Updated Course interface to match properties used in data.ts and TeacherDashboard
export interface Course {
  id: string | number;
  school_id: string | number;
  grade_level?: string;
  grade_level_id?: string; // Support for different mock/DB property names
  division: string;
  orientation?: string;
  name?: string;
  year_label?: string;
  is_active?: boolean;
}

// Updated Subject interface with missing properties like units_count, courses, and orientation_notes
export interface Subject {
  id: string | number;
  name: string;
  units_count?: number;
  courses?: string[];
  orientation_notes?: Record<string, string>;
}

// Added Unit interface (Main UI model for pedagogical content)
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

// Added BlockContent interface used by Unit and BlockCard components
export interface BlockContent {
  id: string; // maps to block_key or UI ID
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

// Table 'units' structure in Supabase
export interface DBUnit {
  id: string;
  subject_id: number;
  unit_number: number;
  title: string;
  content_json: UnitPedagogicalContent;
}

// Estructura interna del JSON Pedagógico
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

// Defined BlockPedagogicalContent as an alias for consistency
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

// Updated ProgressRecord to include UI-specific properties and subject_id for dashboard logic
export interface ProgressRecord {
  id: number;
  course_id: number;
  block_id: any; // ID can be numeric (DB) or string (Block Key)
  user_id: string;
  status: string;
  completed_at: string;
  visited?: boolean; // UI state for UnitPage
  subject_id?: string | number; // Grouping key for StudentDashboard
}
