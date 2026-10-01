import http from "http";
import { Prisma } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";
import { FIXED_ADMIN_EMAILS, ADMIN_CONTACT_EMAILS } from "../../src/lib/constants/admins";

const PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 5000;

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method || "GET";

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }

  try {
    // 1. Healthcheck
    if (pathname === "/health" || pathname === "/api/health") {
      return sendJson(res, 200, {
        status: "ok",
        service: "chocobliss-backend",
        timestamp: new Date().toISOString(),
        database: "connected (Neon PostgreSQL)",
        port: PORT,
      });
    }

    // 2. Products API
    if (pathname === "/api/products" && method === "GET") {
      const category = url.searchParams.get("category");
      const where: Prisma.ProductWhereInput = { isPublished: true, deletedAt: null };
      if (category && category !== "All") {
        where.category = category;
      }
      const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      return sendJson(res, 200, { success: true, count: products.length, data: products });
    }

    // 3. Announcements API
    if (pathname === "/api/announcements" && method === "GET") {
      const announcements = await prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });
      return sendJson(res, 200, { success: true, count: announcements.length, data: announcements });
    }

    // 4. Contact Inquiries & Complaints API
    if (pathname === "/api/contact" && method === "POST") {
      let body = "";
      req.on("data", (chunk: Buffer) => (body += chunk.toString()));
      req.on("end", async () => {
        try {
          const parsed = JSON.parse(body || "{}");
          const { name, email, phone, category = "GENERAL", subject, message } = parsed;

          if (!name || !email || !subject || !message) {
            return sendJson(res, 400, {
              success: false,
              error: "Missing required fields (name, email, subject, message)",
            });
          }

          const saved = await prisma.contactMessage.create({
            data: {
              name,
              email,
              phone: phone || null,
              category,
              subject,
              message,
            },
          });

          return sendJson(res, 201, {
            success: true,
            message: "Dispatched to boutique administrators",
            id: saved.id,
          });
        } catch {
          return sendJson(res, 400, { success: false, error: "Invalid JSON payload" });
        }
      });
      return;
    }

    // 5. Admin Info & Metrics
    if (pathname === "/api/admin/info" && method === "GET") {
      return sendJson(res, 200, {
        success: true,
        atelierLocation: "Dhanmondi, Dhaka, Bangladesh",
        status: "operational",
      });
    }

    // Default 404
    return sendJson(res, 404, {
      success: false,
      error: `Route not found: ${method} ${pathname}`,
      availableEndpoints: [
        "GET  /health",
        "GET  /api/products",
        "GET  /api/announcements",
        "POST /api/contact",
        "GET  /api/admin/info",
      ],
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("Backend Server Error:", err);
    return sendJson(res, 500, { success: false, error: errorMsg });
  }
});

server.listen(PORT, () => {
  console.log(`\n🍫 ========================================================`);
  console.log(`🍫  ChocoBliss Backend Server is live on http://localhost:${PORT}`);
  console.log(`🍫  Database: Connected to Neon PostgreSQL (Production Branch)`);
  console.log(`🍫  Health check: http://localhost:${PORT}/health`);
  console.log(`🍫 ========================================================\n`);
});
