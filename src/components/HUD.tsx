interface HUDProps {
  score: number;
  multiplier: number;
  highScore: number;
  skinColor: string;
}

export default function HUD({ score, multiplier, highScore, skinColor }: HUDProps) {
  const progress = Math.min(1, score / Math.max(highScore, 1000));

  return (
    <div className="hud" style={{ "--skin-color": skinColor } as React.CSSProperties}>
      <div className="hud-top">
        <div className="hud-score">
          <div className="hud-label">SCORE</div>
          <div className="hud-value">{score.toLocaleString()}</div>
        </div>
        <div className="hud-multiplier">
          <div className="hud-label">MULTIPLIER</div>
          <div className="hud-mult-value" style={{ color: multiplier > 4 ? "#ffd700" : multiplier > 2 ? "#ff6600" : skinColor }}>
            ×{multiplier}
          </div>
        </div>
        <div className="hud-best">
          <div className="hud-label">BEST</div>
          <div className="hud-value">{highScore.toLocaleString()}</div>
        </div>
      </div>
      <div className="hud-progress-bar">
        <div className="hud-progress-fill" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${skinColor}, #ffffff)` }} />
      </div>
      <div className="hud-controls-mobile">
        <div className="touch-hint left">◀</div>
        <div className="touch-hint top">▲ JUMP</div>
        <div className="touch-hint right">▶</div>
      </div>
    </div>
  );
}
