CREATE TYPE game_status AS ENUM ('waiting', 'picking', 'active', 'finished');

CREATE TABLE IF NOT EXISTS games (
  id           SERIAL PRIMARY KEY,
  room_id      INTEGER NOT NULL REFERENCES rooms(id),
  game_type    VARCHAR(50) NOT NULL DEFAULT 'tictactoe',
  status       game_status NOT NULL DEFAULT 'waiting',
  player1_id   INTEGER NOT NULL REFERENCES users(id),
  player2_id   INTEGER REFERENCES users(id),
  picker_id    INTEGER REFERENCES users(id),  -- randomly chosen to pick X or O
  x_player_id  INTEGER REFERENCES users(id),  -- user who plays X
  o_player_id  INTEGER REFERENCES users(id),  -- user who plays O
  turn_user_id INTEGER REFERENCES users(id),  -- whose turn it is
  winner_id    INTEGER REFERENCES users(id),  -- NULL = draw or not finished
  is_draw      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_moves (
  id         SERIAL PRIMARY KEY,
  game_id    INTEGER NOT NULL REFERENCES games(id),
  user_id    INTEGER NOT NULL REFERENCES users(id),
  position   SMALLINT NOT NULL CHECK (position >= 0 AND position <= 8),
  move_order SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
