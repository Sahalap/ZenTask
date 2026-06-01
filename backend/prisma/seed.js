const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean database
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // Create normal user
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@zentask.com',
      password: hashedUserPassword,
      name: 'Alex Mercer',
      role: 'USER'
    }
  });

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@zentask.com',
      password: hashedAdminPassword,
      name: 'Sarah Connor',
      role: 'ADMIN'
    }
  });

  console.log('Seeded Users:');
  console.log(`- Regular User: user@zentask.com / user123`);
  console.log(`- Admin User: admin@zentask.com / admin123`);

  // Create some tasks for user
  await prisma.task.create({
    data: {
      title: 'Review System Design Document',
      description: 'Go through the latest version of the ZenTask architecture plan and add feedback on the caching section.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      userId: normalUser.id
    }
  });

  await prisma.task.create({
    data: {
      title: 'Fix CSRF vulnerabilities',
      description: 'Ensure double submit cookies or secure custom headers are validated across sensitive operations.',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      userId: normalUser.id
    }
  });

  await prisma.task.create({
    data: {
      title: 'Refactor client authentication logic',
      description: 'Clean up local storage bindings and implement persistent token refresh cycles if possible.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      userId: normalUser.id
    }
  });

  // Create a task for admin
  await prisma.task.create({
    data: {
      title: 'Audit application access logs',
      description: 'Review logs for unauthorized login attempts or anomalies in the rate limiting headers.',
      status: 'PENDING',
      priority: 'LOW',
      userId: adminUser.id
    }
  });

  console.log('Seeded Tasks successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
