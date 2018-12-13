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

    this.add.text(95, 50, 'U ded :(', { fill: '#fff' });

    const button = this.add.text(135,110, 'Retry?', { fill: '#fff' });
    button.setInteractive();
    
    /*
    this.scene.stop('Battlescene');
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    */

    let getScene = this.scene.get('WorldScene');
    // resetGame.scene.restart();
    //this.scene.start('MenuScene');
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
