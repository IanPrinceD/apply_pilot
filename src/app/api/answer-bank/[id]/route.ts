// src\app\api\answer-bank\[id]\route.ts
import { NextResponse } from 'next/server';
import { deleteAnswerBankEntry, updateAnswerBankEntry } from '@/services/answerBankService';
import { answerBankInputSchema } from '@/types/answerBank';
import { handleRouteError } from '@/utils/routeError';

/** Updates an answer bank entry. */
export const PUT = async (req: Request, ctx: RouteContext<'/api/answer-bank/[id]'>) => {
  try {
    const { id } = await ctx.params;
    const input = answerBankInputSchema.parse(await req.json());
    return NextResponse.json(await updateAnswerBankEntry(id, input));
  } catch (err) {
    return handleRouteError(err);
  }
};

/** Deletes an answer bank entry. */
export const DELETE = async (_req: Request, ctx: RouteContext<'/api/answer-bank/[id]'>) => {
  try {
    const { id } = await ctx.params;
    await deleteAnswerBankEntry(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
};
