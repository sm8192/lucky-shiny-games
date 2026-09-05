import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
          Lucky Shiny Games
        </h1>
        <p className="max-w-md text-lg text-[var(--muted)]">
          Your destination for fun and games. Sign up to get started, or sign
          in to continue playing.
        </p>

        <div className="mt-4 flex gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-black transition hover:bg-[var(--accent-hover)]"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[var(--border)] px-6 py-3 font-semibold text-[var(--foreground)] transition hover:border-[var(--muted)] hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
