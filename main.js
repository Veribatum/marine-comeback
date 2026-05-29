// =========================
// GAME CONFIG
// =========================

// =========================
// GLOBAL VARIABLES
// =========================
let player;
let cursors;
let bullets;
let casings;
let fireKey;
let slime;
let slimeDirection = -1;
let slimeHitsTaken = 0;
let slimeCanTakeDamage = true;
let playerHealth = 3;
let playerCanTakeDamage = true;
let playerLives = 3;
let playerIsHurt = false;
let playerIsDead = false;
let healthBar;
let livesDisplay;
let gameOverScreen;
let restartKey;
let titleScreen;
let gameStarted = false;
let apartmentDoor;
let levelTransitioning = false;
let fadeScreen;
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const WORLD_Y_OFFSET = -60;
const config = {

  type: Phaser.AUTO,

  width: 1280,
  height: 720,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  backgroundColor: '#000000',

  physics: {
    default: 'arcade',

    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },

  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// =========================
// START GAME
// =========================
const game = new Phaser.Game(config);

// =========================
// PRELOAD
// =========================
function preload() {

  // =========================
  // LOAD PLAYER SPRITE
  // =========================
  this.load.image('playerIdle', 'assets/player_idle.png');
  this.load.image('playerIdle2', 'assets/player_idle_b.png');
this.load.image('playerIdle3', 'assets/player_idle_c.png');
this.load.image('playerIdle4', 'assets/player_idle_d.png');
this.load.image('playerCrouch', 'assets/player_crouch.png');
this.load.image('playerHurt', 'assets/player_hurt.png');
this.load.image('playerCrouchHurt', 'assets/player_crouchhurt.png');
this.load.image('playerDead', 'assets/player_dead.png');

// =========================
// LOAD PLAYER JUMP FRAMES
// =========================
this.load.image('playerJump1', 'assets/player_jump_1.png');
this.load.image('playerJump2', 'assets/player_jump_2.png');
this.load.image('playerJump3', 'assets/player_jump_3.png');

// =========================
// PLAYER SHOOTING FX
// =========================
this.load.image('bullet', 'assets/player_bullet.png');
this.load.image('casing', 'assets/player_casing.png');
this.load.image('muzzleFlash', 'assets/player_muzzleflash.png');

// =========================
// LOAD APARTMENT FLOOR
// =========================
this.load.image('apartmentFloor', 'assets/apartment_floor.png');

// =========================
// LOAD APARTMENT BACKGROUND
// =========================
this.load.image('apartmentBackground', 'assets/apartment_background.png');

// =========================
// LOAD SLIME ENEMY
// =========================
this.load.image('slimeWalk1', 'assets/slime_walk_1.png');
this.load.image('slimeWalk2', 'assets/slime_walk_2.png');
this.load.image('slimeHurt', 'assets/slime_hurt.png');
this.load.image('slimeDeath', 'assets/slime_death.png');

// =========================
// HUD ASSETS
// =========================

this.load.image('leftUp', 'assets/button_left_up.png');
this.load.image('leftDown', 'assets/button_left_down.png');

this.load.image('rightUp', 'assets/button_right_up.png');
this.load.image('rightDown', 'assets/button_right_down.png');

this.load.image('jumpUp', 'assets/button_jump_up.png');
this.load.image('jumpDown', 'assets/button_jump_down.png');

this.load.image('fireUp', 'assets/button_fire_up.png');
this.load.image('fireDown', 'assets/button_fire_down.png');

this.load.image('crouchUp', 'assets/button_crouch_up.png');
this.load.image('crouchDown', 'assets/button_crouch_down.png');

this.load.image('controlPlate', 'assets/control_plate_left.png');

this.load.image('health0', 'assets/health_0.png');
this.load.image('health1', 'assets/health_1.png');
this.load.image('health2', 'assets/health_2.png');
this.load.image('health3', 'assets/health_3.png');

this.load.image('lives0', 'assets/lives_0.png');
this.load.image('lives1', 'assets/lives_1.png');
this.load.image('lives2', 'assets/lives_2.png');
this.load.image('lives3', 'assets/lives_3.png');

// =========================
// LOAD PLAYER RUN FRAMES
// =========================
this.load.image('playerRun1', 'assets/player_run_1.png');
this.load.image('playerRun2', 'assets/player_run_2.png');
this.load.image('playerRun3', 'assets/player_run_3.png');
this.load.image('playerRun4', 'assets/player_run_4.png');
this.load.image('playerRun5', 'assets/player_run_5.png');
this.load.image('playerRun6', 'assets/player_run_6.png');

// =========================
// APARTMENT PROPS
// =========================
this.load.image('couch', 'assets/apartment_couch.png');
this.load.image('tv', 'assets/apartment_tv.png');
this.load.image('pizza', 'assets/apartment_pizza.png');
this.load.image('apartment_soda', 'assets/apartment_soda.png');
this.load.image('apartmentDoor', 'assets/apartment_door.png');

// =========================
// Game Over Screen
// =========================
this.load.image('gameOverScreen', 'assets/Gameover.png');

// =========================
// Title Screen
// =========================
this.load.image('titleScreen', 'assets/Title.png');

}



// =========================
// CREATE
// =========================
function create() {

 // =========================
// APARTMENT BACKGROUND
// =========================
const background = this.add.image(
  GAME_WIDTH / 2,
  GAME_HEIGHT / 2,
  'apartmentBackground'
);

background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

background.setScrollFactor(0);



  // =========================
  // GROUND
  // =========================
const ground = this.add.tileSprite(GAME_WIDTH / 2, 480, GAME_WIDTH, 128, 'apartmentFloor');
ground.tilePositionY = 520;

  this.physics.add.existing(ground, true);

  // =========================
// GROUND HITBOX OFFSET
// =========================
ground.body.setSize(1600, 40);
ground.body.setOffset(0, 70);

// =========================
// APARTMENT PROP: COUCH
// =========================
const couch = this.add.image(430, 370, 'couch');

couch.setDepth(5);
couch.setScale(1);

// =========================
// PIZZA BOX
// =========================
const pizza = this.add.image(900, 450, 'pizza');

pizza.setDepth(5);
pizza.setScale(0.8);

// =========================
// COKE
// =========================
const coke = this.add.image(980, 430, 'apartment_soda');

coke.setDepth(5);
coke.setScale(0.7);


  // =========================
  // PLAYER
  // =========================

  player = this.physics.add.sprite(150, 200, 'playerIdle');

  player.body.setCollideWorldBounds(true);

  // =========================
// BULLET GROUP
// =========================
bullets = this.physics.add.group();

// =========================
// CASING GROUP
// =========================
casings = this.physics.add.group();

// =========================
// PLAYER SCALE
// =========================
player.setScale(0.15);
player.setDepth(20);

// =========================
// PLAYER HITBOX SIZE
// =========================
player.body.setSize(360, 520);
player.body.setOffset(240, 500);

// =========================
// KEYBOARD INPUT
// =========================
cursors = this.input.keyboard.createCursorKeys();

fireKey = this.input.keyboard.addKey(
  Phaser.Input.Keyboard.KeyCodes.SPACE
);

restartKey = this.input.keyboard.addKey(
  Phaser.Input.Keyboard.KeyCodes.R
);

  // =========================
  // PLAYER TOUCHES GROUND
  // =========================
  this.physics.add.collider(player, ground);

  // =========================
// SLIME WALK ANIMATION
// =========================
this.anims.create({
  key: 'slimeWalk',

  frames: [
    { key: 'slimeWalk1' },
    { key: 'slimeWalk2' }
  ],

  frameRate: 4,
  repeat: -1
});

  // =========================
// SLIME ENEMY
// =========================
slime = this.physics.add.sprite(900, 400, 'slimeWalk1');

slime.setScale(1);
slime.setDepth(15);
slime.health = 2;
slime.isDead = false;

this.physics.add.collider(slime, ground);

// =========================
// BULLET HITS SLIME
// =========================
this.physics.add.overlap(bullets, slime, hitSlime, null, this);
this.physics.add.overlap(player, slime, hurtPlayer, null, this);

slime.play('slimeWalk');

// =========================
// CASINGS TOUCH GROUND
// =========================
this.physics.add.collider(casings, ground);

// =========================
// WORLD SIZE
// =========================
this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
// =========================
// CAMERA FOLLOW
// =========================
this.cameras.main.startFollow(player);

// =========================
// PLAYER IDLE ANIMATION
// =========================
this.anims.create({
  key: 'idle',

  frames: [
    { key: 'playerIdle' },
    { key: 'playerIdle2' },
    { key: 'playerIdle3' },
    { key: 'playerIdle4' }
  ],

  frameRate: 5,
  repeat: -1
});

// =========================
// PLAYER JUMP ANIMATION
// =========================
this.anims.create({
    key: 'jump',
    frames: [
        { key: 'playerJump1' },
        { key: 'playerJump2' },
        { key: 'playerJump3' }
    ],
    frameRate: 8,
    repeat: 0
});

// =========================
// PLAYER RUN ANIMATION
// =========================
this.anims.create({
  key: 'run',

  frames: [
    { key: 'playerRun1' },
    { key: 'playerRun2' },
    { key: 'playerRun3' },
    { key: 'playerRun4' },
    { key: 'playerRun5' },
    { key: 'playerRun6' }
  ],

  frameRate: 10,
  repeat: -1
});

// =========================
// START IDLE ANIMATION
// =========================
player.play('idle');

// =========================
// FOREGROUND TV
// =========================
const tv = this.add.image(650, 460, 'tv');

tv.setDepth(50);
tv.setScale(1.2);

// =========================
// EXIT DOOR
// =========================
apartmentDoor = this.physics.add.sprite(
  1165,
  320,
  'apartmentDoor'
);

apartmentDoor.setScale(.5);
apartmentDoor.setDepth(10);
apartmentDoor.body.allowGravity = false;
apartmentDoor.body.immovable = true;

this.physics.add.overlap(player, apartmentDoor, enterDoor, null, this);

// =========================
// GAME OVER SCREEN
// =========================
gameOverScreen = this.add.image(
GAME_WIDTH / 2,
GAME_HEIGHT / 2,
  'gameOverScreen'
);

gameOverScreen.setScrollFactor(0);
gameOverScreen.setDepth(5000);
gameOverScreen.setVisible(false);

gameOverScreen.setInteractive();

gameOverScreen.on('pointerdown', () => {

  if (playerLives <= 0) {
    location.reload();
  }

});

// =========================
// HUD / CONTROLS
// =========================

// LEFT CONTROL PLATE
const leftPlate = this.add.image(170, 700, 'controlPlate')
  .setScrollFactor(0)
  .setDepth(100)
.setScale(0.60);

// RIGHT CONTROL PLATE
const rightPlate = this.add.image(1260, 700, 'controlPlate')
  .setScrollFactor(0)
  .setDepth(100)
.setScale(0.60)
  .setFlipX(true);

// LEFT BUTTON
this.leftButton = this.add.image(145, 665, 'leftUp')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.50
  )
  .setInteractive();

// RIGHT BUTTON
this.rightButton = this.add.image(210, 665, 'rightUp')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.50)
  .setInteractive();

