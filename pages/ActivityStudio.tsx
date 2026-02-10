// pages/ActivityStudio.tsx
import React, { useEffect, useMemo, useState } from "react";
import ActivityGallery from "./ActivityGallery";

/**
 * Activity Studio — Diseñador/preview de actividades
 * + MODO GALERÍA (catálogo gamificado)
 * - Paleta (10 tipos)
 * - Editor de datos (rápido y usable)
 * - Preview potente (estilo poster)
 * - Guardado local (localStorage) para ir coleccionando y probando
 */

type ActivityKind =
  | "study_guide"
  | "table_fill"
  | "match_pairs"
  | "classify"
  | "fill_blanks"
  | "case_study"
  | "timeline"
  | "debate_cards"
  | "data_snap"
  | "mini_project";

type Difficulty = "suave" | "media" | "fuerte";

type Activity = {
  id: string;
  kind: ActivityKind;
  title: string;
  instructions?: string;
  difficulty?: Difficulty;
  time_min?: number;
  pdf_required?: boolean;
  pdf_hint?: string;
  tags?: string[];
  rubric?: { c: string; pts: number }[];
  data: Record<string, any>;
};

type SavedActivity = {
  id: string;
  created_at: string;
  activity: Activity;
};

const LS_KEY = "cv_activity_studio_library_v1";

const KIND_LABEL: Record<ActivityKind, string> = {
  study_guide: "Study Guide",
  table_fill: "Table Fill",
  match_pairs: "Match Pairs",
  classify: "Classify",
  fill_blanks: "Fill Blanks",
  case_study: "Case Study",
  timeline: "Timeline",
  debate_cards: "Debate Cards",
  data_snap: "Data Snap",
  mini_project: "Mini Project",
};

