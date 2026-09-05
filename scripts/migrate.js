const fs = require("fs");
const path = require("path");

// Load .env.local
fs.readFileSync(".env.local", "utf8")
  .split("\n")
  .forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const statements = [
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
      CREATE TYPE game_status AS ENUM ('waiting', 'picking', 'active', 'finished');
    END IF;
  END $$`,
  `CREATE TABLE IF NOT EXISTS games (
    id           SERIAL PRIMARY KEY,
    room_id      INTEGER NOT NULL REFERENCES rooms(id),
    game_type    VARCHAR(50) NOT NULL DEFAULT 'tictactoe',
    status       game_status NOT NULL DEFAULT 'waiting',
    player1_id   INTEGER NOT NULL REFERENCES users(id),
    player2_id   INTEGER REFERENCES users(id),
    picker_id    INTEGER REFERENCES users(id),
    x_player_id  INTEGER REFERENCES users(id),
    o_player_id  INTEGER REFERENCES users(id),
    turn_user_id INTEGER REFERENCES users(id),
    winner_id    INTEGER REFERENCES users(id),
    is_draw      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS game_moves (
    id         SERIAL PRIMARY KEY,
    game_id    INTEGER NOT NULL REFERENCES games(id),
    user_id    INTEGER NOT NULL REFERENCES users(id),
    position   SMALLINT NOT NULL CHECK (position >= 0 AND position <= 8),
    move_order SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
];

(async () => {
  for (const stmt of statements) {
    await sql.query(stmt);
    console.log("OK:", stmt.trim().slice(0, 60));
  }
  console.log("All migrations complete.");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
