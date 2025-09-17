// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function seedLeavePolicy(prisma: PrismaClient) {
//   console.log('Seeding leave policy...');

//   try {
//     await prisma.leave_policy.upsert({
//       where: { leaveType: 'ANNUAL' },
//       update: {},
//       create: { leaveType: 'ANNUAL', defaultBalance: 14 },
//     });
//     await prisma.leave_policy.upsert({
//       where: { leaveType: 'CASUAL' },
//       update: {},
//       create: { leaveType: 'CASUAL', defaultBalance: 7 },
//     });

//     console.log(`🌱 Created new leave policy entries:`);
//   } catch (error) {
//     console.error('❌ Leave policy seeding failed:', error);
//     throw error;
//   }
// }

// seedLeavePolicy(prisma)
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLeavePolicy(prisma: PrismaClient) {
  console.log('Seeding leave policy and attendance config...');

  try {
    // Seed leave policies
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

    // Seed attendance config
    await prisma.attendanceConfig.create({
      data: {
        workStart: new Date('1970-01-01T08:00:00Z'),
        workEnd: new Date('1970-01-01T16:30:00Z'),
        otEnd: new Date('1970-01-01T20:00:00Z'),
        earlyStart: new Date('1970-01-01T07:00:00Z'),
      },
    });

    console.log(`🌱 Created new leave policy entries and attendance config.`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
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
