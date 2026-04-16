import { Mail, Phone, MapPin, Linkedin, Github, ExternalLink } from 'lucide-react';
import { resumeData } from '../../data/resumeData';
import { WorkExperience } from './WorkExperience';
import { Projects } from './Projects';
import { Skills } from './Skills';
import { Education } from './Education';
import { Certifications } from './Certifications';
import { Leadership } from './Leadership';

interface ResumePanelProps {
  onAskAbout: (prompt: string) => void;
}

export function ResumePanel({ onAskAbout }: ResumePanelProps) {
  const { personal } = resumeData;

  return (
    <div className="min-h-full">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-8 py-7 text-white">
        <h1 className="text-3xl font-bold tracking-tight">{personal.name}</h1>
        <p className="mt-1 text-blue-200 text-sm font-medium tracking-wide">{personal.title}</p>

        {/* Contact row */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-300">
          <a href={`tel:${personal.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5" />
            {personal.phone}
          </a>
          <a href={`mailto:${personal.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="w-3.5 h-3.5" />
            {personal.email}
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {personal.location}
          </span>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
            LinkedIn
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
          <a
            href={personal.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        </div>

        {/* AI chat hint */}
        <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
          <span className="text-xs text-blue-200">AI version of me is live — ask anything →</span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-7">
        <Education onAskAbout={onAskAbout} />
        <Divider />
        <Skills onAskAbout={onAskAbout} />
        <Divider />
        <WorkExperience onAskAbout={onAskAbout} />
        <Divider />
        <Projects onAskAbout={onAskAbout} />
        <Divider />
        <Certifications onAskAbout={onAskAbout} />
        <Divider />
        <Leadership onAskAbout={onAskAbout} />
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="border-slate-100" />;
}
