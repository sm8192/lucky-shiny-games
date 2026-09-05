import { NextResponse } from "next/server";
import { auth } from "@/auth";
import sql from "@/lib/db";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = Number(session.user.id);

  // Generate a unique code — retry if there's a collision (extremely rare)
  let code = "";
  let attempts = 0;
  while (attempts < 10) {
    const candidate = generateCode();
    const existing = await sql`
      SELECT id FROM rooms WHERE code = ${candidate} LIMIT 1
    `;
    if (existing.length === 0) {
      code = candidate;
      break;
    }
    attempts++;
  }

  if (!code) {
    return NextResponse.json(
      { error: "Failed to generate a unique room code. Please try again." },
      { status: 500 }
    );
  }

  await sql`
    INSERT INTO rooms (code, created_by)
    VALUES (${code}, ${userId})
  `;

  return NextResponse.json({ code }, { status: 201 });
}
