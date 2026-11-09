// src\utils\resumeFilters.ts
import type { MasterResume } from '@/types/resume';

/** Case-insensitive union: keeps `existing` order, appends new items from `incoming`, never removes. */
export const mergeUnique = (existing: string[], incoming: string[]): string[] => {
  const seen = new Set(existing.map((v) => v.trim().toLowerCase()));
  const added = incoming
    .map((v) => v.trim())
    .filter((v) => {
      const key = v.toLowerCase();
      if (!v || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return [...existing, ...added];
};

/** Turns a headline into a searchable title: "Full-Stack Developer (Next.js) | Remote" → "Full-Stack Developer". */
const cleanHeadline = (headline: string): string =>
  headline
    .split(/\s[|–—-]\s/)[0]
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();

/** Job titles from the resume: cleaned headline first, then each experience title. */
export const resumeRoles = (resume: MasterResume): string[] =>
  mergeUnique([], [cleanHeadline(resume.headline), ...resume.experience.map((e) => e.title)]);

/** Skills listed on the resume, de-duplicated. */
export const resumeSkills = (resume: MasterResume): string[] => mergeUnique([], resume.skills);