const KIND_BADGE: Record<ActivityKind, { label: string; tone: string }> = {
  study_guide: { label: "GUÍA", tone: "bg-sky-500/10 text-sky-200 border-sky-500/20" },
  table_fill: { label: "TABLA", tone: "bg-violet-500/10 text-violet-200 border-violet-500/20" },
  match_pairs: { label: "MATCH", tone: "bg-amber-500/10 text-amber-200 border-amber-500/20" },
  classify: { label: "CLASIFICAR", tone: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20" },
  fill_blanks: { label: "COMPLETAR", tone: "bg-indigo-500/10 text-indigo-200 border-indigo-500/20" },
  case_study: { label: "CASO", tone: "bg-rose-500/10 text-rose-200 border-rose-500/20" },
  timeline: { label: "TIEMPO", tone: "bg-cyan-500/10 text-cyan-200 border-cyan-500/20" },
  debate_cards: { label: "DEBATE", tone: "bg-fuchsia-500/10 text-fuchsia-200 border-fuchsia-500/20" },
  data_snap: { label: "DATA", tone: "bg-lime-500/10 text-lime-200 border-lime-500/20" },
  mini_project: { label: "PROYECTO", tone: "bg-orange-500/10 text-orange-200 border-orange-500/20" },
};

function uid(prefix = "a") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function loadLibrary(): SavedActivity[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveLibrary(items: SavedActivity[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

function template(kind: ActivityKind): Activity {
  const base: Activity = {
    id: uid("act"),
    kind,
    title: `Nueva actividad: ${KIND_LABEL[kind]}`,
    instructions: "Regla sagrada: PDF abierto. Reformulá y justificá.",
    difficulty: "media",
    time_min: 12,
    pdf_required: true,
    pdf_hint: "Indicá sección/página del PDF",
    tags: ["nucleo"],
    rubric: [
      { c: "Usa evidencia del PDF", pts: 3 },
      { c: "Reformula (no copia)", pts: 3 },
      { c: "Justifica con argumentos", pts: 4 },
    ],
    data: {},
  };

  switch (kind) {
    case "study_guide":
      base.data = {
        questions: [
          { id: uid("q"), prompt: "Definí con tus palabras el concepto central y poné un ejemplo cotidiano." },
          { id: uid("q"), prompt: "Ubicá 2 ideas del PDF y explicá por qué importan." },
          { id: uid("q"), prompt: "Elegí una pregunta del Umbral y respondela con 2 evidencias del texto." },
        ],
      };
      break;

    case "table_fill":
      base.data = {
        columns: ["Aspecto", "Antigüedad", "Edad Media", "Evidencia del PDF"],
        rows: [
          { id: uid("r"), cells: ["Producción", "", "", ""] },
          { id: uid("r"), cells: ["Trabajo", "", "", ""] },
          { id: uid("r"), cells: ["Control del excedente", "", "", ""] },
        ],
      };
      break;

    case "match_pairs":
      base.data = {
        pairs: [
          { id: uid("p"), left: "Escasez", right: "No alcanza para todo" },
          { id: uid("p"), left: "Costo de oportunidad", right: "Renunciar a una alternativa" },
          { id: uid("p"), left: "Excedente", right: "Lo que sobra luego de cubrir lo básico" },
        ],
      };
      break;

    case "classify":
      base.data = {
        categories: ["Antigüedad", "Edad Media"],
        items: [
          { id: uid("i"), label: "Esclavitud", correct: "Antigüedad" },
          { id: uid("i"), label: "Feudalismo", correct: "Edad Media" },
          { id: uid("i"), label: "Tributos", correct: "Edad Media" },
        ],
      };
      break;

    case "fill_blanks":
      base.data = {
        sentence:
          "La economía aparece cuando una sociedad enfrenta ____ y debe decidir cómo usar ____ para satisfacer ____. Cada elección implica renunciar a ____, lo que se conoce como ____.",
        bank: ["escasez", "recursos", "necesidades", "alternativas", "costo de oportunidad"],
      };
      break;

    case "case_study":
      base.data = {
        scenario:
          "Mini-caso: una comunidad tiene 100 unidades de alimentos y 4 grupos con necesidades distintas. Deben definir un criterio de asignación.",
        tasks: [
          "Proponé un criterio (equidad, eficiencia, urgencia, mérito, etc.).",
          "Defendelo con 2 ideas del PDF (reformuladas).",
          "Explicá qué gana y qué pierde cada grupo.",
        ],
      };
      break;

    case "timeline":
      base.data = {
        events: [
          { id: uid("e"), label: "Organización básica de la producción", order: 1 },
          { id: uid("e"), label: "Jerarquías y control del excedente", order: 2 },
          { id: uid("e"), label: "Cambios en trabajo y propiedad", order: 3 },
        ],
      };
      break;

    case "debate_cards":
      base.data = {
        cards: [
          {
            id: uid("c"),
            stance: "Postura A",
            claim: "La escasez es un problema de elección, no de falta total.",
            challenge: "Mostrá un ejemplo cotidiano + 1 evidencia del PDF.",
            pdf_hint: "Buscá la parte donde se explica escasez/decisión.",
          },
          {
            id: uid("c"),
            stance: "Postura B",
            claim: "El poder define quién se queda con el excedente.",
            challenge: "Señalá 2 mecanismos (coerción, consenso, jerarquía).",
            pdf_hint: "Sección sobre autoridad/jerarquías.",
          },
        ],
      };
      break;

    case "data_snap":
      base.data = {
        prompt:
          "Data Snap: elegí un dato/tabla/ejemplo del PDF y convertílo en 3 conclusiones (una obvia, una inferida, una discutible).",
        response_format: ["Conclusión 1", "Conclusión 2", "Conclusión 3"],
      };
      break;

    case "mini_project":
      base.data = {
        deliverable: "1 hoja en carpeta: criterio + evidencia + conclusión personal.",
        steps: [
          "Elegí un concepto del PDF (escasez, excedente, poder, trabajo).",
          "Explicalo con ejemplo actual (tu barrio/escuela).",
          "Comparalo con Antigüedad o Edad Media (una diferencia clave).",
        ],
      };
      break;
  }

  return base;
}

function pretty(obj: any) {
  return JSON.stringify(obj, null, 2);
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] rounded-full bg-white/8 text-white/70 px-3 py-1 border border-white/10">
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-[11px] font-black uppercase tracking-widest text-white/50">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-sky-500/30"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="text-[11px] font-black uppercase tracking-widest text-white/50">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-sky-500/30"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-sm text-white/80">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "h-7 w-12 rounded-full border border-white/10 transition relative",
          checked ? "bg-emerald-500/30" : "bg-white/10",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-6 w-6 rounded-full bg-white/80 transition",
            checked ? "left-5" : "left-0.5",
          ].join(" ")}
        />
      </button>
    </label>
  );
}

