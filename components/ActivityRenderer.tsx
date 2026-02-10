import React from "react";

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

export const ActivityRenderer: React.FC<{ a: any; index: number }> = ({ a, index }) => {

  const kind = String(a?.kind ?? "").toLowerCase() as ActivityKind;

  const badgeTone =
    kind === "study_guide" ? "bg-sky-500/10 border-sky-500/20 text-sky-200" :
    kind === "table_fill" ? "bg-violet-500/10 border-violet-500/20 text-violet-200" :
    kind === "match_pairs" ? "bg-amber-500/10 border-amber-500/20 text-amber-200" :
    kind === "classify" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" :
    kind === "fill_blanks" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-200" :
    kind === "case_study" ? "bg-rose-500/10 border-rose-500/20 text-rose-200" :
    kind === "timeline" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-200" :
    kind === "debate_cards" ? "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-200" :
    kind === "data_snap" ? "bg-lime-500/10 border-lime-500/20 text-lime-200" :
    "bg-orange-500/10 border-orange-500/20 text-orange-200";

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
          <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${badgeTone}`}>
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
        <KindBody a={a} kind={kind} />
      </div>
    </div>
  );
}

function KindBody({ a, kind }: { a: any; kind: string }) {
  const d = a?.data ?? a ?? {}; // soporte: si data no existe, usamos a como fallback

  // 1) Study guide
  if (kind === "study_guide") {
    const questions = d?.questions ?? a?.questions ?? [];
    if (!Array.isArray(questions) || questions.length === 0) return null;

    return (
      <ul className="space-y-2 text-sm text-slate-200">
        {questions.map((q: any, i: number) => (
          <li key={q?.id ?? i} className="flex gap-3">
            <span className="text-slate-500">{i + 1}.</span>
            <span>{q?.prompt ?? q?.question ?? String(q)}</span>
          </li>
        ))}
      </ul>
    );
  }

  // 2) Table fill
  if (kind === "table_fill") {
    const columns = d?.columns ?? [];
    const rows = d?.rows ?? [];
    if (!Array.isArray(columns) || !Array.isArray(rows) || columns.length === 0) return null;

    return (
      <div className="overflow-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm text-slate-200">
          <thead className="bg-slate-950/30">
            <tr>
              {columns.map((c: string, i: number) => (
                <th key={i} className="text-left px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-400">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, ri: number) => (
              <tr key={r?.id ?? ri} className="border-t border-slate-800">
                {(r?.cells ?? []).map((cell: string, ci: number) => (
                  <td key={ci} className="px-3 py-2 align-top">
                    {cell || <span className="text-slate-600">…</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 3) Match pairs
  if (kind === "match_pairs") {
    const pairs = d?.pairs ?? [];
    if (!Array.isArray(pairs) || pairs.length === 0) return null;

    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {pairs.map((p: any, i: number) => (
          <div key={p?.id ?? i} className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
            <div className="text-sm font-bold text-white">{p?.left ?? "…"}</div>
            <div className="mt-2 text-xs text-slate-300">→ {p?.right ?? "…"}</div>
          </div>
        ))}
      </div>
    );
  }

  // 4) Classify
  if (kind === "classify") {
    const categories = d?.categories ?? [];
    const items = d?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {items.map((it: any, i: number) => (
            <span key={it?.id ?? i} className="text-xs text-slate-200 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-full">
              {it?.label ?? "…"}
            </span>
          ))}
        </div>
        {Array.isArray(categories) && categories.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {categories.map((c: string, i: number) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-slate-200">
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 5) Fill blanks
  if (kind === "fill_blanks") {
    const sentence = d?.sentence ?? a?.text ?? "";
    const bank = d?.bank ?? a?.bank ?? [];
    return (
      <div className="space-y-3">
        {sentence && <div className="text-sm text-slate-200 whitespace-pre-wrap">{sentence}</div>}
        {Array.isArray(bank) && bank.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bank.map((w: string, i: number) => (
              <span key={i} className="text-xs text-slate-200 bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-full">
                {w}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 6) Case study
  if (kind === "case_study") {
    const scenario = d?.scenario ?? "";
    const tasks = d?.tasks ?? [];
    return (
      <div className="space-y-3">
        {scenario && <div className="text-sm text-slate-200 whitespace-pre-wrap">{scenario}</div>}
        {Array.isArray(tasks) && tasks.length > 0 && (
          <ul className="space-y-2 text-sm text-slate-200">
            {tasks.map((t: string, i: number) => (
              <li key={i} className="flex gap-3">
                <span className="text-emerald-400">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // 7) Timeline
  if (kind === "timeline") {
    const events = d?.events ?? [];
    if (!Array.isArray(events) || events.length === 0) return null;

    const sorted = events.slice().sort((x: any, y: any) => (x?.order ?? 0) - (y?.order ?? 0));
    return (
      <div className="space-y-2">
        {sorted.map((e: any, i: number) => (
          <div key={e?.id ?? i} className="rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-slate-200">
            {e?.label ?? "…"}
          </div>
        ))}
      </div>
    );
  }

  // 8) Debate cards
  if (kind === "debate_cards") {
    const cards = d?.cards ?? [];
    if (!Array.isArray(cards) || cards.length === 0) return null;

    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {cards.map((c: any, i: number) => (
          <div key={c?.id ?? i} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-xs text-slate-500">{c?.stance ?? "Postura"}</div>
            <div className="mt-1 text-sm font-bold text-white">{c?.claim ?? "…"}</div>
            {c?.challenge && <div className="mt-2 text-xs text-slate-300">Desafío: {c.challenge}</div>}
            {c?.pdf_hint && <div className="mt-3 text-xs text-emerald-200/80">PDF: {c.pdf_hint}</div>}
          </div>
        ))}
      </div>
    );
  }

  // 9) Data snap
  if (kind === "data_snap") {
    const prompt = d?.prompt ?? "";
    const response_format = d?.response_format ?? [];
    return (
      <div className="space-y-3">
        {prompt && <div className="text-sm text-slate-200 whitespace-pre-wrap">{prompt}</div>}
        {Array.isArray(response_format) && response_format.length > 0 && (
          <div className="grid gap-2">
            {response_format.map((r: string, i: number) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-sm text-slate-300">
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 10) Mini project
  if (kind === "mini_project") {
    const deliverable = d?.deliverable ?? "";
    const steps = d?.steps ?? [];
    return (
      <div className="space-y-3">
        {deliverable && <div className="text-sm text-slate-200">Entregable: {deliverable}</div>}
        {Array.isArray(steps) && steps.length > 0 && (
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-200">
            {steps.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  return null;
}
