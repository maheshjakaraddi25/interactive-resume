import type { AIModel } from '../../types';

interface Props {
  model: AIModel;
  onChange: (model: AIModel) => void;
  disabled?: boolean;
}

const MODELS: { id: AIModel; label: string; badge: string; color: string }[] = [
  {
    id: 'claude',
    label: 'Claude',
    badge: 'Sonnet 3.5',
    color: 'from-orange-500 to-amber-400',
  },
  {
    id: 'gpt4o',
    label: 'GPT-4o',
    badge: 'OpenAI',
    color: 'from-emerald-500 to-teal-400',
  },
];

export function ModelSwitcher({ model, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
      {MODELS.map((m) => {
        const isActive = model === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            disabled={disabled}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${m.color} ${
                isActive ? 'opacity-100' : 'opacity-40'
              }`}
            />
            {m.label}
            <span className={`text-[10px] ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
              {m.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
