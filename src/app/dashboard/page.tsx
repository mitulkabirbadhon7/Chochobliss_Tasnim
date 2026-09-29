import { redirect } from "next/navigation";
import { SessionService } from "@/lib/auth/session";
import { signOutAction } from "@/lib/actions/auth";

export default async function DashboardPage() {
  const user = await SessionService.getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-[#E8DCCF] pb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1C140D]">My Dashboard</h1>
            <p className="text-xs text-[#634E3F]">Welcome back, {user.name || user.email}</p>
          </div>
          <form action={async () => {
            "use server";
            await signOutAction();
            redirect("/login");
          }}>
            <button
              type="submit"
              className="py-2 px-4 text-xs font-semibold text-[#1C140D] border border-[#E8DCCF] hover:bg-[#F5EDE4] rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E8DCCF] shadow-sm">
            <span className="text-xs uppercase tracking-wider text-[#634E3F] font-semibold">Account Role</span>
            <div className="text-lg font-bold text-[#1C140D] mt-1">{user.role}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DCCF] shadow-sm">
            <span className="text-xs uppercase tracking-wider text-[#634E3F] font-semibold">Cocoa Points</span>
            <div className="text-2xl font-bold text-[#D4A853] mt-1">{user.cocoaPoints} pts</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DCCF] shadow-sm">
            <span className="text-xs uppercase tracking-wider text-[#634E3F] font-semibold">Account Status</span>
            <div className="text-sm font-medium text-emerald-700 mt-1">Active Customer</div>
          </div>
        </div>

        {user.role === "ADMIN" && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <span className="text-xs text-[#1C140D] font-medium">You have administrative credentials.</span>
            <a
              href="/admin"
              className="text-xs font-semibold py-1.5 px-3 bg-[#1C140D] text-white rounded-lg hover:bg-[#C45A3C]"
            >
              Go to Admin Panel →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
