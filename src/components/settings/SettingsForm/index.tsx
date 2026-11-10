// src\components\settings\SettingsForm\index.tsx
'use client';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BoltIcon from '@mui/icons-material/Bolt';
import { Alert, Box, Link, Slider, Typography } from '@mui/material';
import NextLink from 'next/link';
import { type SubmitEvent, useMemo, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Dropdown } from '@/components/shared/Dropdown';
import { Input } from '@/components/shared/Input';
import { LoadingState } from '@/components/shared/LoadingState';
import {
  DATE_POSTED_OPTIONS,
  type DatePosted,
  JOB_TYPE_OPTIONS,
  type JobType,
  MAX_DAILY_CAP,
  RUN_MODE_OPTIONS,
  type RunModeValue,
  SALARY_PERIOD_OPTIONS,
  type SalaryPeriod,
  WORK_SETUP_OPTIONS,
  type WorkSetup,
} from '@/constants/settings';
import { buildRoleOptions, buildSkillOptions } from '@/constants/suggestions';
import { useMasterResume } from '@/hooks/useResume';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useToastQueue } from '@/components/shared/ToastQueueProvider';
import type { MasterResume } from '@/types/resume';
import { type Filters, type SettingsDto, type SettingsInput, settingsSchema } from '@/types/settings';
import { mergeUnique, resumeRoles, resumeSkills } from '@/utils/resumeFilters';
import {
  ActionsRow,
  FieldGrid,
  FormStack,
  SalaryRow,
  Section,
  SectionHeader,
  SliderBox,
} from './settingsForm.element';

interface SettingsFormInnerProps {
  initial: SettingsDto;
  resume: MasterResume | null;
}

/** Strips the DTO's server-only fields. */
const toInput = ({
  filters,
  dailyCap,
  mode,
  threshold,
  indeedSite,
  scheduleEnabled,
  scheduleTime,
}: SettingsDto): SettingsInput => ({
  filters,
  dailyCap,
  mode,
  threshold,
  indeedSite,
  scheduleEnabled,
  scheduleTime,
});

interface InitialForm {
  input: SettingsInput;
  prefilled: boolean;
}

/** Starts from saved settings; fills *empty* role keywords / skills from the resume (not saved until Save). */
const buildInitialForm = (initial: SettingsDto, resume: MasterResume | null): InitialForm => {
  const input = toInput(initial);
  if (!resume) return { input, prefilled: false };

  const roles = resumeRoles(resume);
  const skills = resumeSkills(resume);
  const fillRoles = input.filters.roleKeywords.length === 0 && roles.length > 0;
  const fillSkills = input.filters.techStack.length === 0 && skills.length > 0;
  if (!fillRoles && !fillSkills) return { input, prefilled: false };

  return {
    input: {
      ...input,
      filters: {
        ...input.filters,
        roleKeywords: fillRoles ? roles : input.filters.roleKeywords,
        techStack: fillSkills ? skills : input.filters.techStack,
      },
    },
    prefilled: true,
  };
};

