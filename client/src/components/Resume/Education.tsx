import { GraduationCap } from 'lucide-react';
import { resumeData } from '../../data/resumeData';
import { SectionHeader } from './WorkExperience';

interface Props { onAskAbout: (prompt: string) => void; }

export function Education({ onAskAbout }: Props) {
  const { education } = resumeData;

  return (
    <section>
      <SectionHeader icon={<GraduationCap className="w-4 h-4" />} title="Education" />

      <div className="mt-3 space-y-3">
        {education.map((edu, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 cursor-pointer group resume-item"
            onClick={() =>
              onAskAbout(
                `Tell me about your education at ${edu.institution} and how it's shaping your career.`
              )
            }
          >
            <div>
              <h3 className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">
                {edu.institution}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">{edu.degree}</p>
              {edu.gpa && (
                <p className="text-xs text-slate-400 mt-0.5">GPA: {edu.gpa}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-500 font-medium">{edu.period}</p>
              <p className="text-xs text-slate-400">{edu.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
