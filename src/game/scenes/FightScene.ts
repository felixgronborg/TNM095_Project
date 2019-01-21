import { BlendModes, Scene } from 'phaser';
import { BehaviorTreeBuilder, BehaviorTreeStatus, TimeData } from 'fluent-behavior-tree';
// import BehaviorTree, {Sequence, Task, SUCCESS, FAILURE }  from 'behaviortree';
// const BehaviorTree = require('behaviortree');
// const { Sequence, Task, SUCCESS, FAILURE } = BehaviorTree;
require('babel-core/register');
require('babel-polyfill');

export const BattleScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function BattleScene() {
    Phaser.Scene.call(this, { key: 'BattleScene' });
  },

  preload() {
    console.debug('Preload');

    // 96 x 96, 6x6, 16x16 px
    this.load.spritesheet('hero_frames', 'assets/Heroes.png', {
      frameWidth: 16,
      frameHeight: 16});

      this.load.spritesheet('test_frames', 'assets/testsprite.png', {
        frameWidth: 70,
        frameHeight: 70});

      // 480 x 620, 10x13, 48x48 px för standardstora x2, x4 för större
    this.load.spritesheet('enemy_frames', 'assets/Enemies.png', {
      frameWidth: 48,
      frameHeight: 48});


  },

  create() {
    console.debug('Create');
    this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');
    this.startBattle();

    let lost = false;

    this.anims.create({
      key: 'spooksDmg',
      frames: this.anims.generateFrameNumbers('test_frames', { frames: [0,1,0]}),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'zombsDmg',
      frames: this.anims.generateFrameNumbers('test_frames', { frames: [0,1,0]}),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'fralleDmg',
      frames: this.anims.generateFrameNumbers('test_frames', { frames: [0,1,0]}),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'felixDmg',
      frames: this.anims.generateFrameNumbers('test_frames', { frames: [0,1,0]}),
      frameRate: 10,
      repeat: 0
    });
    
    this.sys.events.on('wake', this.startBattle, this);
  },

  nextTurn() {
    if(this.checkEndBattle()) {
      this.endBattle();
      return;
    }

    do {
      this.index++;
      if(this.index >= this.units.length) {
        this.index = 0;
      }
    } while(!this.units[this.index].alive);

    if (this.units[this.index] instanceof PlayerCharacter) {
      this.events.emit('PlayerSelect', this.index);
    } else { // enemy unit
      // let r = Math.floor(Math.random() * this.heroes.length);
      // this.units[this.index].attack(this.heroes[r]);
      this.Tree();
      this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
    }
  },

  startBattle() {
    // Heroes
    const fralle = new PlayerCharacter(
      this, 250, 50, 'hero_frames', 1, 'Fralle', 'Water', 200, 30, 1);
      // this, x, y, assets, frame, name, element, hp, damage, health packs);
    this.add.existing(fralle);

    const felix = new PlayerCharacter(
      this, 250, 100, 'hero_frames', 4, 'Felix', 'Fire', 200, 30, 1);
    this.add.existing(felix);

    // Enemies
    const spooks = new Enemy(
      this, 50, 50, 'enemy_frames', 60, 'Spooks', 'Normal', 1, 30, 1);
    this.add.existing(spooks);

    const zombs = new Enemy(
      this, 50, 100, 'enemy_frames', 61, 'Zombs', 'Earth', 1, 30, 1);
    this.add.existing(zombs);

    this.heroes = [fralle, felix];

    this.enemies = [spooks, zombs];

    this.units = this.heroes.concat(this.enemies);

    this.index = -1;

    // Run UI scene at the same time
    this.scene.run('UIScene');

  },

  checkEndBattle() {
    let win = true;

    for(let i = 0; i < this.enemies.length; i++) {
      if(this.enemies[i].alive) {
        win = false;
      }
    }

    let loose = true;
    for(let i = 0; i < this.heroes.length; i++) {
      if(this.heroes[i].alive) {
        loose = false;
      }
    }
    if(loose) {
      this.lost = true;
    }
    return win || loose;
  },

  endBattle() {
    this.heroes.length = 0;
    this.enemies.length = 0;

    for(var i = 0; i < this.units.length; i++) {
      this.units[i].destroy();
    }
    this.units.length = 0;
    this.scene.sleep('UIScene');
    
    if(this.lost)
    {
      this.lost = false;
      this.scene.sleep('WorldScene');
      this.scene.switch('DeathScene');
    }
    else {
      this.scene.switch('WorldScene');
    }
  },
  
  receivePlayerSelection(action, target) {
    if (action === 'attack') {
      this.units[this.index].attack(this.enemies[target]);
    }
    if (action === 'elementalAttack') {
      this.units[this.index].elementalAttack(this.enemies[target], this.units[this.index].element);
    }
    if (action === 'heal') {
      this.units[this.index].useHealthPack();
    }
    // let r = Math.floor(Math.random() * this.heroes.length);
    // this.units[this.index].attack(this.heroes[r]);
    this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
  },

  Tree() {
    console.log('Inside Tree');

    const builder = new BehaviorTreeBuilder();
    this.tree = builder
      .selector('root')
        .sequence('fightOrHeal')
          .condition('currHealth', async t => this.checkHealth())
          .do('heal', async t => this.heal())
        .end()

        .sequence('chooseTarget')
          .condition('checkWeakness', async t => this.checkWeakness())
          .do('elementalAttack', async t => this.specialAttack())
        .end()

        .do('regularAttack', async t => this.regularAttack())
      .end()
    .build();
    this.tree.tick(3000);
  },

  checkWeakness() {
    const currElement = this.units[this.index].element;
    if (currElement === 'Normal') {
      console.log('haha normie');
      return false;
    }
    for (let i = 0; i < this.heroes.length; i = + 1) {
      console.log('inside for', i);

      if (currElement === 'Fire' && this.heroes[i].element === 'Earth') {
        console.log('im fire', i);
        this.setTarget = i;
        return true;
      }
      if (currElement === 'Water' && this.heroes[i].element === 'Fire' ) {
        console.log('im water', i);
        this.setTarget = i;
        return true;
      }
      if (currElement === 'Earth' && this.heroes[i].element === 'Water' ) {
        console.log('im earth', i);
        this.setTarget = i;
        return true;
      }
    }
    console.log('why am i doing this?');
    return false;
  },

  specialAttack() {
    console.log('yay im special!', this.setTarget);
    this.units[this.index].elementalAttack(
      this.heroes[this.setTarget], this.units[this.index].element);

    return BehaviorTreeStatus.Success;

  },

  regularAttack() {
    console.log('chucks! Im normal!', this.setTarget); // this.setTarget is undefined
    const r = Math.floor(Math.random() * this.heroes.length);
    this.units[this.index].attack(this.heroes[r]);

    return BehaviorTreeStatus.Success;

  },

  checkHealth() {
    if (this.units[this.index].hp <= 10 && this.units[this.index].healthPack > 0) {
      console.log('return true');
      return true;
    }
    console.log('return false');
    return false;
  },

  heal() {
    console.log('before heal', this.units[this.index].hp);
    this.units[this.index].useHealthPack();
    console.log('after heal', this.units[this.index].hp);

    return BehaviorTreeStatus.Success;
  },
});

