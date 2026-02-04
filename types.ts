
export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  course_id?: string; // Solo para alumnos
  avatar_url?: string;
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

export interface Course {
  id: string;
  school_id: string;
  grade_level: string;
  division: string;
  orientation?: string;
}

export interface Subject {
  id: string;
  name: string;
  units_count: number;
  courses: string[];
  orientation_notes?: Record<string, string>;
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

export interface BlockContent {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  counts_for_progress: boolean;
  optional?: boolean;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface UnitMetadata {
  version: string;
  updated_at: string;
  change_note: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  number: number;
  title: string;
  description: string;
  isAvailable: boolean;
  pdfBaseUrl: string;
  pdfPrintUrl: string;
  blocks: BlockContent[];
  metadata?: UnitMetadata;
}

export interface ProgressRecord {
  id?: string;
  user_id: string;
  subject_id: string;
  unit_id: string;
  block_id: string;
  visited: boolean;
  completed: boolean;
  timestamp: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  unit_id: string;
  score: number;
  attempts: number;
  date: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  subject_id: string;
  unit_id: string;
  type: 'TP' | 'EVALUACION';
  grade: string;
  feedback: string;
  attachments?: string[];
  date: string;
}
