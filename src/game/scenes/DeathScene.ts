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
    this.load.image('skull', 'assets/skull.png');

  },

  create: function () {
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');

    this.add.text(95, 50, 'You have died!', { fill: '#fff' });

    this.skull = this.physics.add.sprite(160, 110, 'skull');
    this.skull.setScale(0.5);


    let button = this.add.text(135,170, 'Retry?', { fill: '#fff' });
    button.setInteractive();

    button.on('pointerover', () => { button.setFill('#ff0000'); });
    button.on('pointerout', () => { button.setFill('#ffffff'); });


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
