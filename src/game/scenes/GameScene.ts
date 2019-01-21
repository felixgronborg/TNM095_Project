import { BlendModes } from 'phaser';

export const GameScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

  function GameScene() {
    Phaser.Scene.call(this, { key: 'GameScene' });
  },

  preload() {
      // map tiles
    this.load.image('tiles', 'assets/map/spritesheet.png');

    // map in json format
    this.load.tilemapTiledJSON('map', 'assets/map/map.json');

    // our two characters
    this.load.spritesheet('player', 'assets/Heroes.png', { frameWidth: 16, frameHeight: 16 });

    this.load.spritesheet('enemy_frames', 'assets/Enemies.png', {
      frameWidth: 48,
      frameHeight: 48});
  },

  create() {
    this.scene.start('WorldScene');
  }
});

export const WorldScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

  function WorldScene() {
    Phaser.Scene.call(this, { key: 'WorldScene' });
  },
  preload() {},
  create() {
    const map = this.make.tilemap({ key: 'map' });

    const tiles = map.addTilesetImage('spritesheet', 'tiles');

	  const grass = map.createStaticLayer('Grass', tiles, 0, 0);
    const obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);
    obstacles.setCollisionByExclusion([-1]);

    this.player = this.physics.add.sprite(50, 100, 'player', 6);

    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.player.setCollideWorldBounds(true);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13]}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13] }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', { frames: [2, 8, 2, 14]}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', { frames: [ 0, 6, 0, 12 ] }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.add.collider(this.player, obstacles);

    // enemy spawns
    this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
    this.sprites = this.physics.add.group({ classType: Phaser.GameObjects.Sprite })
    for (let i = 0; i < 5; i += 1) {
      const x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
      const y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
      //this.spawns.create(x, y, 45, 45);

      // create enmy sprite for each zone!
      //this.sprites.create(x, y, 'enemy_frames', 60);

      this.sprites.create(x, y, 'enemy_frames', 60);
      //this.physics.add.overlap(this.player, this.sprite, this.test, false, this);
    }
    this.physics.add.overlap(this.player, this.sprites, this.onEnemyMeet, false, this);

    this.sys.events.on('wake', this.wake, this);
  },

  wake() {
    this.cursor.left.reset();
    this.cursor.right.reset();
    this.cursor.up.reset();
    this.cursor.down.reset();
  },

  update(time, delta) {
    this.player.body.setVelocity(0);

    if (this.cursor.left.isDown) {
      this.player.body.setVelocityX(-80);
    } else if (this.cursor.right.isDown) {
      this.player.body.setVelocityX(80);
    }

    if (this.cursor.up.isDown) {
      this.player.body.setVelocityY(-80);
    } else if (this.cursor.down.isDown) {
      this.player.body.setVelocityY(80);
    }

    if (this.cursor.left.isDown) {
      this.player.anims.play('left', true);
      this.player.flipX = true;
    } else if (this.cursor.right.isDown) {
      this.player.anims.play('right', true);
      this.player.flipX = false;
    } else if (this.cursor.up.isDown) {
      this.player.anims.play('up', true);
    } else if (this.cursor.down.isDown) {
      this.player.anims.play('down', true);
    } else {
      this.player.anims.stop();
    }
  },

  onEnemyMeet(player, sprite) {
    // Probably remove and detroy zone instead
    //zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
    //zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
    sprite.destroy();
    //zone.destroy();

    this.cameras.main.shake(300);

    this.scene.switch('BattleScene');

  },

  test(sprite){
    sprite.destroy;
  },

  reset()
  {
    this.player.setPosition(50,100);
  }

});