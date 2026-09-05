import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import sql from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { code } = await params;
  const { mark } = await req.json(); // 'X' or 'O'
  const userId = Number(session.user.id);

  if (mark !== "X" && mark !== "O") {
    return NextResponse.json({ error: "Mark must be X or O." }, { status: 400 });
  }

  const roomRows = await sql`
    SELECT id FROM rooms WHERE code = ${code.toUpperCase()} LIMIT 1
  `;
  if (roomRows.length === 0) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const gameRows = await sql`
    SELECT id, status, picker_id, player1_id, player2_id
    FROM games
    WHERE room_id = ${roomRows[0].id}
    ORDER BY id DESC LIMIT 1
  `;

  if (gameRows.length === 0 || gameRows[0].status !== "picking") {
    return NextResponse.json({ error: "No game awaiting a pick." }, { status: 409 });
  }

  const game = gameRows[0];

  if (Number(game.picker_id) !== userId) {
    return NextResponse.json(
      { error: "It is not your turn to pick." },
      { status: 403 },
    );
  }

  const otherId =
    Number(game.player1_id) === userId
      ? Number(game.player2_id)
      : Number(game.player1_id);

  const xPlayerId = mark === "X" ? userId : otherId;
  const oPlayerId = mark === "X" ? otherId : userId;

  await sql`
    UPDATE games
    SET x_player_id  = ${xPlayerId},
        o_player_id  = ${oPlayerId},
        turn_user_id = ${xPlayerId},
        status       = 'active',
        updated_at   = NOW()
    WHERE id = ${game.id}
  `;

  return NextResponse.json({ xPlayerId, oPlayerId });
}
