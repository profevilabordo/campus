// components/ActivityPlayer.tsx
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

export const ActivityPlayer: React.FC<{ a: any; index: number }> = ({ a, index }) => {
  const kind = String(a?.kind ?? "").toLowerCase() as ActivityKind;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Actividad {index + 1}
          </div>
          <div className="mt-1 text-sm font-bold text-white leading-snug">
            {a?.title ?? `Actividad ${index + 1}`}
          </div>
        </div>
        {a?.kind && (
          <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-white/5 border-white/10 text-white/70">
            {String(a.kind)}
          </div>
        )}
      </div>

      {a?.instructions && (
        <div className="mt-2 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {a.instructions}
        </div>
      )}

      <div className="mt-4">
        <PlayerBody a={a} kind={kind} />
      </div>
    </div>
  );
};

function PlayerBody({ a, kind }: { a: any; kind: ActivityKind }) {
  const d = a?.data ?? a ?? {};

  // ✅ 1) MATCH PAIRS — versión alumno (interactiva)
  if (kind === "match_pairs") return <PlayMatchPairs d={d} />;

  // ✅ 2) FILL BLANKS — versión alumno (interactiva)
  if (kind === "fill_blanks") return <PlayFillBlanks d={d} />;

  // Por ahora, fallback: si no está gamificada aún, mostramos tu renderer “lectura”
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-300">
      ⚠️ Esta actividad todavía no tiene modo “alumno interactivo”. (Ya está lista para preview/lectura).
    </div>
  );
}

function PlayMatchPairs({ d }: { d: any }) {
  const pairs = Array.isArray(d?.pairs) ? d.pairs : [];
  const left = pairs.map((p: any) => ({ id: p.id, text: p.left }));
  const right = useMemo(() => {
    const arr = pairs.map((p: any) => ({ id: p.id, text: p.right }));
    return arr.sort(() => Math.random() - 0.5);
  }, [pairs]);

  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, boolean>>({});
  const [wrong, setWrong] = useState<string | null>(null);

  const done = pairs.length > 0 && Object.keys(matches).length === pairs.length;

  function reset() {
    setPickedLeft(null);
    setMatches({});
    setWrong(null);
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-400">
        Tocá un ítem de la izquierda y luego su par de la derecha.
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          {left.map((l: any) => {
            const isDone = !!matches[l.id];
            const isActive = pickedLeft === l.id;

            return (
              <button
                key={l.id}
                disabled={isDone}
                onClick={() => {
                  setWrong(null);
                  setPickedLeft(l.id);
                }}
                className={[
                  "w-full text-left rounded-xl border px-3 py-2 transition",
                  isDone ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-slate-800 bg-slate-950/30 text-white hover:bg-white/5",
                  isActive ? "ring-2 ring-fuchsia-500/30" : "",
                ].join(" ")}
              >
                <div className="text-sm font-bold">{l.text}</div>
                {isDone && <div className="text-[11px] text-emerald-200/80 mt-1">✅ Emparejado</div>}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {right.map((r: any) => {
            const isDone = !!matches[r.id];
            return (
              <button
                key={r.id}
                disabled={isDone || !pickedLeft}
                onClick={() => {
                  if (!pickedLeft) return;
                  if (r.id === pickedLeft) {
                    setMatches((m) => ({ ...m, [r.id]: true }));
                    setPickedLeft(null);
                    setWrong(null);
                  } else {
                    setWrong("❌ No coincide. Probá otra vez.");
                  }
                }}
                className={[
                  "w-full text-left rounded-xl border px-3 py-2 transition",
                  isDone ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-slate-800 bg-slate-950/30 text-white hover:bg-white/5",
                  (!pickedLeft || isDone) ? "opacity-60" : "",
                ].join(" ")}
              >
                <div className="text-sm">{r.text}</div>
              </button>
            );
          })}
        </div>
      </div>

      {wrong && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {wrong}
        </div>
      )}

      {done && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          🎉 ¡Perfecto! Completaste todos los pares.
        </div>
      )}

      <button
        onClick={reset}
        className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-white/80"
      >
        Reset
      </button>
    </div>
  );
}

function PlayFillBlanks({ d }: { d: any }) {
  const sentence = String(d?.sentence ?? "");
  const bank = Array.isArray(d?.bank) ? d.bank : [];

  // estrategia simple: alumno escribe libre, pero ve banco.
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-3">
      {sentence && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-slate-200 whitespace-pre-wrap">
          {sentence}
        </div>
      )}

      {bank.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {bank.map((w: string, i: number) => (
            <span
              key={i}
              className="text-xs text-slate-200 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-full"
            >
              {w}
            </span>
          ))}
        </div>
      )}

      <textarea
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setChecked(false);
        }}
        placeholder="Escribí la oración completa completando los espacios…"
        rows={4}
        className="w-full rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-sky-500/30"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setChecked(true)}
          className="rounded-xl border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/15 px-3 py-2 text-xs font-black text-sky-100"
        >
          Comprobar
        </button>
        <button
          onClick={() => {
            setAnswer("");
            setChecked(false);
          }}
          className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-white/80"
        >
          Reset
        </button>
      </div>

      {checked && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          ✅ Listo. (Acá después le metemos autocorrección si querés, pero primero hagamos experiencia).
        </div>
      )}
    </div>
  );
}
