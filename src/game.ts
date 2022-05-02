import "phaser";
import { MainScene } from "./scenes/MainScene";
import { Plugin as NineSlicePlugin } from "phaser3-nineslice";

import { BLACK } from "./utility/Constants";
import { BootScene } from "./scenes/BootScene";
import { SystemSelectScene } from "./scenes/SystemSelectScene";
import { StellarBodyScene } from "./scenes/StellarBodyScene";
import { UIScene } from "./scenes/UIScene";
import { StateScene } from "./scenes/StateScene";
export type GameScenes = "BootScene" | "MainScene" | "Audio";
// main game configuration
const config: Phaser.Types.Core.GameConfig = {
  width: "100%",
  height: "100%",
  type: Phaser.AUTO,
  parent: "game",
  scene: [
    BootScene,
    MainScene,
    SystemSelectScene,
    StellarBodyScene,
    UIScene,
    StateScene,
  ],
  plugins: {
    global: [NineSlicePlugin.DefaultCfg],
    scene: [],
  },
  backgroundColor: BLACK.str,
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    },
  },
  render: { pixelArt: true, antialias: false },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener("load", () => {
  new Game(config);
});
