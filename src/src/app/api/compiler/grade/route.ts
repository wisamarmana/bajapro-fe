import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { essays } = body; 
    // essays diharapkan array of object: { question: string, answer: string }

    const formData = new URLSearchParams();
    
    // Berdasarkan error Django, API mengharapkan:
    // esay_question, esay_answer, esay_question2, esay_answer2, dst.
    if (essays && Array.isArray(essays)) {
      essays.forEach((essay, index) => {
        const suffix = index === 0 ? '' : (index + 1).toString();
        formData.append(`esay_question${suffix}`, essay.question || '');
        formData.append(`esay_answer${suffix}`, essay.answer || '');
      });
    }

    // const compilerBaseUrl = process.env.NODE_ENV === 'production'
    //    ? process.env.COMPILER_URL
    //    : 'http://labai.polinema.ac.id:90/online-compiler';

    const compilerBaseUrl = process.env.NODE_ENV === 'production'
       ? 'http://192.168.60.92:8000'
       : 'http://labai.polinema.ac.id:90/online-compiler';

    let res;
    try {
      res = await fetch(`${compilerBaseUrl}/compiler/generate/grade`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (fetchError: any) {
      console.error('Grader fetch network error:', fetchError);
      return NextResponse.json({ error: `Grader server is unreachable: ${fetchError.message}` }, { status: 200 });
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch(e) {
      // Jika error HTML dari Django
      console.error('Grade HTML response:', text.substring(0, 500));
      return NextResponse.json({ error: `Format response dari Django salah (${res.status})`, raw: text.substring(0, 200) }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Compiler grade error:', error);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}
