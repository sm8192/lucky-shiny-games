import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const session = await auth();

  // Already logged in — send them to the dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          Lucky Shiny Games
        </h1>
        <p className="max-w-md text-lg text-gray-400">
          Your destination for fun and games. Sign up to get started, or sign
          in to continue playing.
        </p>

        <div className="mt-4 flex gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-700 px-6 py-3 font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
