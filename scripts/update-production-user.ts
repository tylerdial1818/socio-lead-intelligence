/**
 * One-time script to update the production database.
 * Updates the user account and team members for the real team.
 *
 * Usage: npx tsx scripts/update-production-user.ts
 *
 * Requires DATABASE_URL or DIRECT_URL to be set in .env
 */

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting production user update...\n");

  // 1. Update or create the user account
  const newPassword = "Socio!Lead2026$";
  const hashedPassword = await hash(newPassword, 12);

  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: "Tyler Dial",
        email: "tyler@dialedintelligence.com",
        password: hashedPassword,
      },
    });
    console.log(`Updated user: ${existingUser.email} -> tyler@dialedintelligence.com`);
  } else {
    await prisma.user.create({
      data: {
        name: "Tyler Dial",
        email: "tyler@dialedintelligence.com",
        password: hashedPassword,
      },
    });
    console.log("Created new user: tyler@dialedintelligence.com");
  }

  // 2. Delete all existing team members
  const deleted = await prisma.teamMember.deleteMany({});
  console.log(`Deleted ${deleted.count} existing team members`);

  // 3. Create new team members
  const teamMembers = [
    { name: "Tyler Dial", email: "tyler@dialedintelligence.com" },
    { name: "Ruth Hardy", email: "ruth@dialedintelligence.com" },
    { name: "Ben Gibbs", email: "ben@dialedintelligence.com" },
    { name: "Lance Erikson", email: "lance@dialedintelligence.com" },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.create({ data: member });
    console.log(`Created team member: ${member.name}`);
  }

  console.log("\nProduction update complete!");
  console.log(`Login: tyler@dialedintelligence.com / ${newPassword}`);
}

main()
  .catch((err) => {
    console.error("Update failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
