// src\types\answerBank.ts
import { z } from 'zod';

export const answerBankInputSchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(500),
  answer: z.string().trim().min(1, 'Answer is required').max(5000),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});

export type AnswerBankInput = z.infer<typeof answerBankInputSchema>;

export interface AnswerBankEntryDto extends AnswerBankInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}
