import { GameScene, WorldScene } from '@/scenes/GameScene';
import { FightScene, BattleScene, UIScene } from '@/scenes/FightScene';
import { MenuScene } from '@/scenes/MenuScene';
import { DeathScene } from '@/scenes/DeathScene';
// import { EnemyAI } from '@/scenes/BehaviouTree';

/**
 * Phaser game config
 */
export const phaserConfig: GameConfig = {
  parent: 'app', // content??
  type: Phaser.AUTO, // AUTO
  scene: [MenuScene,
          DeathScene,
          GameScene,
          WorldScene,
          BattleScene,
          UIScene
          ], // GameScene
  width: 320, // 1024
  height: 240, // 576
  zoom: 2,

  // Sample config items
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      // remember to change!
      debug: false
    }
  },
};