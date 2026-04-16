import { User, Bot } from 'lucide-react';
import type { Message } from '../../types';

interface Props {
  message: Message;
}

const MODEL_BADGE: Record<string, string> = {
  claude: '🟠 Claude',
  gpt4o:  '🟢 GPT-4o',
};

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 message-enter">
        <div className="max-w-[80%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed shadow-lg shadow-blue-500/10">
            {message.content}
          </div>
          <p className="text-right text-xs text-slate-600 mt-1 pr-1">
            {formatTime(message.timestamp)}
          </p>
        </div>
        <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-blue-400" />
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex gap-2.5 message-enter">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="max-w-[85%]">
        {/* Model badge */}
        {message.model && (
          <p className="text-xs text-slate-500 mb-1 font-medium">
            {MODEL_BADGE[message.model] ?? 'AI'} · Mahesh
          </p>
        )}

        <div
          className={`
            bg-chat-panel border border-chat-border text-slate-200 rounded-2xl rounded-tl-sm
            px-4 py-2.5 text-sm leading-relaxed shadow-sm
            ${message.isStreaming ? 'streaming-cursor' : ''}
          `}
        >
          {message.content || (
            <span className="flex gap-1 items-center text-slate-500">
              <ThinkingDots />
              <span className="text-xs">Searching my experience...</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 mt-1 pl-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="flex gap-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
