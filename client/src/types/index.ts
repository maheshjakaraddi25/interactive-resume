export type AIModel = 'claude' | 'gpt4o' | 'gpt2';

export type InterviewMode = 'hr' | 'technical' | 'sysdesign';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  model?: AIModel;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  model: AIModel;
  mode: InterviewMode;
}

// ─── Resume Data Types ────────────────────────────────────────────────────────

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  location: string;
  gpa?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  type: 'full-time' | 'internship';
  categories: {
    title: string;
    bullets: string[];
  }[];
}

export interface Project {
  name: string;
  stack: string;
  bullets: string[];
  tags: string[];
}

export interface SkillCategory {
  label: string;
  skills: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  icon?: string;
}

export interface LeadershipItem {
  description: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  education: Education[];
  experience: ExperienceItem[];
  projects: Project[];
  skillCategories: SkillCategory[];
  certifications: Certification[];
  leadership: LeadershipItem[];
}

// ─── Chat API Types ───────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  model: AIModel;
  mode: InterviewMode;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export interface PromptChip {
  label: string;
  prompt: string;
  mode: InterviewMode | 'all';
}
