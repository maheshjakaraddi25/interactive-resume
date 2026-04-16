import { useRef, useState, type KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex gap-2 items-end bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-blue-500/60 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder={disabled ? 'Waiting for response...' : 'Ask me anything — technical, behavioral, or system design...'}
          rows={1}
          className="
            flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-sm
            resize-none outline-none leading-relaxed max-h-[120px] min-h-[24px]
            py-0.5 scrollbar-none
          "
          style={{ scrollbarWidth: 'none' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0
            ${value.trim() && !disabled
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          {disabled
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </button>
      </div>
      <p className="text-center text-xs text-slate-600 mt-1.5">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
