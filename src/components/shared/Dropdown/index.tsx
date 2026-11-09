// src\components\shared\Dropdown\index.tsx
'use client';

import { Chip, MenuItem, TextField } from '@mui/material';
import { type ReactNode, useMemo } from 'react';
import { SelectField, StyledAutocomplete } from './dropdown.element';

export interface DropdownOption {
  value: string;
  label: string;
  /** Searchable only: options sharing a group render under one heading. Keep options sorted by group. */
  group?: string;
}

interface BaseDropdownProps {
  label: string;
  options: DropdownOption[];
  /** Renders an Autocomplete with type-to-filter instead of a plain select. */
  searchable?: boolean;
  /** Searchable + multiple only: allow values not in `options` (type and press Enter). */
  creatable?: boolean;
  placeholder?: string;
  helperText?: ReactNode;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

interface SingleDropdownProps extends BaseDropdownProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

interface MultiDropdownProps extends BaseDropdownProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type DropdownProps = SingleDropdownProps | MultiDropdownProps;


/** Select input. Plain select by default; `searchable` switches to Autocomplete. */
export const Dropdown = (props: DropdownProps) => {
  const { label, options, searchable, creatable, placeholder, helperText, error, disabled, required, name } = props;
  const optionValues = useMemo(() => options.map((o) => o.value), [options]);
  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const hasGroups = useMemo(() => options.some((o) => o.group), [options]);

  /** Option label, falling back to the raw value (for creatable entries). */
  const labelFor = (value: string): string => byValue.get(value)?.label ?? value;
  /** Group heading for Autocomplete; typed-in values land under "Custom". */
  const groupBy = hasGroups ? (value: string): string => byValue.get(value)?.group ?? 'Custom' : undefined;

  if (searchable && props.multiple) {
    return (
      <StyledAutocomplete<string, true, false, boolean>
        multiple
        freeSolo={creatable}
        options={optionValues}
        value={props.value}
        disabled={disabled}
        filterSelectedOptions
        getOptionLabel={(v) => labelFor(v)}
        groupBy={groupBy}
        onChange={(_e, next) => props.onChange(Array.from(new Set(next.map((v) => v.trim()).filter(Boolean))))}
        renderValue={(values, getItemProps) =>
          values.map((v, index) => {
            const { key, ...itemProps } = getItemProps({ index });
            return <Chip key={key} size="small" label={labelFor(v)} {...itemProps} />;
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={label}
            placeholder={props.value.length ? undefined : placeholder}
            helperText={helperText}
            error={error}
            required={required}
            size="small"
          />
        )}
      />
    );
  }

  if (searchable && !props.multiple) {
    return (
      <StyledAutocomplete<string, false, false, false>
        options={optionValues}
        value={props.value || null}
        disabled={disabled}
        getOptionLabel={(v) => labelFor(v)}
        groupBy={groupBy}
        onChange={(_e, next) => props.onChange(next ?? '')}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={label}
            placeholder={placeholder}
            helperText={helperText}
            error={error}
            required={required}
            size="small"
          />
        )}
      />
    );
  }

  return (
    <SelectField
      select
      fullWidth
      size="small"
      name={name}
      label={label}
      value={props.value}
      helperText={helperText}
      error={error}
      disabled={disabled}
      required={required}
      onChange={(e) => {
        const raw = e.target.value as string | string[];
        if (props.multiple) props.onChange(Array.isArray(raw) ? raw : raw.split(','));
        else props.onChange(Array.isArray(raw) ? (raw[0] ?? '') : raw);
      }}
      slotProps={{
        select: {
          multiple: props.multiple,
          renderValue: props.multiple
            ? (selected) => (selected as string[]).map((v) => labelFor(v)).join(', ')
            : undefined,
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </SelectField>
  );
};
