import { useState, useCallback, useRef } from 'react';
import type { Message, AIModel, InterviewMode } from '../types';
import { streamChat } from '../services/api';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [model, setModel]           = useState<AIModel>('claude');
  const [mode, setMode]             = useState<InterviewMode>('hr');
  const abortRef                    = useRef<boolean>(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      abortRef.current = false;

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantId = generateId();
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        model,
        timestamp: new Date(),
      };

      // Optimistically add both messages
      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      // Build history without the new assistant placeholder
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      await streamChat(content.trim(), model, mode, history, {
        onToken: (token) => {
          if (abortRef.current) return;
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: m.content + token }
                : m
            )
          );
        },
        onDone: () => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
          setIsLoading(false);
        },
        onError: (error) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: `⚠️ ${error}`, isStreaming: false }
                : m
            )
          );
          setIsLoading(false);
        },
      });
    },
    [messages, isLoading, model, mode]
  );

  const clearChat = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setIsLoading(false);
  }, []);

  const copyTranscript = useCallback(() => {
    const text = messages
      .map(m => `${m.role === 'user' ? 'Recruiter' : 'Mahesh'}: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
  }, [messages]);

  return {
    messages,
    isLoading,
    model,
    setModel,
    mode,
    setMode,
    sendMessage,
    clearChat,
    copyTranscript,
  };
}
