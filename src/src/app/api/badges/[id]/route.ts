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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const badgeId = Number(id);

  try {
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      return jsonResponse({ error: 'Badge not found' }, 404);
    }

    return jsonResponse({
      id: badge.id,
      name: badge.name,
      image: badge.image,
      minScore: badge.minScore,
      maxScore: badge.maxScore,
      isactive: badge.isActive ? 'Aktif' : 'Nonaktif',
      created_at: badge.createdAt,
      updated_at: badge.updatedAt,
    });
  } catch (error: any) {
    console.error('Error in GET /api/badges/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const badgeId = Number(id);

  try {
    const body = await req.json();
    const updated = await prisma.badge.update({
      where: { id: badgeId },
      data: {
        name: body.name,
        image: body.image,
        minScore: body.minScore !== undefined ? Number(body.minScore) : undefined,
        maxScore: body.maxScore !== undefined ? Number(body.maxScore) : undefined,
        isActive: body.isactive !== undefined ? Boolean(body.isactive) : undefined,
      },
    });

    return jsonResponse({
      id: updated.id,
      name: updated.name,
      image: updated.image,
      minScore: updated.minScore,
      maxScore: updated.maxScore,
      isactive: updated.isActive ? 'Aktif' : 'Nonaktif',
    });
  } catch (error: any) {
    console.error('Error in PUT /api/badges/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const badgeId = Number(id);

  try {
    await prisma.badge.delete({
      where: { id: badgeId },
    });
    return jsonResponse({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/badges/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
