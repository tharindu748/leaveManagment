import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLeavePolicy(prisma: PrismaClient) {
  console.log('Seeding leave policy...');

  try {
    await prisma.leave_policy.upsert({
      where: { leaveType: 'ANNUAL' },
      update: {},
      create: { leaveType: 'ANNUAL', defaultBalance: 14 },
    });
    await prisma.leave_policy.upsert({
      where: { leaveType: 'CASUAL' },
      update: {},
      create: { leaveType: 'CASUAL', defaultBalance: 7 },
    });

    console.log(`🌱 Created new leave policy entries:`);
  } catch (error) {
    console.error('❌ Leave policy seeding failed:', error);
    throw error;
  }
}

seedLeavePolicy(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
