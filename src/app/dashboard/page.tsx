import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {session.user.name}!
        </h1>
        <p className="mt-2 text-gray-400">More coming soon…</p>
      </div>
    </main>
  );
}
