
import { School, Course, Subject, Unit, BlockType, User, UserRole } from './types';

export const SCHOOLS: School[] = [
  { id: "eetp602", name: "EETP N°602 \"Gral. José de San Martín\"", level: "secundaria_tecnica" },
  { id: "eeso206", name: "EESO N°206 \"Rosa Turner de Estrugamou\"", level: "secundaria_orientada" }
];

export const COURSES: Course[] = [
  { id: "eetp602-4a", school_id: "eetp602", grade_level: "4°", division: "A" },
  { id: "eetp602-5a", school_id: "eetp602", grade_level: "5°", division: "A" },
  { id: "eetp602-6a", school_id: "eetp602", grade_level: "6°", division: "A" },
  { id: "eetp602-6b", school_id: "eetp602", grade_level: "6°", division: "B" },
  { id: "eeso206-3a", school_id: "eeso206", grade_level: "3°", division: "A", orientation: "humanidades" },
  { id: "eeso206-4c", school_id: "eeso206", grade_level: "4°", division: "C", orientation: "economia_administracion" },
  { id: "eeso206-4d", school_id: "eeso206", grade_level: "4°", division: "D", orientation: "economia_administracion" },
  { id: "eeso206-5d", school_id: "eeso206", grade_level: "5°", division: "D", orientation: "economia_administracion" }
];

export const SUBJECTS: Subject[] = [
  { id: "fundamentos_gestion", name: "Fundamentos de Gestión", units_count: 3, courses: ["eetp602-4a"] },
  { id: "procesos_productivos", name: "Procesos Productivos", units_count: 3, courses: ["eetp602-5a"] },
  { id: "organizacion_gestion", name: "Organización y Gestión", units_count: 3, courses: ["eetp602-5a"] },
  { id: "marco_juridico", name: "Marco Jurídico", units_count: 3, courses: ["eetp602-5a", "eetp602-6b"] },
  { id: "organizacion_gestion_comercial", name: "Organización y Gestión Comercial", units_count: 3, courses: ["eetp602-6a"] },
  { id: "economia", name: "Economía", units_count: 3, courses: ["eetp602-6b", "eeso206-3a", "eeso206-4d"], orientation_notes: { "eeso206-3a": "Enfoque histórico y social (Humanidades).", "eeso206-4d": "Enfoque Economía y Administración.", "eetp602-6b": "Enfoque Economía y Administración." } },
  { id: "derecho", name: "Derecho", units_count: 3, courses: ["eeso206-4c", "eeso206-4d"] },
  { id: "ocl", name: "Orientación en Contextos Laborales", units_count: 3, courses: ["eeso206-5d"] },
  { id: "administracion_iii", name: "Administración III", units_count: 3, courses: ["eeso206-5d"] }
];

// Content simulation (the JSON part)
export const UNIT_CONTENT: Record<string, Unit> = {
  "economia_1": {
    id: "economia_1",
    subject_id: "economia",
    number: 1,
    title: "Sistemas Económicos y Escasez",
    description: "Una exploración profunda sobre cómo las sociedades deciden qué producir y para quién.",
    isAvailable: true,
    pdfBaseUrl: "#",
    pdfPrintUrl: "#",
    metadata: {
      version: "1.0.0",
      updated_at: "2024-03-20T10:00:00Z",
      change_note: "Lanzamiento inicial de la unidad."
    },
    blocks: [
      {
        id: "eco1-b1",
        type: BlockType.UMBRAL,
        title: "Umbral de inicio",
        content: "Antes de abrir el PDF de la unidad, detenete un momento. ¿Qué imágenes se te vienen a la mente cuando escuchás la palabra 'Economía'? No busques definiciones en Google, solo registrá tus intuiciones.",
        counts_for_progress: true
      },
      {
        id: "eco1-b2",
        type: BlockType.MAPA,
        title: "Hoja de ruta",
        content: "En esta unidad vamos a recorrer tres grandes estaciones: 1. El problema de la escasez. 2. Los factores productivos. 3. Los sistemas de mercado vs. planificados.",
        counts_for_progress: true
      },
      {
        id: "eco1-b3",
        type: BlockType.NUCLEO,
        title: "Actividad de lectura dirigida",
        content: "Leé las páginas 4 a 8 del PDF base. Prestá especial atención a la distinción entre 'necesidades primarias' y 'necesidades secundarias'. ¿Cómo impacta la publicidad en esta frontera?",
        counts_for_progress: true
      },
      {
        id: "eco1-b4",
        type: BlockType.SENALES,
        title: "Ojo aquí",
        content: "Cuidado: No confundas 'escasez económica' con 'pobreza'. La escasez es un concepto universal que afecta incluso a los más ricos, porque el tiempo y los recursos siempre son finitos.",
        counts_for_progress: false
      },
      {
        id: "eco1-b5",
        type: BlockType.PAUSAS,
        title: "Momento de reflexión",
        content: "Si tuvieras que renunciar a algo hoy para poder estudiar mañana, ¿qué sería? Ese es tu 'Costo de Oportunidad'. Escribilo en tu cuaderno real.",
        counts_for_progress: true
      },
      {
        id: "eco1-b6",
        type: BlockType.SABIAS,
        title: "Curiosidad significativa",
        content: "¿Sabías que la palabra 'Economía' viene del griego 'Oikonomia', que significa 'administración de la casa'?",
        counts_for_progress: false
      },
      {
        id: "eco1-b7",
        type: BlockType.RELECTURA,
        title: "Integración final",
        content: "Volvé a la página 2. Ahora que terminaste la unidad, ¿cambiarías algo de tu respuesta inicial en el Umbral?",
        counts_for_progress: true
      },
      {
        id: "eco1-b8",
        type: BlockType.EMOCIONAL,
        title: "¿Cómo te sentiste hoy?",
        content: "Marcá cómo estuvo tu proceso de lectura hoy.",
        counts_for_progress: true
      },
      {
        id: "eco1-b9",
        type: BlockType.AUTOTEST,
        title: "Autoevaluación de conceptos",
        content: "Respondé estas preguntas para verificar si los conceptos base quedaron claros.",
        counts_for_progress: true,
        questions: [
          { id: "q1", question: "¿Qué define mejor al costo de oportunidad?", options: ["El precio de un producto", "Aquello a lo que se renuncia para obtener algo", "La ganancia neta", "El valor del dinero en el tiempo"], correctAnswer: 1 },
          { id: "q2", question: "La escasez existe porque...", options: ["Los recursos son infinitos", "Las necesidades son limitadas", "Los recursos son finitos y las necesidades ilimitadas", "El gobierno no imprime suficiente dinero"], correctAnswer: 2 }
        ]
      }
    ]
  }
};

// Fix: Adjusted MOCK_USERS to match the User and Profile interfaces defined in types.ts
export const MOCK_USERS: User[] = [
  { 
    id: "u1", 
    email: "estudiante@ejemplo.com", 
    profile: { id: "u1", full_name: "Estudiante Ejemplo", role: UserRole.STUDENT, course_id: "eeso206-4d" } 
  },
  { 
    id: "t1", 
    email: "profesor@campus.com", 
    profile: { id: "t1", full_name: "Profesor Campus", role: UserRole.TEACHER, course_id: "all" } 
  }
];
