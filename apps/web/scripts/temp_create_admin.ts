import { prisma } from './lib/db';
import { hash } from 'bcryptjs';

async function main() {
  const email = 'admin@montaj.com';
  const password = process.env.ADMIN_PASSWORD;
  const hashedPassword = await hash(password, 10);
  console.log('Upserting user...');
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true
      },
      create: {
        email,
        name: 'Admin',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log('User upserted: ', user);
  } catch (e) {
    console.error('Error upserting user:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
