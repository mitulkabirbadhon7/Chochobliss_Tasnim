/**
 * Secure Admin & User Password Management CLI
 *
 * Usage:
 *   npx tsx scripts/set-admin-password.ts <email> <newPassword>
 *
 * Example:
 *   npx tsx scripts/set-admin-password.ts mitulkabirbadhon7@gmail.com MySecretPass123!
 */

import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth/password";
import { FIXED_ADMIN_EMAILS } from "../src/lib/constants/admins";

async function main() {
  const args = process.argv.slice(2);
  const email = args[0]?.toLowerCase().trim();
  const newPassword = args[1];

  if (!email || !newPassword) {
    console.log("\n=======================================================");
    console.log("🍫  ChocoBliss Admin Password Management Utility");
    console.log("=======================================================");
    console.log("Usage:   npx tsx scripts/set-admin-password.ts <email> <newPassword>");
    console.log("Example: npx tsx scripts/set-admin-password.ts mitulkabirbadhon7@gmail.com MyStrongPassword123!");
    console.log("\nActive Administrators in system:");
    for (const adminEmail of FIXED_ADMIN_EMAILS) {
      console.log(` - ${adminEmail}`);
    }
    console.log("=======================================================\n");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  const isAdmin = FIXED_ADMIN_EMAILS.includes(email);
  const hashedPassword = hashPassword(newPassword);

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.startsWith("mitul") ? "Mitul Kabir Badhon" : "Tasnim",
        passwordHash: hashedPassword,
        role: isAdmin ? "ADMIN" : "CUSTOMER",
        cocoaPoints: isAdmin ? 1000 : 50,
        authProvider: "credentials",
      },
    });
    console.log(`✅ Created user ${email} with role [${user.role}] and new password successfully!`);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        ...(isAdmin ? { role: "ADMIN" } : {}),
      },
    });
    console.log(`✅ Updated password for ${email} [${user.role}] successfully!`);
  }
}

main().catch(console.error).finally(() => process.exit(0));
