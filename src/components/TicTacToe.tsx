"use client";

import { useCallback, useEffect, useState } from "react";
import type { Board, Mark } from "@/lib/tictactoe";

interface GameState {
  id: number;
  gameType: string;
  status: "waiting" | "picking" | "active" | "finished";
  player1Id: number;
  player2Id: number | null;
  pickerId: number | null;
  xPlayerId: number | null;
  oPlayerId: number | null;
  turnUserId: number | null;
  winnerId: number | null;
  isDraw: boolean;
  player1Name: string;
  player2Name: string | null;
  xPlayerName: string | null;
  oPlayerName: string | null;
  winnerName: string | null;
  board: Board;
}

interface Props {
  roomCode: string;
  currentUserId: number;
  currentUserName: string;
  isOwner: boolean;
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinningCells(board: Board): number[] {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return [];
}

export default function TicTacToe({
  roomCode,
  currentUserId,
  currentUserName,
  isOwner,
}: Props) {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGame = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomCode}/game`);
    if (res.ok) {
      const data = await res.json();
      setGame(data.game);
    }
  }, [roomCode]);

  // Poll every 2 seconds
  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  async function post(path: string, body?: object) {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/rooms/${roomCode}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
    } else {
      await fetchGame();
    }
  }

  const handleSelectGame = () => post("/game", { gameType: "tictactoe" });
  const handleJoin = () => post("/game/join");
  const handlePick = (mark: Mark) => post("/game/pick", { mark });
  const handleMove = (position: number) => post("/game/move", { position });

  const myMark: Mark | null =
    game?.xPlayerId === currentUserId
      ? "X"
      : game?.oPlayerId === currentUserId
        ? "O"
        : null;

  const isMyTurn = game?.turnUserId === currentUserId;
  const winningCells = game ? getWinningCells(game.board) : [];
  const isPlayer =
    game?.player1Id === currentUserId || game?.player2Id === currentUserId;

  // ── No game yet ────────────────────────────────────────────────────────
  if (!game) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        {isOwner ? (
          <>
            <p className="text-[var(--muted)]">Select a game to get started.</p>
            <button
              onClick={handleSelectGame}
              disabled={loading}
              className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-black transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading ? "Starting…" : "Tic Tac Toe"}
            </button>
          </>
        ) : (
          <p className="text-[var(--muted)]">
            Waiting for the room owner to select a game…
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // ── Waiting for second player ──────────────────────────────────────────
  if (game.status === "waiting") {
    const isPlayer1 = game.player1Id === currentUserId;
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-lg font-semibold text-[var(--foreground)]">
          Tic Tac Toe
        </p>
        {isPlayer1 ? (
          <p className="text-[var(--muted)]">
            Waiting for another player to join…
          </p>
        ) : (
          <>
            <p className="text-[var(--muted)]">
              <span className="text-[var(--foreground)]">
                {game.player1Name}
              </span>{" "}
              has started a game of Tic Tac Toe.
            </p>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-black transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading ? "Joining…" : "Join game"}
            </button>
          </>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // ── Picking X or O ────────────────────────────────────────────────────
  if (game.status === "picking") {
    const isPicker = game.pickerId === currentUserId;
    const otherName =
      game.player1Id === currentUserId ? game.player2Name : game.player1Name;
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-lg font-semibold text-[var(--foreground)]">
          Tic Tac Toe
        </p>
        {isPicker ? (
          <>
            <p className="text-[var(--muted)]">
              You were randomly selected. Pick your mark:
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handlePick("X")}
                disabled={loading}
                className="rounded-xl border-2 border-[var(--accent)] px-8 py-4 text-2xl font-extrabold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
              >
                X
              </button>
              <button
                onClick={() => handlePick("O")}
                disabled={loading}
                className="rounded-xl border-2 border-[var(--accent)] px-8 py-4 text-2xl font-extrabold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
              >
                O
              </button>
            </div>
            <p className="text-xs text-[var(--muted)]">X plays first.</p>
          </>
        ) : (
          <p className="text-[var(--muted)]">
            Waiting for{" "}
            <span className="text-[var(--foreground)]">{otherName}</span> to
            pick X or O…
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  // ── Active or Finished ────────────────────────────────────────────────
  const statusLine = (() => {
    if (game.status === "finished") {
      if (game.isDraw) return "It's a draw!";
      if (game.winnerId === currentUserId) return "You win! 🎉";
      return `${game.winnerName} wins!`;
    }
    if (!isPlayer) {
      return `${game.turnUserId === game.xPlayerId ? game.xPlayerName : game.oPlayerName}'s turn`;
    }
    if (isMyTurn) return `Your turn — you are ${myMark}`;
    const opponentName =
      game.player1Id === currentUserId ? game.player2Name : game.player1Name;
    return `Waiting for ${opponentName}…`;
  })();

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-lg font-semibold text-[var(--foreground)]">
        Tic Tac Toe
      </p>

      {/* Players */}
      <div className="flex gap-6 text-sm text-[var(--muted)]">
        <span>
          <span className="font-bold text-[var(--foreground)]">X</span>{" "}
          {game.xPlayerName}
          {game.xPlayerId === currentUserId && " (you)"}
        </span>
        <span>vs</span>
        <span>
          <span className="font-bold text-[var(--foreground)]">O</span>{" "}
          {game.oPlayerName}
          {game.oPlayerId === currentUserId && " (you)"}
        </span>
      </div>

      {/* Status */}
      <p
        className={`font-medium ${game.status === "finished" ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
      >
        {statusLine}
      </p>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2">
        {game.board.map((cell, i) => {
          const isWinCell = winningCells.includes(i);
          const canClick =
            game.status === "active" &&
            isMyTurn &&
            isPlayer &&
            cell === null &&
            !loading;

          return (
            <button
              key={i}
              onClick={() => canClick && handleMove(i)}
              disabled={!canClick}
              aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ""}`}
              className={[
                "flex h-24 w-24 items-center justify-center rounded-xl border-2 text-4xl font-extrabold transition",
                isWinCell
                  ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                  : "border-[var(--border)] bg-[var(--surface)]",
                canClick
                  ? "cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
                  : "cursor-default",
                cell === "X" && !isWinCell ? "text-white" : "",
                cell === "O" && !isWinCell ? "text-[var(--muted)]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {cell ?? ""}
            </button>
          );
        })}
      </div>

      {/* New game button for owner after finish */}
      {game.status === "finished" && isOwner && (
        <button
          onClick={handleSelectGame}
          disabled={loading}
          className="mt-2 rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-black transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {loading ? "Starting…" : "Play again"}
        </button>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
