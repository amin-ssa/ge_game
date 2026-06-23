import { useState, useEffect } from "react";
import { getHighScore, getUnlockedSkins, getSelectedSkin, setSelectedSkin, getDailyChallenge } from "../lib/storage";
import { SKINS } from "../lib/skins";

interface MainMenuProps {
  onStart: () => void;
  onSkinChange: (skinId: string) => void;
}

export default function MainMenu({ onStart, onSkinChange }: MainMenuProps) {
  const [tab, setTab] = useState<"play" | "skins" | "challenge">("play");
  const [highScore, setHighScore] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(["default"]);
  const [selectedSkin, setSelected] = useState("default");
  const [challenge] = useState(getDailyChallenge());

  useEffect(() => {
    setHighScore(getHighScore());
    setUnlockedSkins(getUnlockedSkins());
    setSelected(getSelectedSkin());
  }, []);

  const handleSelectSkin = (id: string) => {
    if (!unlockedSkins.includes(id)) return;
    setSelected(id);
    setSelectedSkin(id);
    onSkinChange(id);
  };

  return (
    <div className="menu-overlay">
      <div className="scanlines" />
      <div className="menu-card">
        <div className="game-logo">
          <span className="logo-main">NEON</span>
          <span className="logo-sub">RUNNER</span>
          <div className="logo-tagline">CYBER-ARCADE 2077</div>
        </div>

        <div className="tab-bar">
          {(["play", "skins", "challenge"] as const).map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "play" ? "PLAY" : t === "skins" ? "SKINS" : "DAILY"}
            </button>
          ))}
        </div>

        {tab === "play" && (
          <div className="play-panel">
            <div className="score-display">
              <div className="score-label">HIGH SCORE</div>
              <div className="score-value">{highScore.toLocaleString()}</div>
            </div>
            <button className="start-btn" onClick={onStart}>
              <span>START GAME</span>
              <div className="btn-glow" />
            </button>
            <div className="controls-hint">
              <span>← → / A D — LANES</span>
              <span>SPACE / W / ↑ — JUMP</span>
              <span>MOBILE — TAP SIDES / TOP</span>
            </div>
          </div>
        )}

        {tab === "skins" && (
          <div className="skins-panel">
            <div className="skins-grid">
              {SKINS.map((skin) => {
                const unlocked = unlockedSkins.includes(skin.id);
                return (
                  <div
                    key={skin.id}
                    className={`skin-card ${selectedSkin === skin.id ? "selected" : ""} ${!unlocked ? "locked" : ""}`}
                    onClick={() => handleSelectSkin(skin.id)}
                    style={{ "--skin-color": skin.color } as React.CSSProperties}
                  >
                    <div className="skin-preview" style={{ background: `radial-gradient(circle, ${skin.color}33 0%, transparent 70%)` }}>
                      <div className="skin-cube" style={{ background: skin.color, boxShadow: `0 0 12px ${skin.color}` }} />
                    </div>
                    <div className="skin-info">
                      <div className="skin-name">{skin.name}</div>
                      <div className="skin-desc">{unlocked ? skin.description : `🔒 ${skin.description}`}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "challenge" && (
          <div className="challenge-panel">
            <div className="challenge-badge">{challenge.completed ? "✓ COMPLETE" : "TODAY'S CHALLENGE"}</div>
            <div className="challenge-title">Reach Score</div>
            <div className="challenge-target">{challenge.target.toLocaleString()}</div>
            <div className="challenge-reward">
              Reward: Unlock bonus XP & skin progress
            </div>
            <div className={`challenge-status ${challenge.completed ? "done" : "pending"}`}>
              {challenge.completed ? "Mission accomplished. GG." : "Not yet complete. Get running."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
