import type { ResumeData, PromptChip } from '../types';

export const resumeData: ResumeData = {
  personal: {
    name: 'Mahesh P Jakaraddi',
    title: 'Cloud & DevOps Engineer · MS CS @ Arizona State University',
    location: 'Tempe, Arizona',
    email: 'mjakara1@asu.edu',
    phone: '(+1) 623-238-6774',
    linkedin: 'https://linkedin.com/in/maheshjakaraddi',
    github: 'https://github.com/maheshjakaraddi',
    summary:
      'Cloud & DevOps Engineer with ~3 years of production experience at Daimler Truck Innovation Center. Expert in Kubernetes, Terraform IaC, CI/CD pipelines, and cloud migrations on Azure & AWS. Currently pursuing an MS in Computer Science at Arizona State University.',
  },

  education: [
    {
      institution: 'Arizona State University',
      degree: 'Master of Science in Computer Science',
      period: 'Jan 2026 – Present',
      location: 'Tempe, AZ',
    },
    {
      institution: 'KLE Technological University',
      degree: 'Bachelor of Engineering in Computer Science',
      period: 'Aug 2019 – May 2023',
      location: 'India',
      gpa: '8.2 / 10',
    },
  ],

  experience: [
    {
      company: 'Daimler Truck Innovation Center India Pvt Ltd',
      role: 'Cloud and DevOps Engineer',
      period: 'Feb 2023 – Dec 2025',
      location: 'Bangalore, India',
      type: 'full-time',
      categories: [
        {
          title: 'Cloud Migration & Platform Modernisation',
          bullets: [
            'Led live migration of production platform from VM-based architecture to containerised Kubernetes — zero data loss, minimal downtime, platform uptime improved from 85% → 99.9%.',
            'Executed cloud migration for 5+ enterprise applications to Azure using AKS, VMs, and supporting services for a scalable, resilient infrastructure.',
            'Authored and integrated custom Helm charts for enterprise applications, streamlining Kubernetes workload packaging and deployment lifecycle.',
          ],
        },
        {
          title: 'Infrastructure as Code & Automation',
          bullets: [
            'Authored Terraform IaC modules automating provisioning of Azure & AWS resources (AKS, VMs, App Services, Application Gateway, DNS, EC2, VPC, IAM, S3) across multiple environments — improved deployment speed by 70%.',
            'Designed and implemented a fully automated Nginx server setup routing traffic for all platform applications using Terraform and Ansible playbooks.',
          ],
        },
        {
          title: 'CI/CD & Developer Experience',
          bullets: [
            'Designed and implemented automated CI/CD workflows enabling seamless integration and delivery across dev, staging, and production environments.',
            'Engineered microservice-based backend services supporting 15,000+ internal users and developed REST APIs supporting CI/CD tooling and developer platforms.',
            'Built and maintained core infrastructure supporting application scaling for thousands of concurrent users across global teams.',
          ],
        },
        {
          title: 'Kubernetes, Security & Observability',
          bullets: [
            'Managed Kubernetes clusters including namespace config, RBAC access controls, and security patch management — enabling zero-downtime deployments for multiple engineering teams.',
            'Configured and maintained Azure Application Gateway, DNS, and network routing for cloud-hosted platform services.',
            'Integrated an NLU-powered chatbot into the platform, extending product capabilities with AI-driven conversational features.',
            'Set up observability stack using Prometheus & Grafana for platform performance and resource utilisation monitoring.',
          ],
        },
      ],
    },
    {
      company: 'Daimler Truck Innovation Center India Pvt Ltd',
      role: 'Software Engineering Intern',
      period: '2022 – Feb 2023',
      location: 'Bangalore, India',
      type: 'internship',
      categories: [
        {
          title: 'Key Contributions',
          bullets: [
            'Built automation workflows for microservice deployments across Azure cloud services.',
            'Expanded Terraform modules enabling automated deployment of 15+ cloud resources.',
            'Supported production deployment pipelines, monitoring, and debugging of application services.',
          ],
        },
      ],
    },
  ],

  projects: [
    {
      name: 'Student Voting System',
      stack: 'Full Stack — PERN (PostgreSQL · Express · React · Node)',
      bullets: [
        'Built full-stack web platform with React frontend, Node.js/Express REST backend, and PostgreSQL database with role-based auth.',
        'Designed reusable React components and integrated backend services using an API-driven architecture.',
        'Handled authentication & authorization using JWT tokens.',
        'Deployed on Azure, implementing cloud-native infrastructure.',
      ],
      tags: ['React', 'Node.js', 'PostgreSQL', 'JWT', 'Azure'],
    },
    {
      name: 'Load Balancing Algorithm Optimisation',
      stack: 'Systems & Networking',
      bullets: [
        'Designed an optimised traffic routing algorithm reducing server bottlenecks and latency.',
        'Integrated monitoring utilities to dynamically adjust routing based on real-time performance metrics.',
      ],
      tags: ['Algorithms', 'Load Balancing', 'Monitoring', 'Performance'],
    },
  ],

  skillCategories: [
    {
      label: 'Languages',
      skills: ['Python', 'TypeScript', 'JavaScript', 'C++', 'C', 'Bash'],
    },
    {
      label: 'Frontend / Backend',
      skills: ['React.js', 'Node.js', 'Express.js', 'D3.js', 'REST APIs', 'Hooks'],
    },
    {
      label: 'Databases',
      skills: ['PostgreSQL', 'MongoDB', 'DynamoDB'],
    },
    {
      label: 'Cloud & DevOps',
      skills: ['AWS', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'Helm', 'Ansible', 'CI/CD'],
    },
    {
      label: 'Observability & Tools',
      skills: ['Prometheus', 'Grafana', 'Nginx', 'Jenkins', 'GitHub Actions', 'Artifactory'],
    },
  ],

  certifications: [
    { name: 'Azure Fundamentals (AZ-900)', issuer: 'Microsoft' },
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services' },
    { name: 'Speak English Professionally', issuer: 'Georgia Tech / Coursera' },
    { name: 'Data Structures & Algorithms', issuer: 'Udemy' },
  ],

  leadership: [
    { description: 'Admin of Code-KLE Programming Club — organized hackathons and coding competitions for 100+ student members.' },
    { description: 'Organized employee engagement and collaboration events at enterprise level at Daimler Truck.' },
    { description: 'Ranked in top placements across multiple competitive programming platforms.' },
  ],
};

