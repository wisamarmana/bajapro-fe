import { NextResponse } from "next/server";

// --- DUMMY DATABASE DI MEMORI ---
// Di dunia nyata, bagian ini diganti dengan koneksi ke database (Prisma, Sequelize, dll)
let role_permissions = [
  { id: 1, role_id: 1, permission_id: 1 },
  { id: 2, role_id: 1, permission_id: 2 },
  { id: 3, role_id: 2, permission_id: 2 },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const roleId = parseInt(params.id);

  // 1. Cari semua permission untuk role_id ini
  const roleAccess = role_permissions.filter((rp) => rp.role_id === roleId);

  // 2. Ekstrak hanya ID permission-nya saja (sesuai format yang diminta Frontend)
  const permissionIds = roleAccess.map((rp) => rp.permission_id);

  // Output yang dikirim ke frontend: [1, 2]
  return NextResponse.json(permissionIds);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const roleId = parseInt(params.id);
  
  // Tangkap data array [1, 2, 3, 5] yang dikirim frontend dari action "Save"
  const body = await request.json();
  const incomingPermissionIds: number[] = body.permission_ids;

  // 1. DELETE / CLEAR (Hapus semua akses lama milik role ini)
  role_permissions = role_permissions.filter((rp) => rp.role_id !== roleId);

  // 2. INSERT / SYNC (Masukkan akses baru yang baru saja dicentang)
  incomingPermissionIds.forEach((permId) => {
    role_permissions.push({
      id: Date.now() + Math.floor(Math.random() * 1000), // Auto-increment dummy
      role_id: roleId,
      permission_id: permId,
    });
  });

  return NextResponse.json({ 
    message: "Permissions updated successfully",
    updated_permissions: incomingPermissionIds
  });
}