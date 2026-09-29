import { prisma } from "../src/lib/prisma";

export const FIXED_ADMINS = [
  {
    email: "mitulkabirbadhon7@gmail.com",
    name: "Mitul Kabir Badhon",
    role: "ADMIN" as const,
    cocoaPoints: 1000,
  },
  {
    email: "ttasnim342@gmail.com",
    name: "Tasnim",
    role: "ADMIN" as const,
    cocoaPoints: 1000,
  },
  {
    email: "tasnim.admin@chocobliss.test",
    name: "Tasnim B.",
    role: "ADMIN" as const,
    cocoaPoints: 1000,
  },
];

async function main() {
  console.log("🔐 Provisioning fixed administrators in Neon PostgreSQL...");

  for (const admin of FIXED_ADMINS) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        role: "ADMIN",
        name: admin.name,
      },
      create: {
        email: admin.email,
        name: admin.name,
        role: "ADMIN",
        cocoaPoints: admin.cocoaPoints,
        authProvider: "credentials",
      },
    });
    console.log(`✅ Fixed Admin verified: ${user.email} (Role: ${user.role}, Name: ${user.name})`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error provisioning admins:", err);
  process.exit(1);
});