// CROUCH BUTTON
this.crouchButton = this.add.image(175, 725, 'crouchUp')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.50)
  .setInteractive();

// FIRE BUTTON
this.fireButton = this.add.image(1280, 670, 'fireUp')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.60)
  .setInteractive();

// =========================
// FIRE BUTTON INPUT
// =========================
this.fireButton.on('pointerdown', () => {

  let bullet = bullets.create(
    player.x + 55,
    player.y - 40,
    'bullet'
  );
  bullet.body.allowGravity = false;

  // =========================
// SHELL CASING
// =========================
let casing = casings.create(
  player.x,
  player.y - 50,
  'casing'
);

casing.setScale(1.5);
casing.body.setSize(casing.width, casing.height);
casing.body.setOffset(0, 0);

casing.setBounce(0.20);
casing.setDragX(900);
casing.setAngularVelocity(Phaser.Math.Between(-250, 250));

// RIGHT-FACING EJECTION
if (!player.flipX) {

  casing.setVelocity(
    -120,
    -220
  );

  casing.setAngularVelocity(-400);

}

// LEFT-FACING EJECTION
else {

  casing.setVelocity(
    120,
    -220
  );

  casing.setFlipX(true);

  casing.setAngularVelocity(400);

}

// REMOVE CASING LATER
this.time.delayedCall(8000, () => {

  if (casing.active) {
    casing.destroy();
  }

});

  // =========================
// MUZZLE FLASH
// =========================
let flashX;

flashX = bulletX;

let muzzleFlash = this.add.image(
  flashX,
 bulletY,
  'muzzleFlash'
);

muzzleFlash.setScale(1);
muzzleFlash.setDepth(2000);

if (player.flipX) {
  muzzleFlash.setFlipX(true);
}

this.time.delayedCall(80, () => {
  muzzleFlash.destroy();
});

  if (!player.flipX) {
    bullet.setVelocityX(800);
  } else {
    bullet.setVelocityX(-800);
    bullet.setFlipX(true);
  }

});

