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

export async function POST(req: NextRequest) {
  try {
    const { keys } = await req.json();
    const userIds = (keys || []).map((k: any) => Number(k));

    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isApprovedByAdmin: 2 },
    });

    return jsonResponse({ success: true });
  } catch (error: any) {
    console.error('Error in POST /api/admin/approval-pengajar/reject:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
