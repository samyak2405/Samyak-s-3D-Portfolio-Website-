export interface Social {
  github: string
  linkedin: string
  leetcode: string
  email: string
  phone: string
  instagram: string
  website: string
}

export interface Profile {
  name: string
  shortName: string
  tagline: string
  role: string
  specialization: string
  location: string
  yearsOfExperience: string
  bio: string
  avatar: string
  social: Social
}

export interface Metric {
  value: string
  label: string
  context: string
}

export interface SkillItem {
  name: string
  /** Flags a recently added / growth skill for subtle visual emphasis. */
  recent?: boolean
}

export interface SkillCategory {
  name: string
  items: SkillItem[]
}

export interface Skills {
  categories: SkillCategory[]
}

export interface Service {
  title: string
  description: string
  /** lucide-react icon name */
  icon: string
}

export interface Experience {
  company: string
  role: string
  period: string
  location: string
  /** Marks the current role for an active/pulsing timeline node. */
  active?: boolean
  summary: string
  highlights: string[]
}

export interface Project {
  id: string
  title: string
  subtitle: string
  description: string
  stack: string[]
  role: string
  year: string
  /** Source repository. `repo` is preferred; `link` is kept for back-compat. */
  link?: string
  repo?: string
  /** Live demo / deployed app. Shown as the primary link when present. */
  demo?: string
  /** Optional screenshot / GIF / video (path or URL). */
  media?: string
  image?: string
  highlight: boolean
}

export interface Education {
  degree: string
  institution: string
  period: string
}

export interface Testimonial {
  id: string
  quote: string
  name: string
  role: string
  avatarColor: string
}

export interface Portfolio {
  profile: Profile
  metrics: Metric[]
  skills: Skills
  services: Service[]
  experience: Experience[]
  projects: Project[]
  education: Education[]
  testimonials: Testimonial[]
}
