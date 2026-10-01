import { uploadProductImageAction } from "../lib/actions/upload";
import { AdminGuard } from "../lib/auth/admin-guard";

async function runTask1Tests() {
  console.log("=== RUNNING TASK 1: FILE UPLOAD & SIZE LIMIT AUDIT ===");

  // Mock AdminGuard to simulate authenticated admin
  const originalVerifyAdmin = AdminGuard.verifyAdmin;
  AdminGuard.verifyAdmin = async () => ({
    id: "admin-test-id",
    email: "admin@chocobliss.com",
    role: "ADMIN" as const,
    name: "Admin Tester",
    cocoaPoints: 100,
  });

  try {
    // Test 1: Reject empty FormData
    console.log("Test 1: Empty FormData rejection...");
    const emptyForm = new FormData();
    const emptyRes = await uploadProductImageAction(emptyForm);
    if (!emptyRes.success && emptyRes.error.message.includes("No valid image file")) {
      console.log("✔ PASS: Empty upload rejected with ValidationError.");
    } else {
      throw new Error(`Test 1 Failed: Expected ValidationError but got ${JSON.stringify(emptyRes)}`);
    }

    // Test 2: Reject file exceeding 10MB limit
    console.log("Test 2: Rejection of file exceeding 10MB limit...");
    const largeBuffer = new Uint8Array(11 * 1024 * 1024); // 11MB
    const largeFile = new File([largeBuffer], "massive_photo.jpg", { type: "image/jpeg" });
    const largeForm = new FormData();
    largeForm.append("file", largeFile);

    const largeRes = await uploadProductImageAction(largeForm);
    if (!largeRes.success && largeRes.error.message.includes("exceeds the 10MB limit")) {
      console.log(`✔ PASS: 11MB file properly blocked (${largeRes.error.message}).`);
    } else {
      throw new Error(`Test 2 Failed: Expected 10MB limit rejection but got ${JSON.stringify(largeRes)}`);
    }

    // Test 3: Reject disallowed MIME type (e.g. PDF or executable)
    console.log("Test 3: Disallowed MIME type rejection...");
    const pdfBuffer = new Uint8Array(1024);
    const pdfFile = new File([pdfBuffer], "malicious_script.pdf", { type: "application/pdf" });
    const pdfForm = new FormData();
    pdfForm.append("file", pdfFile);

    const pdfRes = await uploadProductImageAction(pdfForm);
    if (!pdfRes.success && pdfRes.error.message.includes("Unsupported media type")) {
      console.log(`✔ PASS: application/pdf blocked (${pdfRes.error.message}).`);
    } else {
      throw new Error(`Test 3 Failed: Expected MIME rejection but got ${JSON.stringify(pdfRes)}`);
    }

    // Test 4: Accept valid WebP image within 10MB
    console.log("Test 4: Acceptance of valid WebP image file...");
    const validBuffer = new Uint8Array(256 * 1024); // 256KB
    const validFile = new File([validBuffer], "chocobliss_bar.webp", { type: "image/webp" });
    const validForm = new FormData();
    validForm.append("file", validFile);

    const validRes = await uploadProductImageAction(validForm);
    if (validRes.success && validRes.data.url) {
      console.log(`✔ PASS: Valid WebP file accepted successfully. Returned URL: ${validRes.data.url.slice(0, 40)}...`);
    } else {
      throw new Error(`Test 4 Failed: Expected success but got ${JSON.stringify(validRes)}`);
    }

    console.log("\n>>> ALL TASK 1 TESTS PASSED SUCCESSFULLY! <<<\n");
  } finally {
    AdminGuard.verifyAdmin = originalVerifyAdmin;
  }
}

runTask1Tests().catch((err) => {
  console.error("TASK 1 TEST SUITE FAILED:", err);
  process.exit(1);
});
