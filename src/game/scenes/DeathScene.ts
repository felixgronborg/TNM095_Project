import { BlendModes, Scene } from 'phaser';
import { WorldScene } from '@/scenes/GameScene';

export const DeathScene = new Phaser.Class({
 
  Extends: Phaser.Scene,

  initialize:

  function MenuScene ()
  {
      Phaser.Scene.call(this, { key: 'DeathScene' });
  },

  preload: function () { 
  },

  create: function () {
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');

    this.add.text(110, 50, 'You died :(', { fill: '#fff' });

    const button = this.add.text(135,110, 'Retry?', { fill: '#fff' });
    button.setInteractive();

    let getScene = this.scene.get('WorldScene');

    button.on('pointerdown', () => { this.reboot(); });
  },

  reboot()
  {
    this.getScene = this.scene.get('WorldScene');
    this.getScene.reset();
    this.scene.run('WorldScene');
    this.scene.sleep('DeathScene');
  }
});
