import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create the user
  const user = await prisma.user.upsert({
    where: { email: 'email@email.com' },
    update: {},
    create: {
      email: 'email@email.com',
      password: hashedPassword,
    },
  });

  console.log('Seed user created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 