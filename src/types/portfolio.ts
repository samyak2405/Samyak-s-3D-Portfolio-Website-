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

export interface SkillCategory {
  name: string
  items: string[]
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
  link: string
  image: string
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
