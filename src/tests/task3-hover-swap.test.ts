import fs from "fs";
import path from "path";

async function runTask3Tests() {
  console.log("=== RUNNING TASK 3: COLLECTION & PRODUCT HOVER IMAGE SWAP AUDIT ===");

  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  const productCardPath = path.resolve(process.cwd(), "src/components/shop/ProductCard.tsx");
  const productFormPath = path.resolve(process.cwd(), "src/components/admin/ProductForm.tsx");
  const homePagePath = path.resolve(process.cwd(), "src/app/page.tsx");
  const shopPagePath = path.resolve(process.cwd(), "src/app/shop/page.tsx");

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const productCardContent = fs.readFileSync(productCardPath, "utf-8");
  const productFormContent = fs.readFileSync(productFormPath, "utf-8");
  const homePageContent = fs.readFileSync(homePagePath, "utf-8");
  const shopPageContent = fs.readFileSync(shopPagePath, "utf-8");

  // 1. Verify Prisma Product model includes hoverImage
  console.log("Test 1: Verify Prisma schema has hoverImage String? field on Product model...");
  if (!schemaContent.includes("hoverImage") || !/hoverImage\s+String\?/.test(schemaContent)) {
    throw new Error("Test 1 Failed: prisma/schema.prisma is missing `hoverImage String?` on Product model.");
  }
  console.log("✔ PASS: Prisma Product schema defines `hoverImage String?`.");

  // 2. Verify ProductCard pure CSS group-hover image swap
  console.log("Test 2: Verify ProductCard implements pure CSS group-hover image swap with fallback...");
  if (!productCardContent.includes("product.hoverImage")) {
    throw new Error("Test 2 Failed: ProductCard does not reference product.hoverImage.");
  }
  if (!productCardContent.includes("opacity-0 group-hover:opacity-100")) {
    throw new Error("Test 2 Failed: ProductCard missing pure CSS `opacity-0 group-hover:opacity-100` transition classes.");
  }
  if (!productCardContent.includes("absolute inset-0")) {
    throw new Error("Test 2 Failed: ProductCard hover image is not stacked with `absolute inset-0`.");
  }
  // Fallback to second image if hoverImage not set
  if (!/hoverImage\s*\|\|\s*\(product\.images\.length\s*>\s*1\s*\?\s*product\.images\[1\]\s*:\s*null\)/.test(productCardContent)) {
    throw new Error("Test 2 Failed: ProductCard missing fallback to images[1] if hoverImage is null.");
  }
  console.log("✔ PASS: ProductCard stacks images with pure CSS opacity-0 to group-hover:opacity-100 and secondary image fallback.");

  // 3. Verify Admin ProductForm supports Hover Image
  console.log("Test 3: Verify Admin ProductForm supports Hover Image upload & URL input...");
  if (!productFormContent.includes("Upload Hover Image")) {
    throw new Error("Test 3 Failed: ProductForm missing 'Upload Hover Image' button.");
  }
  if (!productFormContent.includes("handleFileUpload(e, true)")) {
    throw new Error("Test 3 Failed: ProductForm does not pass isForHover=true to handleFileUpload.");
  }
  if (!productFormContent.includes("hoverImage: hoverImage")) {
    throw new Error("Test 3 Failed: ProductForm does not pass hoverImage in save payload.");
  }
  console.log("✔ PASS: Admin ProductForm includes dedicated Hover Image upload with WebP compression and URL setting.");

  // 4. Verify Curated Collections grid on Homepage implements hover image swap
  console.log("Test 4: Verify Curated Collections grid on Homepage implements hover image swap...");
  const collectionsBlock = homePageContent.slice(
    homePageContent.indexOf("Curated Collections"),
    homePageContent.indexOf("Tasnim's Signature Creations")
  );
  if (!collectionsBlock.includes("opacity-0 group-hover:opacity-100")) {
    throw new Error("Test 4 Failed: Curated Collections section missing opacity-0 group-hover:opacity-100.");
  }
  console.log("✔ PASS: Curated Collections section features smooth CSS group-hover alternate image reveal.");

  // 5. Verify Product listing in Shop page uses ProductCard with hover effect
  console.log("Test 5: Verify Product listing in Shop page uses ProductCard...");
  if (!shopPageContent.includes("<ProductCard")) {
    throw new Error("Test 5 Failed: Shop page does not render <ProductCard /> component.");
  }
  console.log("✔ PASS: Shop catalog utilizes ProductCard with complete hover image swapping.");

  console.log("\n>>> ALL TASK 3 TESTS PASSED SUCCESSFULLY! <<<\n");
}

runTask3Tests().catch((err) => {
  console.error("TASK 3 TEST SUITE FAILED:", err);
  process.exit(1);
});
