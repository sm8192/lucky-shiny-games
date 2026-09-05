import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Welcome back,{" "}
          <span className="text-[var(--accent)]">{session.user.name}</span>!
        </h1>
        <p className="mt-2 text-[var(--muted)]">More coming soon…</p>
      </div>
    </main>
  );
}
