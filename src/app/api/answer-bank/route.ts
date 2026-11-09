// src\app\api\answer-bank\route.ts
import { connection, NextResponse } from 'next/server';
import { createAnswerBankEntry, listAnswerBankEntries } from '@/services/answerBankService';
import { answerBankInputSchema } from '@/types/answerBank';
import { handleRouteError } from '@/utils/routeError';

/** Lists answer bank entries. */
export const GET = async () => {
  await connection();
  try {
    return NextResponse.json(await listAnswerBankEntries());
  } catch (err) {
    return handleRouteError(err);
  }
};

/** Creates an answer bank entry. */
export const POST = async (req: Request) => {
  try {
    const input = answerBankInputSchema.parse(await req.json());
    return NextResponse.json(await createAnswerBankEntry(input), { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
};
