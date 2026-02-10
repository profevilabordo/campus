import React from "react";

type Props = {
  onClick: () => void;
};

export default function FloatingPlayButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-28 p-4 rounded-3xl shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all border border-slate-700 bg-gradient-to-br from-fuchsia-500 to-violet-600"
      title="¿Jugamos?"
    >
      <span className="text-white text-xl">🎮</span>
    </button>
  );
}
