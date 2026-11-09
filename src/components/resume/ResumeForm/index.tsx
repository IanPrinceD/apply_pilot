// src\components\resume\ResumeForm\index.tsx
'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { IconButton, Tooltip, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Button } from '@/components/shared/Button';
import { Dropdown } from '@/components/shared/Dropdown';
import { Input } from '@/components/shared/Input';
import { Textarea } from '@/components/shared/Textarea';
import { SKILL_SUGGESTIONS } from '@/constants/suggestions';
import {
  EMPTY_CERTIFICATION,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  EMPTY_PROJECT,
  type MasterResume,
} from '@/types/resume';
import {
  ActionsRow,
  FieldGrid,
  FormStack,
  ItemCard,
  ItemHeader,
  Section,
  SectionHeader,
} from './resumeForm.element';

type ListKey = 'experience' | 'education' | 'certifications' | 'projects';

interface ResumeFormProps {
  value: MasterResume;
  onChange: (next: MasterResume) => void;
  onSave: () => void;
  onDiscard?: () => void;
  saving: boolean;
  dirty: boolean;
}

interface RepeatableProps<T> {
  title: string;
  addLabel: string;
  items: T[];
  itemLabel: (item: T, index: number) => string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
}

/** A section holding a list of cards with add/remove. */
const Repeatable = <T,>({ title, addLabel, items, itemLabel, onAdd, onRemove, renderItem }: RepeatableProps<T>) => (
  <Section>
    <SectionHeader>
      <Typography variant="h6">{title}</Typography>
      <Button buttonType="cancel" size="small" startIcon={<AddIcon />} onClick={onAdd}>
        {addLabel}
      </Button>
    </SectionHeader>
    {items.length === 0 && (
      <Typography variant="body2" color="text.secondary">
        Nothing added yet.
      </Typography>
    )}
    {items.map((item, index) => (
      <ItemCard key={index}>
        <ItemHeader>
          <Typography variant="subtitle2">{itemLabel(item, index)}</Typography>
          <Tooltip title="Remove">
            <IconButton size="small" aria-label={`Remove ${itemLabel(item, index)}`} onClick={() => onRemove(index)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ItemHeader>
        {renderItem(item, index)}
      </ItemCard>
    ))}
  </Section>
);

/** Splits a textarea into lines, keeping blanks while typing (cleaned on save). */
const toLines = (text: string): string[] => text.split('\n');

/** Controlled editor for the master resume. */
export const ResumeForm = ({ value, onChange, onSave, onDiscard, saving, dirty }: ResumeFormProps) => {
  /** Replaces one top-level field. */
  const set = <K extends keyof MasterResume>(key: K, next: MasterResume[K]) => onChange({ ...value, [key]: next });

  /** Patches one item in a list section. */
  const patchItem = <K extends ListKey>(key: K, index: number, patch: Partial<MasterResume[K][number]>) =>
    set(
      key,
      value[key].map((item, i) => (i === index ? { ...item, ...patch } : item)) as MasterResume[K],
    );

  /** Appends an item to a list section. */
  const addItem = <K extends ListKey>(key: K, empty: MasterResume[K][number]) =>
    set(key, [...value[key], empty] as MasterResume[K]);

  /** Removes an item from a list section. */
  const removeItem = (key: ListKey, index: number) =>
    set(key, value[key].filter((_, i) => i !== index) as MasterResume[typeof key]);

  const { contact } = value;
  const setContact = (field: keyof MasterResume['contact'], v: string) =>
    set('contact', { ...contact, [field]: v });

  return (
    <FormStack>
      <Section>
        <Typography variant="h6">Contact</Typography>
        <FieldGrid>
          <Input label="Full name" value={contact.fullName} onChange={(e) => setContact('fullName', e.target.value)} />
          <Input label="Email" type="email" value={contact.email} onChange={(e) => setContact('email', e.target.value)} />
          <Input label="Phone" value={contact.phone} onChange={(e) => setContact('phone', e.target.value)} />
          <Input label="Location" value={contact.location} onChange={(e) => setContact('location', e.target.value)} />
          <Input label="LinkedIn" value={contact.linkedin} onChange={(e) => setContact('linkedin', e.target.value)} />
          <Input label="GitHub" value={contact.github} onChange={(e) => setContact('github', e.target.value)} />
          <Input label="Website" value={contact.website} onChange={(e) => setContact('website', e.target.value)} />
        </FieldGrid>
      </Section>

      <Section>
        <Typography variant="h6">Profile</Typography>
        <Input
          label="Headline"
          placeholder="e.g. Customer Service Representative, Registered Nurse, Web Developer"
          value={value.headline}
          onChange={(e) => set('headline', e.target.value)}
        />
        <Textarea label="Summary" minRows={4} value={value.summary} onChange={(e) => set('summary', e.target.value)} />
        <Dropdown
          label="Skills & tools"
          placeholder="Pick a skill or type your own and press Enter"
          options={SKILL_SUGGESTIONS}
          multiple
          searchable
          creatable
          value={value.skills}
          onChange={(v) => set('skills', v)}
          helperText="Only list skills you actually have — tailoring never adds new ones."
        />
      </Section>

      <Repeatable
        title="Experience"
        addLabel="Add role"
        items={value.experience}
        itemLabel={(item, i) => [item.title, item.company].filter(Boolean).join(' @ ') || `Role ${i + 1}`}
        onAdd={() => addItem('experience', { ...EMPTY_EXPERIENCE })}
        onRemove={(i) => removeItem('experience', i)}
        renderItem={(item, i) => (
          <>
            <FieldGrid>
              <Input label="Job title" value={item.title} onChange={(e) => patchItem('experience', i, { title: e.target.value })} />
              <Input label="Company" value={item.company} onChange={(e) => patchItem('experience', i, { company: e.target.value })} />
              <Input label="Location" value={item.location} onChange={(e) => patchItem('experience', i, { location: e.target.value })} />
              <FieldGrid>
                <Input label="Start" placeholder="Jan 2021" value={item.startDate} onChange={(e) => patchItem('experience', i, { startDate: e.target.value })} />
                <Input label="End" placeholder="Present" value={item.endDate} onChange={(e) => patchItem('experience', i, { endDate: e.target.value })} />
              </FieldGrid>
            </FieldGrid>
            <Textarea
              label="Highlights (one per line)"
              minRows={3}
              value={item.highlights.join('\n')}
              onChange={(e) => patchItem('experience', i, { highlights: toLines(e.target.value) })}
            />
          </>
        )}
      />

      <Repeatable
        title="Education"
        addLabel="Add education"
        items={value.education}
        itemLabel={(item, i) => item.institution || `Education ${i + 1}`}
        onAdd={() => addItem('education', { ...EMPTY_EDUCATION })}
        onRemove={(i) => removeItem('education', i)}
        renderItem={(item, i) => (
          <FieldGrid>
            <Input label="Institution" value={item.institution} onChange={(e) => patchItem('education', i, { institution: e.target.value })} />
            <Input label="Degree" value={item.degree} onChange={(e) => patchItem('education', i, { degree: e.target.value })} />
            <Input label="Field of study" value={item.field} onChange={(e) => patchItem('education', i, { field: e.target.value })} />
            <FieldGrid>
              <Input label="Start" value={item.startDate} onChange={(e) => patchItem('education', i, { startDate: e.target.value })} />
              <Input label="End" value={item.endDate} onChange={(e) => patchItem('education', i, { endDate: e.target.value })} />
            </FieldGrid>
          </FieldGrid>
        )}
      />

      <Repeatable
        title="Certifications"
        addLabel="Add certification"
        items={value.certifications}
        itemLabel={(item, i) => item.name || `Certification ${i + 1}`}
        onAdd={() => addItem('certifications', { ...EMPTY_CERTIFICATION })}
        onRemove={(i) => removeItem('certifications', i)}
        renderItem={(item, i) => (
          <FieldGrid>
            <Input label="Name" value={item.name} onChange={(e) => patchItem('certifications', i, { name: e.target.value })} />
            <Input label="Issuer" value={item.issuer} onChange={(e) => patchItem('certifications', i, { issuer: e.target.value })} />
            <Input label="Date" value={item.date} onChange={(e) => patchItem('certifications', i, { date: e.target.value })} />
          </FieldGrid>
        )}
      />

      <Repeatable
        title="Projects"
        addLabel="Add project"
        items={value.projects}
        itemLabel={(item, i) => item.name || `Project ${i + 1}`}
        onAdd={() => addItem('projects', { ...EMPTY_PROJECT })}
        onRemove={(i) => removeItem('projects', i)}
        renderItem={(item, i) => (
          <>
            <FieldGrid>
              <Input label="Name" value={item.name} onChange={(e) => patchItem('projects', i, { name: e.target.value })} />
              <Input label="URL" value={item.url} onChange={(e) => patchItem('projects', i, { url: e.target.value })} />
            </FieldGrid>
            <Textarea
              label="Description"
              minRows={2}
              value={item.description}
              onChange={(e) => patchItem('projects', i, { description: e.target.value })}
            />
            <Dropdown
              label="Skills & tools used"
              options={SKILL_SUGGESTIONS}
              multiple
              searchable
              creatable
              value={item.techStack}
              onChange={(v) => patchItem('projects', i, { techStack: v })}
            />
          </>
        )}
      />

      <ActionsRow>
        {dirty && (
          <Typography variant="body2" color="text.secondary">
            Unsaved changes
          </Typography>
        )}
        {onDiscard && (
          <Button buttonType="cancel" onClick={onDiscard} disabled={!dirty || saving}>
            Discard
          </Button>
        )}
        <Button onClick={onSave} loading={saving} disabled={!dirty}>
          Save resume
        </Button>
      </ActionsRow>
    </FormStack>
  );
};
