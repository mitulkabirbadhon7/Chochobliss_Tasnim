import fs from "fs";
import path from "path";

async function runTask6Tests() {
  console.log("=== RUNNING TASK 6: NAVBAR BRAND LOGO & URL TAB FAVICON AUDIT ===");

  const navbarPath = path.resolve(process.cwd(), "src/components/shared/Navbar.tsx");
  const logoPngPath = path.resolve(process.cwd(), "public/images/logo.png");
  const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
  const iconAppPath = path.resolve(process.cwd(), "src/app/icon.png");

  // 1. Verify Official Brand Logo Asset in public/images
  console.log("Test 1: Verify official logo asset exists in public/images/ and src/app/...");
  if (!fs.existsSync(logoPngPath)) {
    throw new Error("Test 1 Failed: Transparent logo file public/images/logo.png does not exist.");
  }
  if (!fs.existsSync(iconAppPath)) {
    throw new Error("Test 1 Failed: Browser tab icon src/app/icon.png does not exist.");
  }
  console.log("✔ PASS: Official brand logo exists at public/images/logo.png and browser tab icon at src/app/icon.png.");

  // 2. Verify Navbar Image import and component
  console.log("Test 2: Verify Navbar component imports and uses next/image...");
  const navbarContent = fs.readFileSync(navbarPath, "utf-8");

  if (!navbarContent.includes("import Image from \"next/image\"")) {
    throw new Error("Test 2 Failed: Navbar.tsx does not import Image from next/image.");
  }
  if (!navbarContent.includes("<Image")) {
    throw new Error("Test 2 Failed: Navbar.tsx does not render an <Image /> component.");
  }
  console.log("✔ PASS: Navbar imports and renders Next.js Image component.");

  // 3. Verify Logo attributes: src, alt, priority
  console.log("Test 3: Verify logo attributes (src, alt, priority)...");
  if (!navbarContent.includes("src=\"/images/logo.png\"")) {
    throw new Error("Test 3 Failed: Image src is not pointing to /images/logo.png.");
  }
  if (!navbarContent.includes("alt=\"Chocobliss by Tasnim\"")) {
    throw new Error("Test 3 Failed: Image missing required alt=\"Chocobliss by Tasnim\".");
  }
  if (!navbarContent.includes("priority")) {
    throw new Error("Test 3 Failed: Image missing priority attribute for above-the-fold fast loading.");
  }
  console.log("✔ PASS: Brand logo configured with priority, accessibility alt tag, and transparent round container.");

  // 4. Verify Homepage Link wrapper
  console.log("Test 4: Verify logo is wrapped in <Link href=\"/\">...");
  const logoLinkBlock = navbarContent.slice(
    navbarContent.indexOf("{/* Brand Logo */}"),
    navbarContent.indexOf("{/* Desktop Nav Links */}")
  );

  if (!logoLinkBlock.includes("<Link href=\"/\"") || !logoLinkBlock.includes("</Link>")) {
    throw new Error("Test 4 Failed: Logo is not wrapped inside a <Link href=\"/\"> component.");
  }
  console.log("✔ PASS: Brand logo is wrapped in homepage navigation link.");

  // 5. Verify URL bar favicon configuration in layout.tsx
  console.log("Test 5: Verify URL bar / browser tab favicon in layout.tsx...");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  if (!layoutContent.includes("icons:") || (!layoutContent.includes("/images/logo.png") && !layoutContent.includes("/images/logo.jpg"))) {
    throw new Error("Test 5 Failed: layout.tsx missing icons configuration for browser tab.");
  }
  console.log("✔ PASS: URL bar / browser tab favicon metadata configured in layout.tsx.");

  console.log("\n>>> ALL TASK 6 TESTS PASSED SUCCESSFULLY! <<<\n");
}

runTask6Tests().catch((err) => {
  console.error("TASK 6 TEST SUITE FAILED:", err);
  process.exit(1);
});
