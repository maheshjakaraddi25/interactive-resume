import { Briefcase, MessageSquarePlus } from 'lucide-react';
import { resumeData } from '../../data/resumeData';

interface Props { onAskAbout: (prompt: string) => void; }

export function WorkExperience({ onAskAbout }: Props) {
  const { experience } = resumeData;

  return (
    <section>
      <SectionHeader icon={<Briefcase className="w-4 h-4" />} title="Professional Experience" />

      <div className="mt-4 space-y-6">
        {experience.map((job, i) => (
          <div key={i} className="resume-item group relative">
            {/* Company + role row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm leading-tight">
                  {job.company}
                </h3>
                <p className="text-blue-700 text-sm font-medium mt-0.5">
                  {job.role}
                  {job.type === 'internship' && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-normal">
                      Internship
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500 font-medium">{job.period}</p>
                <p className="text-xs text-slate-400">{job.location}</p>
              </div>
            </div>

            {/* Ask chip */}
            <AskChip
              label={`Ask about my ${job.role.toLowerCase()} role`}
              onClick={() =>
                onAskAbout(
                  `Tell me about your ${job.role} role at ${job.company}. What were your key responsibilities and biggest wins?`
                )
              }
            />

            {/* Sub-categories */}
            <div className="mt-3 space-y-3">
              {job.categories.map((cat, ci) => (
                <div key={ci}>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    {cat.title}
                  </p>
                  <ul className="space-y-1.5">
                    {cat.bullets.map((bullet, bi) => (
                      <li key={bi} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                        <span className="text-blue-400 mt-0.5 shrink-0">–</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AskChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="ask-chip mt-1.5 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full transition-colors"
    >
      <MessageSquarePlus className="w-3 h-3" />
      {label} →
    </button>
  );
}

export function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-blue-600">{icon}</span>
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">{title}</h2>
    </div>
  );
}
