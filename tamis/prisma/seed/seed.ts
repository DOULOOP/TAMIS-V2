import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tamis.gov.tr' },
    update: {},
    create: {
      email: 'admin@tamis.gov.tr',
      password: adminPassword,
      name: 'TAMIS Admin',
      role: 'ADMIN',
      department: 'Bilgi İşlem',
      isActive: true,
    },
  });

  // Create supervisor user
  const supervisorPassword = await bcrypt.hash('super123', 12);
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@tamis.gov.tr' },
    update: {},
    create: {
      email: 'supervisor@tamis.gov.tr',
      password: supervisorPassword,
      name: 'Ahmet Yılmaz',
      role: 'SUPERVISOR',
      department: 'Güvenlik',
      isActive: true,
    },
  });

  // Create engineer user
  const engineerPassword = await bcrypt.hash('eng123', 12);
  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@tamis.gov.tr' },
    update: {},
    create: {
      email: 'engineer@tamis.gov.tr',
      password: engineerPassword,
      name: 'Fatma Demir',
      role: 'ENGINEER',
      department: 'Mühendislik',
      isActive: true,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@tamis.gov.tr' },
    update: {},
    create: {
      email: 'user@tamis.gov.tr',
      password: userPassword,
      name: 'Mehmet Özkan',
      role: 'USER',
      department: 'Operasyon',
      isActive: true,
    },
  });

  console.log('Seed completed successfully!');
  console.log('Created users:');
  console.log('- Admin:', admin.email, '(password: admin123)');
  console.log('- Supervisor:', supervisor.email, '(password: super123)');
  console.log('- Engineer:', engineer.email, '(password: eng123)');
  console.log('- User:', user.email, '(password: user123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
