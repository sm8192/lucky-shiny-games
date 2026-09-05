"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoomButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/rooms", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create room.");
    } else {
      router.push(`/room/${data.code}`);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCreate}
        disabled={loading}
        className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-black transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "Creating room…" : "Create room"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