const unit = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,

  initialize:

  function unit(scene, x, y, texture, frame, type, element, hp, damage, healthPack) {
    Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame);
    this.type = type;
    this.element = element;
    this.maxHp = this.hp = hp;
    this.damage = damage;
    this.alive = true;
    this.healthPack = healthPack;
  },

  setMenuItem(item) {
    this.menuItem = item;
  },

  attack(target) {
    if(target.alive) {
      target.takeDamage(this.damage);
      this.scene.events.emit('Message',
      `${this.type} attacks ${target.type} with a regular attack`);
    }
  },

  elementalAttack(target, element) {
  if(target.alive) {
    const weakAttack = this.damage - 5;
    const strongAttack = this.damage + 5;
    if (element === 'Normal' || target.element === 'Normal') {
      target.takeDamage(this.damage);
      this.scene.events
        .emit('Message', `${this.type} attacks ${target.type} for ${this.damage} ${this.element} damage`);
    } else if (element === 'Fire' && target.element === 'Water') {
      target.takeDamage(weakAttack);
      this.scene.events
        .emit('Message', `${this.type} attacks ${target.type} for ${weakAttack} ${this.element} damage`);
    } else if (element === 'Water' && target.element === 'Earth') {
      target.takeDamage(weakAttack);
      this.scene.events
        .emit('Message', `${this.type} attacks ${target.type} for ${weakAttack} ${this.element} damage`);
    } else if (element === 'Earth' && target.element === 'Fire') {
      target.takeDamage(weakAttack);
      this.scene.events
        .emit('Messge', `${this.type} attacks ${target.type} for ${weakAttack} ${this.element} damage`);
    } else {
      console.log('dmg', strongAttack);
      target.takeDamage(strongAttack);
      this.scene.events
        .emit('Message', `${this.type} attacks ${target.type} for ${strongAttack} ${this.element} damage`);
    }
    // target.takeDamage(this.damage);
    // this.scene.events
    //  .emit('Message',
    //  this.type + ' attacks ' + target.type + ' for ' + this.damage + this.element + ' damage');
  }
  },
  useHealthPack() {
    if (this.healthPack > 0) {
      this.healthPack -= 1;
      this.hp += 20;
      this.scene.events.emit('Message', `${this.type} used a health pack for 20 HP`);
    }
  },

  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      console.log(`${this.type} has died`);
      this.scene.events.emit(`${this.type} has died`); // Does not emit attack message
      this.setFrame(2);
    }
    console.log(`${this.type} has ${this.hp} left`);

    //TODO figure this out
    if(this.type == 'Spooks')
    {
      this.anims.play('spooksDmg', true);
    }
    if(this.type == 'Zombs')
    {
      this.anims.play('zombsDmg', true);
    }
    if(this.type == 'Fralle')
    {
      this.anims.play('fralleDmg', true);
    }
    if(this.type == 'Felix')
    {
      this.anims.play('felixDmg', true);
    }
  },

  
});

