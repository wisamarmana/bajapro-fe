import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return jsonResponse({}, 200);
}

export async function GET(req: NextRequest) {
  try {
    // Role 2 is Pengajar (Teacher)
    const teachers = await prisma.user.findMany({
      where: { roleId: 2 },
      orderBy: { id: 'asc' },
    });

    return jsonResponse(
      teachers.map((t: any, index: number) => ({
        key: t.id,
        no: index + 1,
        nama: t.name,
        email: t.email,
        instansi: t.instansiSekolah || '-',
        nip: t.nip || '-',
        is_approved_by_admin: t.isApprovedByAdmin,
      }))
    );
  } catch (error: any) {
    console.error('Error in GET /api/admin/approval-pengajar:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
