import { spawn } from "child_process";

console.log("🚀 Starting ChocoBliss Frontend & Backend Monorepo services...\n");

// 1. Start Backend Server (Port 5000)
const backend = spawn("npx", ["tsx", "backend/src/server.ts"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, BACKEND_PORT: "5000" },
});

// 2. Start Frontend Next.js Server (Port 3000)
const frontend = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, PORT: "3000" },
});

function cleanup() {
  console.log("\n Shutting down ChocoBliss services...");
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
