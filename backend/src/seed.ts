import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";
import { env } from "./config/env";

const SALT_ROUNDS = 12;

async function seed() {
  try {
    console.log("🌱 Starting seed...");

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: env.ADMIN_EMAIL }
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, SALT_ROUNDS);
    const adminUser = await prisma.user.create({
      data: {
        email: env.ADMIN_EMAIL,
        name: "Admin",
        passwordHash,
        riskLevel: "MEDIUM"
      }
    });

    console.log("✅ Admin user created successfully:", adminUser.email);

    // Create profile for admin
    const profile = await prisma.userProfile.create({
      data: {
        userId: adminUser.id,
        slug: "admin",
        fullName: "Admin User",
        role: "admin"
      }
    });

    console.log("✅ Admin profile created successfully");
    console.log("🌱 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
