import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import sql from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { code } = await params;
  const userId = Number(session.user.id);

  const roomRows = await sql`
    SELECT id FROM rooms WHERE code = ${code.toUpperCase()} LIMIT 1
  `;
  if (roomRows.length === 0) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const roomId = roomRows[0].id;

  const gameRows = await sql`
    SELECT id, status, player1_id, player2_id
    FROM games
    WHERE room_id = ${roomId}
    ORDER BY id DESC LIMIT 1
  `;

  if (gameRows.length === 0) {
    return NextResponse.json({ error: "No game found in this room." }, { status: 404 });
  }

  const game = gameRows[0];

  if (game.status !== "waiting") {
    return NextResponse.json(
      { error: "Game is not open for joining." },
      { status: 409 },
    );
  }

  if (Number(game.player1_id) === userId) {
    return NextResponse.json(
      { error: "You created this game." },
      { status: 409 },
    );
  }

  // Randomly pick which player chooses X or O
  const pickerId =
    Math.random() < 0.5 ? Number(game.player1_id) : userId;

  await sql`
    UPDATE games
    SET player2_id = ${userId},
        picker_id  = ${pickerId},
        status     = 'picking',
        updated_at = NOW()
    WHERE id = ${game.id}
  `;

  return NextResponse.json({ pickerId });
}
