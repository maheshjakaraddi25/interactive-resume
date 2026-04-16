import type { ReactNode } from 'react';

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function SplitLayout({ left, right }: SplitLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Resume Panel — 55% */}
      <div className="w-[55%] min-w-[480px] h-full overflow-y-auto bg-white resume-scroll border-r border-slate-200">
        {left}
      </div>

      {/* Chat Panel — 45% */}
      <div className="flex-1 h-full flex flex-col overflow-hidden bg-chat-bg">
        {right}
      </div>
    </div>
  );
}
