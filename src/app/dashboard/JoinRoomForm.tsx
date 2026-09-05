"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const upper = code.trim().toUpperCase();

    if (!/^[A-Z]{6}$/.test(upper)) {
      setError("Room code must be exactly 6 letters.");
      return;
    }

    setLoading(true);

    // Verify the room exists before navigating
    const res = await fetch(`/api/rooms/${upper}`);
    setLoading(false);

    if (res.status === 404) {
      setError("No room found with that code.");
    } else if (!res.ok) {
      setError("Something went wrong. Please try again.");
    } else {
      router.push(`/room/${upper}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          maxLength={6}
          placeholder="XXXXXX"
          aria-label="Room code"
          className="w-36 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3 text-center font-mono text-lg uppercase tracking-widest text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-[var(--border)] px-5 py-3 font-semibold text-[var(--foreground)] transition hover:border-[var(--muted)] hover:text-white disabled:opacity-50"
        >
          {loading ? "Checking…" : "Join room"}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
