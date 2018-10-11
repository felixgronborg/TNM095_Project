import { BlendModes, Scene } from 'phaser';

export const FightScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function FightScene() {
    Phaser.Scene.call(this, { key: 'FightScene' });
  },

  preload: function() {
    console.debug('Preload');
    this.load.image('hero1', 'assets/HeroFrall.png');
    this.load.image('hero2', 'assets/HeroLix.png');
    this.load.image('enemy1', 'assets/enmyTard.png');
    this.load.image('enemy2', 'assets/enmySpooks.png');
  },

  create: function() {
    console.debug('Create');
    this.scene.start('BattleScene');
  }
});

export const BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function BattleScene() {
    Phaser.Scene.call(this, { key: 'BattleScene' });
  },

  create: function(){
    console.debug('Create');
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');
  
    // Heroes
    const fralle = new PlayerCharacter(this, 250, 50, 'hero1', 1, 'Fralle', 100, 20);
    this.add.existing(fralle);

    const felix = new PlayerCharacter(this, 250, 100, 'hero2', 4, 'Felix', 100, 20);
    this.add.existing(felix);
  
    // Enemies
    const spooks = new Enemy(this, 50, 50, 'enemy1', null, 'Spooks', 50, 3);
    this.add.existing(spooks);

    const tard = new Enemy(this, 50, 100, 'enemy2', null, 'Tard', 50, 3);
    this.add.existing(tard);
  
    this.heroes = [fralle, felix];
  
    this.enemies = [spooks, tard];
  
    this.units = this.heroes.concat(this.enemies);
  
    // Run UI scene at the same time
    this.scene.launch('UIScene');
  
    this.index = -1;
  },

  nextTurn: function() {
    this.index++;
    // no more units? start from first
    if (this.index >= this.units.length) {
      this.index = 0;
    }
    if (this.units[this.index]) {
      // if its player hero
      if (this.units[this.index] instanceof PlayerCharacter) {
        this.events.emit('PlayerSelect', this.index);
      } else { // enemy unit
        let r = Math.floor(Math.random() * this.heroes.length);
        this.units[this.index].attack(this.heroes[r]);
        this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
      }
    }
  },

  receivePlayerSelection: function(action, target) {
    if (action == 'attack') {
      console.log('fjfl', this.index)
      this.units[this.index].attack(this.enemies[target]);
    }
    this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
  }
});

const Unit = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,

  initialize:

  function Unit(scene, x, y, texture, frame, type, hp, damage) {
    Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame);
    this.type = type;
    this.maxHp = this.hp = hp;
    this.damage = damage;
  },

  attack: function(target) {
    target.takeDamage(this.damage);
    this.scene.events.emit("Message", this.type + " attacks " + target.type + " for " + this.damage + " damage");
  },

  takeDamage: function(damage) {
    this.hp -= damage;
    if(this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

});

const Enemy = new Phaser.Class({
  Extends: Unit,

  initialize:
  function Enemy(scene, x, y, texture, frame, type, hp, damage) {
    Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
  }
});

const PlayerCharacter = new Phaser.Class({
  Extends: Unit,

  initialize:
  function Enemy(scene, x, y, texture, frame, type, hp, damage) {
    Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
    // this.flipX = true;
    // this.setScale(2);
  }
});

const MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,

  initialize:

  function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.Text.call(this, scene, x, y, text, { color: '#ffffff', align: 'left', fontSize: 15 });
  },

  select: function () {
    this.setColor('#f8ff38');
  },

  deselect: function () {
    this.setColor('#ffffff');
  }

});


const Menu = new Phaser.Class({
  Extends: Phaser.GameObjects.Container, 

  initialize:

  function Menu(x, y, scene, heroes) {
    Phaser.GameObjects.Container.call(this, scene, x, y);
    this.menuItems = [];
    this.menuItemIndex = 0;
    this.heroes = heroes;
    this.x = x;
    this.y = y;
  },

  addMenuItem: function(unit) {
    const menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
    this.menuItems.push(menuItem);
    this.add(menuItem);
  },

  moveSelectionUp: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex--;

    if (this.menuItemIndex < 0) {
      this.menuItemIndex = this.menuItems.length - 1;
    }
    this.menuItems[this.menuItemIndex].select();
  },

  moveSelectionDown: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex++;

    if (this.menuItemIndex >= this.menuItems.length) {
      this.menuItemIndex = 0;
    }
    this.menuItems[this.menuItemIndex].select();
  },

  select: function(index) {
    if (!index) {
      index = 0;
    }
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = index;
    this.menuItems[this.menuItemIndex].select();
  },

  deselect: function() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = 0;
  },

  confirm: function() {
    // when player selects, do the action
  },

  clear: function() {
    for(let i = 0; i < this.menuItems.length; i++) {
      this.menuItems[i].destroy();
    }
    this.menuItems.length = 0;
    this.menuItemIndex = 0;
  },

  reMap: function(units) {
    this.clear();
    for(let i = 0; i < units.length; i++) {
      let unit = units[i];
      this.addMenuItem(unit.type);
    }
  }
});

