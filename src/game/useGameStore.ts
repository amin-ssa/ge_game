import { useRef, useCallback } from "react";

export type GameState = "menu" | "playing" | "gameover";

export interface GameStore {
  state: GameState;
  score: number;
  multiplier: number;
  lives: number;
  highScore: number;
}
