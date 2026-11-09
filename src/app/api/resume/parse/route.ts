// src\app\api\resume\parse\route.ts
import { NextResponse } from 'next/server';
import { parseResumeUpload } from '@/services/resumeService';
import { handleRouteError } from '@/utils/routeError';

/** Parses an uploaded PDF/DOCX into a resume draft. Does not save it. */
export const POST = async (req: Request) => {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Attach a file in the "file" field.' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    return NextResponse.json(await parseResumeUpload(buffer, file.name, file.type));
  } catch (err) {
    return handleRouteError(err);
  }
};
