import { BlendModes, Scene } from 'phaser';

export const MenuScene = new Phaser.Class({
 
  Extends: Phaser.Scene,

  initialize:

  function MenuScene ()
  {
      Phaser.Scene.call(this, { key: 'MenuScene' });
  },

  preload: function () {
    this.load.spritesheet('zomb_frames', 'assets/zombsprite.png', {
      frameWidth: 48,
      frameHeight: 48});
      
    this.load.spritesheet('frall_frames', 'assets/frallsprite-test2.png', {
      frameWidth: 15,
      frameHeight: 15});    
  },

  create: function () {
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');

    this.add.text(75, 50, 'Goblin killer RPG', { fill: '#ffffff' });

    let button = this.add.text(135,110, 'Start', { fill: '#ffffff' });
    button.setInteractive();

    button.on('pointerover', () => { button.setFill('#ff0000'); });
    button.on('pointerout', () => { button.setFill('#ffffff'); });


    this.goblin = this.physics.add.sprite(70, 160, 'zomb_frames', 0);
    this.goblin.setScale(2);
    this.player = this.physics.add.sprite(250, 185, 'frall_frames', 0);
    this.player.setScale(3);
    this.player.flipX = true;

    button.on('pointerdown', () => { this.scene.start('GameScene'); });
  },

  over(button) {
    button.fill = '#ff0000';
  }
});
