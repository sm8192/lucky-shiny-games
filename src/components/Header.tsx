import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function Header() {
  const session = await auth();

  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          Lucky Shiny Games
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-sm text-[var(--muted)]">
                {session.user.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--muted)] hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-[var(--accent-hover)]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
