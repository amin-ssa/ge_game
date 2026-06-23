import { useState, useRef, useCallback, useEffect } from "react";
import GameScene, { GameSceneHandle } from "./game/GameScene";
import MainMenu from "./components/MainMenu";
import HUD from "./components/HUD";
import GameOver from "./components/GameOver";
import {
  getHighScore,
  setHighScore,
  getSelectedSkin,
  addTotalScore,
  unlockSkin,
  getTotalScore,
} from "./lib/storage";
import { SKINS } from "./lib/skins";

type GameState = "menu" | "playing" | "gameover";

export default function App() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [highScore, setHighScoreState] = useState(getHighScore);
  const [skinId, setSkinId] = useState(getSelectedSkin);
  const [finalScore, setFinalScore] = useState(0);
  const gameSceneRef = useRef<GameSceneHandle>(null);

  const skinColor = SKINS.find((s) => s.id === skinId)?.color ?? "#00f5ff";

  const handleStart = useCallback(() => {
    setScore(0);
    setMultiplier(1);
    setGameState("playing");
  }, []);

  const handleDie = useCallback(() => {
    setGameState("gameover");
    setFinalScore(score);
    addTotalScore(score);

    if (score > getHighScore()) {
      setHighScore(score);
      setHighScoreState(score);
    }

    const totalScore = getTotalScore();
    SKINS.forEach((skin) => {
      if (totalScore >= skin.unlockScore) unlockSkin(skin.id);
    });
  }, [score]);

  const handleRestart = useCallback(() => {
    setScore(0);
    setMultiplier(1);
    setGameState("playing");
  }, []);

  const handleMenu = useCallback(() => {
    setScore(0);
    setMultiplier(1);
    setGameState("menu");
  }, []);

  const handleScoreUpdate = useCallback((s: number) => {
    setScore(s);
    if (s > getHighScore()) {
      setHighScore(s);
      setHighScoreState(s);
    }
  }, []);

  const handleMultiplierUpdate = useCallback((m: number) => {
    setMultiplier(m);
  }, []);

  const handleSkinChange = useCallback((id: string) => {
    setSkinId(id);
  }, []);

  return (
    <div className="game-root">
      <GameScene
        ref={gameSceneRef}
        isRunning={gameState === "playing"}
        skinId={skinId}
        onScoreUpdate={handleScoreUpdate}
        onDie={handleDie}
        onMultiplierUpdate={handleMultiplierUpdate}
      />

      {gameState === "menu" && (
        <MainMenu onStart={handleStart} onSkinChange={handleSkinChange} />
      )}

      {gameState === "playing" && (
        <HUD
          score={score}
          multiplier={multiplier}
          highScore={highScore}
          skinColor={skinColor}
        />
      )}

      {gameState === "gameover" && (
        <GameOver
          score={finalScore}
          onRestart={handleRestart}
          onMenu={handleMenu}
          skinId={skinId}
        />
      )}
    </div>
  );
}
