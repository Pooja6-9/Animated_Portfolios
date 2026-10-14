/**
 * All content on this site is taken from Pooja Jain's resume PDFs
 * (Pooja_Resume.pdf — primary, and the earlier "Pooja Jain" resume for
 * Education and Hobbies). Edit here to update the whole site.
 */

export const profile = {
  name: 'Pooja Jain',
  firstName: 'Pooja',
  lastName: 'Jain',
  role: 'Computer Science Undergraduate',
  /** Placeholder: real contact details are kept out of the public repo. */
  email: 'xyz@gmail.com',
  linkedin: 'https://www.linkedin.com/in/pooja-jain6',
  linkedinLabel: 'linkedin.com/in/pooja-jain6',
  github: 'https://github.com/Pooja6-9',
  githubLabel: 'github.com/Pooja6-9',
  /** Path to a resume PDF in /public. Left empty so no phone number or email is published; the download buttons hide. */
  resumeUrl: '',
  intro:
    'Computer Science undergraduate who builds and ships working software end-to-end — from database design to functional prototypes.',
  summary: [
    'Computer Science undergraduate who builds and ships working software end-to-end — from database design to functional prototypes.',
    'Experience spans Python automation, SQL-backed applications, and frontend web development (HTML/CSS/JavaScript), with a habit of understanding the problem and data model before writing code.',
    'Comfortable working independently and remotely.',
  ],
  careerDirection:
    'Looking to grow into full-stack development (React/Node) through hands-on production work.',
};

export const education = {
  institution: 'JECRC University, Jaipur',
  degree: 'B.Tech in Computer Science Engineering',
  period: '2023 – Present',
};

export const hobbies = ['Creative writing', 'Graphic designing', 'Chess', 'Volunteering'];

export type SkillCategory = {
  title: string;
  icon: 'code' | 'web' | 'server' | 'database' | 'brain' | 'tools' | 'heart';
  skills: string[];
  note?: string;
};

export const skillCategories: SkillCategory[] = [
  { title: 'Programming Languages', icon: 'code', skills: ['Python', 'JavaScript', 'C++', 'SQL'] },
  {
    title: 'Web Technologies',
    icon: 'web',
    skills: ['HTML', 'CSS', 'JavaScript', 'React.js (currently learning)'],
    note: 'Frontend UI development',
  },
  { title: 'Backend & Cloud', icon: 'server', skills: ['Flask', 'Supabase'] },
  {
    title: 'Databases',
    icon: 'database',
    skills: ['MySQL', 'PostgreSQL', 'SQLite'],
    note: 'Schema design, query optimization, relational data modeling',
  },
  {
    title: 'AI / ML',
    icon: 'brain',
    skills: ['NLP', 'Generative AI', 'Prompt Engineering', 'Machine Learning'],
  },
  {
    title: 'Tools & Platforms',
    icon: 'tools',
    skills: ['Git', 'GitHub', 'VS Code', 'ServiceNow (CMDB & CSDM)'],
  },
  {
    title: 'Soft Skills',
    icon: 'heart',
    skills: ['Leadership', 'Ownership', 'Teamwork', 'Clear Communication', 'Work Ethic', 'Creativity'],
  },
];

export type Experience = {
  role: string;
  organization: string;
  location?: string;
  period: string;
  points: string[];
  tags: string[];
};

export const experiences: Experience[] = [
  {
    role: 'AutoCAD & Python Intern',
    organization: 'College of Aviation Technology',
    location: 'Bangladesh',
    period: 'Apr 2026 – May 2026',
    points: [
      'Wrote Python automation scripts to eliminate repetitive engineering workflow steps, reducing manual effort.',
      'Assisted in creating and modifying 2D AutoCAD designs while ensuring accuracy and compliance with project requirements.',
      'Collaborated with engineering teams to troubleshoot design issues, translating requirements into working fixes.',
    ],
    tags: ['Python', 'Automation', 'AutoCAD'],
  },
  {
    role: 'Research & Database Analyst',
    organization: 'Universidad Tecnológica de Panamá',
    location: 'Panama',
    period: 'Sep 2025 – Nov 2025',
    points: [
      'Designed and executed SQL queries for data extraction, validation, and reporting on structured research datasets.',
      'Applied relational database concepts to improve data accuracy and consistency across analysis pipelines.',
      'Organized and cleaned raw data for use in technical documentation, translating messy inputs into a usable structure.',
    ],
    tags: ['SQL', 'Relational Databases', 'Data Cleaning'],
  },
  {
    role: 'Web Development Intern',
    organization: 'SECRETEYE',
    period: 'Jul 2024 – Sep 2024',
    points: [
      'Built and maintained responsive web pages using HTML, CSS, and JavaScript, directly shaping user-facing functionality.',
      'Diagnosed and resolved UI bugs across browsers, improving page reliability and user experience.',
      'Participated in testing and release checks before deployment, helping catch issues prior to shipping.',
    ],
    tags: ['HTML', 'CSS', 'JavaScript'],
  },
];

