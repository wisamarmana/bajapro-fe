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
    const badges = await prisma.badge.findMany({
      orderBy: { id: 'asc' },
    });

    return jsonResponse(
      badges.map((b: any) => ({
        id: b.id,
        name: b.name,
        image: b.image,
        minScore: b.minScore,
        maxScore: b.maxScore,
        isactive: b.isActive ? 'Aktif' : 'Nonaktif',
        created_at: b.createdAt,
        updated_at: b.updatedAt,
      }))
    );
  } catch (error: any) {
    console.error('Error in GET /api/badges:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await prisma.badge.create({
      data: {
        name: body.name,
        image: body.image || "",
        minScore: Number(body.minScore) || 0,
        maxScore: Number(body.maxScore) || 100,
        isActive: body.isactive === undefined ? true : Boolean(body.isactive),
      },
    });

    return jsonResponse({
      id: created.id,
      name: created.name,
      image: created.image,
      minScore: created.minScore,
      maxScore: created.maxScore,
      isactive: created.isActive ? 'Aktif' : 'Nonaktif',
      created_at: created.createdAt,
      updated_at: created.updatedAt,
    }, 201);
  } catch (error: any) {
    console.error('Error in POST /api/badges:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
