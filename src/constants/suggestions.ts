// src\constants\suggestions.ts
// Suggestion lists for role keywords and skills. Edit the JSON files to change them.
import jobTitles from '@/constants/jobTitles.json';
import roleSkillMap from '@/constants/roleSkillMap.json';
import skills from '@/constants/skills.json';

export interface SuggestionOption {
  value: string;
  label: string;
  group: string;
}

const LAST_GROUP = 'General';

/** Flattens `{ category: string[] }` into grouped options: categories A–Z ("General" last), each title once. */
const toGroupedOptions = (source: Record<string, string[]>): SuggestionOption[] => {
  const seen = new Set<string>();
  const groups = Object.keys(source).sort((a, b) => {
    if (a === LAST_GROUP) return 1;
    if (b === LAST_GROUP) return -1;
    return a.localeCompare(b);
  });

  return groups.flatMap((group) =>
    [...source[group]]
      .map((title) => title.trim())
      .filter((title) => {
        const key = title.toLowerCase();
        if (!title || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.localeCompare(b))
      .map((title) => ({ value: title, label: title, group })),
  );
};

export const ROLE_SUGGESTIONS: SuggestionOption[] = toGroupedOptions(jobTitles);
export const SKILL_SUGGESTIONS: SuggestionOption[] = toGroupedOptions(skills);

export const RESUME_GROUP = 'From your resume';
export const ROLE_SKILLS_GROUP = 'Suggested for your roles';

const ROLE_SKILL_MAP: Record<string, string[]> = roleSkillMap;

/** Lowercased job title → its category, e.g. "registered nurse" → "Healthcare". */
const ROLE_CATEGORY = new Map(ROLE_SUGGESTIONS.map((o) => [o.value.toLowerCase(), o.group]));

/** Returns a filter that accepts each value once (case-insensitive, blanks rejected). */
const createTaker = () => {
  const seen = new Set<string>();
  return (value: string): boolean => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  };
};

/** Wraps plain strings as options in one group. */
const asGroup = (values: string[], group: string): SuggestionOption[] =>
  values.map((v) => ({ value: v.trim(), label: v.trim(), group }));

/** Role options: titles from the resume first, then the full job-title list by category. */
export const buildRoleOptions = ({ resumeRoles = [] }: { resumeRoles?: string[] }): SuggestionOption[] => {
  const take = createTaker();
  const fromResume = asGroup(resumeRoles.filter(take), RESUME_GROUP);
  return [...fromResume, ...ROLE_SUGGESTIONS.filter((o) => take(o.value))];
};

interface SkillOptionsInput {
  /** Selected role keywords; typed-in roles not in the list are ignored. */
  roles: string[];
  /** Skills from the saved master resume, shown first. */
  resumeSkills?: string[];
}

/** Skill options ordered: resume skills, then skills for the selected roles, then everything else by category. */
export const buildSkillOptions = ({ roles, resumeSkills = [] }: SkillOptionsInput): SuggestionOption[] => {
  const take = createTaker();
  const fromResume = asGroup(resumeSkills.filter(take), RESUME_GROUP);

  // Mapping order matters: each role's primary skill category comes first.
  const skillGroups = [
    ...new Set(roles.flatMap((role) => ROLE_SKILL_MAP[ROLE_CATEGORY.get(role.trim().toLowerCase()) ?? ''] ?? [])),
  ];
  const forRoles = skillGroups.flatMap((group) =>
    SKILL_SUGGESTIONS.filter((o) => o.group === group && take(o.value)).map((o) => ({
      ...o,
      group: ROLE_SKILLS_GROUP,
    })),
  );

  const rest = SKILL_SUGGESTIONS.filter((o) => take(o.value));
  return [...fromResume, ...forRoles, ...rest];
};