const Enemy = new Phaser.Class({
  Extends: unit,

  initialize:
  function Enemy(scene, x, y, texture, frame, type, element, hp, damage, healthPack) {
    unit.call(this, scene, x, y, texture, frame, type, element, hp, damage, healthPack);
    this.flipX = false;
  }
});

const PlayerCharacter = new Phaser.Class({
  Extends: unit,

  initialize:
  function Enemy(scene, x, y, texture, frame, type, element, hp, damage, healthPack) {
    unit.call(this, scene, x, y, texture, frame, type, element, hp, damage, healthPack);
    this.flipX = true;
  }
});

const MenuItem = new Phaser.Class({
  Extends: Phaser.GameObjects.Text,

  initialize:

  function MenuItem(x, y, text, scene) {
    Phaser.GameObjects.Text
      .call(this, scene, x, y, text, { color: '#ffffff', align: 'left', fontSize: 15 });
  },

  select () {
    this.setColor('#f8ff38');
  },

  deselect () {
    this.setColor('#ffffff');
  },

  unitKilled() {
    this.active = false;
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
    this.selected = false;
  },

  addMenuItem(unit) {
    const menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
    this.menuItems.push(menuItem);
    this.add(menuItem);
    return menuItem;
  },

  moveSelectionUp() {
    this.menuItems[this.menuItemIndex].deselect();
    do {
      this.menuItemIndex--;
      if(this.menuItemIndex < 0) {
        this.menuItemIndex = this.menuItems.length - 1;
      }
    } while(!this.menuItems[this.menuItemIndex].active);
    this.menuItems[this.menuItemIndex].select();
  },

  moveSelectionDown() {
    this.menuItems[this.menuItemIndex].deselect();
    do {
      this.menuItemIndex++;
      if(this.menuItemIndex >= this.menuItems.length) {
        this.menuItemIndex = 0;
      } 
    } while(!this.menuItems[this.menuItemIndex].active);
    this.menuItems[this.menuItemIndex].select();
  },

  select(index) {

    if(!index)
            index = 0;       
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        while(!this.menuItems[this.menuItemIndex].active) {
            this.menuItemIndex++;
            if(this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
            if(this.menuItemIndex == index)
                return;
        }        
        this.menuItems[this.menuItemIndex].select();
        this.selected = true;
  },

  deselect() {
    this.menuItems[this.menuItemIndex].deselect();
    this.menuItemIndex = 0;
    this.selected = false;
  },

  confirm() {
    // when player selects, do the action
  },
  
  clear() {
    for (let i = 0; i < this.menuItems.length; i += 1) {
      this.menuItems[i].destroy();
    }
    this.menuItems.length = 0;
    this.menuItemIndex = 0;
  },

  reMap(units) {
    this.clear();
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      unit.setMenuItem(this.addMenuItem(unit.type));
      //this.addMenuItem(unit.type);
      // this.addMenuItem(unit.hp);
    }
    this.menuItemIndex = 0;
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
    this.addMenuItem('Elemental');
    this.addMenuItem('Heal');
  },

  create() {
    // const choice;
  },

  confirm() {
    console.log('hello', this.menuItemIndex);
    this.choice = this.menuItemIndex;
    this.scene.events.emit('SelectEnemies');
  }
});