export type Project = {
  name: string;
  context: string;
  period: string;
  status?: string;
  illustration: 'finance' | 'health' | 'meal';
  description: string;
  contributions: string[];
  outcomes: { value: string; label: string }[];
  tech: string[];
  /** Only set these when a real URL exists. */
  githubUrl?: string;
  liveUrl?: string;
};

export const projects: Project[] = [
  {
    name: 'FinFlow – Smart Finance Tracker',
    context: 'Personal Project',
    period: 'May 2026 – In progress',
    status: 'In progress',
    illustration: 'finance',
    description:
      'A personal finance management application to monitor income, expenses, and savings in real time.',
    contributions: [
      'Designed and built the tracker end-to-end, from database schema to functioning application — a fully self-directed project.',
      'Implemented SQL-based transaction management with efficient retrieval.',
      'Built interactive spending analytics that automatically categorize expenses.',
    ],
    outcomes: [
      { value: '2,000+', label: 'financial records managed' },
      { value: '10+', label: 'expense categories' },
    ],
    tech: ['SQL'],
  },
  {
    name: 'AI Patient Discharge System',
    context: 'Healthcare Hackathon',
    period: 'Apr 2026 – May 2026',
    illustration: 'health',
    description:
      'An AI-powered patient discharge system that automates discharge summary processing end-to-end.',
    contributions: [
      'Built the system in Python using NLP and SQL to automate summary processing.',
      'Automated text classification to cut manual discharge documentation.',
      'Used AI-assisted recommendations and prompt engineering to improve workflow accuracy.',
    ],
    outcomes: [
      { value: '~40%', label: 'less documentation time' },
      { value: '35%', label: 'better workflow accuracy' },
    ],
    tech: ['Python', 'NLP', 'SQL', 'Prompt Engineering'],
  },
  {
    name: 'TAT Meal Tracking System',
    context: 'Healthcare Hackathon',
    period: 'Jan 2025 – Mar 2025',
    illustration: 'meal',
    description:
      'A hospital meal tracking system to monitor meal preparation, dispatch, and delivery turnaround time (TAT).',
    contributions: [
      'Designed a relational database and application to track meal prep, dispatch, and delivery.',
      'Automated status updates and reporting for a real operational workflow.',
    ],
    outcomes: [
      { value: '500+', label: 'daily orders tracked' },
      { value: '60%', label: 'less manual tracking' },
    ],
    tech: ['Relational Database Design'],
  },
];

export const achievements = [
  { title: 'Healthcare Hackathon Finalist', detail: 'Top 15', year: '2026', icon: 'crown' as const },
  { title: 'Social Summer of Code (SSOC)', detail: 'Open Source Contributor', year: '2025', icon: 'star' as const },
  { title: 'Smart India Hackathon', detail: 'Participant', year: '2025', icon: 'trophy' as const },
];

export const certifications = [
  {
    title: 'ServiceNow Certified Implementation Specialist – Data Foundations, CMDB & CSDM',
    issuer: 'ServiceNow',
    date: undefined as string | undefined,
  },
  { title: 'Python Programming Certification', issuer: 'Udemy', date: 'Nov 2025' },
  { title: 'Generative AI & Gemini CLI Training', issuer: 'GDG × Hack2Skill', date: 'Jun 2025' },
  { title: 'API Development Certification', issuer: 'Infosys Springboard', date: 'Feb 2025' },
];

export const leadership = [
  {
    role: 'Head, Design Department & HRA Member',
    organization: 'IAESTE LC JECRC',
    period: '2025 – 2026',
  },
  {
    role: 'Core Team Member',
    organization: 'JECRC Incubation Center',
    period: '2025 – 2026',
  },
];
