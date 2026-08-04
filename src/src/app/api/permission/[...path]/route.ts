import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export const dynamic = 'force-dynamic';

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
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const route = path.join('/');

  try {
    // 1. Get Roles
    if (route === 'roles') {
      const roles = await prisma.role.findMany({
        orderBy: { id: 'asc' },
      });
      return jsonResponse(
        roles.map((r: any) => ({
          id: r.id,
          role_name: r.roleName,
          isactive: r.isActive,
          created_at: r.createdAt,
          updated_at: r.updatedAt,
        }))
      );
    }

    // 2. Get All Permissions
    if (route === 'permissions') {
      const permissions = await prisma.permission.findMany({
        include: { roles: true },
        orderBy: { id: 'asc' },
      });
      return jsonResponse(
        permissions.map((p: any) => ({
          id: p.id,
          name: p.name,
          role_ids: p.roles.map((r: any) => r.id),
          isactive: p.isActive,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        }))
      );
    }

    return jsonResponse({ error: 'Route not found' }, 404);
  } catch (error: any) {
    console.error('Error handling GET in permission API:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const route = path.join('/');

  try {
    // 1. Update Permission Roles association
    if (route.startsWith('permissions/')) {
      const permId = route.split('/')[1];
      const body = await req.json();
      const roleIds = (body.role_ids || []).map((id: any) => Number(id));

      const updated = await prisma.permission.update({
        where: { id: Number(permId) },
        data: {
          roles: {
            set: roleIds.map((id: number) => ({ id })),
          },
        },
        include: { roles: true },
      });

      return jsonResponse({
        id: updated.id,
        name: updated.name,
        role_ids: updated.roles.map((r: any) => r.id),
        isactive: updated.isActive,
      });
    }

    return jsonResponse({ error: 'Route not found' }, 404);
  } catch (error: any) {
    console.error('Error handling PATCH in permission API:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