// ─── Prompt Chips per Mode ────────────────────────────────────────────────────

export const promptChips: PromptChip[] = [
  // HR / Behavioral
  { label: 'Tell me about yourself', prompt: 'Can you give me a brief introduction about yourself and your background?', mode: 'hr' },
  { label: 'Why new opportunities?', prompt: "Why are you looking for new opportunities right now?", mode: 'hr' },
  { label: 'Biggest achievement', prompt: "What's your biggest professional achievement so far?", mode: 'hr' },
  { label: 'Teamwork example', prompt: 'Tell me about a time you collaborated with a cross-functional team on a challenging project.', mode: 'hr' },
  { label: '5-year goal', prompt: 'Where do you see yourself in the next 5 years?', mode: 'hr' },

  // Technical
  { label: 'Kubernetes experience', prompt: 'Walk me through your Kubernetes experience and the most complex cluster you managed.', mode: 'technical' },
  { label: 'Terraform deep dive', prompt: 'Tell me about your Terraform IaC work — how did you structure modules and handle multiple environments?', mode: 'technical' },
  { label: 'CI/CD pipeline design', prompt: 'How did you design the CI/CD pipeline at Daimler? What tools were involved and how did you handle environment promotions?', mode: 'technical' },
  { label: 'Cloud migration story', prompt: 'Walk me through the cloud migration you led — what were the key challenges and how did you achieve zero data loss?', mode: 'technical' },
  { label: 'Observability setup', prompt: 'How did you set up the observability stack and what did you monitor?', mode: 'technical' },

  // System Design
  { label: 'Design a deploy pipeline', prompt: 'How would you design a scalable, multi-environment CI/CD deployment pipeline from scratch?', mode: 'sysdesign' },
  { label: 'Multi-region Kubernetes', prompt: 'Design a multi-region Kubernetes architecture for a high-availability enterprise platform.', mode: 'sysdesign' },
  { label: 'Platform reliability', prompt: 'How would you architect a platform to achieve 99.9% uptime for 15,000+ concurrent users?', mode: 'sysdesign' },
];
