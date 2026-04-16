import type { InterviewMode } from '../../types';

interface Props {
  mode: InterviewMode;
  onChange: (mode: InterviewMode) => void;
  disabled?: boolean;
}

const MODES: { id: InterviewMode; label: string; emoji: string; desc: string }[] = [
  { id: 'hr',        label: 'HR / Behavioral', emoji: '🤝', desc: 'Culture, background & soft skills' },
  { id: 'technical', label: 'Technical',        emoji: '⚙️', desc: 'Deep tech, architecture & tools' },
  { id: 'sysdesign', label: 'System Design',    emoji: '🏗️', desc: 'Scalability & architecture thinking' },
];

export function ModeSelector({ mode, onChange, disabled }: Props) {
  return (
    <div className="flex gap-1">
      {MODES.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            disabled={disabled}
            title={m.desc}
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200
              ${isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span>{m.emoji}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
