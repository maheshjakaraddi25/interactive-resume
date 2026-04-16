import { Cpu, MessageSquarePlus } from 'lucide-react';
import { resumeData } from '../../data/resumeData';
import { SectionHeader } from './WorkExperience';

interface Props { onAskAbout: (prompt: string) => void; }

export function Skills({ onAskAbout }: Props) {
  const { skillCategories } = resumeData;

  return (
    <section>
      <SectionHeader icon={<Cpu className="w-4 h-4" />} title="Technical Skills" />

      <div className="mt-3 space-y-3">
        {skillCategories.map((cat) => (
          <div key={cat.label} className="flex items-start gap-3">
            <span className="text-xs font-semibold text-slate-500 w-36 shrink-0 pt-0.5">
              {cat.label}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cat.skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() =>
                    onAskAbout(
                      `Tell me about your experience with ${skill}. What projects did you use it in?`
                    )
                  }
                  className="group/skill flex items-center gap-1 text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-0.5 rounded-full font-mono transition-all duration-150"
                  title={`Ask about ${skill}`}
                >
                  {skill}
                  <MessageSquarePlus className="w-2.5 h-2.5 opacity-0 group-hover/skill:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400 italic">
        Click any skill to ask me about it →
      </p>
    </section>
  );
}