function Badge({ kind }: { kind: ActivityKind }) {
  const b = KIND_BADGE[kind];
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${b.tone}`}>
      {b.label}
    </span>
  );
}

/** Preview potente (estilo poster) */
function ActivityPreview({ a }: { a: Activity }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50">Actividad</div>
          <div className="text-lg font-extrabold text-white leading-tight">{a.title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge kind={a.kind} />
            {a.difficulty && <Chip>Dificultad: {a.difficulty}</Chip>}
            {a.time_min != null && <Chip>~{a.time_min} min</Chip>}
            {a.pdf_required && <Chip>PDF abierto</Chip>}
          </div>
        </div>
      </div>

      {a.instructions && <div className="mt-4 text-sm text-white/75 whitespace-pre-wrap leading-relaxed">{a.instructions}</div>}

      {a.pdf_hint && (
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-200/80">Pista de PDF</div>
          <div className="mt-2 text-sm text-emerald-50/80">{a.pdf_hint}</div>
        </div>
      )}

      <div className="mt-5">
        <ActivityKindPreview a={a} />
      </div>

      {Array.isArray(a.rubric) && a.rubric.length > 0 && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Rúbrica</div>
          <div className="mt-3 grid gap-2">
            {a.rubric.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-sm text-white/80">{r.c}</div>
                <div className="text-xs font-black text-white/60">{r.pts} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Preview por tipo */
function ActivityKindPreview({ a }: { a: Activity }) {
  const d = a.data || {};

  const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-white/50">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );

  switch (a.kind) {
    case "study_guide":
      return (
        <Box title="Preguntas">
          <ul className="space-y-2 text-sm text-white/80">
            {(d.questions ?? []).map((q: any, i: number) => (
              <li key={q.id ?? i} className="flex gap-3">
                <span className="text-white/40">{i + 1}.</span>
                <span>{q.prompt}</span>
              </li>
            ))}
          </ul>
        </Box>
      );

    case "table_fill":
      return (
        <Box title="Tabla a completar">
          <div className="overflow-auto rounded-xl border border-white/10">
            <table className="w-full text-sm text-white/80">
              <thead className="bg-white/5">
                <tr>
                  {(d.columns ?? []).map((c: string, i: number) => (
                    <th key={i} className="text-left px-3 py-2 font-bold text-white/70">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(d.rows ?? []).map((r: any, ri: number) => (
                  <tr key={r.id ?? ri} className="border-t border-white/10">
                    {(r.cells ?? []).map((cell: string, ci: number) => (
                      <td key={ci} className="px-3 py-2 align-top">
                        {cell || <span className="text-white/30">…</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Box>
      );

    case "match_pairs":
      return (
        <Box title="Unir pares">
          <div className="grid md:grid-cols-2 gap-3">
            {(d.pairs ?? []).map((p: any, i: number) => (
              <div key={p.id ?? i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-bold text-white">{p.left}</div>
                <div className="mt-2 text-xs text-white/60">→ {p.right}</div>
              </div>
            ))}
          </div>
        </Box>
      );

    case "classify":
      return (
        <Box title="Clasificar">
          <div className="flex flex-wrap gap-2">
            {(d.items ?? []).map((it: any, i: number) => (
              <span key={it.id ?? i} className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">
                {it.label}
              </span>
            ))}
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {(d.categories ?? []).map((c: any, i: number) => (
              <div key={c?.id ?? i} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                {typeof c === "string" ? c : c?.label}
              </div>
            ))}
          </div>
        </Box>
      );

    case "fill_blanks":
      return (
        <Box title="Completar con banco">
          <div className="text-sm text-white/80 whitespace-pre-wrap">{d.sentence}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(d.bank ?? []).map((w: string, i: number) => (
              <span key={i} className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">
                {w}
              </span>
            ))}
          </div>
        </Box>
      );

    case "case_study":
      return (
        <Box title="Caso">
          <div className="text-sm text-white/80 whitespace-pre-wrap">{d.scenario}</div>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {(d.tasks ?? []).map((t: string, i: number) => (
              <li key={i} className="flex gap-3">
                <span className="text-white/40">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Box>
      );

    case "timeline":
      return (
        <Box title="Línea de tiempo (ordenar)">
          <div className="space-y-2">
            {(d.events ?? [])
              .slice()
              .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
              .map((e: any, i: number) => (
                <div key={e.id ?? i} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                  {e.label}
                </div>
              ))}
          </div>
        </Box>
      );

    case "debate_cards":
      return (
        <Box title="Cartas de debate">
          <div className="grid md:grid-cols-2 gap-3">
            {(d.cards ?? []).map((c: any, i: number) => (
              <div key={c.id ?? i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/50">{c.stance}</div>
                <div className="mt-1 text-sm font-bold text-white">{c.claim}</div>
                <div className="mt-2 text-xs text-white/70">Desafío: {c.challenge}</div>
                {c.pdf_hint && <div className="mt-3 text-xs text-emerald-200/80">PDF: {c.pdf_hint}</div>}
              </div>
            ))}
          </div>
        </Box>
      );

    case "data_snap":
      return (
        <Box title="Data Snap">
          <div className="text-sm text-white/80 whitespace-pre-wrap">{d.prompt}</div>
          <div className="mt-3 grid gap-2">
            {(d.response_format ?? []).map((r: string, i: number) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                {r}
              </div>
            ))}
          </div>
        </Box>
      );

    case "mini_project":
      return (
        <Box title="Mini proyecto">
          {d.deliverable && <div className="text-sm text-white/80">Entregable: {d.deliverable}</div>}
          <ol className="mt-3 space-y-2 text-sm text-white/75 list-decimal list-inside">
            {(d.steps ?? []).map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Box>
      );

    default:
      return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Sin preview para este tipo.
        </div>
      );
  }
}

function LibraryList({
  items,
  onLoad,
  onDelete,
}: {
  items: SavedActivity[];
  onLoad: (a: Activity) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
        Todavía no guardaste nada. Diseñá una actividad y tocá “Guardar en biblioteca”.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/50">
                {KIND_LABEL[it.activity.kind]}
              </div>
              <div className="text-sm font-bold text-white">{it.activity.title}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge kind={it.activity.kind} />
                {it.activity.difficulty && <Chip>{it.activity.difficulty}</Chip>}
                {it.activity.time_min != null && <Chip>~{it.activity.time_min} min</Chip>}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onLoad(it.activity)}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-3 py-2 text-xs font-bold text-white/80"
              >
                Cargar
              </button>
              <button
                onClick={() => onDelete(it.id)}
                className="rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-200"
              >
                Borrar
              </button>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-white/40">
            Guardado: {new Date(it.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivityStudio() {
  const [mode, setMode] = useState<"builder" | "gallery">("builder");

  const [kind, setKind] = useState<ActivityKind>("study_guide");
  const [activity, setActivity] = useState<Activity>(() => template("study_guide"));
  const [library, setLibrary] = useState<SavedActivity[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "json" | "library">("editor");

  useEffect(() => {
    setLibrary(loadLibrary());
  }, []);

  const posterBg = useMemo(() => {
    return [
      "min-h-screen text-white",
      "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950",
      "relative overflow-hidden",
    ].join(" ");
  }, []);

  function setField<K extends keyof Activity>(k: K, v: Activity[K]) {
    setActivity((prev) => ({ ...prev, [k]: v }));
  }

  function setData(patch: Record<string, any>) {
    setActivity((prev) => ({ ...prev, data: { ...(prev.data || {}), ...patch } }));
  }

  function pickKind(k: ActivityKind) {
    setKind(k);
    setActivity(template(k));
    setActiveTab("editor");
    setMode("builder");
  }

  function onSave() {
    const entry: SavedActivity = {
      id: uid("saved"),
      created_at: new Date().toISOString(),
      activity: { ...activity, id: activity.id || uid("act") },
    };
    const next = [entry, ...library];
    setLibrary(next);
    saveLibrary(next);
    setActiveTab("library");
    setMode("builder");
  }

  function onDelete(id: string) {
    const next = library.filter((x) => x.id !== id);
    setLibrary(next);
    saveLibrary(next);
  }

  function onLoad(a: Activity) {
    setKind(a.kind);
    setActivity({ ...a });
    setActiveTab("editor");
    setMode("builder");
  }

  function addQuestion() {
    const qs = Array.isArray(activity.data?.questions) ? activity.data.questions : [];
    setData({ questions: [...qs, { id: uid("q"), prompt: "Nueva pregunta…" }] });
  }

  function addPair() {
    const pairs = Array.isArray(activity.data?.pairs) ? activity.data.pairs : [];
    setData({ pairs: [...pairs, { id: uid("p"), left: "Izquierda…", right: "Derecha…" }] });
  }

  function addClassifyItem() {
    const items = Array.isArray(activity.data?.items) ? activity.data.items : [];
    const cats = Array.isArray(activity.data?.categories) ? activity.data.categories : ["A", "B"];
    setData({ items: [...items, { id: uid("i"), label: "Item…", correct: typeof cats[0] === "string" ? cats[0] : cats[0]?.id ?? "A" }] });
  }

  function addTimelineEvent() {
    const events = Array.isArray(activity.data?.events) ? activity.data.events : [];
    setData({ events: [...events, { id: uid("e"), label: "Evento…", order: events.length + 1 }] });
  }

  function addDebateCard() {
    const cards = Array.isArray(activity.data?.cards) ? activity.data.cards : [];
    setData({
      cards: [
        ...cards,
        {
          id: uid("c"),
          stance: "Postura…",
          claim: "Afirmación…",
          challenge: "Desafío…",
          pdf_hint: "Sección/página…",
        },
      ],
    });
  }

  const EditorPanel = (
    <div className="space-y-4">
      <Field label="Título" value={activity.title} onChange={(v) => setField("title", v)} placeholder="Título con fuerza…" />
      <TextArea
        label="Instrucciones"
        value={activity.instructions ?? ""}
        onChange={(v) => setField("instructions", v)}
        placeholder="Regla sagrada + foco + entrega…"
        rows={4}
      />

      <div className="grid md:grid-cols-3 gap-3">
        <label className="block">
          <div className="text-[11px] font-black uppercase tracking-widest text-white/50">Dificultad</div>
          <select
            value={activity.difficulty ?? "media"}
            onChange={(e) => setField("difficulty", e.target.value as Difficulty)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="suave">suave</option>
            <option value="media">media</option>
            <option value="fuerte">fuerte</option>
          </select>
        </label>

        <label className="block">
          <div className="text-[11px] font-black uppercase tracking-widest text-white/50">Tiempo (min)</div>
          <input
            type="number"
            value={activity.time_min ?? 10}
            onChange={(e) => setField("time_min", Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-sky-500/30"
          />
        </label>

        <Toggle label="Requiere PDF" checked={!!activity.pdf_required} onChange={(v) => setField("pdf_required", v)} />
      </div>

      <Field label="PDF hint" value={activity.pdf_hint ?? ""} onChange={(v) => setField("pdf_hint", v)} placeholder="Sección / página / idea guía…" />

      {/* Editor rápido por tipo */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Editor por tipo</div>
            <div className="text-sm font-bold text-white">{KIND_LABEL[kind]}</div>
          </div>

          <div className="flex gap-2">
            {kind === "study_guide" && (
              <button onClick={addQuestion} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-3 py-2 text-xs font-bold text-white/80">
                + Pregunta
              </button>
            )}
            {kind === "match_pairs" && (
              <button onClick={addPair} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-3 py-2 text-xs font-bold text-white/80">
                + Par
              </button>
            )}
            {kind === "classify" && (
              <button onClick={addClassifyItem} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-3 py-2 text-xs font-bold text-white/80">
                + Ítem
              </button>
            )}
            {kind === "timeline" && (
              <button onClick={addTimelineEvent} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-3 py-2 text-xs font-bold text-white/80">
                + Evento
              </button>
            )}
            {kind === "debate_cards" && (
              <button onClick={addDebateCard} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-3 py-2 text-xs font-bold text-white/80">
                + Carta
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <TextArea
            label="DATA (JSON) — editable"
            value={pretty(activity.data || {})}
            onChange={(v) => {
              try {
                const parsed = JSON.parse(v);
                setActivity((prev) => ({ ...prev, data: parsed }));
              } catch {
                // si hay error de JSON, no rompemos el estado
              }
            }}
            rows={10}
          />
          <div className="mt-2 text-xs text-white/40">
            Tip: acá tenés control total. Editás y mirás el preview en vivo. Si el JSON queda inválido, no se aplica.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onSave}
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 px-4 py-2 text-sm font-extrabold text-emerald-100"
        >
          Guardar en biblioteca
        </button>

        <button
          onClick={() => setActivity(template(kind))}
          className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-4 py-2 text-sm font-bold text-white/80"
        >
          Reset template
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(pretty(activity))}
          className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-4 py-2 text-sm font-bold text-white/80"
        >
          Copiar JSON
        </button>
      </div>
    </div>
  );

  return (
    <div className={posterBg}>
      {/* halos tipo poster */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-40 h-[520px] w-[520px] rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">Campus · Cuaderno Vivo</div>
            <h1 className="mt-2 text-3xl font-black text-white leading-tight">Activity Studio</h1>
            <p className="mt-2 text-white/60 max-w-2xl">
              Diseñá actividades poderosas, miralas como alumno y guardá tus favoritas.
              Ahora también tenés un catálogo gamificado para inspirarte rápido.
            </p>
          </div>

          {/* MODE SWITCH */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode("builder")}
              className={[
                "rounded-full px-4 py-2 text-sm font-black border transition",
                mode === "builder" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8",
              ].join(" ")}
            >
              🧪 Builder
            </button>
            <button
              onClick={() => setMode("gallery")}
              className={[
                "rounded-full px-4 py-2 text-sm font-black border transition",
                mode === "gallery" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8",
              ].join(" ")}
            >
              🎮 Galería
            </button>
          </div>
        </div>

        {/* ====== GALERÍA ====== */}
        {mode === "gallery" && (
          <div className="mt-8">
            <ActivityGallery
              onPick={(a) => {
                // cargar plantilla al builder
                setKind(a.kind);
                setActivity(a);
                setActiveTab("editor");
                setMode("builder");
              }}
            />
          </div>
        )}

        {/* ====== BUILDER (lo tuyo) ====== */}
        {mode === "builder" && (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("editor")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-bold border",
                  activeTab === "editor" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8",
                ].join(" ")}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-bold border",
                  activeTab === "json" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8",
                ].join(" ")}
              >
                JSON
              </button>
              <button
                onClick={() => setActiveTab("library")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-bold border",
                  activeTab === "library" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8",
                ].join(" ")}
              >
                Biblioteca ({library.length})
              </button>
            </div>

            {/* Main grid */}
            <div className="mt-8 grid lg:grid-cols-12 gap-6">
              {/* Palette */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Paleta (10)</div>
                  <div className="mt-3 space-y-2">
                    {(Object.keys(KIND_LABEL) as ActivityKind[]).map((k) => (
                      <button
                        key={k}
                        onClick={() => pickKind(k)}
                        className={[
                          "w-full text-left rounded-2xl border p-3 transition",
                          k === kind ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/8",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-extrabold text-white">{KIND_LABEL[k]}</div>
                            <div className="mt-1 text-xs text-white/50">Diseñala · probala · guardala</div>
                          </div>
                          <Badge kind={k} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Biblioteca compacta */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Colección</div>
                    <button
                      onClick={() => {
                        setLibrary([]);
                        saveLibrary([]);
                      }}
                      className="text-xs font-bold text-rose-200/80 hover:text-rose-200"
                    >
                      vaciar
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-white/70">
                    Guardás acá tus actividades favoritas para reutilizarlas después.
                  </div>
                </div>
              </div>

              {/* Center */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  {activeTab === "editor" && EditorPanel}

                  {activeTab === "json" && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/50">JSON espejo</div>
                      <pre className="mt-3 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/80">
                        {pretty(activity)}
                      </pre>
                    </div>
                  )}

                  {activeTab === "library" && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Biblioteca</div>
                      <div className="mt-4">
                        <LibraryList items={library} onLoad={onLoad} onDelete={onDelete} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Preview */}
              <div className="lg:col-span-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Preview (modo alumno)</div>
                  <div className="mt-4">
                    <ActivityPreview a={activity} />
                  </div>

                  <div className="mt-4 text-xs text-white/40">
                    Este preview es el “contrato”: lo que diseñás acá es lo que después renderiza el NÚCLEO.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
