import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateRoomButton from "./CreateRoomButton";
import JoinRoomForm from "./JoinRoomForm";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Welcome back,{" "}
          <span className="text-[var(--accent)]">{session.user.name}</span>!
        </h1>
        <p className="mt-2 text-[var(--muted)]">What would you like to do?</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-lg">
          <div className="flex flex-col gap-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6">
            <h2 className="font-semibold text-[var(--foreground)]">Create a room</h2>
            <p className="text-sm text-[var(--muted)]">
              Start a new room and share the code with others.
            </p>
            <CreateRoomButton />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6">
            <h2 className="font-semibold text-[var(--foreground)]">Join a room</h2>
            <p className="text-sm text-[var(--muted)]">
              Enter a 6-letter code to join an existing room.
            </p>
            <JoinRoomForm />
          </div>
        </div>
      </div>
    </main>
  );
}
