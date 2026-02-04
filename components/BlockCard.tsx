
import React, { useState } from 'react';
import { BlockContent, BlockType } from '../types';
import { BLOCK_STYLES } from '../constants';

interface BlockCardProps {
  block: BlockContent;
  index: number;
  isVisited: boolean;
  onToggleVisit: () => void;
}

const BlockCard: React.FC<BlockCardProps> = ({ block, index, isVisited, onToggleVisit }) => {
  const [isOpen, setIsOpen] = useState(index === 0);
  const styles = BLOCK_STYLES[block.type];

  return (
    <div className={`unit-block mb-4 border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'ring-1 ring-slate-200 shadow-sm' : 'hover:bg-slate-50'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles.color} flex-shrink-0`}>
            {styles.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paso {index + 1}</span>
              {isVisited && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  Recorrido
                </span>
              )}
            </div>
            <h3 className="font-semibold text-slate-800 leading-tight">{block.title}</h3>
          </div>
        </div>
        <div className="text-slate-400">
          <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-6 pt-0 ml-13 sm:ml-14">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed serif whitespace-pre-wrap">{block.content}</p>
          </div>
          
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer group no-print">
              <input 
                type="checkbox" 
                checked={isVisited} 
                onChange={onToggleVisit}
                className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 transition-colors"
              />
              <span className="text-sm font-medium text-slate-500 group-hover:text-slate-800">Marcar como realizado</span>
            </label>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              {styles.label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockCard;
