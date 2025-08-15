import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

async function main() {
  const args = process.argv.slice(2);
  const help = args.includes('-h') || args.includes('--help');
  const write = args.includes('--write');
  const filtered = args.filter((a) => !['--write', '-h', '--help'].includes(a));
  const [email, password] = filtered;

  if (help || !email || !password) {
    console.log('Usage: npx tsx server/scripts/setAdmin.ts <email> <password> [--write]');
    console.log(' - <email>: admin email to set');
    console.log(' - <password>: admin plaintext password to hash');
    console.log(' - --write: if provided, updates .env in-place; otherwise prints the lines to add');
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);

  const envLines = [
    `ADMIN_EMAIL="${email}"`,
    `ADMIN_PASSWORD_HASH="${hash}"`,
  ];

  if (!write) {
    console.log('\nAdd the following lines to your .env file (replace existing ones if present):\n');
    console.log(envLines.join('\n'));
    console.log('\nDone.');
    return;
  }

  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`.env not found at ${envPath}. Create it first.`);
    process.exit(1);
  }

  let content = fs.readFileSync(envPath, 'utf8');

  const setOrAppend = (key: string, valueLine: string) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, valueLine);
    } else {
      if (!content.endsWith('\n')) content += '\n';
      content += valueLine + '\n';
    }
  };

  setOrAppend('ADMIN_EMAIL', envLines[0]);
  setOrAppend('ADMIN_PASSWORD_HASH', envLines[1]);

  fs.writeFileSync(envPath, content, 'utf8');
  console.log('Updated .env with new ADMIN_EMAIL and ADMIN_PASSWORD_HASH');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
