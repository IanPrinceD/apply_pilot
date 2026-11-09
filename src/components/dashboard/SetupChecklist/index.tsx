// src\components\dashboard\SetupChecklist\index.tsx
'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import { useAnswerBank } from '@/hooks/useAnswerBank';
import { useMasterResume } from '@/hooks/useResume';
import { useSettings } from '@/hooks/useSettings';
import { CardGrid, Spacer, StepCard, StepHeader } from './setupChecklist.element';

interface Step {
  title: string;
  done: boolean;
  detail: string;
  href: string;
  cta: string;
}

/** Phase 1 setup progress: filters, resume, answer bank. */
export const SetupChecklist = () => {
  const settings = useSettings();
  const resume = useMasterResume();
  const answers = useAnswerBank();

  const roleCount = settings.data?.filters.roleKeywords.length ?? 0;
  const answerCount = answers.data?.length ?? 0;

  const steps: Step[] = [
    {
      title: 'Add your master resume',
      done: Boolean(resume.data),
      detail: resume.data
        ? `${resume.data.data.skills.length} skills, ${resume.data.data.experience.length} roles`
        : 'Upload a PDF/DOCX or fill in the form. Settings will be pre-filled from it.',
      href: '/resume',
      cta: 'Open resume',
    },
    {
      title: 'Set your filters',
      done: roleCount > 0,
      detail:
        roleCount > 0
          ? `${roleCount} role keyword(s), min score ${settings.data?.threshold}`
          : 'Review the roles and skills taken from your resume, then save.',
      href: '/settings',
      cta: 'Open settings',
    },
    {
      title: 'Fill the answer bank',
      done: answerCount > 0,
      detail: answerCount > 0 ? `${answerCount} saved answer(s)` : 'Add common screening answers.',
      href: '/answer-bank',
      cta: 'Open answer bank',
    },
  ];

  return (
    <CardGrid>
      {steps.map((step, index) => {
        const previous = steps[index - 1];
        const blockedBy = previous && !previous.done && !step.done ? previous : null;
        return (
          <StepCard key={step.title}>
            <StepHeader>
              {step.done ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled" />}
              <Typography variant="subtitle1">
                {index + 1}. {step.title}
              </Typography>
            </StepHeader>
            <Typography variant="body2" color="text.secondary">
              {step.detail}
            </Typography>
            {blockedBy && (
              <Typography variant="caption" color="warning.main">
                Do this first: {blockedBy.title.toLowerCase()}
              </Typography>
            )}
            <Spacer />
            <Link component={NextLink} href={step.href} underline="hover">
              {step.cta}
            </Link>
          </StepCard>
        );
      })}
    </CardGrid>
  );
};
