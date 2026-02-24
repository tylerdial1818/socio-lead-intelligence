/**
 * One-time script to update the production database.
 * Updates the user account and team members for the real team.
 *
 * Usage:
 *   SEED_PASSWORD="YourStrongPassword" npx tsx scripts/update-production-user.ts
 *
 * Requires:
 *   - DATABASE_URL or DIRECT_URL set in .env
 *   - SEED_PASSWORD passed as environment variable (NOT hardcoded)
 */

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = process.env.SEED_PASSWORD;
  if (!newPassword) {
    console.error("ERROR: SEED_PASSWORD environment variable is required.");
    console.error("Usage: SEED_PASSWORD=\"YourPassword\" npx tsx scripts/update-production-user.ts");
    process.exit(1);
  }

  console.log("Starting production user update...\n");

  const hashedPassword = await hash(newPassword, 12);

  // 1. Update or create the user account
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: "Tyler Dial",
        email: "tyler@socio-analytics.com",
        password: hashedPassword,
      },
    });
    console.log(`Updated user: ${existingUser.email} -> tyler@socio-analytics.com`);
  } else {
    await prisma.user.create({
      data: {
        name: "Tyler Dial",
        email: "tyler@socio-analytics.com",
        password: hashedPassword,
      },
    });
    console.log("Created new user: tyler@socio-analytics.com");
  }

  // 2. Delete all existing team members
  const deleted = await prisma.teamMember.deleteMany({});
  console.log(`Deleted ${deleted.count} existing team members`);

  // 3. Create new team members
  const teamMembers = [
    { name: "Tyler Dial", email: "tyler@socio-analytics.com" },
    { name: "Ruth Hardy", email: "ruth@socio-analytics.com" },
    { name: "Ben Gibbs", email: "ben@socio-analytics.com" },
    { name: "Lance Erikson", email: "lance@socio-analytics.com" },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.create({ data: member });
    console.log(`Created team member: ${member.name}`);
  }

  console.log("\nProduction update complete!");
  console.log("Login: tyler@socio-analytics.com");
}

main()
  .catch((err) => {
    console.error("Update failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
