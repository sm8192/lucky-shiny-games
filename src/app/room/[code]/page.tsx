import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import sql from "@/lib/db";

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { code } = await params;
  const upperCode = code.toUpperCase();

  const rows = await sql`
    SELECT rooms.id, rooms.code, rooms.created_at, users.username AS owner
    FROM rooms
    JOIN users ON users.id = rooms.created_by
    WHERE rooms.code = ${upperCode}
    LIMIT 1
  `;

  if (rows.length === 0) {
    notFound();
  }

  const room = rows[0];
  const isOwner = session.user.name === room.owner;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">Room code</p>
              <h1 className="text-4xl font-extrabold tracking-widest text-[var(--accent)]">
                {room.code as string}
              </h1>
            </div>
            <div className="text-sm text-[var(--muted)] sm:text-right">
              <p>
                Created by{" "}
                <span className="text-[var(--foreground)]">
                  {room.owner as string}
                </span>
                {isOwner && (
                  <span className="ml-2 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--accent)]">
                    you
                  </span>
                )}
              </p>
              <p className="mt-0.5">
                {new Date(room.created_at as string).toLocaleString()}
              </p>
            </div>
          </div>

          <hr className="my-6 border-[var(--border)]" />

          <p className="text-[var(--muted)]">
            Share the room code with others so they can join. Games coming soon…
          </p>
        </div>
      </div>
    </main>
  );
}
