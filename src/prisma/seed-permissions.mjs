import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log("Membaca database.json...");
  const rawData = fs.readFileSync('./database.json', 'utf8');
  const db = JSON.parse(rawData);

  const permissions = db.permissions;
  if (!permissions) {
    console.log("Tidak ada data permissions di database.json");
    return;
  }

  console.log(`Ditemukan ${permissions.length} permissions di JSON. Memperbarui PostgreSQL Pivot Table...`);

  for (const p of permissions) {
    const roleIds = p.role_ids || [];
    
    if (roleIds.length > 0) {
      await prisma.permission.update({
        where: { id: Number(p.id) },
        data: {
          roles: {
            connect: roleIds.map(id => ({ id: Number(id) }))
          }
        }
      }).catch(err => {
        console.error(`Gagal update permission ${p.name}:`, err.message);
      });
      console.log(`Berhasil sinkronisasi permission: ${p.name} -> Roles: [${roleIds.join(', ')}]`);
    }
  }

  console.log("Berhasil memperbarui Pivot Table Role <-> Permission!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
