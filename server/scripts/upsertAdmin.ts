import bcrypt from 'bcrypt';
import { prisma } from '../prisma';

async function main() {
  const args = process.argv.slice(2);
  const help = args.includes('-h') || args.includes('--help');
  const filtered = args.filter((a) => !['-h', '--help'].includes(a));
  const [email, password] = filtered;

  if (help || !email || !password) {
    console.log('Usage: npx tsx server/scripts/upsertAdmin.ts <email> <password>');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Admin upserted: ${admin.email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
