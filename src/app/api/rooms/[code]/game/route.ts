import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import sql from "@/lib/db";
import { buildBoard } from "@/lib/tictactoe";

type Params = { params: Promise<{ code: string }> };

// ── GET /api/rooms/[code]/game ─────────────────────────────────────────────
// Returns current game state for the room. Used for polling.
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { code } = await params;

  const roomRows = await sql`
    SELECT id FROM rooms WHERE code = ${code.toUpperCase()} LIMIT 1
  `;
  if (roomRows.length === 0) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const roomId = roomRows[0].id;

  const gameRows = await sql`
    SELECT
      g.id, g.game_type, g.status,
      g.player1_id, g.player2_id,
      g.picker_id,
      g.x_player_id, g.o_player_id,
      g.turn_user_id, g.winner_id, g.is_draw,
      u1.username AS player1_name,
      u2.username AS player2_name,
      ux.username AS x_player_name,
      uo.username AS o_player_name,
      uw.username AS winner_name
    FROM games g
    LEFT JOIN users u1 ON u1.id = g.player1_id
    LEFT JOIN users u2 ON u2.id = g.player2_id
    LEFT JOIN users ux ON ux.id = g.x_player_id
    LEFT JOIN users uo ON uo.id = g.o_player_id
    LEFT JOIN users uw ON uw.id = g.winner_id
    WHERE g.room_id = ${roomId}
    ORDER BY g.id DESC
    LIMIT 1
  `;

  if (gameRows.length === 0) {
    return NextResponse.json({ game: null });
  }

  const game = gameRows[0];

  // Fetch moves if game is active or finished
  let board = Array(9).fill(null);
  if (game.status === "active" || game.status === "finished") {
    const moves = await sql`
      SELECT position, user_id, move_order
      FROM game_moves
      WHERE game_id = ${game.id}
      ORDER BY move_order ASC
    `;
    board = buildBoard(
      moves as { position: number; user_id: number; move_order: number }[],
      game.x_player_id as number,
    );
  }

  return NextResponse.json({
    game: {
      id: game.id,
      gameType: game.game_type,
      status: game.status,
      player1Id: game.player1_id,
      player2Id: game.player2_id,
      pickerId: game.picker_id,
      xPlayerId: game.x_player_id,
      oPlayerId: game.o_player_id,
      turnUserId: game.turn_user_id,
      winnerId: game.winner_id,
      isDraw: game.is_draw,
      player1Name: game.player1_name,
      player2Name: game.player2_name,
      xPlayerName: game.x_player_name,
      oPlayerName: game.o_player_name,
      winnerName: game.winner_name,
      board,
    },
  });
}

// ── POST /api/rooms/[code]/game ────────────────────────────────────────────
// Room owner selects a game type, creates a new games row.
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { code } = await params;
  const { gameType } = await req.json();

  if (gameType !== "tictactoe") {
    return NextResponse.json({ error: "Unknown game type." }, { status: 400 });
  }

  const roomRows = await sql`
    SELECT id, created_by FROM rooms WHERE code = ${code.toUpperCase()} LIMIT 1
  `;
  if (roomRows.length === 0) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const room = roomRows[0];
  if (Number(session.user.id) !== Number(room.created_by)) {
    return NextResponse.json(
      { error: "Only the room owner can select a game." },
      { status: 403 },
    );
  }

  // Block if a game is already ongoing
  const existing = await sql`
    SELECT id, status FROM games
    WHERE room_id = ${room.id}
    ORDER BY id DESC LIMIT 1
  `;
  if (
    existing.length > 0 &&
    (existing[0].status === "waiting" ||
      existing[0].status === "picking" ||
      existing[0].status === "active")
  ) {
    return NextResponse.json(
      { error: "A game is already in progress." },
      { status: 409 },
    );
  }

  const result = await sql`
    INSERT INTO games (room_id, game_type, status, player1_id)
    VALUES (${room.id}, ${gameType}, 'waiting', ${session.user.id})
    RETURNING id
  `;

  return NextResponse.json({ gameId: result[0].id }, { status: 201 });
}
