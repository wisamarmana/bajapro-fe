const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE t_essay_answer ALTER COLUMN is_approved_by_teacher DROP DEFAULT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE t_essay_answer ALTER COLUMN is_approved_by_teacher TYPE INTEGER USING CASE WHEN is_approved_by_teacher = 'approved' THEN 1 WHEN is_approved_by_teacher = 'rejected' THEN 0 ELSE NULL END;`);
  console.log('Successfully altered column type in Supabase!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
