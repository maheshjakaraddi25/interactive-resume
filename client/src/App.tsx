import { useChat } from './hooks/useChat';
import { SplitLayout } from './components/Layout/SplitLayout';
import { ResumePanel } from './components/Resume/ResumePanel';
import { ChatPanel } from './components/Chat/ChatPanel';

export default function App() {
  const chat = useChat();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      <SplitLayout
        left={
          <ResumePanel
            onAskAbout={(prompt) => chat.sendMessage(prompt)}
          />
        }
        right={
          <ChatPanel {...chat} />
        }
      />
    </div>
  );
}
