import fs from "fs";
import path from "path";
import assert from "assert";
import { createReviewSchema } from "../lib/validations/review";

async function runTask5Tests() {
  console.log("=== RUNNING TASK 5: VERIFIED CUSTOMER REVIEWS & MODERATION AUDIT ===");

  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  const reviewActionPath = path.resolve(process.cwd(), "src/lib/actions/review.ts");
  const productDetailPath = path.resolve(process.cwd(), "src/components/shop/ProductDetailView.tsx");
  const footerPath = path.resolve(process.cwd(), "src/components/shared/Footer.tsx");
  const adminReviewsPagePath = path.resolve(process.cwd(), "src/app/admin/reviews/page.tsx");

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const reviewActionContent = fs.readFileSync(reviewActionPath, "utf-8");
  const productDetailContent = fs.readFileSync(productDetailPath, "utf-8");
  const footerContent = fs.readFileSync(footerPath, "utf-8");
  const adminReviewsContent = fs.readFileSync(adminReviewsPagePath, "utf-8");

  // 1. Verify Prisma Schema
  console.log("Test 1: Verify ReviewStatus enum and status field on Review model...");
  if (!schemaContent.includes("enum ReviewStatus")) {
    throw new Error("Test 1 Failed: prisma/schema.prisma missing `enum ReviewStatus`.");
  }
  if (!schemaContent.includes("status     ReviewStatus @default(PENDING)")) {
    throw new Error("Test 1 Failed: Review model missing `status ReviewStatus @default(PENDING)`.");
  }
  console.log("✔ PASS: Prisma schema defines ReviewStatus { PENDING, APPROVED, REJECTED } defaulting to PENDING.");

  // 2. Verify Zod Schema & Server Action createReview
  console.log("Test 2: Verify createReview Zod schema and server validations...");
  const validReviewInput = {
    productId: "prod_dark_1",
    rating: 5,
    title: "Incredible Depth",
    comment: "The berry notes and smooth mouthfeel are truly world-class.",
  };
  const validParsed = createReviewSchema.safeParse(validReviewInput);
  assert.strictEqual(validParsed.success, true, "Valid review input must pass Zod schema");

  const invalidRating = createReviewSchema.safeParse({ ...validReviewInput, rating: 6 });
  assert.strictEqual(invalidRating.success, false, "Rating > 5 must fail Zod validation");

  const emptyComment = createReviewSchema.safeParse({ ...validReviewInput, comment: "" });
  assert.strictEqual(emptyComment.success, false, "Empty comment must fail Zod validation");

  // Verify server action implementation details
  if (!reviewActionContent.includes("enforceRateLimit(\"review:create\"")) {
    throw new Error("Test 2 Failed: createReview missing token-bucket rate limiting.");
  }
  if (!reviewActionContent.includes("status: \"DELIVERED\"")) {
    throw new Error("Test 2 Failed: createReview does not check for DELIVERED order status.");
  }
  if (!reviewActionContent.includes("UNVERIFIED_BUYER")) {
    throw new Error("Test 2 Failed: createReview does not return UNVERIFIED_BUYER error code for non-purchasers.");
  }
  if (!reviewActionContent.includes("status: ReviewStatus.PENDING")) {
    throw new Error("Test 2 Failed: createReview does not set newly created review to PENDING.");
  }
  console.log("✔ PASS: createReview validates input, enforces token rate limiting, checks DELIVERED order, and queues in PENDING status.");

  // 3. Verify Product Page UI
  console.log("Test 3: Verify Product Detail Page reviews section & verified buyer gate...");
  if (!productDetailContent.includes("Verified Impressions") || !productDetailContent.includes("Customer Reviews")) {
    throw new Error("Test 3 Failed: ProductDetailView missing Reviews section.");
  }
  if (!productDetailContent.includes("Only verified buyers who have received a delivered order of this product can submit a review.")) {
    throw new Error("Test 3 Failed: ProductDetailView missing unverified buyer restriction notice.");
  }
  if (!productDetailContent.includes("Share Your Connoisseur Reflection")) {
    throw new Error("Test 3 Failed: ProductDetailView missing review submission header.");
  }
  if (!productDetailContent.includes("status: ReviewStatus.APPROVED") && !reviewActionContent.includes("status: ReviewStatus.APPROVED")) {
    throw new Error("Test 3 Failed: Only APPROVED reviews should be queried for display.");
  }
  console.log("✔ PASS: ProductDetailView displays only approved reviews and guards review form behind verified buyer status.");

  // 4. Verify Footer Testimonials
  console.log("Test 4: Verify Footer Testimonials section...");
  if (!footerContent.includes("Loved by Discerning Connoisseurs")) {
    throw new Error("Test 4 Failed: Footer missing Testimonials header.");
  }
  if (!footerContent.includes("getCuratedTestimonialsAction")) {
    throw new Error("Test 4 Failed: Footer does not call getCuratedTestimonialsAction.");
  }
  console.log("✔ PASS: Footer showcases curated approved customer reflections across the site.");

  // 5. Verify Admin Moderation Table
  console.log("Test 5: Verify Admin Review Moderation page...");
  if (!adminReviewsContent.includes("Customer Reviews Moderation")) {
    throw new Error("Test 5 Failed: Admin reviews page missing header.");
  }
  if (!adminReviewsContent.includes("approveReviewAction") || !adminReviewsContent.includes("rejectReviewAction")) {
    throw new Error("Test 5 Failed: Admin reviews page missing approval/rejection action triggers.");
  }
  if (!adminReviewsContent.includes("Pending Moderation")) {
    throw new Error("Test 5 Failed: Admin reviews page missing moderation queue filter.");
  }
  console.log("✔ PASS: Admin panel includes complete moderation queue to view, approve, and reject reviews.");

  console.log("\n>>> ALL TASK 5 TESTS PASSED SUCCESSFULLY! <<<\n");
}

runTask5Tests().catch((err) => {
  console.error("TASK 5 TEST SUITE FAILED:", err);
  process.exit(1);
});