const EnemiesMenu = new Phaser.Class({
  Extends: Menu,

  initialize:

  function EnemiesMenu(x, y, scene) {
    Menu.call(this, x, y, scene);
  },

  confirm() {
    this.scene.events.emit('Enemy', this.menuItemIndex);
  },

  undo() {
    // this.scene.start(ActionsMenu); // Does nothing
    // this.currentMenu = ActionsMenu;
  }
});

export const UIScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function UIScene() {
    Phaser.Scene.call(this, { key: 'UIScene' });
  },

  create() {
    console.debug('Create');

    this.graphics = this.add.graphics();
    this.graphics.lineStyle(1, 0xffffff, 1);
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

    /*
    this.remapHeroes();
    this.remapEnemies();
    */
   
    this.input.keyboard.on('keydown', this.onKeyInput, this);

    this.battleScene.events.on('PlayerSelect', this.onPlayerSelect, this);

    this.events.on('SelectEnemies', this.onSelectEnemies, this);

    this.events.on('Enemy', this.onEnemy, this);

    this.sys.events.on('wake', this.createMenu, this);

    this.message = new Message(this, this.battleScene.events);
    this.add.existing(this.message);

    //this.battleScene.nextTurn();
    this.createMenu();
  },

  createMenu() {
    this.remapHeroes();
    this.remapEnemies();
    this.battleScene.nextTurn();
  },

  onEnemy(index) {
    console.log('on enemy', this.enemiesMenu.choice);
    this.heroesMenu.deselect();
    this.actionsMenu.deselect();
    this.enemiesMenu.deselect();
    this.currentMenu = null;
    if (this.actionsMenu.choice === 0) {
      console.log('this is normal');
      this.battleScene.receivePlayerSelection('attack', index);
    } else if (this.actionsMenu.choice === 1) {
      console.log('this is elemental');
      this.battleScene.receivePlayerSelection('elementalAttack', index);
    } else if (this.actionsMenu.choice === 2) {
      console.log('this is a heal');
      this.battleScene.receivePlayerSelection('heal', index);
    }
    // this.battleScene.receivePlayerSelection('attack', index);
  },

  onPlayerSelect(id) {
    this.heroesMenu.select(id);
    this.actionsMenu.select(0);
    this.currentMenu = this.actionsMenu;
  },

  onSelectEnemies() {
    console.log('valde', this.actionsMenu.choice);
    this.currentMenu = this.enemiesMenu;
    if (this.actionsMenu.choice === 2) {
      this.currentMenu.confirm();
    }else {
    this.enemiesMenu.select(0);
    }
  },

  remapHeroes() {
    const heroes = this.battleScene.heroes;
    this.heroesMenu.reMap(heroes);
  },

  remapEnemies() {
    const enemies = this.battleScene.enemies;
    this.enemiesMenu.reMap(enemies);
  },

  onKeyInput(event) {
    if (this.currentMenu && this.currentMenu.selected) {
      if (event.code === 'ArrowUp') {
        this.currentMenu.moveSelectionUp();
      } else if (event.code === 'ArrowDown') {
        this.currentMenu.moveSelectionDown();
      } else if (event.code === 'ArrowRight' || event.code === 'Shift') {
        // this.scene.start(ActionsMenu); // Does nothing
        // this.currentMenu.clear(); // Breaks things
        console.log('ArrowRight logged');
        //this.currentMenu.undo();
      } else if (event.code === 'Space' || event.code === 'ArrowLeft') {
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
    const graphics = this.scene.add.graphics();
    this.add(graphics);
    graphics.lineStyle(1, 0xffffff, 0.8);
    graphics.fillStyle(0x031f4c, 0.3);
    graphics.strokeRect(-90, -15, 180, 30);
    graphics.fillRect(-90, -15, 180, 30);
    this.text = new Phaser.GameObjects.Text(scene, 0, 0, '', {
      color: '#ffffff', align: 'center', fontSize: 13, wordWrap: {
        width: 160, useAdvancedWrap: true }});
    this.add(this.text);
    this.text.setOrigin(0.5);
    events.on('Message', this.showMessage, this);
    this.visible = false;
  },
  showMessage(text) {
    this.text.setText(text);
    this.visible = true;
    if (this.hideEvent)
      this.hideEvent.remove(false);
    this.hideEvent = this.scene.time.addEvent({
      delay: 2000, callback: this.hideMessage, callbackScope: this });
  },
  hideMessage() {
    this.hideEvent = null;
    this.visible = false;
  }
});