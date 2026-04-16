import { Award } from 'lucide-react';
import { resumeData } from '../../data/resumeData';
import { SectionHeader } from './WorkExperience';

interface Props { onAskAbout: (prompt: string) => void; }

const ISSUER_COLORS: Record<string, string> = {
  'Microsoft':          'bg-blue-50 text-blue-700 border-blue-200',
  'Amazon Web Services':'bg-amber-50 text-amber-700 border-amber-200',
  'Georgia Tech / Coursera': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Udemy':              'bg-purple-50 text-purple-700 border-purple-200',
};

export function Certifications({ onAskAbout }: Props) {
  const { certifications } = resumeData;

  return (
    <section>
      <SectionHeader icon={<Award className="w-4 h-4" />} title="Courses & Certifications" />

      <div className="mt-3 grid grid-cols-2 gap-2">
        {certifications.map((cert, i) => (
          <div
            key={i}
            className={`flex flex-col gap-0.5 border rounded-lg p-2.5 cursor-pointer hover:shadow-sm transition-all resume-item ${
              ISSUER_COLORS[cert.issuer] ?? 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
            onClick={() =>
              onAskAbout(
                `Tell me about your ${cert.name} certification and how you've applied that knowledge.`
              )
            }
          >
            <p className="text-xs font-semibold leading-snug">{cert.name}</p>
            <p className="text-xs opacity-70">{cert.issuer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
