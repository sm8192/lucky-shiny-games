import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import sql from "@/lib/db";
import { buildBoard, checkWinner, isDraw } from "@/lib/tictactoe";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { code } = await params;
  const { position } = await req.json();
  const userId = Number(session.user.id);

  if (typeof position !== "number" || position < 0 || position > 8) {
    return NextResponse.json({ error: "Invalid position." }, { status: 400 });
  }

  const roomRows = await sql`
    SELECT id FROM rooms WHERE code = ${code.toUpperCase()} LIMIT 1
  `;
  if (roomRows.length === 0) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const gameRows = await sql`
    SELECT id, status, x_player_id, o_player_id, turn_user_id, player1_id, player2_id
    FROM games
    WHERE room_id = ${roomRows[0].id}
    ORDER BY id DESC LIMIT 1
  `;

  if (gameRows.length === 0 || gameRows[0].status !== "active") {
    return NextResponse.json({ error: "No active game." }, { status: 409 });
  }

  const game = gameRows[0];

  if (Number(game.turn_user_id) !== userId) {
    return NextResponse.json({ error: "It is not your turn." }, { status: 403 });
  }

  // Fetch existing moves
  const existingMoves = await sql`
    SELECT position, user_id, move_order
    FROM game_moves
    WHERE game_id = ${game.id}
    ORDER BY move_order ASC
  `;

  const board = buildBoard(
    existingMoves as { position: number; user_id: number; move_order: number }[],
    Number(game.x_player_id),
  );

  if (board[position] !== null) {
    return NextResponse.json(
      { error: "That cell is already taken." },
      { status: 409 },
    );
  }

  const moveOrder = existingMoves.length;

  // Write the move
  await sql`
    INSERT INTO game_moves (game_id, user_id, position, move_order)
    VALUES (${game.id}, ${userId}, ${position}, ${moveOrder})
  `;

  // Rebuild board with new move
  const newBoard = [...board];
  newBoard[position] = userId === Number(game.x_player_id) ? "X" : "O";

  const winner = checkWinner(newBoard);
  const draw = !winner && isDraw(newBoard);

  const nextTurn =
    Number(game.turn_user_id) === Number(game.x_player_id)
      ? Number(game.o_player_id)
      : Number(game.x_player_id);

  if (winner) {
    await sql`
      UPDATE games
      SET status    = 'finished',
          winner_id = ${userId},
          updated_at = NOW()
      WHERE id = ${game.id}
    `;
  } else if (draw) {
    await sql`
      UPDATE games
      SET status    = 'finished',
          is_draw   = TRUE,
          updated_at = NOW()
      WHERE id = ${game.id}
    `;
  } else {
    await sql`
      UPDATE games
      SET turn_user_id = ${nextTurn},
          updated_at   = NOW()
      WHERE id = ${game.id}
    `;
  }

  return NextResponse.json({ board: newBoard, winner, isDraw: draw });
}
