import { BlendModes } from 'phaser';

export const GameScene = new Phaser.Class({
 
  Extends: Phaser.Scene,

  initialize:

  function GameScene ()
  {
      Phaser.Scene.call(this, { key: 'GameScene' });
  },

  preload: function () {
      // map tiles
      this.load.image('tiles', 'assets/map/spritesheet.png');
        
      // map in json format
      this.load.tilemapTiledJSON('map', 'assets/map/map.json');
      
      // our two characters
      this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
      
  },

  create: function () {
      this.scene.start('WorldScene');
  }
});

export const WorldScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

  function WorldScene ()
  {
      Phaser.Scene.call(this, { key: 'WorldScene' });
  },
  preload: function ()
  {
      
  },
  create: function () {
    var map = this.make.tilemap({ key: 'map' });

    var tiles = map.addTilesetImage('spritesheet', 'tiles');
        
	  var grass = map.createStaticLayer('Grass', tiles, 0, 0);
    var obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);
    obstacles.setCollisionByExclusion([-1]);

    this.player = this.physics.add.sprite(50, 100, 'player', 6);

    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.player.setCollideWorldBounds(true);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true;

    //  animation with key 'left', we don't need left and right as we will use one and flip the sprite
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13]}),
      frameRate: 10,
      repeat: -1
    });
  
    // animation with key 'right'
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

    this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
    for(let i = 0; i < 30; i++){
      var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
      var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
      this.spawns.create(x, y, 20, 20);
    }
    this.physics.add.overlap(this.player, this.spawns, this.onEnemyMeet, false, this);

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

    if(this.cursor.left.isDown) {
      this.player.body.setVelocityX(-80);
    }
    else if(this.cursor.right.isDown) {
      this.player.body.setVelocityX(80);
    }

    
    if(this.cursor.up.isDown) {
      this.player.body.setVelocityY(-80);
    }
    else if(this.cursor.down.isDown) {
      this.player.body.setVelocityY(80);
    }

    if (this.cursor.left.isDown)
        {
            this.player.anims.play('left', true);
        }
        else if (this.cursor.right.isDown)
        {
            this.player.anims.play('right', true);
        }
        else if (this.cursor.up.isDown)
        {
            this.player.anims.play('up', true);
        }
        else if (this.cursor.down.isDown)
        {
            this.player.anims.play('down', true);
        }
        else
        {
            this.player.anims.stop();
        }
  },

  onEnemyMeet(player, zone) {
    // start battle
    zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
    zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height); 
    
    this.cameras.main.shake(300);

    this.scene.switch('BattleScene');

  }

});