/** The form itself; remounted (via `key`) whenever saved settings or the resume change. */
const SettingsFormInner = ({ initial, resume }: SettingsFormInnerProps) => {
  const [initialForm] = useState(() => buildInitialForm(initial, resume));
  const [form, setForm] = useState<SettingsInput>(initialForm.input);
  const [prefilled, setPrefilled] = useState(initialForm.prefilled);
  const [confirmAuto, setConfirmAuto] = useState(false);
  const updateSettings = useUpdateSettings();
  const { showToast } = useToastQueue();

  /** Adds the resume's titles and skills to the current filters without removing anything. */
  const handleFillFromResume = () => {
    if (!resume) return;
    setForm((f) => ({
      ...f,
      filters: {
        ...f.filters,
        roleKeywords: mergeUnique(f.filters.roleKeywords, resumeRoles(resume)),
        techStack: mergeUnique(f.filters.techStack, resumeSkills(resume)),
      },
    }));
    showToast('Added titles and skills from your resume. Review them, then save.', 'info');
  };

  /** Updates one filter field. */
  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setForm((f) => ({ ...f, filters: { ...f.filters, [key]: value } }));

  /** Mode change: auto mode needs explicit confirmation. */
  const handleModeChange = (mode: string) => {
    if (mode === 'AUTO' && form.mode !== 'AUTO') {
      setConfirmAuto(true);
      return;
    }
    setForm((f) => ({ ...f, mode: mode as RunModeValue }));
  };

  /** Validates and saves. */
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = settingsSchema.safeParse(form);
    if (!parsed.success) {
      showToast(parsed.error.issues[0]?.message ?? 'Please fix the highlighted fields', 'error');
      return;
    }
    updateSettings.mutate(parsed.data);
  };

  const { filters } = form;
  const roleOptions = useMemo(() => buildRoleOptions({ resumeRoles: resume ? resumeRoles(resume) : [] }), [resume]);
  const skillOptions = useMemo(
    () => buildSkillOptions({ roles: filters.roleKeywords, resumeSkills: resume ? resumeSkills(resume) : [] }),
    [filters.roleKeywords, resume],
  );

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <FormStack>
        <Section>
          <SectionHeader>
            <Typography variant="h6">What you&apos;re looking for</Typography>
            <Button
              buttonType="cancel"
              size="small"
              startIcon={<AutoFixHighIcon />}
              onClick={handleFillFromResume}
              disabled={!resume}
            >
              Fill from resume
            </Button>
          </SectionHeader>
          {!resume && (
            <Alert severity="warning">
              Upload your resume first to get role and skill suggestions.{' '}
              <Link component={NextLink} href="/resume">
                Go to resume
              </Link>
            </Alert>
          )}
          {prefilled && (
            <Alert severity="info" onClose={() => setPrefilled(false)}>
              Pre-filled from your resume. Remove anything you don&apos;t want to search for, then save.
            </Alert>
          )}
          <FieldGrid>
            <Dropdown
              label="Role keywords"
              placeholder="Pick a job title or type your own and press Enter"
              options={roleOptions}
              multiple
              searchable
              creatable
              value={filters.roleKeywords}
              onChange={(v) => setFilter('roleKeywords', v)}
              helperText="Job titles to search for. Not in the list? Type it and press Enter."
            />
            <Dropdown
              label="Skills & tools"
              placeholder="e.g. Excel, Customer Service, Salesforce"
              options={skillOptions}
              multiple
              searchable
              creatable
              value={filters.techStack}
              onChange={(v) => setFilter('techStack', v)}
              helperText="Suggestions follow your role keywords and resume. Type your own if missing."
            />
            <Dropdown
              label="Work setup"
              options={WORK_SETUP_OPTIONS}
              multiple
              value={filters.workSetup}
              onChange={(v) => setFilter('workSetup', v as WorkSetup[])}
            />
            <Input
              label="Location"
              placeholder="City, region, or leave blank for remote-anywhere"
              value={filters.location}
              onChange={(e) => setFilter('location', e.target.value)}
            />
            <Dropdown
              label="Job type"
              options={JOB_TYPE_OPTIONS}
              multiple
              value={filters.jobType}
              onChange={(v) => setFilter('jobType', v as JobType[])}
            />
            <Dropdown
              label="Date posted"
              options={DATE_POSTED_OPTIONS}
              value={filters.datePosted}
              onChange={(v) => setFilter('datePosted', v as DatePosted)}
            />
          </FieldGrid>
          <SalaryRow>
            <Input
              label="Expected salary (minimum)"
              type="number"
              value={filters.salaryMin ?? ''}
              onChange={(e) => setFilter('salaryMin', e.target.value === '' ? null : Number(e.target.value))}
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <Input
              label="Currency"
              value={filters.salaryCurrency}
              onChange={(e) => setFilter('salaryCurrency', e.target.value.toUpperCase())}
              slotProps={{ htmlInput: { maxLength: 5 } }}
            />
            <Dropdown
              label="Period"
              options={SALARY_PERIOD_OPTIONS}
              value={filters.salaryPeriod}
              onChange={(v) => setFilter('salaryPeriod', v as SalaryPeriod)}
            />
          </SalaryRow>
        </Section>

        <Section>
          <Typography variant="h6">Matching &amp; pacing</Typography>
          <SliderBox>
            <Typography gutterBottom>Minimum match score: {form.threshold}</Typography>
            <Slider
              value={form.threshold}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: '0' },
                { value: 50, label: '50' },
                { value: 70, label: '70' },
                { value: 100, label: '100' },
              ]}
              valueLabelDisplay="auto"
              onChange={(_e, v) => setForm((f) => ({ ...f, threshold: v as number }))}
              aria-label="Minimum match score"
            />
            <Typography variant="body2" color="text.secondary">
              Jobs scoring below this are skipped before any resume tailoring.
            </Typography>
          </SliderBox>
          <FieldGrid>
            <Input
              label="Daily application limit"
              type="number"
              value={form.dailyCap}
              onChange={(e) => setForm((f) => ({ ...f, dailyCap: Number(e.target.value) }))}
              slotProps={{ htmlInput: { min: 1, max: MAX_DAILY_CAP } }}
              helperText={`1–${MAX_DAILY_CAP}. Applications are spaced out with random delays.`}
            />
            <Dropdown label="Mode" options={RUN_MODE_OPTIONS} value={form.mode} onChange={handleModeChange} />
          </FieldGrid>
          {form.mode === 'AUTO' && (
            <Alert severity="warning">
              Auto mode is on: jobs that meet your match score will be submitted without asking you first.
            </Alert>
          )}
        </Section>

        <ActionsRow>
          <Button buttonType="cancel" onClick={() => {
              setForm(toInput(initial));
              setPrefilled(false);
            }} disabled={updateSettings.isPending}>
            Reset
          </Button>
          <Button buttonType="submit" loading={updateSettings.isPending}>
            Save settings
          </Button>
        </ActionsRow>
      </FormStack>

      <ConfirmModal
        open={confirmAuto}
        onClose={() => setConfirmAuto(false)}
        onConfirm={() => {
          setForm((f) => ({ ...f, mode: 'AUTO' }));
          setConfirmAuto(false);
        }}
        title="Turn on auto mode?"
        description="ApplyPilot will submit applications without waiting for your approval, up to your daily limit. Indeed restricts automated use — keep volume low. You can switch back to review mode at any time."
        icon={<BoltIcon />}
        severity="warning"
        confirmButtonType="destructive"
        confirmLabel="Enable auto mode"
        cancelLabel="Keep review mode"
      />
    </Box>
  );
};

/** Settings & filters form, loaded from the API. */
export const SettingsForm = () => {
  const settings = useSettings();
  const resume = useMasterResume();
  if (settings.isPending || resume.isPending) return <LoadingState label="Loading settings…" />;
  if (settings.isError) return <Alert severity="error">{settings.error.message}</Alert>;
  // A failed resume load shouldn't block settings; it just means no resume suggestions.
  const resumeDto = resume.data ?? null;
  return (
    <SettingsFormInner
      key={`${settings.data.updatedAt}-${resumeDto?.updatedAt ?? 'none'}`}
      initial={settings.data}
      resume={resumeDto?.data ?? null}
    />
  );
};