const HeroesMenu = new Phaser.Class({
  Extends: Menu,

  initialize:

  function HeroesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  }
});

const ActionsMenu = new Phaser.Class({
  Extends: Menu,

  initialize:

  function ActionsMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
    this.addMenuItem('Attack');
  },
  confirm: function() {
    this.scene.events.emit('SelectEnemies');
  }
});

const EnemiesMenu = new Phaser.Class({
  Extends: Menu,

  initialize:

  function EnemiesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  },
  confirm: function() {
    this.scene.events.emit("Enemy", this.menuItemIndex);
  }
});


export const UIScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function UIScene() {
    Phaser.Scene.call(this, { key: 'UIScene' });
  },

  create: function() {
    console.debug('Create');

    this.graphics = this.add.graphics();
    this.graphics.lineStyle(1, 0xffffff);
    this.graphics.fillStyle(0x031f4c, 1);
    this.graphics.strokeRect(2, 150, 90, 100);
    this.graphics.fillRect(2, 150, 90, 100);
    this.graphics.strokeRect(95, 150, 90, 100);
    this.graphics.fillRect(95, 150, 90, 100);
    this.graphics.strokeRect(188, 150, 130, 100);
    this.graphics.fillRect(188, 150, 130, 100);

    // menu container
    this.menus = this.add.container();

    this.heroesMenu = new HeroesMenu(195, 153, this);
    this.actionsMenu = new ActionsMenu(100, 153, this);
    this.enemiesMenu = new EnemiesMenu(8, 153, this);

    // currently selected menu
    this.currentMenu = this.actionsMenu;

    // add menus to container
    this.menus.add(this.heroesMenu);
    this.menus.add(this.actionsMenu);
    this.menus.add(this.enemiesMenu);

    this.battleScene = this.scene.get('BattleScene');

    this.remapHeroes();
    this.remapEnemies();

    this.input.keyboard.on('keydown', this.onKeyInput, this);

    this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);

    this.events.on("SelectEnemies", this.onSelectEnemies, this);

    this.events.on("Enemy", this.onEnemy, this);

    this.message = new Message(this, this.battleScene.events);
    this.add.existing(this.message);
    console.log('kuk', this.message);

    this.battleScene.nextTurn();
  },

  onEnemy: function(index) {
    this.heroesMenu.deselect();
    this.actionsMenu.deselect();
    this.enemiesMenu.deselect();
    this.currentMenu = null;
    this.battleScene.receivePlayerSelection('attack', index);
  },

  onPlayerSelect: function(id) {
    this.heroesMenu.select(id);
    this.actionsMenu.select(0);
    this.currentMenu = this.actionsMenu;
  },

  onSelectEnemies: function() {
    this.currentMenu = this.enemiesMenu;
    this.enemiesMenu.select(0);
  },

  remapHeroes: function() {
    let heroes = this.battleScene.heroes;
    this.heroesMenu.reMap(heroes);
  },

  remapEnemies: function() {
    let enemies = this.battleScene.enemies;
    this.enemiesMenu.reMap(enemies);
  },

  onKeyInput: function(event) {
    if(this.currentMenu) {
      if(event.code === "ArrowUp") {
          this.currentMenu.moveSelectionUp();
      } else if(event.code === "ArrowDown") {
          this.currentMenu.moveSelectionDown();
      } else if(event.code === "ArrowRight" || event.code === "Shift") {

      } else if(event.code === "Space" || event.code === "ArrowLeft") {
          this.currentMenu.confirm();
      } 
    }
  },
});

export const Message = new Phaser.Class({

  Extends: Phaser.GameObjects.Container,

  initialize:
  function Message(scene, events) {
    Phaser.GameObjects.Container.call(this, scene, 160, 30);
    var graphics = this.scene.add.graphics();
    this.add(graphics);
    graphics.lineStyle(1, 0xffffff, 0.8);
    graphics.fillStyle(0x031f4c, 0.3);        
    graphics.strokeRect(-90, -15, 180, 30);
    graphics.fillRect(-90, -15, 180, 30);
    this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: '#ffffff', align: 'center', fontSize: 13, wordWrap: { width: 160, useAdvancedWrap: true }});
    this.add(this.text);
    this.text.setOrigin(0.5);        
    events.on("Message", this.showMessage, this);
    this.visible = false;
  },
  showMessage: function(text) {
    console.log('inside show')
    this.text.setText(text);
    this.visible = true;
    if(this.hideEvent)
        this.hideEvent.remove(false);
    this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
},
  hideMessage: function() {
    console.log('inside hide')
    this.hideEvent = null;
    this.visible = false;
}
});