import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

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
  const userId = Number(id);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404);
    }

    return jsonResponse({
      id: user.id,
      role_id: user.roleId,
      class_id: user.classId,
      name: user.name,
      email: user.email,
      password: user.password,
      is_approved_by_admin: user.isApprovedByAdmin,
      instansi_sekolah: user.instansiSekolah,
      nip: user.nip,
      isactive: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    });
  } catch (error: any) {
    console.error('Error in GET /api/users/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  try {
    const body = await req.json();
    
    // Hash password if provided
    let updatedPassword = body.password;
    if (body.password) {
      updatedPassword = bcrypt.hashSync(body.password, 10);
    }
    
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        roleId: body.role_id ? Number(body.role_id) : undefined,
        classId: body.class_id !== undefined ? (body.class_id ? Number(body.class_id) : null) : undefined,
        name: body.name,
        email: body.email ? body.email.toLowerCase() : undefined,
        password: updatedPassword,
        isApprovedByAdmin: body.is_approved_by_admin !== undefined ? Number(body.is_approved_by_admin) : undefined,
        instansiSekolah: body.instansi_sekolah,
        nip: body.nip !== undefined ? body.nip : undefined,
        isActive: body.isactive !== undefined ? Boolean(body.isactive) : undefined,
      },
    });

    return jsonResponse({
      id: updated.id,
      role_id: updated.roleId,
      class_id: updated.classId,
      name: updated.name,
      email: updated.email,
      password: updated.password,
      is_approved_by_admin: updated.isApprovedByAdmin,
      instansi_sekolah: updated.instansiSekolah,
      nip: updated.nip,
      isactive: updated.isActive,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/users/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  try {
    const body = await req.json();
    const updateData: any = {};
    if (body.role_id !== undefined) updateData.roleId = Number(body.role_id);
    if (body.class_id !== undefined) updateData.classId = body.class_id ? Number(body.class_id) : null;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email.toLowerCase();
    if (body.password !== undefined) updateData.password = bcrypt.hashSync(body.password, 10);
    if (body.is_approved_by_admin !== undefined) updateData.isApprovedByAdmin = Number(body.is_approved_by_admin);
    if (body.instansi_sekolah !== undefined) updateData.instansiSekolah = body.instansi_sekolah;
    if (body.nip !== undefined) updateData.nip = body.nip;
    if (body.isactive !== undefined) updateData.isActive = Boolean(body.isactive);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return jsonResponse({
      id: updated.id,
      role_id: updated.roleId,
      class_id: updated.classId,
      name: updated.name,
      email: updated.email,
      password: updated.password,
      is_approved_by_admin: updated.isApprovedByAdmin,
      instansi_sekolah: updated.instansiSekolah,
      nip: updated.nip,
      isactive: updated.isActive,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/users/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return jsonResponse({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
