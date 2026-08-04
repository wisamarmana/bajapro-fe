const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$executeRawUnsafe('ALTER TABLE m_users ADD COLUMN nip TEXT;')
  .then(() => console.log('success'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
