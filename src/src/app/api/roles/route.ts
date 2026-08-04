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
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
    });

    return jsonResponse(
      roles.map((r: any) => ({
        id: r.id,
        role_name: r.roleName,
        isactive: r.isActive ? 'Aktif' : 'Nonaktif',
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      }))
    );
  } catch (error: any) {
    console.error('Error in GET /api/roles:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await prisma.role.create({
      data: {
        roleName: body.role_name,
        isActive: body.isactive === undefined ? true : Boolean(body.isactive),
      },
    });

    return jsonResponse({
      id: created.id,
      role_name: created.roleName,
      isactive: created.isActive ? 'Aktif' : 'Nonaktif',
      created_at: created.createdAt,
      updated_at: created.updatedAt,
    }, 201);
  } catch (error: any) {
    console.error('Error in POST /api/roles:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
