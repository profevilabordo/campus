// pages/ActivityGallery.tsx
import React, { useMemo, useState } from "react";

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

function uid(prefix = "a") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type SectionKey = "umbral" | "nucleo" | "sabias";

type GalleryTemplate = {
  id: string;
  section: SectionKey;
  emoji: string;
  title: string;
  subtitle: string;
  level: string;
  tone: string; // tailwind tone classes
  makeActivity: () => Activity;
};

export default function ActivityGallery({
  onPick,
}: {
  onPick: (a: Activity) => void;
}) {
  const [section, setSection] = useState<SectionKey>("nucleo");

  const sections = [
    {
      key: "umbral" as const,
      label: "UMBRAL",
      icon: "🚪",
      tone: "bg-amber-500/10 border-amber-500/20 text-amber-100",
      glow: "shadow-[0_0_60px_rgba(245,158,11,0.18)]",
    },
    {
      key: "nucleo" as const,
      label: "NÚCLEO",
      icon: "⚛️",
      tone: "bg-indigo-500/10 border-indigo-500/20 text-indigo-100",
      glow: "shadow-[0_0_60px_rgba(99,102,241,0.20)]",
    },
    {
      key: "sabias" as const,
      label: "SABÍAS",
      icon: "✨",
      tone: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-100",
      glow: "shadow-[0_0_60px_rgba(236,72,153,0.18)]",
    },
  ];

  const templates: GalleryTemplate[] = useMemo(() => {
    return [
      // =========================
      // UMBRAL
      // =========================
      {
        id: "umbral-preguntas-pista",
        section: "umbral",
        emoji: "🔥",
        title: "Preguntas disparadoras con pista",
        subtitle: "Tocan y se revela una pista (engancha con la realidad).",
        level: "Activar",
        tone: "border-amber-500/20 bg-amber-500/10",
        makeActivity: () => ({
          id: uid("act"),
          kind: "study_guide",
          title: "🔥 UMBRAL — Preguntas disparadoras",
          instructions:
            "Elegí 2 preguntas. Respondé con tu experiencia y sumá una referencia del PDF (idea o sección). Prohibido copiar textual.",
          difficulty: "suave",
          time_min: 8,
          pdf_required: true,
          pdf_hint: "Buscá una idea del PDF que conecte con tu respuesta.",
          tags: ["umbral"],
          rubric: [
            { c: "Conecta con su vida", pts: 4 },
            { c: "Trae una evidencia del PDF", pts: 3 },
            { c: "Respuesta clara y propia", pts: 3 },
          ],
          data: {
            variant: "reveal_hints",
            questions: [
              {
                id: uid("q"),
                prompt: "¿Por qué algunas cosas cuestan más en un país que en otro?",
                hint: "Pensá en tecnología en Argentina vs. otros países.",
                emoji: "💰",
              },
              {
                id: uid("q"),
                prompt: "¿Quién decide qué se produce y qué no?",
                hint: "¿Alguna vez dejaron de fabricar algo que te gustaba?",
                emoji: "🏭",
              },
              {
                id: uid("q"),
                prompt: "¿La economía existía antes del dinero?",
                hint: "¿Cómo conseguían lo que necesitaban?",
                emoji: "🌍",
              },
            ],
          },
        }),
      },
      {
        id: "umbral-termometro",
        section: "umbral",
        emoji: "🌡️",
        title: "Termómetro de saberes",
        subtitle: "Slider + etiqueta: ¿cuánto sabés antes de empezar?",
        level: "Diagnosticar",
        tone: "border-rose-500/20 bg-rose-500/10",
        makeActivity: () => ({
          id: uid("act"),
          kind: "data_snap",
          title: "🌡️ UMBRAL — Termómetro de saberes",
          instructions:
            "Mové el termómetro. Escribí una frase: ¿por qué elegiste ese nivel?",
          difficulty: "suave",
          time_min: 5,
          pdf_required: false,
          tags: ["umbral"],
          data: {
            variant: "thermometer",
            question: "¿Cuánto sabés sobre este tema antes de empezar?",
          },
        }),
      },

      // =========================
      // NÚCLEO
      // =========================
      {
        id: "nucleo-orden-tap",
        section: "nucleo",
        emoji: "📋",
        title: "Ordenar cronológicamente (tap)",
        subtitle: "Tocás en orden. Feedback inmediato + reintentar.",
        level: "Organizar",
        tone: "border-indigo-500/20 bg-indigo-500/10",
        makeActivity: () => ({
          id: uid("act"),
          kind: "timeline",
          title: "📋 NÚCLEO — Ordenar cronológicamente",
          instructions:
            "Tocá los conceptos en orden. Al final justificá 2 decisiones con una frase (PDF abierto).",
          difficulty: "media",
          time_min: 10,
          pdf_required: true,
          pdf_hint: "Ubicá en el PDF señales de secuencia / períodos / etapas.",
          tags: ["nucleo"],
          rubric: [
            { c: "Orden correcto", pts: 4 },
            { c: "Justifica con evidencia del PDF", pts: 4 },
            { c: "Reformula (no copia)", pts: 2 },
          ],
          data: {
            variant: "tap_order",
            items: [
              { id: "a", text: "Trueque", emoji: "🤝" },
              { id: "b", text: "Creación de la moneda", emoji: "🪙" },
              { id: "c", text: "Mercantilismo", emoji: "👑" },
              { id: "d", text: "Revolución Industrial", emoji: "🏭" },
              { id: "e", text: "Comercio internacional", emoji: "🚢" },
            ],
            correctOrder: ["a", "b", "c", "d", "e"],
          },
        }),
      },
      {
        id: "nucleo-clasificador-botones",
        section: "nucleo",
        emoji: "🗂️",
        title: "Clasificador por botones",
        subtitle: "Elegís categoría por botón. Verificar + conteo errores.",
        level: "Clasificar",
        tone: "border-emerald-500/20 bg-emerald-500/10",
        makeActivity: () => ({
          id: uid("act"),
          kind: "classify",
          title: "🗂️ NÚCLEO — Clasificador de conceptos",
          instructions:
            "Asigná cada concepto a su categoría. Luego verificá. Si fallás, corregí y justificá 1 corrección con el PDF.",
          difficulty: "media",
          time_min: 12,
          pdf_required: true,
          pdf_hint: "Buscá definiciones/ejemplos en el PDF para justificar una corrección.",
          tags: ["nucleo"],
          rubric: [
            { c: "Clasifica correctamente", pts: 5 },
            { c: "Corrige con criterio", pts: 3 },
            { c: "Justifica con PDF", pts: 2 },
          ],
          data: {
            variant: "buttons",
            categories: [
              { id: "micro", label: "Microeconomía", emoji: "🔍" },
              { id: "macro", label: "Macroeconomía", emoji: "🌐" },
            ],
            items: [
              { id: "i1", label: "Oferta y demanda", correct: "micro" },
              { id: "i2", label: "Inflación", correct: "macro" },
              { id: "i3", label: "Precio de un bien", correct: "micro" },
              { id: "i4", label: "PBI", correct: "macro" },
              { id: "i5", label: "Costos de producción", correct: "micro" },
              { id: "i6", label: "Desempleo", correct: "macro" },
            ],
          },
        }),
      },

      // =========================
      // SABÍAS
      // =========================
      {
        id: "sabias-flip-cards",
        section: "sabias",
        emoji: "🃏",
        title: "Flip cards de curiosidades",
        subtitle: "Tocás y se da vuelta. Memorable + emocional.",
        level: "Descubrir",
        tone: "border-fuchsia-500/20 bg-fuchsia-500/10",
        makeActivity: () => ({
          id: uid("act"),
          kind: "data_snap",
          title: "🃏 SABÍAS — Curiosidades (flip)",
          instructions:
            "Tocá 3 cartas. Elegí la que más te sorprendió y escribí por qué (1 frase).",
          difficulty: "suave",
          time_min: 7,
          pdf_required: false,
          tags: ["sabias"],
          data: {
            variant: "flip_cards",
            cards: [
              {
                id: "c1",
                front: "¿Sabías que...?",
                back:
                  "La primera moneda se acuñó en Lidia (actual Turquía) alrededor del 600 a.C. y estaba hecha de electro (oro + plata).",
                emoji: "🪙",
                tone: "amber",
              },
              {
                id: "c2",
                front: "Dato curioso",
                back:
                  "Adam Smith casi no usó la expresión 'mano invisible' en su obra, pero se volvió el concepto más famoso.",
                emoji: "🤚",
                tone: "violet",
              },
              {
                id: "c3",
                front: "¿Lo sabías?",
                back:
                  "En hiperinflación extrema hubo billetes gigantes que no alcanzaban para comprar cosas básicas.",
                emoji: "💸",
                tone: "rose",
              },
            ],
          },
        }),
      },
    ];
  }, []);

  const visible = templates.filter((t) => t.section === section);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
            Catálogo gamificado
          </div>
          <div className="mt-2 text-xl font-black text-white tracking-tight">
            Plantillas “listas para jugar”
          </div>
          <div className="mt-2 text-sm text-white/60">
            Elegís una plantilla, la cargás al Builder y la adaptás a tu unidad.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={[
              "rounded-full px-4 py-2 text-sm font-extrabold border transition",
              section === s.key
                ? `${s.tone} ${s.glow}`
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8",
            ].join(" ")}
          >
            <span className="mr-2">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {visible.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-2xl border p-4 transition-all",
              t.tone,
              "hover:bg-white/8 hover:scale-[1.01]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wider">
                  {t.level}
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  {t.emoji} {t.title}
                </div>
                <div className="mt-2 text-sm text-white/70">{t.subtitle}</div>
              </div>

              <button
                onClick={() => onPick(t.makeActivity())}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 px-3 py-2 text-xs font-black text-emerald-100"
              >
                Usar
              </button>
            </div>

            <div className="mt-4 text-[11px] text-white/50">
              Tip: “Usar” la manda al Builder para que la edites y la guardes en biblioteca.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
