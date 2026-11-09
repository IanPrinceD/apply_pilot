// src\constants\settings.ts
// Shared by client forms, API routes, services and the worker.

export const WORK_SETUP_VALUES = ['remote', 'hybrid', 'onsite'] as const;
export const JOB_TYPE_VALUES = ['fulltime', 'parttime', 'contract', 'temporary', 'internship'] as const;
export const DATE_POSTED_VALUES = ['1', '3', '7', '14', 'any'] as const;
export const RUN_MODE_VALUES = ['REVIEW', 'AUTO'] as const;
export const SALARY_PERIOD_VALUES = ['year', 'month', 'hour'] as const;

export type WorkSetup = (typeof WORK_SETUP_VALUES)[number];
export type JobType = (typeof JOB_TYPE_VALUES)[number];
export type DatePosted = (typeof DATE_POSTED_VALUES)[number];
export type RunModeValue = (typeof RUN_MODE_VALUES)[number];
export type SalaryPeriod = (typeof SALARY_PERIOD_VALUES)[number];

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export const WORK_SETUP_OPTIONS: Option<WorkSetup>[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

export const JOB_TYPE_OPTIONS: Option<JobType>[] = [
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
];

export const DATE_POSTED_OPTIONS: Option<DatePosted>[] = [
  { value: '1', label: 'Last 24 hours' },
  { value: '3', label: 'Last 3 days' },
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: 'any', label: 'Any time' },
];

export const RUN_MODE_OPTIONS: Option<RunModeValue>[] = [
  { value: 'REVIEW', label: 'Review — approve each application' },
  { value: 'AUTO', label: 'Auto — submit without approval' },
];

export const SALARY_PERIOD_OPTIONS: Option<SalaryPeriod>[] = [
  { value: 'year', label: 'per year' },
  { value: 'month', label: 'per month' },
  { value: 'hour', label: 'per hour' },
];

export const DEFAULT_THRESHOLD = 70;
export const DEFAULT_DAILY_CAP = 10;
export const MAX_DAILY_CAP = 50;
