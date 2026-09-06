import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all users...");
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`Found ${users.length} users. Resetting passwords to Password@123...`);

  const passwordHash = await hashPassword("Password@123");

  let updatedCount = 0;
  for (const user of users) {
    try {
      await prisma.account.updateMany({
        where: {
          userId: user.id,
          providerId: "credential",
        },
        data: {
          password: passwordHash,
        },
      });
      updatedCount++;
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount}/${users.length}...`);
      }
    } catch (err) {
      console.error(`Failed to update password for ${user.email}:`, err);
    }
  }

  console.log(`\nSuccessfully reset passwords for ${updatedCount} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
