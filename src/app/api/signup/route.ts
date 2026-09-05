import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import sql from "@/lib/db";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 }
    );
  }

  if (username.length < 3 || username.length > 50) {
    return NextResponse.json(
      { error: "Username must be between 3 and 50 characters." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  // Check if username is already taken
  const existing = await sql`
    SELECT id FROM users WHERE username = ${username} LIMIT 1
  `;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Username is already taken." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO users (username, password)
    VALUES (${username}, ${hashedPassword})
  `;

  return NextResponse.json({ success: true }, { status: 201 });
}
