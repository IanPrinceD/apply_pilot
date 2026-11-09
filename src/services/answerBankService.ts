// src\services\answerBankService.ts
import { z } from 'zod';
import type { AnswerBankEntry } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { AnswerBankEntryDto, AnswerBankInput } from '@/types/answerBank';

const tagsSchema = z.array(z.string());

/** Maps an AnswerBankEntry row to the API shape. */
const toDto = (row: AnswerBankEntry): AnswerBankEntryDto => {
  const tags = tagsSchema.safeParse(row.tags);
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    tags: tags.success ? tags.data : [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

/** Throws a 404 service error. */
const notFound = (id: string): never => {
  throw Object.assign(new Error(`Answer bank entry ${id} not found`), { status: 404 });
};

/** Lists all answer bank entries, newest first. */
export const listAnswerBankEntries = async (): Promise<AnswerBankEntryDto[]> => {
  const rows = await prisma.answerBankEntry.findMany({ orderBy: { updatedAt: 'desc' } });
  return rows.map(toDto);
};

/** Creates an answer bank entry. */
export const createAnswerBankEntry = async (input: AnswerBankInput): Promise<AnswerBankEntryDto> => {
  const row = await prisma.answerBankEntry.create({ data: input });
  return toDto(row);
};

/** Updates an answer bank entry; 404 if missing. */
export const updateAnswerBankEntry = async (id: string, input: AnswerBankInput): Promise<AnswerBankEntryDto> => {
  const existing = await prisma.answerBankEntry.findUnique({ where: { id } });
  if (!existing) return notFound(id);
  const row = await prisma.answerBankEntry.update({ where: { id }, data: input });
  return toDto(row);
};

/** Deletes an answer bank entry; 404 if missing. */
export const deleteAnswerBankEntry = async (id: string): Promise<void> => {
  const existing = await prisma.answerBankEntry.findUnique({ where: { id } });
  if (!existing) notFound(id);
  await prisma.answerBankEntry.delete({ where: { id } });
};
