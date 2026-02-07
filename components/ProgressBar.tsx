import React from "react";

interface ProgressBarProps {
  visitedCount: number;
  totalBlocks: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ visitedCount, totalBlocks }) => {
  const progressPercentage = Math.round((visitedCount / totalBlocks) * 100);
  const isComplete = progressPercentage === 100;

  return (
    <div className="mt-4">
      <div className="relative h-[4px] w-full bg-slate-800 rounded-full overflow-hidden">
        
        <div
          className={`
            h-full rounded-full transition-all duration-700
            ${isComplete ? "bg-emerald-400" : "bg-blue-500"}
            ${isComplete 
              ? "shadow-[0_0_18px_rgba(16,185,129,0.9)]" 
              : "shadow-[0_0_12px_rgba(59,130,246,0.7)]"}
          `}
          style={{ width: `${progressPercentage}%` }}
        />

        <div
          className={`
            absolute inset-0 blur-md opacity-50 transition-all duration-700
            ${isComplete ? "bg-emerald-400" : "bg-blue-400"}
          `}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex justify-end items-center gap-3 text-sm text-slate-400 mt-2">
        <span>
          Recorrido: {visitedCount} de {totalBlocks}
        </span>
      </div>

      {isComplete && (
        <div className="text-emerald-400 text-xs mt-2 animate-pulse">
          ✔ Unidad completada
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
