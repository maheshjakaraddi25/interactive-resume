import { FolderGit2, MessageSquarePlus } from 'lucide-react';
import { resumeData } from '../../data/resumeData';
import { SectionHeader } from './WorkExperience';

interface Props { onAskAbout: (prompt: string) => void; }

export function Projects({ onAskAbout }: Props) {
  const { projects } = resumeData;

  return (
    <section>
      <SectionHeader icon={<FolderGit2 className="w-4 h-4" />} title="Technical Projects" />

      <div className="mt-4 space-y-5">
        {projects.map((project, i) => (
          <div key={i} className="resume-item group">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">{project.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{project.stack}</p>
              </div>
              <button
                onClick={() =>
                  onAskAbout(
                    `Tell me about your "${project.name}" project. Walk me through the architecture and key decisions you made.`
                  )
                }
                className="ask-chip shrink-0 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full transition-colors"
              >
                <MessageSquarePlus className="w-3 h-3" />
                Deep dive →
              </button>
            </div>

            <ul className="mt-2 space-y-1.5">
              {project.bullets.map((bullet, bi) => (
                <li key={bi} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                  <span className="text-blue-400 mt-0.5 shrink-0">–</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Tech tags */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
