export interface Skin {
  id: string;
  name: string;
  color: string;
  emissive: string;
  trailColor: string;
  unlockScore: number;
  description: string;
}

export const SKINS: Skin[] = [
  {
    id: "default",
    name: "Ghost Runner",
    color: "#00f5ff",
    emissive: "#00a0cc",
    trailColor: "#00f5ff",
    unlockScore: 0,
    description: "The classic cyber warrior",
  },
  {
    id: "phoenix",
    name: "Neon Phoenix",
    color: "#ff4500",
    emissive: "#cc2200",
    trailColor: "#ff6600",
    unlockScore: 1000,
    description: "Burn through the grid — Score 1,000",
  },
  {
    id: "viper",
    name: "Viper Protocol",
    color: "#39ff14",
    emissive: "#22aa00",
    trailColor: "#39ff14",
    unlockScore: 3000,
    description: "Toxic green infiltrator — Score 3,000",
  },
  {
    id: "void",
    name: "Void Walker",
    color: "#bf00ff",
    emissive: "#7a00cc",
    trailColor: "#dd00ff",
    unlockScore: 6000,
    description: "From beyond the code — Score 6,000",
  },
  {
    id: "gold",
    name: "Gold Reaper",
    color: "#ffd700",
    emissive: "#cc9900",
    trailColor: "#ffcc00",
    unlockScore: 10000,
    description: "Legend of the datastream — Score 10,000",
  },
];
