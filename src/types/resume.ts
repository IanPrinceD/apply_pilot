// src\types\resume.ts
import { z } from 'zod';

// Every field is required (empty string / empty array when unknown) so the same
// schema works for LLM structured output, the form, and DB storage.

export const experienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  location: z.string(),
  startDate: z.string().describe('As written on the resume, e.g. "Jan 2021" or "2021"'),
  endDate: z.string().describe('As written, or "Present"'),
  highlights: z.array(z.string()),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
});

export const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  url: z.string(),
});

export const masterResumeSchema = z.object({
  contact: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string(),
    github: z.string(),
    website: z.string(),
  }),
  headline: z.string().describe('Current role / professional title'),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  projects: z.array(projectSchema),
});

export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type MasterResume = z.infer<typeof masterResumeSchema>;

export interface MasterResumeDto {
  data: MasterResume;
  sourceFileName: string | null;
  updatedAt: string;
}

export interface ParsedResumeDraft {
  data: MasterResume;
  sourceFileName: string;
}

export const EMPTY_EXPERIENCE: Experience = {
  company: '',
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  highlights: [],
};

export const EMPTY_EDUCATION: Education = { institution: '', degree: '', field: '', startDate: '', endDate: '' };

export const EMPTY_CERTIFICATION: Certification = { name: '', issuer: '', date: '' };

export const EMPTY_PROJECT: Project = { name: '', description: '', techStack: [], url: '' };

export const EMPTY_RESUME: MasterResume = {
  contact: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
  headline: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  projects: [],
};
