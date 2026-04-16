import { Users } from 'lucide-react';
import { resumeData } from '../../data/resumeData';
import { SectionHeader } from './WorkExperience';

interface Props { onAskAbout: (prompt: string) => void; }

export function Leadership({ onAskAbout }: Props) {
  const { leadership } = resumeData;

  return (
    <section className="pb-4">
      <SectionHeader icon={<Users className="w-4 h-4" />} title="Leadership & Activities" />

      <ul className="mt-3 space-y-2">
        {leadership.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-xs text-slate-600 leading-relaxed cursor-pointer group resume-item"
            onClick={() =>
              onAskAbout(
                `Tell me about your leadership experience: "${item.description.slice(0, 60)}..."`
              )
            }
          >
            <span className="text-blue-400 mt-0.5 shrink-0">•</span>
            <span className="group-hover:text-blue-700 transition-colors">{item.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
