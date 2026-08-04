/**
 * Utility untuk memanggil Compiler API.
 * Jangan pernah panggil Django API secara langsung dari client side,
 * selalu gunakan helper ini agar diarahkan melalui Next.js proxy route (/api/compiler)
 */

export interface CompileRequest {
  code: string;
  language?: string; // e.g., 'java'
}

export interface CompileResponse {
  output: string;
  error?: string;
  success: boolean;
}

export async function executeCode(payload: CompileRequest): Promise<CompileResponse> {
  try {
    const response = await fetch('/api/compiler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        language: payload.language || 'java',
      }),
    });

    if (!response.ok) {
      throw new Error(`Compiler API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      output: data.output || '',
      error: data.error || undefined,
      success: !data.error, // Sesuaikan dengan struktur JSON asli dari Django Anda
    };
  } catch (err: any) {
    console.error('Execute code error:', err);
    return {
      output: '',
      error: err.message || 'Unknown compilation error',
      success: false,
    };
  }
}
