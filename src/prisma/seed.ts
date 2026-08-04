import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Enkripsi password untuk admin
  const hashedPassword = bcrypt.hashSync('admin123', 10);

  // Upsert (Update atau Insert) akun Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bajapro.com' },
    update: {}, // Jika sudah ada, jangan diubah
    create: {
      roleId: 1, // ID Role Admin
      name: 'Administrator',
      email: 'admin@bajapro.com',
      password: hashedPassword,
      isApprovedByAdmin: 1, // Langsung aktif
      isActive: true,
      instansiSekolah: 'Universitas Brawijaya', // Atau lainnya
    },
  });

  console.log('✅ Default Admin berhasil dibuat!');
  console.log('Email: admin@bajapro.com');
  console.log('Password: admin123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
