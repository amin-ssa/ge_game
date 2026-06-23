const KEYS = {
  HIGH_SCORE: "cp_high_score",
  UNLOCKED_SKINS: "cp_unlocked_skins",
  SELECTED_SKIN: "cp_selected_skin",
  DAILY_CHALLENGE: "cp_daily_challenge",
  TOTAL_SCORE: "cp_total_score",
};

export function getHighScore(): number {
  return parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || "0", 10);
}

export function setHighScore(score: number): void {
  localStorage.setItem(KEYS.HIGH_SCORE, String(score));
}

export function getUnlockedSkins(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.UNLOCKED_SKINS) || '["default"]');
  } catch {
    return ["default"];
  }
}

export function unlockSkin(skinId: string): void {
  const skins = getUnlockedSkins();
  if (!skins.includes(skinId)) {
    skins.push(skinId);
    localStorage.setItem(KEYS.UNLOCKED_SKINS, JSON.stringify(skins));
  }
}

export function getSelectedSkin(): string {
  return localStorage.getItem(KEYS.SELECTED_SKIN) || "default";
}

export function setSelectedSkin(skinId: string): void {
  localStorage.setItem(KEYS.SELECTED_SKIN, skinId);
}

export function getTotalScore(): number {
  return parseInt(localStorage.getItem(KEYS.TOTAL_SCORE) || "0", 10);
}

export function addTotalScore(score: number): void {
  const total = getTotalScore() + score;
  localStorage.setItem(KEYS.TOTAL_SCORE, String(total));
}

export interface DailyChallenge {
  date: string;
  target: number;
  completed: boolean;
}

export function getDailyChallenge(): DailyChallenge {
  const today = new Date().toISOString().split("T")[0];
  try {
    const stored = JSON.parse(localStorage.getItem(KEYS.DAILY_CHALLENGE) || "{}");
    if (stored.date === today) return stored;
  } catch {
    // ignore
  }
  const challenge: DailyChallenge = {
    date: today,
    target: Math.floor(Math.random() * 5000) + 2000,
    completed: false,
  };
  localStorage.setItem(KEYS.DAILY_CHALLENGE, JSON.stringify(challenge));
  return challenge;
}

export function completeDailyChallenge(): void {
  const challenge = getDailyChallenge();
  challenge.completed = true;
  localStorage.setItem(KEYS.DAILY_CHALLENGE, JSON.stringify(challenge));
}
