import { execSync } from "child_process";

const taskTests = [
  "src/tests/task1-upload.test.ts",
  "src/tests/task2-showcase.test.ts",
  "src/tests/task3-hover-swap.test.ts",
  "src/tests/task4-flavors-cart.test.ts",
  "src/tests/task5-reviews.test.ts",
  "src/tests/task6-navbar-logo.test.ts",
];

console.log("================================================================================");
console.log("=== EXECUTING COMPLETE PHASE 5E & 5F VERIFICATION SUITE (TASKS 1 - 6) ==========");
console.log("================================================================================\n");

for (const testFile of taskTests) {
  try {
    const output = execSync(`npx tsx "${testFile}"`, { encoding: "utf-8" });
    console.log(output);
  } catch (err: any) {
    console.error(`FAILED: ${testFile}`);
    console.error(err.stdout || err.message);
    process.exit(1);
  }
}

console.log("================================================================================");
console.log(">>> ALL 6 TASKS (1 THROUGH 6) VERIFIED AND 100% PASSING! <<<");
console.log("================================================================================\n");
