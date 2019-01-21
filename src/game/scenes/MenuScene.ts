import { BlendModes, Scene } from 'phaser';

export const MenuScene = new Phaser.Class({
 
  Extends: Phaser.Scene,

  initialize:

  function MenuScene ()
  {
      Phaser.Scene.call(this, { key: 'MenuScene' });
  },

  preload: function () {      
  },

  create: function () {
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');

    this.add.text(75, 50, 'Goblin killer RPG', { fill: '#fff' });

    const button = this.add.text(135,110, 'Start', { fill: '#fff' });
    button.setInteractive();

    button.on('pointerdown', () => { this.scene.start('GameScene'); });
  }
});
