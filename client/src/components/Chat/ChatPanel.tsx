import { useRef, useEffect, useState } from 'react';
import { Trash2, Copy, CheckCheck, Bot, FlaskConical } from 'lucide-react';
import type { AIModel, InterviewMode, Message } from '../../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { PromptChips } from './PromptChips';
import { ModelSwitcher } from './ModelSwitcher';
import { ModeSelector } from './ModeSelector';

interface Props {
  messages: Message[];
  isLoading: boolean;
  model: AIModel;
  setModel: (m: AIModel) => void;
  mode: InterviewMode;
  setMode: (m: InterviewMode) => void;
  sendMessage: (content: string) => void;
  clearChat: () => void;
  copyTranscript: () => void;
}

const WELCOME_MESSAGE = `Hey there! 👋 I'm Mahesh's AI representative.

I have his full professional knowledge — work experience at Daimler Truck, projects, technical skills, certifications, and more.

Feel free to ask me anything you'd ask in a real interview. Try a quick question below, or type your own.`;

export function ChatPanel({
  messages, isLoading,
  model, setModel,
  mode, setMode,
  sendMessage, clearChat, copyTranscript
}: Props) {
  const bottomRef    = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = () => {
    copyTranscript();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modeLabel: Record<InterviewMode, string> = {
    hr:        '🤝 HR / Behavioral mode',
    technical: '⚙️ Technical mode',
    sysdesign: '🏗️ System Design mode',
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-chat-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-200 leading-none">Chat with Mahesh</p>
                <DemoBadge />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{modeLabel[mode]}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <>
                <button
                  onClick={handleCopy}
                  title="Copy transcript"
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  {copied
                    ? <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                    : <Copy className="w-3.5 h-3.5" />
                  }
                </button>
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Model + Mode selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <ModelSwitcher model={model} onChange={setModel} disabled={isLoading} />
          <ModeSelector  mode={mode}   onChange={setMode}  disabled={isLoading} />
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Welcome state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-slate-200 font-semibold text-base mb-2">
              Talk to Mahesh's AI
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">
              {WELCOME_MESSAGE}
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Bottom anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Prompt Chips ─────────────────────────────────────── */}
      <PromptChips mode={mode} onSelect={sendMessage} disabled={isLoading} />

      {/* ── Input ────────────────────────────────────────────── */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}

// Shows a small "Demo" pill when no API keys are configured.
// Checks once on mount via the health endpoint.
function DemoBadge() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then((data: { demoMode?: boolean }) => {
        if (data.demoMode) setIsDemo(true);
      })
      .catch(() => {});
  }, []);

  if (!isDemo) return null;

  return (
    <span
      title="No API keys set — responses are canned demos. Add keys to server/.env to enable real AI."
      className="flex items-center gap-1 text-[10px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full"
    >
      <FlaskConical className="w-2.5 h-2.5" />
      Demo
    </span>
  );
}
