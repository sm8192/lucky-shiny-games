// Board is a 9-element array of 'X' | 'O' | null
export type Mark = "X" | "O";
export type Board = (Mark | null)[];

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function checkWinner(board: Board): Mark | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Mark;
    }
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return board.every((cell) => cell !== null) && checkWinner(board) === null;
}

export function buildBoard(
  moves: { position: number; user_id: number; move_order: number }[],
  xPlayerId: number,
): Board {
  const board: Board = Array(9).fill(null);
  const sorted = [...moves].sort((a, b) => a.move_order - b.move_order);
  for (const move of sorted) {
    board[move.position] = move.user_id === xPlayerId ? "X" : "O";
  }
  return board;
}
