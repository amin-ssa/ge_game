import { useEffect, useState } from "react";
import { getHighScore, getDailyChallenge, completeDailyChallenge } from "../lib/storage";
import { SKINS } from "../lib/skins";

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
  skinId: string;
}

export default function GameOver({ score, onRestart, onMenu, skinId }: GameOverProps) {
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);
  const [shared, setShared] = useState(false);
  const skin = SKINS.find((s) => s.id === skinId) || SKINS[0];

  useEffect(() => {
    const hs = getHighScore();
    if (score > hs) setIsNewHigh(true);
    const challenge = getDailyChallenge();
    if (!challenge.completed && score >= challenge.target) {
      completeDailyChallenge();
      setChallengeDone(true);
    }
  }, [score]);

  const handleShare = () => {
    const text = `🎮 I just scored ${score.toLocaleString()} on NEON RUNNER! ${isNewHigh ? "🏆 New personal best!" : ""} Can you beat me? #NeonRunner #CyberArcade`;
    if (navigator.share) {
      navigator.share({ title: "NEON RUNNER", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => setShared(true));
    }
  };

  return (
    <div className="gameover-overlay">
      <div className="scanlines" />
      <div className="gameover-card">
        <div className="gameover-title">
          {isNewHigh ? "NEW RECORD" : "GAME OVER"}
        </div>
        {isNewHigh && <div className="new-high-badge">✦ HIGH SCORE ✦</div>}

        <div className="gameover-score-block">
          <div className="go-label">FINAL SCORE</div>
          <div className="go-score" style={{ color: skin.color, textShadow: `0 0 20px ${skin.color}` }}>
            {score.toLocaleString()}
          </div>
        </div>

        {challengeDone && (
          <div className="challenge-complete-badge">
            ✓ Daily Challenge Complete!
          </div>
        )}

        <div className="gameover-actions">
          <button className="go-btn primary" onClick={onRestart}>
            TRY AGAIN
          </button>
          <button className="go-btn share" onClick={handleShare}>
            {shared ? "COPIED!" : "SHARE SCORE"}
          </button>
          <button className="go-btn secondary" onClick={onMenu}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
