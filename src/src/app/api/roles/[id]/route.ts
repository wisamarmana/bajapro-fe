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
  const roleId = Number(id);

  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return jsonResponse({ error: 'Role not found' }, 404);
    }

    return jsonResponse({
      id: role.id,
      role_name: role.roleName,
      isactive: role.isActive ? 'Aktif' : 'Nonaktif',
      created_at: role.createdAt,
      updated_at: role.updatedAt,
    });
  } catch (error: any) {
    console.error('Error in GET /api/roles/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roleId = Number(id);

  try {
    const body = await req.json();
    const updated = await prisma.role.update({
      where: { id: roleId },
      data: {
        roleName: body.role_name,
        isActive: body.isactive !== undefined ? Boolean(body.isactive) : undefined,
      },
    });

    return jsonResponse({
      id: updated.id,
      role_name: updated.roleName,
      isactive: updated.isActive ? 'Aktif' : 'Nonaktif',
    });
  } catch (error: any) {
    console.error('Error in PUT /api/roles/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roleId = Number(id);

  try {
    await prisma.role.delete({
      where: { id: roleId },
    });
    return jsonResponse({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/roles/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
