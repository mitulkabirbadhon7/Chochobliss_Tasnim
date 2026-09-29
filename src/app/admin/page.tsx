import { redirect } from "next/navigation";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { signOutAction } from "@/lib/actions/auth";

export default async function AdminPage() {
  let adminUser;

  try {
    // Strict server-side verification: Throws if not authenticated or not ADMIN
    adminUser = await AdminGuard.verifyAdmin();
  } catch {
    redirect("/login?redirect=/admin&error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-[#1C140D] text-[#F5EDE4] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-[#634E3F] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-serif font-bold text-white">Chocobliss Admin Panel</h1>
              <span className="bg-[#C45A3C] text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded">
                Verified Admin
              </span>
            </div>
            <p className="text-xs text-[#E8DCCF]/70 mt-1">Logged in as {adminUser.email}</p>
          </div>

          <form action={async () => {
            "use server";
            await signOutAction();
            redirect("/login");
          }}>
            <button
              type="submit"
              className="py-1.5 px-3 text-xs font-medium text-white/80 border border-[#634E3F] hover:bg-white/10 rounded transition-colors"
            >
              Sign Out
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#2D2117] p-5 rounded-lg border border-[#634E3F]/40">
            <span className="text-[11px] uppercase tracking-wider text-[#D4A853]">Total Orders</span>
            <div className="text-2xl font-bold text-white mt-1">0</div>
          </div>
          <div className="bg-[#2D2117] p-5 rounded-lg border border-[#634E3F]/40">
            <span className="text-[11px] uppercase tracking-wider text-[#D4A853]">Active Products</span>
            <div className="text-2xl font-bold text-white mt-1">0</div>
          </div>
          <div className="bg-[#2D2117] p-5 rounded-lg border border-[#634E3F]/40">
            <span className="text-[11px] uppercase tracking-wider text-[#D4A853]">Total Customers</span>
            <div className="text-2xl font-bold text-white mt-1">0</div>
          </div>
          <div className="bg-[#2D2117] p-5 rounded-lg border border-[#634E3F]/40">
            <span className="text-[11px] uppercase tracking-wider text-[#D4A853]">Active Promotions</span>
            <div className="text-2xl font-bold text-white mt-1">0</div>
          </div>
        </div>

        <div className="bg-[#2D2117] p-6 rounded-lg border border-[#634E3F]/40">
          <h2 className="text-sm font-semibold text-white mb-2">Server-Side Authorization Verified</h2>
          <p className="text-xs text-[#E8DCCF]/80 leading-relaxed">
            This dashboard and its underlying Server Actions are strictly gated by server-side role verification.
            Anonymous users and standard customers cannot bypass this route or trigger administrative actions.
          </p>
        </div>
      </div>
    </div>
  );
}
