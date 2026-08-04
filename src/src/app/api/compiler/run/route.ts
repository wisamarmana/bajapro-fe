import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, code, studentId, codeQuestionId } = body;

    const formData = new URLSearchParams();
    formData.append('user', user || 'student');
    formData.append('code', code || '');

    let res;
    try {
      // const compilerBaseUrl = process.env.NODE_ENV === 'production'
      //  ? process.env.COMPILER_URL
      //  : 'http://labai.polinema.ac.id:90/online-compiler'

      const compilerBaseUrl = process.env.NODE_ENV === 'production'
       ? 'http://192.168.60.92:8000'
       : 'http://labai.polinema.ac.id:90/online-compiler';

      res = await fetch(`${compilerBaseUrl}/compiler/run`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (fetchError: any) {
      console.error('Compiler fetch network error:', fetchError);
      // Return 200 with error so the UI handles it gracefully instead of a 500 error log
      return NextResponse.json({ error: `Compiler server is unreachable: ${fetchError.message}` }, { status: 200 });
    }

    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error('Compiler returned non-JSON:', res.status, text.substring(0, 100));
      return NextResponse.json({ 
        error: `Compiler API returned error (${res.status}): ${text.substring(0, 200)}` 
      }, { status: 200 });
    }
    
    // Save to CodeHistoryLog
    if (studentId && codeQuestionId) {
      let isError = false;
      let logs = "";
      if (data.error) {
        isError = true;
        logs = `Server Error: ${data.error}`;
      } else {
        const output = data.output || {};
        if (typeof output.java === 'string' && output.java.includes("failed")) isError = true;
        else if (typeof output.test_output === 'string' && output.test_output.includes("FAILED")) isError = true;
        
        logs = `[Test Output]\n${output.test_output || ''}`;
      }

      try {
        await prisma.codeHistoryLog.create({
          data: {
            userId: Number(studentId),
            codeQuestionId: Number(codeQuestionId),
            timeCount: data.output?.point || 0, // Store points here or actual time? Usually timeCount implies something else, but we can store points or 0
            message: logs.substring(0, 500),
            isError: isError,
            isActive: true,
          }
        });
      } catch (dbError) {
        console.error("Failed to save history log:", dbError);
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Compiler run error:', error);
    // If it's a completely unexpected error, return 200 so UI can display it
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}
