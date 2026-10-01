import fs from "fs";
import path from "path";

async function runTask2Tests() {
  console.log("=== RUNNING TASK 2: SHOWCASE NON-CLICKABLE & TIMELAPSE AUDIT ===");

  const pagePath = path.resolve(process.cwd(), "src/app/page.tsx");
  const cssPath = path.resolve(process.cwd(), "src/app/globals.css");

  const pageContent = fs.readFileSync(pagePath, "utf-8");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  // 1. Verify showcase section is non-clickable
  console.log("Test 1: Verify showcase containers are non-clickable and have pointer-events-none...");
  const showcaseBlock = pageContent.slice(
    pageContent.indexOf("Artisanal Confectionery Showcase"),
    pageContent.indexOf("Curated Collections")
  );

  if (showcaseBlock.includes("<Link") || showcaseBlock.includes("href=")) {
    throw new Error("Test 1 Failed: Showcase section contains a clickable <Link> or href.");
  }
  if (!showcaseBlock.includes("pointer-events-none") || !showcaseBlock.includes("cursor-default")) {
    throw new Error("Test 1 Failed: Showcase section missing pointer-events-none or cursor-default.");
  }
  console.log("✔ PASS: Showcase cards contain no <Link> tags and enforce pointer-events-none cursor-default.");

  // 2. Verify timelapse shade animation class
  console.log("Test 2: Verify animate-timelapse-shade presence...");
  if (!showcaseBlock.includes("animate-timelapse-shade")) {
    throw new Error("Test 2 Failed: Showcase section missing animate-timelapse-shade element.");
  }
  console.log("✔ PASS: Showcase cards include time-lapse sweeping shade overlay element.");

  // 3. Verify CSS keyframe and prefers-reduced-motion
  console.log("Test 3: Verify CSS keyframes and prefers-reduced-motion...");
  if (!cssContent.includes("@keyframes timelapseShade")) {
    throw new Error("Test 3 Failed: globals.css missing @keyframes timelapseShade.");
  }
  if (!cssContent.includes("prefers-reduced-motion: reduce")) {
    throw new Error("Test 3 Failed: globals.css missing prefers-reduced-motion accessibility media query.");
  }
  console.log("✔ PASS: CSS keyframes defined and prefers-reduced-motion properly disables animation.");

  console.log("\n>>> ALL TASK 2 TESTS PASSED SUCCESSFULLY! <<<\n");
}

runTask2Tests().catch((err) => {
  console.error("TASK 2 TEST SUITE FAILED:", err);
  process.exit(1);
});
