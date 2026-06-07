import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.usuario.findUnique({
    where: { email: 'admin@denunUrban.com' },
  });

  if (existing) {
    console.log('Admin já existe, seed ignorado.');
    return;
  }

  const senha = await bcrypt.hash('Admin@1234', 10);

  await prisma.usuario.create({
    data: {
      nome:          'Administrador',
      email:         'admin@denunUrban.com',
      senha,
      primeiroLogin: true,
      role:          'admin',
    },
  });

  console.log('Admin criado: admin@denunUrban.com / Admin@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