// JUMP BUTTON
this.jumpButton = this.add.image(1220, 720, 'jumpUp')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.65)
  .setInteractive();

// HEALTH BAR
healthBar = this.add.image(240, 70, 'health3')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.75);

// LIVES
livesDisplay = this.add.image(1080, 70, 'lives3')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.75);

 // =========================
// Level Transition Fade Screen
// =========================
fadeScreen = this.add.rectangle(
  GAME_WIDTH / 2,
  GAME_HEIGHT / 2,
  GAME_WIDTH,
  GAME_HEIGHT,
  0x000000
);

fadeScreen.setScrollFactor(0);
fadeScreen.setDepth(7000);
fadeScreen.setAlpha(0);

      // =========================
// TITLE SCREEN
// =========================
titleScreen = this.add.image(
GAME_WIDTH / 2,
GAME_HEIGHT / 2,
  'titleScreen'
);

titleScreen.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
titleScreen.setScrollFactor(0);
titleScreen.setDepth(6000);

titleScreen.setInteractive();

// TAP TO START
titleScreen.on('pointerdown', () => {

  titleScreen.setVisible(false);

  gameStarted = true;

});

  }


// =========================
// UPDATE
// =========================
function update() {

// =========================
// START GAME
// =========================
if (!gameStarted) {

  if (Phaser.Input.Keyboard.JustDown(fireKey)) {
    titleScreen.setVisible(false);
    gameStarted = true;
  }

  return;
}

// =========================
// RESTART GAME
// =========================
if (playerLives <= 0 && Phaser.Input.Keyboard.JustDown(restartKey)) {
  location.reload();
}

if (playerIsDead) {
  player.body.setVelocityX(0);
  player.setTexture('playerDead');
  return;
}

  // =========================
  // MOVE LEFT
  // =========================
  if (cursors.left.isDown) {

    player.body.setVelocityX(-300);
    player.setFlipX(true);

  }

  // =========================
  // MOVE RIGHT
  // =========================
  else if (cursors.right.isDown) {

    player.body.setVelocityX(300);
    player.setFlipX(false);

  }

  // =========================
  // STOP MOVING
  // =========================
  else {

    player.body.setVelocityX(0);

  }

  // =========================
// CROUCH STATE
// =========================
let iscrouching =cursors.down.isdown && player.body.blocked.down; 

  // =========================
  // JUMP
  // =========================
  if (cursors.up.isDown && player.body.blocked.down) {

    player.body.setVelocityY(-600);

  }

// =========================
// CROUCH CHECK
// =========================
let isCrouching = cursors.down.isDown && player.body.blocked.down;

if (isCrouching) {
  player.body.setVelocityX(0);
}
if (isCrouching) {

  player.setTexture('playerCrouch');
  player.body.setVelocityX(0);

}

// =========================
// PLAYER ANIMATION STATE
// =========================

if (playerIsDead) {

  player.setTexture('playerDead');

}

else if (playerIsHurt) {

  if (cursors.down.isDown && player.body.blocked.down) {
    player.setTexture('playerCrouchHurt');
  } else {
    player.setTexture('playerHurt');
  }

}
else if (isCrouching) {

  player.setTexture('playerCrouch');

}

else if (!player.body.blocked.down) {

  if (player.body.velocity.y < -100) {
    player.setTexture('playerJump1');
  }

  else if (player.body.velocity.y >= -100 && player.body.velocity.y <= 100) {
    player.setTexture('playerJump2');
  }

  else {
    player.setTexture('playerJump3');
  }

}

else if (cursors.left.isDown || cursors.right.isDown) {

  player.play('run', true);

}

else {

  player.play('idle', true);

}
  // =========================
// KEYBOARD SHOOTING
// =========================
if (Phaser.Input.Keyboard.JustDown(fireKey) && !playerIsDead) {
let bulletX;
let bulletY;

// =========================
// RUNNING
// =========================
if (
  player.body.blocked.down &&
  (cursors.left.isDown || cursors.right.isDown)
) {

  bulletY = player.y - 40;

  if (!player.flipX) {
    bulletX = player.x + 75;
  } else {
    bulletX = player.x - 75;
  }

}

// =========================
// JUMPING
// =========================
else if (!player.body.blocked.down) {

  bulletY = player.y - 55;

  if (!player.flipX) {
    bulletX = player.x + 75;
  } else {
    bulletX = player.x - 75;
  }

}

// =========================
// CROUCHING
// =========================
else if (cursors.down.isDown && player.body.blocked.down) {

  bulletY = player.y - 20;

  if (!player.flipX) {
    bulletX = player.x + 65;
  } else {
    bulletX = player.x - 65;
  }

}

// =========================
// IDLE
// =========================
else {

  bulletY = player.y - 40;

  if (!player.flipX) {
    bulletX = player.x + 65;
  } else {
    bulletX = player.x - 65;
  }

}

let bullet = bullets.create(
  bulletX,
  bulletY,
  'bullet'
);
bullet.setDepth(40);

bullet.body.allowGravity = false;

// =========================
// SHELL CASING
// =========================
let casing = casings.create(
  player.x,
  player.y - 70,
  'casing'
);

casing.setScale(1.5);
casing.body.setSize(casing.width, casing.height);
casing.body.setOffset(0, 0);

casing.setBounce(0.35);
casing.setDragX(500);
casing.setAngularVelocity(Phaser.Math.Between(-600, 600));

if (!player.flipX) {
  casing.setVelocity(-120, -220);
  casing.setAngularVelocity(-400);
} else {
  casing.setVelocity(120, -220);
  casing.setFlipX(true);
  casing.setAngularVelocity(400);
}

this.time.delayedCall(8000, () => {
  if (casing.active) {
    casing.destroy();
  }
});

// =========================
// MUZZLE FLASH
// =========================
let flashX;

flashX = bulletX;

let muzzleFlash = this.add.image(
  bulletX,
  bulletY,
  'muzzleFlash'
);

muzzleFlash.setScale(1);
muzzleFlash.setDepth(2000);

if (player.flipX) {
  muzzleFlash.setFlipX(true);
}

this.time.delayedCall(40, () => {
  muzzleFlash.destroy();
});

if (!player.flipX) {

  bullet.setVelocityX(800);

} else {

  bullet.setVelocityX(-800);
  bullet.setFlipX(true);

}

}
// =========================
// STOP CASING SPIN AFTER LANDING
// =========================
casings.children.iterate((casing) => {

  if (!casing || !casing.body) {
    return;
  }

  if (casing.body.blocked.down && !casing.hasLanded) {

  casing.hasLanded = true;

  casing.setAngularVelocity(0);
  casing.setVelocityX(0);

casing.rotation = Phaser.Math.DegToRad(
  Phaser.Math.Between(-15, 15)
  );

}

});

// =========================
// SLIME ENEMY PATROL
// =========================
if (slime && slime.active && slime.body && !slime.isDead) {

  slime.body.setVelocityX(100 * slimeDirection);

  if (slime.x <= 700) {
    slimeDirection = 1;
    slime.setFlipX(true);
  }

  if (slime.x >= 1200) {
    slimeDirection = -1;
    slime.setFlipX(false);
  }

}
}
// =========================
// HIT SLIME FUNCTION
// =========================
function hitSlime(objectA, objectB) {

  let bulletObject;
  let slimeObject;

  // Figure out which object is the bullet
  if (objectA.texture.key === 'bullet') {
    bulletObject = objectA;
    slimeObject = objectB;
  } else {
    bulletObject = objectB;
    slimeObject = objectA;
  }

  if (!bulletObject.active || slimeObject.isDead) {
    return;
  }

  // Kill ONLY the bullet
  bulletObject.disableBody(true, true);

  // Damage slime
  slimeObject.health = slimeObject.health - 1;

  console.log("Slime health:", slimeObject.health);

  // =========================
// SLIME HIT EFFECT
// =========================
let hitEffect = slimeObject.scene.add.image(
  slimeObject.x,
  slimeObject.y,
  'slimeHurt'
);

hitEffect.setScale(1);
hitEffect.setDepth(slimeObject.depth + 1);
hitEffect.setFlipX(slimeObject.flipX);

slimeObject.scene.time.delayedCall(150, () => {
  hitEffect.destroy();
});

  if (slimeObject.health > 0) {
    return;
  }

  // Death
  slimeObject.isDead = true;
  slimeObject.body.setVelocityX(0);

  let deathEffect = slimeObject.scene.add.image(
    slimeObject.x,
    slimeObject.y,
    'slimeDeath'
  );

deathEffect.setDepth(slimeObject.depth);

  slimeObject.disableBody(true, true);

  slimeObject.scene.time.delayedCall(500, () => {
    deathEffect.destroy();
  });
  
}
// =========================
// PLAYER TAKES DAMAGE
// =========================
function hurtPlayer(playerObject, slimeObject) {

  if (!playerCanTakeDamage || slimeObject.isDead || playerIsDead) {
    return;
  }

  playerCanTakeDamage = false;
  playerIsHurt = true;

  playerHealth--;

  healthBar.setTexture('health' + playerHealth);

  console.log("Player health:", playerHealth);

  playerObject.setTint(0xff0000);

  if (playerHealth <= 0) {

    playerLives--;
    livesDisplay.setTexture('lives' + playerLives);

    console.log("Player lives:", playerLives);

    playerIsDead = true;
    playerIsHurt = false;

    playerObject.setTexture('playerDead');
    playerObject.setVelocity(0, 0);

    playerObject.scene.time.delayedCall(700, () => {

      if (playerLives > 0) {

        playerHealth = 3;
        playerIsDead = false;
        playerIsHurt = false;
        playerCanTakeDamage = true;

        playerObject.clearTint();

        playerObject.x = 150;
        playerObject.y = 300;

        playerObject.setVelocity(0, 0);
        healthBar.setTexture('health3');

      } else {

        console.log("GAME OVER");
        gameOverScreen.setVisible(true);

      }

    });

    return;
  }

  if (cursors.down.isDown && playerObject.body.blocked.down) {
    playerObject.setTexture('playerCrouchHurt');
  } else {
    playerObject.setTexture('playerHurt');
  }

  if (playerObject.x < slimeObject.x) {
    playerObject.setVelocityX(-300);
  } else {
    playerObject.setVelocityX(300);
  }

  playerObject.setVelocityY(-200);

  playerObject.scene.time.delayedCall(250, () => {
    playerIsHurt = false;
    playerObject.clearTint();
  });

  playerObject.scene.time.delayedCall(1000, () => {
    playerCanTakeDamage = true;
  });

}
// =========================
// ENTER DOOR
// =========================
function enterDoor(playerObject, doorObject) {

  if (levelTransitioning || playerIsDead) {
    return;
  }

  levelTransitioning = true;

  playerObject.body.setVelocityX(0);

  playerObject.scene.tweens.add({
    targets: fadeScreen,
    alpha: 1,
    duration: 800,
    onComplete: () => {
      console.log("LOAD LEVEL 1");
    }
  });

}