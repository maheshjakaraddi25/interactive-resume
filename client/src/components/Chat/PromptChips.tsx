import { Sparkles } from 'lucide-react';
import { promptChips } from '../../data/resumeData';
import type { InterviewMode } from '../../types';

interface Props {
  mode: InterviewMode;
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptChips({ mode, onSelect, disabled }: Props) {
  const filtered = promptChips.filter(
    (chip) => chip.mode === mode || chip.mode === 'all'
  );

  return (
    <div className="px-4 py-3 border-t border-chat-border">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3 h-3 text-blue-400" />
        <span className="text-xs text-slate-500 font-medium">Quick questions</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filtered.map((chip) => (
          <button
            key={chip.label}
            onClick={() => !disabled && onSelect(chip.prompt)}
            disabled={disabled}
            className={`
              text-xs px-2.5 py-1 rounded-full border transition-all duration-150
              bg-slate-800 border-slate-700 text-slate-300
              hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-300
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
