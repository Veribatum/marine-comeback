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
let score = 0;
let scoreText;
let playerHealth = 3;
let playerCanTakeDamage = true;

// =========================
// DEBUG: INVINCIBILITY TOGGLE
// =========================
// Set to true to make the player immune to all damage while testing -
// press the 'I' key in-game to toggle it on/off. Has zero effect on
// anything else; hurtPlayer() just exits immediately when this is true.
let debugInvincible = false;

// =========================
// PICKUPS / WEAPON UPGRADES
// =========================
// pickups holds every pickup currently in the level (points, upgrade,
// health) so they can be looped for overlap/cleanup the same way
// enemies are. activeUpgrade tracks which weapon upgrade (if any) is
// currently running and when it expires - null means "no upgrade,
// normal single shot," matching the player's existing default fire
// behavior with zero changes needed to firePlayerBullet() when nothing
// is active.
let pickups = [];
let activeUpgrade = null; // 'spread' | 'firerate' | 'power' | 'homing' | null
let upgradeExpiresAt = 0;
let upgradeText = null; // on-screen label showing the active upgrade + timer

// Fire cooldown - previously nonexistent (every fire-key press fired
// immediately with the only rate limit being how fast you could press
// the key). Needed now so the 'firerate' upgrade has an actual cooldown
// to shorten - normalCooldownMs is the default, upgradedCooldownMs is
// used while 'firerate' is active. nextShotAllowedAt is checked before
// every shot in firePlayerBullet().
const NORMAL_FIRE_COOLDOWN_MS = 180;
const UPGRADED_FIRE_COOLDOWN_MS = 70;
let nextShotAllowedAt = 0;
let playerLives = 3;
let playerIsHurt = false;
let playerIsDead = false;
let healthBar;
let livesDisplay;
let gameOverScreen;
let restartKey;
let invincibleKey; // debug toggle - bound to the 'I' key in both scenes
let titleScreen;
let gameStarted = false;
let apartmentDoor;
let levelTransitioning = false;
let fadeScreen;
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const LEVEL1_WIDTH = GAME_WIDTH * 10;
const WORLD_Y_OFFSET = -60;
let moveLeft = false;
let moveRight = false;
let jumpPressed = false;
let crouchPressed = false;
let firePressed = false; // tracks whether the touch fire button is currently held down - needed for the firerate upgrade's auto-fire-while-held behavior
let playerIsCrouching = false;

// Level 1 platform / building references (kept as named globals since the
// parallax update loop addresses each one individually)
let fireEscapePlatform;
let fireEscapePlatform2;
let fireEscapePlatform3;
let fireEscapePlatform4;
let fireEscapePlatform5;
let Building01roof;
let Building02roof;
let Building03roof;
let Building04roof;
let Building05roof;
let Building06roof;
let Building01LeftWall;
let Building03LeftWall;
let Building03RightWall;
let Building04LeftWall;
let Building04RightWall;
let billboardCatwalk;
let billboardJumpScaffoldPlatform;
let fireEscapePlatform6;
let fireEscapePlatform7;
let fireEscapePlatform8;
let fireEscapePlatform9;
let fireEscapePlatform10;
let fireEscapePlatform11;
let fireEscapePlatform12;
let fireEscapePlatform13;
let fireEscapePlatform14;
let fireEscapePlatform15;
let fireEscapePlatform16;
let fireEscapePlatform17;
let fireEscapePlatform18;

let Building07roof;
let Building08roof;
let Building09roof;
let Building10roof;
let Building11roof;
let Building12roof;

let Building07LeftWall;
let Building07RightWall;
let Building08LeftWall;
let Building08RightWall;
let building06ScaffoldPlatform;

// Enemy collections - add a new enemy with one spawnSlime()/spawnBat() call
// and it automatically gets patrolled/updated through these arrays.
let slimes = [];
let bats = [];

// Swoop bats are a separate enemy type from the normal patrolling bats
// above - they hover near a fixed spot and periodically dive at the
// player instead of flying back and forth between two bounds. Kept in
// their own array/functions so the existing spawnBat()/patrolBat() are
// never touched.
let swoopBats = [];

// Steam traps - environmental hazards on the street, not enemies. Each
// one cycles: idle (safe) -> erupting (animates steamTrap01/02 in a
// loop, damages the player on contact) -> idle again, repeating. Kept
// in their own array since they're not killable and have no health/hit
// logic at all, unlike every enemy type above.
let steamTraps = [];

// Junk Food Goblins - all three now go through spawnJunkFoodGoblin() and
// live in the junkFoodGoblins array, the same pattern as slimes/bats.
// canCooldown for throwing is tracked PER GOBLIN (goblin.canCooldown)
// instead of as a single global, so multiple goblins can throw on their
// own independent timers.
let jfgoblinCans;
let junkFoodGoblins = [];

let currentLevel = 'apartment';
// =========================
// DEBUG: START ON SPECIFIC LEVEL
// =========================
// Options:
// 'apartment'
// 'level1'
// 'sewer'
// 'level3'
const DEBUG_START_LEVEL = 'apartment';

// Optional spawn override.
// Leave as null to use that level's normal start position.
const DEBUG_START_X = null;
const DEBUG_START_Y = null;

const IS_STANDALONE =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone;

const config = {

  type: Phaser.AUTO,

  width: 1280,
  height: 720,

  scale: {
    mode: IS_STANDALONE ? Phaser.Scale.ENVELOP : Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  backgroundColor: '#000000',

  input: {
    activePointers: 3
  },

  // Debug Mode
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: [
    {
      key: 'ApartmentScene',
      preload: preload,
      create: create,
      update: update
    },
    {
      key: 'Level1Scene',
      create: createLevel1,
      update: updateLevel1
    },
        {
      key: 'SewerScene',
      create: createSewerScene,
      update: updateSewerScene
    },
    {
      key: 'Level3Scene',
      create: createLevel3,
      update: updateLevel3
    }
  ]
};
// =========================
// DEBUG: GET START SCENE
// =========================
function getDebugStartSceneKey() {

  if (DEBUG_START_LEVEL === 'level1') {
    return 'Level1Scene';
  }

  if (DEBUG_START_LEVEL === 'sewer') {
    return 'SewerScene';
  }

  if (DEBUG_START_LEVEL === 'level3') {
    return 'Level3Scene';
  }

  return 'ApartmentScene';
}


// =========================
// DEBUG: GET START POSITION
// =========================
function getDebugStartPosition(defaultX, defaultY) {
  return {
    x: DEBUG_START_X !== null ? DEBUG_START_X : defaultX,
    y: DEBUG_START_Y !== null ? DEBUG_START_Y : defaultY
  };
}
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

  // =========================
  // STREET GROUND
  // =========================
  this.load.image('streetGround', 'assets/street_ground.png');

  // =========================
  // CITY SKY
  // =========================
  this.load.image('citySky', 'assets/city_sky.png');

  // =========================
  // CITY buildings
  // =========================
  this.load.image('cityBuilding01', 'assets/city_building_01.png');
  this.load.image('cityBuilding02', 'assets/city_building_02.png');
  this.load.image('cityBuilding03', 'assets/city_building_03.png');

  // =========================
  // CITY Parking Lots
  // =========================
  this.load.image('cityParkingLot01', 'assets/city_parkinglot_01.png');
  this.load.image('cityParkingLot02', 'assets/city_parkinglot_02.png');

  // =========================
  // CITY Trucks
  // =========================
  this.load.image('cityTruck02', 'assets/city_truck_02.png');

  // =========================
  // CITY BILLBOARD
  // =========================
  this.load.image('cityBillboard01', 'assets/city_billboard_01.png');

  // =========================
  // CITY CATWALK
  // =========================
  this.load.image('cityRailing', 'assets/city_railing.png');

  // =========================
  // CITY SCAFFOLD PLATFORM
  // =========================
  this.load.image('cityScaffoldPlatform01', 'assets/city_scaffold_platform_01.png');

  // =========================
  // CITY Props
  // =========================
  this.load.image('vendingMachine', 'assets/vending.png');
  this.load.image('cityPolice', 'assets/city_police.png');
  this.load.image('cityCab', 'assets/city_cab.png');
  this.load.image('cityCar', 'assets/city_car.png');
  this.load.image('barricade', 'assets/barricade.png');
  this.load.image('steamTrap01', 'assets/city_steamtrap01.png');
  this.load.image('steamTrap02', 'assets/city_steamtrap02.png');
  this.load.image('cityTruck01', 'assets/city_truck_01.png');

  // =========================
  // CITY DoomBat
  // =========================
  this.load.image('batFly1', 'assets/bat_fly_1.png');
  this.load.image('batFly2', 'assets/bat_fly_2.png');
  this.load.image('batHit', 'assets/bat_hit.png');
  this.load.image('batDeath', 'assets/bat_death.png');

  // =========================
  // CITY Junk Food Goblin
  // =========================
  this.load.image('jfgoblinIdle', 'assets/jfgoblin_Idle.png');
  this.load.image('jfgoblinWalk1', 'assets/jfgoblin_walk1.png');
  this.load.image('jfgoblinWalk2', 'assets/jfgoblin_walk2.png');
  this.load.image('jfgoblinThrow1', 'assets/jfgoblin_throw1.png');
  this.load.image('jfgoblinThrow2', 'assets/jfgoblin_throw2.png');
  this.load.image('jfgoblinCan', 'assets/jfgoblin_can.png');
  this.load.image('jfgoblinHit', 'assets/jfgoblin_hit.png');
  this.load.image('jfgoblinDeath', 'assets/jfgoblin_death.png');

  // =========================
  // PICKUPS
  // =========================
  this.load.image('pickupPointsLarge', 'assets/pickup_points_large.png');
  this.load.image('pickupPointsSmall', 'assets/pickup_points_small.png');
  this.load.image('pickupUpgrade', 'assets/pickup_upgrade.png');
  this.load.image('pickupHealth', 'assets/pickup_health.png');
  this.load.image('level1EndSign', 'assets/city_level1_end.png');

   // =========================
  // SEWER ASSETS
  // =========================
  this.load.image('sewerSludge', 'assets/sewer_sludge.png');
  this.load.image('sewerSludge02', 'assets/sewer_sludge02.png');
  this.load.image('sewerSludge03', 'assets/sewer_sludge03.png');
    this.load.image('sewerPlatformLong', 'assets/sewer_platform_long.png');
  this.load.image('sewerPlatformMed', 'assets/sewer_platform_med.png');
  this.load.image('sewerPlatformSmall', 'assets/sewer_platform_small.png');
  this.load.image('sewerWallPlain', 'assets/sewer_wall_plain.png');
  this.load.image('sewerWallBars', 'assets/sewer_wall_bars.png');
  this.load.image('sewerWallEyes01', 'assets/sewer_wall_eyes01.png');
  this.load.image('sewerWallEyes02', 'assets/sewer_wall_eyes02.png');
  this.load.image('sewerWallEyes03', 'assets/sewer_wall_eyes03.png');
    this.load.image('sewerPipeStraight', 'assets/sewer_pipe_straight.png');
  this.load.image('sewerPipeVert', 'assets/sewer_pipe_vert.png');
  this.load.image('sewerPipeT', 'assets/sewer_pipe_t.png');
  this.load.image('sewerPipeValve', 'assets/sewer_pipe_valve.png');
    this.load.image('sewerSlimeDrop01', 'assets/sewer_slimedrop01.png');
  this.load.image('sewerSlimeDrop02', 'assets/sewer_slimedrop02.png');
  this.load.image('sewerSlimeDrop03', 'assets/sewer_slimedrop03.png');
  // =========================
  // SEWER HABIT RATS
  // =========================
  this.load.image('sewerRatAmbush01', 'assets/sewer_rat_ambush01.png');
  this.load.image('sewerRatAmbush02', 'assets/sewer_rat_ambush02.png');
  this.load.image('sewerRatAmbush03', 'assets/sewer_rat_ambush03.png');

  this.load.image('sewerRatRun01', 'assets/sewer_rat_run01.png');
  this.load.image('sewerRatRun02', 'assets/sewer_rat_run02.png');

  this.load.image('sewerRatEat01', 'assets/sewer_rat_eat01.png');
  this.load.image('sewerRatEat02', 'assets/sewer_rat_eat02.png');
    this.load.image('sewerRatHit', 'assets/sewer_rat_hit.png');
  this.load.image('sewerRatDeath', 'assets/sewer_rat_death.png');
  this.load.image('sewerRatPile', 'assets/sewer_rat_pile.png');
    this.load.image('sewerExit', 'assets/sewer_exit.png');
    this.load.image('sewerRatSkeleton', 'assets/sewer_rat_skeleton.png');

  // =========================
// LEVEL 3 INDUSTRIAL DISTRICT ASSETS
// =========================
this.load.image('industrialSky', 'assets/industrial_skybox.png');

this.load.image('industrialPlatform', 'assets/industrial_platform.png');
this.load.image('industrialPlatform2', 'assets/industrial_platform2.png');
this.load.image('industrialConveyor01', 'assets/industrial_conveyor01.png');
this.load.image('industrialConveyor02', 'assets/industrial_conveyor02.png');
this.load.image('industrialConveyor03', 'assets/industrial_conveyor03.png');
// LEVEL 3 ENEMIES — RECLINER CHARGER
this.load.image('chargerIdle01', 'assets/charger_idle01.png');
this.load.image('chargerIdle02', 'assets/charger_idle02.png');
this.load.image('chargerCharge01', 'assets/charger_charge01.png'); // pre-charge / shake
this.load.image('chargerCharge02', 'assets/charger_charge02.png'); // actual charge

// LEVEL 3 ENEMIES — JUNK FOOD DRONE
this.load.image('junkFoodDroneIdle01', 'assets/junk_food_drone_idle01.png');
this.load.image('junkFoodDroneIdle02', 'assets/junk_food_drone_idle02.png');
this.load.image('junkFoodDroneHit', 'assets/junk_food_drone_hit.png');
this.load.image('junkFoodDroneDeath', 'assets/junk_food_drone_death.png');
this.load.image('junkFoodDroneProjectile', 'assets/junk_food_drone_projectile.png');
this.load.image('industrialFloor', 'assets/industrial_floor.png');
this.load.image('industrialExit', 'assets/industrial_exit.png');
// LEVEL 3 BOSS — RECLINER TYRANT
this.load.image('reclinerTyrantIdle01', 'assets/recliner_tyrant_idle01.png');
this.load.image('reclinerTyrantIdle02', 'assets/recliner_tyrant_idle02.png');
this.load.image('reclinerTyrantHurt', 'assets/recliner_tyrant_hurt.png');
this.load.image('reclinerTyrantPhase3', 'assets/recliner_tyrant_phase3.png');
this.load.image('reclinerTyrantDead', 'assets/recliner_tyrant_dead.png');
this.load.image('reclinerTyrantDeath02', 'assets/recliner_tyrant_death02.png');
this.load.image('reclinerTyrantEject', 'assets/recliner_tyrant_eject.png');
this.load.image('reclinerTyrantHitEffect', 'assets/recliner_tyrant_hiteffct.png');
}


// =========================
// SHARED: CREATE PLAYER
// =========================
function createPlayer(scene, x, y) {

  const p = scene.physics.add.sprite(x, y, 'playerIdle');

  p.body.setCollideWorldBounds(true);
  p.setScale(0.15);
  p.setDepth(20);
  p.body.setSize(360, 520);
  p.body.setOffset(240, 500);

  if (!scene.anims.exists('idle')) {
    scene.anims.create({
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
  }

  if (!scene.anims.exists('jump')) {
    scene.anims.create({
      key: 'jump',
      frames: [
        { key: 'playerJump1' },
        { key: 'playerJump2' },
        { key: 'playerJump3' }
      ],
      frameRate: 8,
      repeat: 0
    });
  }

  if (!scene.anims.exists('run')) {
    scene.anims.create({
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
  }

  p.play('idle');

  return p;
}
// =========================
// SHARED: PLAYER BODY SIZE
// =========================
function setPlayerStandingBody() {
  if (!player || !player.body || player.currentBodyState === 'standing') {
    return;
  }

  player.body.setSize(360, 520);
  player.body.setOffset(240, 500);
  player.currentBodyState = 'standing';
}

function setPlayerCrouchBody() {
  if (!player || !player.body || player.currentBodyState === 'crouching') {
    return;
  }

  player.body.setSize(360, 330);
  player.body.setOffset(240, 690);
  player.currentBodyState = 'crouching';
}

// =========================
// SHARED: CREATE FADE SCREEN
// =========================
// Phaser destroys a scene's entire display list when that scene shuts
// down via scene.start() - fadeScreen was only ever created once, in
// the Apartment scene's create(), so once Apartment shuts down that
// rectangle is gone and the global fadeScreen variable points at a
// destroyed object. Every transition after that (Level1 -> Sewer, and
// onward) was tweening a dead target: the tween's timer/onComplete
// still ran on schedule, which is why the scene change itself worked,
// but nothing visibly faded since there was nothing left to fade.
// Each scene now creates its own fadeScreen the same way the apartment
// scene originally did.
function createFadeScreen(scene) {
  fadeScreen = scene.add.rectangle(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    GAME_WIDTH,
    GAME_HEIGHT,
    0x000000
  );
  fadeScreen.setScrollFactor(0);
  fadeScreen.setDepth(7000);
  fadeScreen.setAlpha(0);
}
// =========================
// SHARED: CREATE GAME OVER SCREEN
// =========================
function createGameOverScreen(scene) {
  gameOverScreen = scene.add.image(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2,
    'gameOverScreen'
  );

  gameOverScreen.setScrollFactor(0);
  gameOverScreen.setDepth(9000);
  gameOverScreen.setVisible(false);
  gameOverScreen.setInteractive();

  gameOverScreen.on('pointerdown', () => {
    if (playerLives <= 0) {
      location.reload();
    }
  });
}

// =========================
// SHARED: CREATE HUD
// =========================
function createHUD(scene) {

    // LEFT CONTROL PLATE
  scene.add.image(170, 590, 'controlPlate')
    .setScrollFactor(0)
    .setDepth(100)
    .setScale(0.72);

  // RIGHT CONTROL PLATE
  scene.add.image(1120, 590, 'controlPlate')
    .setScrollFactor(0)
    .setDepth(100)
    .setScale(0.72)
    .setFlipX(true);

  // LEFT BUTTON
  scene.leftButton = scene.add.image(138, 548, 'leftUp')
    .setScrollFactor(0)
    .setDepth(101)
    .setScale(0.66);

  scene.leftButton.setInteractive(
  new Phaser.Geom.Rectangle(
    -40,
    -40,
    scene.leftButton.width + 80,
    scene.leftButton.height + 80
  ),
  Phaser.Geom.Rectangle.Contains
);

  // RIGHT BUTTON
  scene.rightButton = scene.add.image(217, 548, 'rightUp')
    .setScrollFactor(0)
    .setDepth(101)
    .setScale(0.66);

  scene.rightButton.setInteractive(
  new Phaser.Geom.Rectangle(
    -40,
    -40,
    scene.rightButton.width + 80,
    scene.rightButton.height + 80
  ),
  Phaser.Geom.Rectangle.Contains
);

  // CROUCH BUTTON
  scene.crouchButton = scene.add.image(175, 622, 'crouchUp')
    .setScrollFactor(0)
    .setDepth(101)
    .setScale(0.64);

  scene.crouchButton.setInteractive(
  new Phaser.Geom.Rectangle(
    -40,
    -40,
    scene.crouchButton.width + 80,
    scene.crouchButton.height + 80
  ),
  Phaser.Geom.Rectangle.Contains
);

// FIRE BUTTON — right side of plate
scene.fireButton = scene.add.image(1155, 585, 'fireUp')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.10);

// Make Fire slightly taller after the object exists
scene.fireButton.setDisplaySize(
  scene.fireButton.displayWidth * 1.12,
  scene.fireButton.displayHeight * 1.18
);

scene.fireButton.setInteractive(
  new Phaser.Geom.Rectangle(
    -70,
    -70,
    scene.fireButton.width + 140,
    scene.fireButton.height + 140
  ),
  Phaser.Geom.Rectangle.Contains
);

// JUMP BUTTON — left side of plate
scene.jumpButton = scene.add.image(1070, 585, 'jumpUp')
  .setScrollFactor(0)
  .setDepth(101)
  .setScale(0.10);

scene.jumpButton.setInteractive(
  new Phaser.Geom.Rectangle(
    -70,
    -70,
    scene.jumpButton.width + 140,
    scene.jumpButton.height + 140
  ),
  Phaser.Geom.Rectangle.Contains
);
  // =========================
  // TOUCH CONTROL HANDLERS
  // =========================
  scene.leftButton.on('pointerdown', () => moveLeft = true);
  scene.leftButton.on('pointerup', () => moveLeft = false);
  scene.leftButton.on('pointerout', () => moveLeft = false);

  scene.rightButton.on('pointerdown', () => moveRight = true);
  scene.rightButton.on('pointerup', () => moveRight = false);
  scene.rightButton.on('pointerout', () => moveRight = false);

  scene.crouchButton.on('pointerdown', () => crouchPressed = true);
  scene.crouchButton.on('pointerup', () => crouchPressed = false);
  scene.crouchButton.on('pointerout', () => crouchPressed = false);

  scene.jumpButton.on('pointerdown', () => jumpPressed = true);
  scene.jumpButton.on('pointerup', () => jumpPressed = false);
  scene.jumpButton.on('pointerout', () => jumpPressed = false);

  scene.fireButton.on('pointerdown', () => {
    firePressed = true;
    if (!playerIsDead) {
      firePlayerBullet(scene);
    }
  });
  scene.fireButton.on('pointerup', () => firePressed = false);
  scene.fireButton.on('pointerout', () => firePressed = false);

  scene.input.addPointer(4);

  // =========================
  // HEALTH / LIVES / SCORE
  // =========================
  healthBar = scene.add.image(240, 95, 'health' + playerHealth)
    .setScrollFactor(0)
    .setDepth(101)
    .setScale(0.75);

  livesDisplay = scene.add.image(1080, 95, 'lives' + playerLives)
    .setScrollFactor(0)
    .setDepth(101)
    .setScale(0.75);

  scoreText = scene.add.text(560, 65, 'SCORE: ' + score, {
    fontSize: '32px',
    fill: '#ffffff'
  });
  scoreText.setScrollFactor(0);
  scoreText.setDepth(101);
}


// =========================
// SHARED: PLACE RANDOM CITY PROPS
// =========================
function placeRandomCityProps(scene, propList) {

  propList.forEach((prop) => {

    const assetKey = Phaser.Utils.Array.GetRandom(prop.assets);

    const placedProp = scene.add.image(prop.x, prop.y, assetKey);

    placedProp.setScale(prop.scale);
    placedProp.setDepth(prop.depth);
    placedProp.setScrollFactor(prop.scrollX, prop.scrollY);
  });
}


// =========================
// SHARED: FIRE PLAYER BULLET
// =========================
function firePlayerBullet(scene) {

  // Cooldown gate - did not exist before (every key-press fired
  // instantly). Without this, "fire rate increase" has nothing to
  // actually speed up. Default cooldown matches the previous "fire as
  // fast as you can press the key" feel closely enough not to be
  // noticeable in normal play; the firerate upgrade cuts it further.
  if (scene.time.now < nextShotAllowedAt) {
    return;
  }
  const cooldown = activeUpgrade === 'firerate' ? UPGRADED_FIRE_COOLDOWN_MS : NORMAL_FIRE_COOLDOWN_MS;
  nextShotAllowedAt = scene.time.now + cooldown;

  let bulletX;
  let bulletY;

  if (playerIsCrouching) {
    bulletY = player.y - 20;
  } else if (!player.body.blocked.down) {
    bulletY = player.y - 55;
  } else {
    bulletY = player.y - 40;
  }

  if (!player.flipX) {
    bulletX = player.x + 65;
  } else {
    bulletX = player.x - 65;
  }

  // Single bullet-creation helper so spread (3 angled bullets) and the
  // normal single shot both go through identical setup - avoids
  // duplicating the gravity/depth/power/homing flags three times.
  const makeBullet = (vx, vy) => {
    const bullet = bullets.create(bulletX, bulletY, 'bullet');
    bullet.setDepth(40);
    bullet.body.allowGravity = false;
    bullet.setVelocity(vx, vy);

    if (player.flipX) {
      bullet.setFlipX(true);
    }

    bullet.startX = bullet.x;
    bullet.maxDistance = GAME_WIDTH;

    // 'power' upgrade: bigger visual + one-shot-kills-everything flag
    // (checked in hitSlime/hitBat/hitJunkFoodGoblin - bosses excluded
    // per spec, but there are no bosses yet so this currently applies
    // to every enemy type that exists).
    if (activeUpgrade === 'power') {
      bullet.setScale(3.2);
      bullet.isPowerShot = true;
    }

    // 'homing' upgrade: tagged here, steering itself happens in
    // cullOffscreenBullets()'s sibling update pass (added below) so
    // every bullet's homing behavior lives in one place rather than
    // duplicated per-bullet-type.
    if (activeUpgrade === 'homing') {
      bullet.isHoming = true;
    }

    return bullet;
  };

  const speed = 800 * (player.flipX ? -1 : 1);

  if (activeUpgrade === 'spread') {
    // 3-bullet fan, Contra-style: straight, and two angled up/down.
    makeBullet(speed, 0);
    makeBullet(speed, -180);
    makeBullet(speed, 180);
  } else {
    makeBullet(speed, 0);
  }

  // MUZZLE FLASH
  const muzzleFlash = scene.add.image(bulletX, bulletY, 'muzzleFlash');
  muzzleFlash.setDepth(40);

  if (player.flipX) {
    muzzleFlash.setFlipX(true);
  }

  scene.time.delayedCall(40, () => {
    muzzleFlash.destroy();
  });

  // SHELL CASING
  const casing = casings.create(player.x, player.y - 70, 'casing');
  casing.body.allowGravity = true;
  casing.setDepth(40);
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

  scene.time.delayedCall(8000, () => {
    if (casing.active) {
      casing.destroy();
    }
  });
}


// =========================
// HOMING ROUNDS - STEER ACTIVE HOMING BULLETS TOWARD NEAREST ENEMY
// =========================
// Called once per frame from both update() and updateLevel1(), right
// alongside cullOffscreenBullets(). Only touches bullets tagged
// isHoming (set in firePlayerBullet() while the 'homing' upgrade is
// active) - every other bullet is completely unaffected and keeps
// flying in a straight line exactly as before.
function updateHomingBullets(scene, enemyList) {

  bullets.children.iterate((bullet) => {
    if (!bullet || !bullet.active || !bullet.isHoming) {
      return;
    }

    let nearest = null;
    let nearestDist = Infinity;

    enemyList.forEach(enemy => {
      if (!enemy || !enemy.active || enemy.isDead) {
        return;
      }
      const d = Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = enemy;
      }
    });

    if (!nearest) {
      return; // no live target - keep flying straight
    }

    const currentSpeed = Math.sqrt(bullet.body.velocity.x ** 2 + bullet.body.velocity.y ** 2) || 800;
    const dx = nearest.x - bullet.x;
    const dy = nearest.y - bullet.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Steer gradually toward the target rather than snapping directly
    // onto it, so it still reads as a flying bullet curving in rather
    // than teleporting onto a new heading.
    const steerStrength = 0.15;
    const targetVx = (dx / dist) * currentSpeed;
    const targetVy = (dy / dist) * currentSpeed;

    bullet.setVelocity(
      bullet.body.velocity.x + (targetVx - bullet.body.velocity.x) * steerStrength,
      bullet.body.velocity.y + (targetVy - bullet.body.velocity.y) * steerStrength
    );
  });
}


// =========================
// SHARED: BULLET OFFSCREEN CLEANUP
// =========================
// Replaces the duplicated bullets.children.iterate(...) block that was
// pasted into both update() and updateLevel1().
function cullOffscreenBullets(scene) {
  bullets.children.iterate((bullet) => {
    if (!bullet || !bullet.active) {
      return;
    }

    const camera = scene.cameras.main;

    if (
      bullet.x < camera.scrollX - 50 ||
      bullet.x > camera.scrollX + GAME_WIDTH + 50
    ) {
      bullet.disableBody(true, true);
    }
  });
}


// =========================
// SHARED: RANDOM STREET PROPS
// =========================
function placeRandomStreetProps(scene, startX, endX, spacing) {

  const streetProps = [
    { key: 'cityCab', scale: 0.35 },
    { key: 'cityCab', scale: 0.35 },
    { key: 'cityCar', scale: 0.35 },
    { key: 'cityCar', scale: 0.35 },
    { key: 'cityPolice', scale: 0.35 },
    { key: 'vendingMachine', scale: 0.2 }
  ];

  for (let x = startX; x < endX; x += spacing) {

    // 60% chance to place nothing
    if (Phaser.Math.Between(1, 100) <= 60) {
      continue;
    }

    const propData = Phaser.Utils.Array.GetRandom(streetProps);

    const propY = propData.key === 'vendingMachine' ? 355 : 405;

    const prop = scene.add.image(
      x + Phaser.Math.Between(-80, 80),
      propY,
      propData.key
    );

    prop.setScale(propData.scale);
    prop.setDepth(7);
    prop.setScrollFactor(1);
  }
}


// =========================
// SHARED: STOP CASINGS SPINNING ONCE LANDED
// =========================
function settleCasings() {

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
}


// =========================
// SHARED: SPAWN A SLIME
// =========================
function spawnSlime(
  scene,
  x,
  y,
  groundObject,
  leftBound,
  rightBound,
  direction = -1,
  bodyConfig = null
) {

  const slimeObj = scene.physics.add.sprite(x, y, 'slimeWalk1');

  slimeObj.setScale(1);
  slimeObj.setDepth(15);
  slimeObj.health = 2;
  slimeObj.isDead = false;
    // Level 1 slime alignment:
  // Smaller, higher body lets the visible slime sit lower on the street.
  if (currentLevel === 'level1' && !bodyConfig) {
    bodyConfig = {
  width: 0.65,
  height: 0.75,
  offsetX: 0.175,
  offsetY: 0.02
};
  }
    if (bodyConfig) {
    slimeObj.body.setSize(
      slimeObj.width * bodyConfig.width,
      slimeObj.height * bodyConfig.height
    );

    slimeObj.body.setOffset(
      slimeObj.width * bodyConfig.offsetX,
      slimeObj.height * bodyConfig.offsetY
    );
  }
  slimeObj.direction = direction;
  slimeObj.leftBound = leftBound;
  slimeObj.rightBound = rightBound;

  if (!scene.anims.exists('slimeWalk')) {
    scene.anims.create({
      key: 'slimeWalk',
      frames: [
        { key: 'slimeWalk1' },
        { key: 'slimeWalk2' }
      ],
      frameRate: 4,
      repeat: -1
    });
  }
  slimeObj.play('slimeWalk');

  if (groundObject) {
    scene.physics.add.collider(slimeObj, groundObject);
  }

  scene.physics.add.overlap(bullets, slimeObj, hitSlime, null, scene);
  scene.physics.add.overlap(player, slimeObj, hurtPlayer, null, scene);

  slimes.push(slimeObj);

  return slimeObj;
}


// =========================
// SHARED: SPAWN A BAT
// =========================
function spawnBat(scene, x, y, leftBound, rightBound, direction = -1, parallaxFactor = 1) {

  const batObj = scene.physics.add.sprite(x, y, 'batFly1');

  batObj.setDepth(30);
  batObj.body.allowGravity = false;
  batObj.setScale(0.1);
  batObj.health = 3;
  batObj.isDead = false;

  // Default parallaxFactor of 1 means "scroll at normal full world
  // speed" - exactly how every existing call to spawnBat() already
  // behaves, since none of them pass this new param. Only bats that
  // explicitly need to track a slower-scrolling platform/goblin (like
  // the two new ones over the fire-escape goblins) pass something
  // other than 1.
  batObj.baseX = x;
  batObj.parallaxFactor = parallaxFactor;
  batObj.direction = direction;
  batObj.leftBound = leftBound;
  batObj.rightBound = rightBound;

  if (parallaxFactor !== 1) {
    // This bat is moved entirely via setPosition() in patrolBat(), not
    // through physics velocity. body.moves=false tells Arcade Physics
    // to stop running its own position/velocity integration on this
    // body every step, while the body stays active so the existing
    // bullet/player overlaps still work normally.
    batObj.body.moves = false;
  }

  if (!scene.anims.exists('batFly')) {
    scene.anims.create({
      key: 'batFly',
      frames: [
        { key: 'batFly1' },
        { key: 'batFly2' }
      ],
      frameRate: 6,
      repeat: -1
    });
  }
  batObj.play('batFly');

  scene.physics.add.overlap(bullets, batObj, hitBat, null, scene);
  scene.physics.add.overlap(player, batObj, hurtPlayer, null, scene);

  bats.push(batObj);

  return batObj;
}


// =========================
// SHARED: SPAWN A JUNK FOOD GOBLIN
// =========================
// Every goblin (the original street one, the second street one, and the
// patrolling billboard one) goes through this single function so every
// goblin automatically gets: a bullet overlap (so it CAN be shot),
// parallax positioning, and - if patrolLeft/patrolRight are supplied -
// ground patrol behavior. canThrow controls whether this particular
// goblin throws cans at the player at all (the patrolling billboard
// goblin does not throw; the two stationary street-level goblins do).
function spawnJunkFoodGoblin(scene, x, y, options = {}) {

  const {
    patrolLeft = null,
    patrolRight = null,
    canThrow = true,
    parallaxFactor = 0.6
  } = options;

  const goblin = scene.physics.add.sprite(x, y, 'jfgoblinIdle');

  goblin.setDepth(20);
  goblin.setScale(0.1);

  // Gravity OFF. These goblins stand on platforms (fireEscapePlatform,
  // fireEscapePlatform7, billboardCatwalk) that are manually repositioned
  // every frame by updateParallaxObject() rather than scrolling normally
  // with the world - they're not stable physics surfaces. Real gravity +
  // colliders fundamentally fight that setup (the platform teleports out
  // from under the goblin every frame), which is what caused the
  // falling/jitter on death. Floating + fixed Y is correct here, the
  // same way fireEscapePlatform/billboardCatwalk themselves have no
  // gravity either.
  goblin.body.allowGravity = false;

  // Anchor to bottom-center instead of Phaser's default center origin.
  // This means the Y you pass into spawnJunkFoodGoblin(scene, x, y, ...)
  // is "where the goblin's FEET should land" - not the sprite's middle.
  // That makes platform-matching math (goblin Y = platform top Y)
  // actually correct instead of needing to guess an offset for half the
  // sprite's height every time.
  goblin.setOrigin(0.5, 1);

  goblin.health = 3;
  goblin.isDead = false;

  // Parallax - every goblin needs baseX/parallaxFactor or it will drift
  // out of sync with the rest of the level as the camera scrolls. This
  // was missing for goblin2/goblin3 before, which is why they looked
  // wrong as soon as the camera moved.
  goblin.baseX = x;
  goblin.parallaxFactor = parallaxFactor;

  // Patrol setup (billboard goblin uses this, street goblins don't)
  goblin.canPatrol = patrolLeft !== null && patrolRight !== null;
  goblin.direction = 1;
  goblin.leftBound = patrolLeft;
  goblin.rightBound = patrolRight;

  // Throw setup - tracked per-goblin so multiple goblins throw on their
  // own independent timers instead of sharing one global cooldown.
  goblin.canThrow = canThrow;
  goblin.canCooldown = 0;
  goblin.isThrowing = false;

  if (!scene.anims.exists('jfgoblinWalk')) {
    scene.anims.create({
      key: 'jfgoblinWalk',
      frames: [
        { key: 'jfgoblinWalk1' },
        { key: 'jfgoblinWalk2' }
      ],
      frameRate: 4,
      repeat: -1
    });
  }

  // THIS overlap is what was missing for goblin2/goblin3 in the previous
  // version - without it, bullets pass straight through and the goblin
  // can never be shot.
  scene.physics.add.overlap(bullets, goblin, hitJunkFoodGoblin, null, scene);

  // If the goblin can throw cans at the player, also let those cans
  // damage the player on contact.
  if (canThrow) {
    scene.physics.add.overlap(player, jfgoblinCans, hurtPlayer, null, scene);
  }

  junkFoodGoblins.push(goblin);

  return goblin;
}


// =========================
// HIT JUNK FOOD GOBLIN FUNCTION
// =========================
function hitJunkFoodGoblin(objectA, objectB) {

  let bulletObject;
  let goblinObject;

  if (objectA.texture.key === 'bullet') {
    bulletObject = objectA;
    goblinObject = objectB;
  } else {
    bulletObject = objectB;
    goblinObject = objectA;
  }

  if (!bulletObject.active || bulletObject.hasHit || goblinObject.isDead) {
    return;
  }

  bulletObject.hasHit = true;
  bulletObject.disableBody(true, true);

  goblinObject.health = bulletObject.isPowerShot ? 0 : goblinObject.health - 1;

  console.log("Junk Food Goblin health:", goblinObject.health);

  // Spawn a separate hit-flash sprite ON TOP of the goblin instead of
  // calling setTexture('jfgoblinHit') on the goblin itself - the old
  // version was swapping the goblin's own texture out for 120ms, which
  // looked like the sprite got replaced rather than flashing over it.
  // hitSlime()/hitBat() already do it this correct way; this brings the
  // goblin in line with that same pattern.
  const hitEffect = goblinObject.scene.add.image(
    goblinObject.x,
    goblinObject.y,
    'jfgoblinHit'
  );
  hitEffect.setOrigin(0.5, 1); // match the goblin's bottom-anchored origin
  hitEffect.setScale(goblinObject.scaleX, goblinObject.scaleY);
  hitEffect.setFlipX(goblinObject.flipX);
  hitEffect.setDepth(goblinObject.depth + 1);

  goblinObject.scene.time.delayedCall(120, () => {
    hitEffect.destroy();
  });

  if (goblinObject.health > 0) {
    return;
  }

  goblinObject.isDead = true;
  goblinObject.body.setVelocity(0, 0);
  goblinObject.body.allowGravity = false; // explicit guard - gravity is
  // already off for goblins at spawn, but this re-asserts it the instant
  // death happens so there is zero window, however small, where the
  // body could pick up a downward velocity before disableBody() runs
  // 500ms later.
  goblinObject.setTexture('jfgoblinDeath');

  addScore(300);

  goblinObject.scene.time.delayedCall(500, () => {
    goblinObject.disableBody(true, true);
  });
}


// =========================
// JUNK FOOD GOBLIN THROW CAN
// =========================
// Now takes the goblin as a parameter instead of always referencing one
// hardcoded global, so every throwing goblin can use this same function.
function junkFoodGoblinThrowCan(scene, goblin) {

  if (!goblin || !goblin.active || goblin.isDead) {
    return;
  }

  const facingLeft = player.x < goblin.x;
  const direction = facingLeft ? -1 : 1;

  // Block patrolJunkFoodGoblin()'s walk animation from overriding the
  // throw frames while this sequence plays out.
  goblin.isThrowing = true;

  goblin.setTexture('jfgoblinThrow1');
  goblin.setFlipX(!facingLeft);

  scene.time.delayedCall(150, () => {

    if (!goblin || goblin.isDead) {
      return;
    }

    goblin.setTexture('jfgoblinThrow2');
    goblin.setFlipX(!facingLeft);

    // goblin.y is now the goblin's FEET (origin is bottom-anchored via
    // setOrigin(0.5, 1) in spawnJunkFoodGoblin), not its center, so
    // "goblin.y - 10" was spawning the can right at ankle height. The
    // can needs to come out near hand/chest height instead - roughly
    // 70% of the sprite's height up from the feet. Using
    // goblin.displayHeight keeps this correct even if a goblin's scale
    // ever changes.
    const handY = goblin.y - (goblin.displayHeight * 0.7);

    const can = jfgoblinCans.create(
      goblin.x + (40 * direction),
      handY,
      'jfgoblinCan'
    );

    can.setDepth(30);
    can.setScale(0.05);
    can.body.allowGravity = true;

    can.setVelocity(300 * direction, -250);
    can.setAngularVelocity(400 * direction);
  });

  scene.time.delayedCall(400, () => {
    goblin.isThrowing = false;
    if (goblin && !goblin.isDead) {
      goblin.setTexture('jfgoblinIdle');
      goblin.setFlipX(!facingLeft);
    }
  });
}


// =========================
// SHARED: PATROL A SLIME (ground enemy)
// =========================
function patrolSlime(slimeObject, speed) {
  if (!slimeObject || !slimeObject.active || !slimeObject.body || slimeObject.isDead) {
    return;
  }

  slimeObject.setVelocityX(speed * slimeObject.direction);

  if (slimeObject.x >= slimeObject.rightBound) {
    slimeObject.direction = -1;
  }

  if (slimeObject.x <= slimeObject.leftBound) {
    slimeObject.direction = 1;
  }

  slimeObject.setFlipX(slimeObject.direction === 1);
}


// =========================
// SHARED: PATROL A BAT (flying enemy)
// =========================
function patrolBat(batObject, speed = 220, scene = null) {
  if (!batObject || !batObject.active || !batObject.body || batObject.isDead) {
    return;
  }

  const usesParallax = scene && batObject.parallaxFactor !== 1;

  if (usesParallax) {
    // For parallax-tracked bats, drive movement by advancing baseX
    // directly (same pattern the goblins use) instead of real physics
    // velocity. The previous version let setVelocityX move the body,
    // then captured that as baseX, then ALSO manually repositioned the
    // body from baseX via the parallax formula - each frame compounding
    // on top of the last frame's already-shifted position, which is
    // exactly what caused the bat to accelerate away and "race by."
    // Driving from baseX alone removes the feedback loop entirely.
    const deltaMs = scene.game.loop.delta;
    batObject.baseX += (speed * batObject.direction) * (deltaMs / 1000);

    if (batObject.baseX <= batObject.leftBound) {
      batObject.direction = 1;
    }
    if (batObject.baseX >= batObject.rightBound) {
      batObject.direction = -1;
    }

    // setPosition() only moves the sprite's visible transform. The
    // previous version called body.updateFromGameObject() + setVelocity
    // every frame, which re-syncs Arcade Physics' internal previous-
    // position/velocity bookkeeping each frame even though this bat
    // never actually needs real collision - that resync fighting with
    // the engine's own physics step is what produced the stutter when
    // moving right (the body's own velocity-derived interpolation
    // disagreeing with the manual override). These bats have no
    // gravity and no collider, so the physics body can be disabled
    // outright and movement handled purely visually.
    batObject.setPosition(
      batObject.baseX + scene.cameras.main.scrollX * (1 - batObject.parallaxFactor),
      batObject.y
    );

  } else {
    // Default behavior for every normal bat (parallaxFactor === 1) -
    // completely unchanged from before this fix.
    batObject.body.setVelocityX(speed * batObject.direction);
    batObject.body.setVelocityY(0);

    if (batObject.body.x <= batObject.leftBound) {
      batObject.direction = 1;
    }
    if (batObject.body.x >= batObject.rightBound) {
      batObject.direction = -1;
    }
  }

  batObject.setFlipX(batObject.direction === 1);
}


// =========================
// SHARED: SPAWN A SWOOP BAT (high-road only - dives at the player)
// =========================
// Separate enemy type from the normal patrolling bat above. Hovers
// around its spawn point (homeX/homeY) and, once the player gets close
// enough horizontally, dives straight down/toward them, then climbs back
// up to its hover point afterward. Uses the same batFly1/batFly2 anim,
// hit/death effects, and bullet overlap as the normal bat - only the
// movement behavior differs.
function spawnSwoopBat(scene, x, y) {

  const batObj = scene.physics.add.sprite(x, y, 'batFly1');

  batObj.setDepth(30);
  batObj.body.allowGravity = false;
  batObj.setScale(0.1);
  batObj.health = 3;
  batObj.isDead = false;

  // setScrollFactor only changes where a sprite is DRAWN on screen - it
  // does not move the sprite's real x/y or its physics body at all.
  // That's why the hitbox stayed at the original spawn point while the
  // visible sprite appeared to drift: the render position and the real
  // position were never the same thing once scrollFactor was involved.
  // Reverting to a real baseX + manual per-frame position update
  // instead - same approach the goblins use - which actually moves both
  // the sprite AND its body together.
  batObj.baseX = x;
  batObj.parallaxFactor = 0.6;

  // Swoop-specific state
  batObj.homeX = x;
  batObj.homeY = y;
  batObj.isSwooping = false;
  batObj.swoopCooldown = 0;

  if (!scene.anims.exists('batFly')) {
    scene.anims.create({
      key: 'batFly',
      frames: [
        { key: 'batFly1' },
        { key: 'batFly2' }
      ],
      frameRate: 6,
      repeat: -1
    });
  }
  batObj.play('batFly');

  scene.physics.add.overlap(bullets, batObj, hitBat, null, scene);
  scene.physics.add.overlap(player, batObj, hurtPlayer, null, scene);

  swoopBats.push(batObj);

  return batObj;
}


// =========================
// SHARED: UPDATE A SWOOP BAT
// =========================
// Called once per swoop bat per frame from updateLevel1(). Hovers with a
// gentle bob at homeX/homeY. When the player comes within range and the
// cooldown has expired, dives toward the player's position, then eases
// back up to its hover point.
function updateSwoopBat(scene, batObject, speed = 260) {

  if (!batObject || !batObject.active || batObject.isDead) {
    return;
  }

  // Recalculate where "home" actually is in world space this frame,
  // based on the same parallax formula the billboard/goblin use. The
  // bat's actual movement still happens through setVelocity() below
  // (real physics, so the hitbox and the visible sprite always move
  // together) - this just keeps correcting WHERE home is, since the
  // billboard itself is drifting at 0.6 while the bat's spawn point
  // was a fixed value that never accounted for camera scroll at all.
  const currentHomeX = batObject.baseX + scene.cameras.main.scrollX * (1 - batObject.parallaxFactor);

  // batFly art faces LEFT by default (confirmed by patrolBat's
  // convention: setFlipX(direction === 1) only flips when moving
  // right). So flip only when the player is to the RIGHT of the bat -
  // the previous condition had this backwards, which is why the bat
  // looked like it was flying away from the player instead of facing it.
  batObject.setFlipX(player.x > batObject.x);

  if (batObject.isSwooping) {
    // Dive toward where the player was when the swoop started.
    const dx = batObject.swoopTargetX - batObject.x;
    const dy = batObject.swoopTargetY - batObject.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 20) {
      // Reached the dive target - head back up to the hover point.
      batObject.isSwooping = false;
      batObject.swoopCooldown = scene.time.now + 2500;
    } else {
      batObject.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    }
    return;
  }

  // Not swooping - hover near the (parallax-corrected) home position
  // with a small bob.
  const returnDx = currentHomeX - batObject.x;
  const returnDy = batObject.homeY - batObject.y;
  batObject.setVelocity(returnDx * 2, returnDy * 2 + Math.sin(scene.time.now * 0.003) * 20);

  const distFromHome = Math.abs(batObject.x - player.x);

  if (distFromHome < 400 && scene.time.now > batObject.swoopCooldown) {
    batObject.isSwooping = true;
    batObject.swoopTargetX = player.x;
    batObject.swoopTargetY = player.y;
  }
}


// =========================
// SHARED: SPAWN A STEAM TRAP (street-level environmental hazard)
// =========================
// Not an enemy - no health, can't be killed, never overlaps with
// bullets. Cycles between a safe "idle" state (just the manhole, no
// steam) and an "erupting" state where it alternates steamTrap01/02 for
// a couple seconds and damages the player on contact, then goes back to
// idle. idleDuration/eruptDuration control the timing of that cycle, in
// milliseconds, and can be staggered per-trap via the startOffset param
// so multiple traps don't all erupt in perfect unison.
function spawnSteamTrap(scene, x, y, options = {}) {

  const {
    idleDuration = 3000,
    eruptDuration = 2000,
    startOffset = 0
  } = options;

  const trap = scene.physics.add.staticSprite(x, y, 'steamTrap01');

  trap.setDepth(8); // above street props (cars/vending at depth 7), below player/enemies
  trap.setScale(0.12);
  trap.setVisible(false); // hidden while idle - only shown while erupting

  trap.isErupting = false;
  trap.idleDuration = idleDuration;
  trap.eruptDuration = eruptDuration;
  trap.stateChangeAt = scene.time.now + idleDuration + startOffset;
  trap.frameToggle = 0;
  trap.frameTimer = 0;

  // Shrink the damage hitbox to roughly the steam plume itself rather
  // than the whole sprite bounding box, so the player only takes damage
  // when actually standing in the steam, not just near the manhole.
  trap.body.setSize(trap.width * 0.09, trap.height * 0.2);
  trap.body.setOffset(trap.width * 0.455, trap.height * 0.4);

  // The processCallback (4th arg) must accept (obj1, obj2) per Phaser's
  // API even though it doesn't need either argument here - it just
  // gates whether hurtPlayer() fires at all based on whether the trap
  // is currently erupting.
  scene.physics.add.overlap(player, trap, hurtPlayer, () => trap.isErupting, scene);

  steamTraps.push(trap);

  return trap;
}


// =========================
// SHARED: UPDATE A STEAM TRAP
// =========================
// Called once per steam trap per frame from updateLevel1(). Handles the
// idle/erupt cycle and the 01/02 animation loop while erupting.
function updateSteamTrap(scene, trap) {

  if (!trap || !trap.active) {
    return;
  }

  if (scene.time.now >= trap.stateChangeAt) {

    trap.isErupting = !trap.isErupting;

    if (trap.isErupting) {
      trap.stateChangeAt = scene.time.now + trap.eruptDuration;
      trap.frameTimer = 0;
      trap.frameToggle = 0;
      trap.setTexture('steamTrap01');
      trap.setVisible(true); // only visible during the eruption
    } else {
      trap.stateChangeAt = scene.time.now + trap.idleDuration;
      trap.setVisible(false); // hidden again once it's done erupting
    }
  }

  if (!trap.isErupting) {
    return;
  }

  // Alternate steamTrap01/02 every 200ms while erupting, the same
  // hand-rolled two-frame loop pattern slimes/bats use via
  // scene.anims, just done manually here since this is a static body
  // (anims work fine on static sprites too, but this keeps the trap's
  // whole lifecycle - including the idle/erupt timer - in one place).
  trap.frameTimer += scene.game.loop.delta;

  if (trap.frameTimer >= 200) {
    trap.frameTimer = 0;
    trap.frameToggle = trap.frameToggle === 0 ? 1 : 0;
    trap.setTexture(trap.frameToggle === 0 ? 'steamTrap01' : 'steamTrap02');
  }
}


// =========================
// SHARED: SPAWN A PICKUP
// =========================
// type is one of: 'pointsLarge', 'pointsSmall', 'upgrade', 'health'.
// All four are placed by hand via this one function - no automatic
// enemy-drop logic, per the fixed-placement design. Pickups float in
// place with a small bob and get collected via overlap with the player.
function spawnPickup(scene, x, y, type, parallaxFactor = 1) {

  const textureKey = {
    pointsLarge: 'pickupPointsLarge',
    pointsSmall: 'pickupPointsSmall',
    upgrade: 'pickupUpgrade',
    health: 'pickupHealth'
  }[type];

  const pickup = scene.physics.add.sprite(x, y, textureKey);

  pickup.setDepth(25);
  pickup.setScale(0.15);
  pickup.body.allowGravity = false;

  // Default body size is the FULL native sprite dimensions, which is
  // why the overlap zone was reaching well above the visible icon -
  // if the source PNG has empty padding above the actual art (common
  // for icon-style assets), the hitbox extends into that empty space
  // and lets the player collect it from a platform above without
  // actually dropping down to it. Shrinking to roughly the visible
  // icon's footprint fixes that.
  pickup.body.setSize(pickup.width * 0.5, pickup.height * 0.5);
  pickup.body.setOffset(pickup.width * 0.25, pickup.height * 0.25);
  pickup.pickupType = type;
  pickup.baseY = y;
  pickup.bobOffset = Phaser.Math.FloatBetween(0, Math.PI * 2); // desync the bob between pickups

  // Default parallaxFactor of 1 = normal full-speed world scroll, which
  // is exactly how ground pickups (health, etc.) already need to
  // behave. Elevated pickups sitting on a fire-escape/roof need to
  // match that platform's actual scroll speed (0.6 throughout this
  // level) or they drift away from the platform the instant the
  // camera moves - which is exactly what was happening here before.
  pickup.baseX = x;
  pickup.parallaxFactor = parallaxFactor;

  scene.physics.add.overlap(player, pickup, collectPickup, null, scene);

  pickups.push(pickup);

  return pickup;
}


// =========================
// SHARED: UPDATE A PICKUP (gentle bob while uncollected)
// =========================
function updatePickup(scene, pickup) {
  if (!pickup || !pickup.active) {
    return;
  }

  pickup.y = pickup.baseY + Math.sin(scene.time.now * 0.004 + pickup.bobOffset) * 6;

  // Only pickups tracking a slower-scrolling platform (parallaxFactor
  // !== 1) need their x corrected here - ground pickups default to 1
  // and skip this entirely, identical to their behavior before this
  // fix. setPosition only touches the visible transform, not the
  // physics body, avoiding the same feedback-loop bug the swoop bats
  // hit earlier when this was done via body.updateFromGameObject().
  if (pickup.parallaxFactor !== 1) {
    pickup.x = pickup.baseX + scene.cameras.main.scrollX * (1 - pickup.parallaxFactor);
  }
}


// =========================
// COLLECT PICKUP
// =========================
function collectPickup(playerObject, pickup) {

  if (!pickup.active) {
    return;
  }

  const type = pickup.pickupType;
  pickup.disableBody(true, true);

  if (type === 'pointsLarge') {
    addScore(500);

  } else if (type === 'pointsSmall') {
    addScore(150);

  } else if (type === 'health') {
    // Full health restore, does NOT add a life - matches the spec
    // exactly: "full restore but not restore lives."
    playerHealth = 3;
    healthBar.setTexture('health3');

  } else if (type === 'upgrade') {
    activateRandomUpgrade(playerObject.scene);
  }
}


// =========================
// ACTIVATE A RANDOM WEAPON UPGRADE
// =========================
// All 4 upgrade types share equal odds. Picking up a new upgrade while
// one is already active immediately switches to the new type and
// refreshes the full 30-second timer, rather than stacking or being
// blocked - so grabbing upgrades back-to-back during a hot streak is
// always a clean win, never wasted.
function activateRandomUpgrade(scene) {

  const upgradeTypes = ['spread', 'firerate', 'power', 'homing'];
  activeUpgrade = Phaser.Utils.Array.GetRandom(upgradeTypes);
  upgradeExpiresAt = scene.time.now + 30000; // 30 seconds

  const labels = {
    spread: 'SPREAD SHOT',
    firerate: 'RAPID FIRE',
    power: 'POWER SHOT',
    homing: 'HOMING ROUNDS'
  };

  if (upgradeText) {
    upgradeText.destroy();
  }

  upgradeText = scene.add.text(640, 115, labels[activeUpgrade], {
  fontSize: '24px',
  fill: '#ffff00'
    });
  upgradeText.setScrollFactor(0);
  upgradeText.setDepth(101);
  upgradeText.setOrigin(0.5, 0);
}


// =========================
// UPDATE ACTIVE UPGRADE (countdown / expiry)
// =========================
// Called once per frame from both update() and updateLevel1(). Clears
// activeUpgrade back to null (normal fire behavior) once the 30 seconds
// run out, and keeps the on-screen label's countdown current.
function updateActiveUpgrade(scene) {

  if (!activeUpgrade) {
    return;
  }

  const msRemaining = upgradeExpiresAt - scene.time.now;

  if (msRemaining <= 0) {
    activeUpgrade = null;
    if (upgradeText) {
      upgradeText.destroy();
      upgradeText = null;
    }
    return;
  }

  if (upgradeText) {
    const secondsRemaining = Math.ceil(msRemaining / 1000);
    const labels = {
      spread: 'SPREAD SHOT',
      firerate: 'RAPID FIRE',
      power: 'POWER SHOT',
      homing: 'HOMING ROUNDS'
    };
    upgradeText.setText(labels[activeUpgrade] + ' - ' + secondsRemaining + 's');
  }
}


// =========================
// SHARED: PATROL A JUNK FOOD GOBLIN (billboard-style ground patrol)
// =========================
// IMPORTANT: this updates goblin.baseX, not goblin.x directly. The
// parallax loop in updateLevel1() runs every frame AFTER this and does
// `goblin.x = goblin.baseX + scrollX * (1 - parallaxFactor)` - if this
// function only moved goblin.x, the parallax line would immediately
// snap it back to baseX and the goblin would never visibly move. By
// advancing baseX instead, the parallax recalculation carries the
// patrol movement forward instead of erasing it.
function patrolJunkFoodGoblin(goblin, speed = 30) {
  if (!goblin || !goblin.active || goblin.isDead || !goblin.canPatrol) {
    return;
  }

  // No gravity on these goblins, so there's no physics body to drive via
  // setVelocityX - just advance baseX directly. The parallax line in
  // updateLevel1() reads baseX every frame and adds the scroll offset on
  // top of it, which is what actually moves the goblin on screen.
  goblin.baseX += (speed * goblin.direction) / 60; // ~speed px/sec at 60fps

  if (goblin.baseX >= goblin.rightBound) {
    goblin.direction = -1;
  }

  if (goblin.baseX <= goblin.leftBound) {
    goblin.direction = 1;
  }

  goblin.setFlipX(goblin.direction === 1);

  if (!goblin.isThrowing) {
    goblin.play('jfgoblinWalk', true);
  }
}


// =========================
// SHARED: JUNK FOOD GOBLIN THROW CHECK
// =========================
// Called once per goblin per frame from updateLevel1(). Handles the
// distance check and per-goblin cooldown that used to only be written
// out for the single original junkFoodGoblin.
function updateJunkFoodGoblinThrow(scene, goblin) {

  if (!goblin || !goblin.active || goblin.isDead || !goblin.canThrow) {
    return;
  }

  const distance = Math.abs(player.x - goblin.x);

  if (distance >= 550) {
    return;
  }

  if (player.x < goblin.x) {
    goblin.setFlipX(false);
  } else {
    goblin.setFlipX(true);
  }

  if (scene.time.now > goblin.canCooldown) {
    goblin.canCooldown = scene.time.now + 2200;
    junkFoodGoblinThrowCan(scene, goblin);
  }
}


// =========================
// CREATE (APARTMENT SCENE)
// =========================
function create() {
    // =========================
  // DEBUG LEVEL START
  // =========================
  const debugSceneKey = getDebugStartSceneKey();

  if (debugSceneKey !== 'ApartmentScene') {
    gameStarted = true;
    this.scene.start(debugSceneKey);
    return;
  }

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

  ground.body.setSize(1600, 40);
  ground.body.setOffset(0, 70);

  // =========================
  // APARTMENT PROPS
  // =========================
  const couch = this.add.image(430, 370, 'couch');
  couch.setDepth(5);
  couch.setScale(1);

  const pizza = this.add.image(900, 450, 'pizza');
  pizza.setDepth(5);
  pizza.setScale(0.8);

  const coke = this.add.image(980, 430, 'apartment_soda');
  coke.setDepth(5);
  coke.setScale(0.7);

  // =========================
  // PLAYER
  // =========================
  player = createPlayer(this, 150, 200);

  // =========================
  // BULLET / CASING GROUPS
  // =========================
  bullets = this.physics.add.group();
  casings = this.physics.add.group();

  // =========================
  // KEYBOARD INPUT
  // =========================
  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  invincibleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

  this.physics.add.collider(player, ground);
  this.physics.add.collider(casings, ground);

  // =========================
  // SLIME ENEMY (apartment tutorial slime)
  // =========================
  slimes = [];
  pickups = [];
  activeUpgrade = null;
  if (upgradeText) { upgradeText.destroy(); upgradeText = null; }
  spawnSlime(this, 900, 400, ground, 700, 1200, -1);

  // =========================
  // WORLD / CAMERA
  // =========================
  this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  this.cameras.main.startFollow(player, true, 0.08, 0.08);
  this.cameras.main.setDeadzone(200, 120);

  // =========================
  // FOREGROUND TV
  // =========================
  const tv = this.add.image(650, 460, 'tv');
  tv.setDepth(50);
  tv.setScale(1.2);

  // =========================
  // EXIT DOOR
  // =========================
  apartmentDoor = this.physics.add.sprite(1165, 170, 'apartmentDoor');
  apartmentDoor.setScale(1);
  apartmentDoor.setDepth(10);
  apartmentDoor.body.allowGravity = false;
  apartmentDoor.body.immovable = true;

  this.physics.add.overlap(player, apartmentDoor, enterDoor, null, this);
// =========================
// GAME OVER SCREEN
// =========================
createGameOverScreen(this);

  // =========================
  // HUD / CONTROLS
  // =========================
  createHUD(this);

  // =========================
  // LEVEL TRANSITION FADE SCREEN
  // =========================
  createFadeScreen(this);

  // =========================
  // TITLE SCREEN
  // =========================
  titleScreen = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'titleScreen');
  titleScreen.setDisplaySize(GAME_WIDTH * 0.96, GAME_HEIGHT * 0.96);
  titleScreen.setScrollFactor(0);
  titleScreen.setDepth(6000);
  titleScreen.setInteractive();

  titleScreen.on('pointerdown', () => {
    titleScreen.setVisible(false);
    gameStarted = true;
  });
}


// =========================
// UPDATE (APARTMENT SCENE)
// =========================
function update() {

  if (!gameStarted) {
    if (Phaser.Input.Keyboard.JustDown(fireKey)) {
      titleScreen.setVisible(false);
      gameStarted = true;
    }
    return;
  }

  if (currentLevel === 'level1') {
    return;
  }

  if (playerLives <= 0 && Phaser.Input.Keyboard.JustDown(restartKey)) {
    location.reload();
  }

  if (Phaser.Input.Keyboard.JustDown(invincibleKey)) {
    debugInvincible = !debugInvincible;
    console.log("Invincibility:", debugInvincible ? "ON" : "OFF");
  }

  if (playerIsDead) {
    player.body.setVelocityX(0);
    player.setTexture('playerDead');
    return;
  }

  // MOVE LEFT / RIGHT
  if (cursors.left.isDown || moveLeft) {
    player.body.setVelocityX(-300);
    player.setFlipX(true);
  } else if (cursors.right.isDown || moveRight) {
    player.body.setVelocityX(300);
    player.setFlipX(false);
  } else {
    player.body.setVelocityX(0);
  }

  // JUMP
  if ((cursors.up.isDown || jumpPressed) && player.body.blocked.down) {
    player.body.setVelocityY(-600);
  }

  // CROUCH CHECK
  playerIsCrouching =
    (cursors.down.isDown || crouchPressed) &&
    player.body.blocked.down;
      if (playerIsCrouching) {
    setPlayerCrouchBody();
  } else {
    setPlayerStandingBody();
  }

  if (playerIsCrouching) {
    player.body.setVelocityX(0);
  }

  // ANIMATION STATE
  if (playerIsDead) {
    player.setTexture('playerDead');
  } else if (playerIsHurt) {
    if (cursors.down.isDown && player.body.blocked.down) {
      player.setTexture('playerCrouchHurt');
    } else {
      player.setTexture('playerHurt');
    }
  } else if (playerIsCrouching) {
    player.setTexture('playerCrouch');
  } else if (!player.body.blocked.down) {
    if (player.body.velocity.y < -100) {
      player.setTexture('playerJump1');
    } else if (player.body.velocity.y >= -100 && player.body.velocity.y <= 100) {
      player.setTexture('playerJump2');
    } else {
      player.setTexture('playerJump3');
    }
  } else if (cursors.left.isDown || cursors.right.isDown || moveLeft || moveRight) {
    player.play('run', true);
  } else {
    player.play('idle', true);
  }

  if (Phaser.Input.Keyboard.JustDown(fireKey) && !playerIsDead) {
    firePlayerBullet(this);
  }

  // 'firerate' upgrade: auto-fire every frame fire is held, instead of
  // requiring a fresh press per shot. firePlayerBullet()'s own cooldown
  // gate (shortened while this upgrade is active) still controls the
  // actual rate - this just keeps calling it every frame so holding the
  // button produces a continuous stream instead of one shot per press.
  if (activeUpgrade === 'firerate' && !playerIsDead && (fireKey.isDown || firePressed)) {
    firePlayerBullet(this);
  }

  cullOffscreenBullets(this);
  updateHomingBullets(this, slimes);
  updateActiveUpgrade(this);
  settleCasings();

  slimes.forEach(s => patrolSlime(s, 100));
  pickups.forEach(p => updatePickup(this, p));
}


// =========================
// HIT SLIME FUNCTION
// =========================
function hitSlime(objectA, objectB) {

  let bulletObject;
  let slimeObject;

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

  bulletObject.disableBody(true, true);

  // Power-shot upgrade: drop health straight to 0 instead of the
  // normal -1, so it always finishes the enemy in one hit regardless
  // of how much health it currently has.
  slimeObject.health = bulletObject.isPowerShot ? 0 : slimeObject.health - 1;

  console.log("Slime health:", slimeObject.health);

  const hitEffect = slimeObject.scene.add.image(
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

  slimeObject.isDead = true;
  addScore(100);
  slimeObject.body.setVelocityX(0);

  const deathEffect = slimeObject.scene.add.image(
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
// HIT BAT FUNCTION
// =========================
function hitBat(objectA, objectB) {

  let bulletObject;
  let batObject;

  if (objectA.texture.key === 'bullet') {
    bulletObject = objectA;
    batObject = objectB;
  } else {
    bulletObject = objectB;
    batObject = objectA;
  }

  if (!bulletObject.active || bulletObject.hasHit || batObject.isDead) {
    return;
  }

  bulletObject.hasHit = true;
  bulletObject.disableBody(true, true);

  batObject.health = bulletObject.isPowerShot ? 0 : batObject.health - 1;

  console.log("Bat health:", batObject.health);

  const hitEffect = batObject.scene.add.image(batObject.x, batObject.y, 'batHit');
  hitEffect.setDepth(60);
  hitEffect.setScale(0.2);

  batObject.scene.time.delayedCall(120, () => {
    hitEffect.destroy();
  });

  if (batObject.health > 0) {
    return;
  }

  batObject.isDead = true;
  batObject.body.setVelocity(0, 0);

  const deathEffect = batObject.scene.add.image(batObject.x, batObject.y, 'batDeath');
  deathEffect.setDepth(60);
  deathEffect.setScale(0.2);

  batObject.disableBody(true, true);

  addScore(200);

  batObject.scene.time.delayedCall(500, () => {
    deathEffect.destroy();
  });
}


// =========================
// PLAYER TAKES DAMAGE
// =========================
function hurtPlayer(playerObject, enemyObject) {

  if (debugInvincible) {
    return;
  }

  if (!playerCanTakeDamage || playerIsDead) {
    return;
  }

  // Thrown cans don't have isDead set at all, so only check it when it
  // exists - this keeps the function working for slimes/bats AND for
  // the can/player overlap.
  if (enemyObject.isDead) {
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

                if (
          currentLevel === 'level3' &&
          (level3BossFightActive || level3Boss || level3BossCanTakeDamage)
        ) {
          resetLevel3BossFightAfterPlayerDeath(playerObject.scene);

          playerObject.x = LEVEL3_BOSS_CHECKPOINT_X;
          playerObject.y = LEVEL3_BOSS_CHECKPOINT_Y;
        } else {
          playerObject.x = 150;
          playerObject.y = 300;
        }

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

  if (playerObject.x < enemyObject.x) {
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
      playerObject.scene.scene.start('Level1Scene');
    }
  });
}


// =========================
// ENTER SEWER (from Level1's end sign)
// =========================
function enterSewer(playerObject, signObject) {

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
      playerObject.scene.scene.start('SewerScene');
    }
  });
}


// =========================
// ADD SCORE
// =========================
function addScore(points) {
  score += points;
  if (scoreText) {
    scoreText.setText('SCORE: ' + score);
  }
}


// =========================
// ONE WAY PLATFORM CHECK
// =========================
function oneWayPlatformCheck(playerObject, platformObject) {

  if ((cursors.down.isDown || crouchPressed) && (cursors.up.isDown || jumpPressed)) {
    playerObject.y += 10;
    return false;
  }

  if (playerObject.body.velocity.y < 0) {
    return false;
  }

  return playerObject.body.bottom <= platformObject.body.top + 15;
}

// =========================================================
// =========================================================
//                       LEVEL 1
// =========================================================
// =========================================================

// =========================
// LEVEL 1 CREATE
// =========================
function createLevel1() {

  currentLevel = 'level1';
  levelTransitioning = false; // reset - enterDoor() set this true to get here and never reset it, which silently blocked enterSewer() later

  this.cameras.main.setBackgroundColor('#000000');

  // CITY SKY
  const sky = this.add.tileSprite(0, -100, LEVEL1_WIDTH, GAME_HEIGHT, 'citySky');
  sky.setOrigin(0, 0);
  sky.setDepth(-200);
  sky.setScrollFactor(0.2);
  sky.tilePositionY = -450;

  // CITY BUILDINGS
  const building01 = this.add.image(250, 100, 'cityBuilding01');
  building01.setScale(0.65);
  building01.setDepth(-50);
  building01.setScrollFactor(0.6, 1);

  const building02 = this.add.image(950, 70, 'cityBuilding02');
  building02.setScale(0.65);
  building02.setDepth(-50);
  building02.setScrollFactor(0.6, 1);

  const building03 = this.add.image(1650, 70, 'cityBuilding03');
  building03.setScale(0.65);
  building03.setDepth(-50);
  building03.setScrollFactor(0.6, 1);

  const building04 = this.add.image(2350, 100, 'cityBuilding01');
  building04.setScale(0.65);
  building04.setDepth(-50);
  building04.setScrollFactor(0.6, 1);

  const building05 = this.add.image(3050, 70, 'cityBuilding02');
  building05.setScale(0.65);
  building05.setDepth(-50);
  building05.setScrollFactor(0.6, 1);

  // PARKING LOTS
  const parkingLot01 = this.add.image(3800, 240, 'cityParkingLot01');
  parkingLot01.setScale(0.65);
  parkingLot01.setDepth(-60);
  parkingLot01.setScrollFactor(0.6, 1);

  const parkingLot02 = this.add.image(4770, 250, 'cityParkingLot02');
  parkingLot02.setScale(0.65);
  parkingLot02.setDepth(-60);
  parkingLot02.setScrollFactor(0.6, 1);

  // PARKING LOT BILLBOARD
  const parkingBillboard = this.add.image(4275, -20, 'cityBillboard01');
  parkingBillboard.setScale(0.85);
  parkingBillboard.setDepth(-65);
  parkingBillboard.setScrollFactor(0.6, 1);

  // TRUCK PROP
  const truck01 = this.add.image(950, 350, 'cityTruck01');
  truck01.setScale(0.4);
  truck01.setDepth(8);
  truck01.setScrollFactor(1);

  // BILLBOARD CATWALK PLATFORM
  billboardCatwalk = this.add.rectangle(4280, -90, 990, 20, 0xff0000);

  // BILLBOARD JUMP SCAFFOLD VISUAL
  const billboardJumpScaffold = this.add.image(3460, -80, 'cityScaffoldPlatform01');
  billboardJumpScaffold.setScale(0.15);
  billboardJumpScaffold.setDepth(-40);
  billboardJumpScaffold.setScrollFactor(0.6, 1);

  // BILLBOARD JUMP SCAFFOLD PLATFORM
  billboardJumpScaffoldPlatform = this.add.rectangle(3460, -80, 260, 20, 0xff0000);
  billboardJumpScaffoldPlatform.setScrollFactor(0.6, 1);
  this.physics.add.existing(billboardJumpScaffoldPlatform, true);
  billboardJumpScaffoldPlatform.baseX = billboardJumpScaffoldPlatform.x;
  billboardJumpScaffoldPlatform.parallaxFactor = 0.6;

  // BUILDING 6 SCAFFOLD VISUAL
  const building06Scaffold = this.add.image(4990, -50, 'cityScaffoldPlatform01');
  building06Scaffold.setScale(0.1);
  building06Scaffold.setDepth(-40);
  building06Scaffold.setScrollFactor(0.6, 1);
  building06Scaffold.setFlipX(true);

  // BUILDING 6 SCAFFOLD PLATFORM
  building06ScaffoldPlatform = this.add.rectangle(4990, -50, 120, 20, 0xff0000);
  this.physics.add.existing(building06ScaffoldPlatform, true);
  building06ScaffoldPlatform.baseX = building06ScaffoldPlatform.x;
  building06ScaffoldPlatform.parallaxFactor = 0.6;

  // PARKING LOT VENDING MACHINE
  const vendingMachine = this.add.image(4270, 320, 'vendingMachine');
  vendingMachine.setScale(0.2);
  vendingMachine.setDepth(-50);
  vendingMachine.setScrollFactor(0.6, 1);

  // CITY BUILDINGS AFTER PARKING LOT
  const building06 = this.add.image(5400, 100, 'cityBuilding03');
  building06.setScale(0.65);
  building06.setDepth(-50);
  building06.setScrollFactor(0.6, 1);

  const building07 = this.add.image(6100, 70, 'cityBuilding01');
  building07.setScale(0.65);
  building07.setDepth(-50);
  building07.setScrollFactor(0.6, 1);

  const building08 = this.add.image(6800, 100, 'cityBuilding02');
  building08.setScale(0.65);
  building08.setDepth(-50);
  building08.setScrollFactor(0.6, 1);

  const building09 = this.add.image(7500, 70, 'cityBuilding03');
  building09.setScale(0.65);
  building09.setDepth(-50);
  building09.setScrollFactor(0.6, 1);

  const building10 = this.add.image(8200, 100, 'cityBuilding01');
  building10.setScale(0.65);
  building10.setDepth(-50);
  building10.setScrollFactor(0.6, 1);

  // =========================
  // TRUCK / FIRE ESCAPE PLATFORMS
  // =========================
  const truckHoodPlatform = this.add.rectangle(710, 380, 180, 40, 0xff0000);
  const truckFrontBlocker = this.add.rectangle(600, 405, 40, 90, 0xff0000);
  const truckBackBlocker = this.add.rectangle(1270, 405, 40, 250, 0xff0000);

  this.physics.add.existing(truckFrontBlocker, true);
  this.physics.add.existing(truckBackBlocker, true);

  const truckCabPlatform = this.add.rectangle(750, 310, 120, 20, 0xff0000);
  const truckBoxPlatform = this.add.rectangle(1040, 240, 480, 20, 0xff0000);

  fireEscapePlatform  = this.add.rectangle(970, 110, 360, 20, 0xff0000);
  fireEscapePlatform2 = this.add.rectangle(970, -20, 360, 20, 0xff0000);
  fireEscapePlatform3 = this.add.rectangle(1660, 210, 260, 20, 0xff0000);
  fireEscapePlatform4 = this.add.rectangle(1660, 80, 260, 20, 0xff0000);
  fireEscapePlatform5 = this.add.rectangle(1660, -50, 260, 20, 0xff0000);
  fireEscapePlatform6 = this.add.rectangle(3080, 220, 360, 20, 0xff0000);
  fireEscapePlatform7 = this.add.rectangle(3080, 90, 360, 20, 0xff0000);
  fireEscapePlatform8 = this.add.rectangle(3080, -40, 360, 20, 0xff0000);
  fireEscapePlatform9 = this.add.rectangle(5150, -10, 200, 20, 0xff0000);
  fireEscapePlatform10 = this.add.rectangle(5400, 240, 290, 20, 0xff0000);
  fireEscapePlatform11 = this.add.rectangle(5420, 110, 270, 20, 0xff0000);
  fireEscapePlatform12 = this.add.rectangle(5420, -20, 270, 20, 0xff0000);
  fireEscapePlatform13 = this.add.rectangle(6830, 260, 370, 20, 0xff0000);
  fireEscapePlatform14 = this.add.rectangle(6830, 140, 370, 20, 0xff0000);
  fireEscapePlatform15 = this.add.rectangle(6830, 10, 370, 20, 0xff0000);
  fireEscapePlatform16 = this.add.rectangle(7520, 210, 290, 20, 0xff0000);
  fireEscapePlatform17 = this.add.rectangle(7530, 90, 270, 20, 0xff0000);
  fireEscapePlatform18 = this.add.rectangle(7530, -50, 270, 20, 0xff0000);

  Building01roof = this.add.rectangle(950, -170, 700, 20, 0xff0000);
  Building01LeftWall = this.add.rectangle(600, -170, 20, 30, 0x00ff00);
  Building01LeftWall.baseX = Building01LeftWall.x;
  Building01LeftWall.parallaxFactor = 0.6;

  Building02roof = this.add.rectangle(250, -200, 700, 20, 0xff0000);

  Building03roof = this.add.rectangle(1750, -190, 500, 20, 0xff0000);
  Building03LeftWall  = this.add.rectangle(1500, -190, 20, 20, 0x00ff00);
  Building03RightWall = this.add.rectangle(2000, -190, 20, 20, 0x00ff00);
  Building03LeftWall.baseX = Building03LeftWall.x;
  Building03LeftWall.parallaxFactor = 0.6;
  Building03RightWall.baseX = Building03RightWall.x;
  Building03RightWall.parallaxFactor = 0.6;

  Building04roof = this.add.rectangle(2350, -210, 700, 20, 0xff0000);
  Building04LeftWall  = this.add.rectangle(2000, -210, 20, 20, 0x00ff00);
  Building04RightWall = this.add.rectangle(2700, -210, 20, 20, 0x00ff00);
  Building04LeftWall.baseX = Building04LeftWall.x;
  Building04LeftWall.parallaxFactor = 0.6;
  Building04RightWall.baseX = Building04RightWall.x;
  Building04RightWall.parallaxFactor = 0.6;

  Building05roof = this.add.rectangle(1400, -170, 400, 20, 0xff0000);

  Building06roof = this.add.rectangle(3040, -170, 700, 20, 0xff0000);
  Building07roof = this.add.rectangle(5400, -150, 700, 20, 0xff0000);
  Building08roof = this.add.rectangle(6100, -240, 700, 20, 0xff0000);
  Building09roof = this.add.rectangle(6800, -150, 700, 20, 0xff0000);
  Building10roof = this.add.rectangle(7700, -190, 700, 20, 0xff0000);
  Building11roof = this.add.rectangle(7250, -180, 240, 20, 0xff0000);
  Building12roof = this.add.rectangle(8200, -210, 700, 20, 0xff0000);

  this.physics.add.existing(truckHoodPlatform, true);
  this.physics.add.existing(truckCabPlatform, true);
  this.physics.add.existing(truckBoxPlatform, true);
  this.physics.add.existing(fireEscapePlatform, true);
  this.physics.add.existing(fireEscapePlatform2, true);
  this.physics.add.existing(fireEscapePlatform3, true);
  this.physics.add.existing(fireEscapePlatform4, true);
  this.physics.add.existing(fireEscapePlatform5, true);
  this.physics.add.existing(fireEscapePlatform6, true);
  this.physics.add.existing(fireEscapePlatform7, true);
  this.physics.add.existing(fireEscapePlatform8, true);
  this.physics.add.existing(fireEscapePlatform9, true);
  this.physics.add.existing(fireEscapePlatform10, true);
  this.physics.add.existing(fireEscapePlatform11, true);
  this.physics.add.existing(fireEscapePlatform12, true);
  this.physics.add.existing(fireEscapePlatform13, true);
  this.physics.add.existing(fireEscapePlatform14, true);
  this.physics.add.existing(fireEscapePlatform15, true);
  this.physics.add.existing(fireEscapePlatform16, true);
  this.physics.add.existing(fireEscapePlatform17, true);
  this.physics.add.existing(fireEscapePlatform18, true);
  this.physics.add.existing(Building01roof, true);
  this.physics.add.existing(Building02roof, true);
  this.physics.add.existing(Building03roof, true);
  this.physics.add.existing(Building04roof, true);
  this.physics.add.existing(Building05roof, true);
  this.physics.add.existing(Building06roof, true);
  this.physics.add.existing(Building07roof, true);
  this.physics.add.existing(Building08roof, true);
  this.physics.add.existing(Building09roof, true);
  this.physics.add.existing(Building10roof, true);
  this.physics.add.existing(Building11roof, true);
  this.physics.add.existing(Building12roof, true);

  fireEscapePlatform.baseX = fireEscapePlatform.x;
  fireEscapePlatform.parallaxFactor = 0.6;
  fireEscapePlatform2.baseX = fireEscapePlatform2.x;
  fireEscapePlatform2.parallaxFactor = 0.6;
  fireEscapePlatform3.baseX = fireEscapePlatform3.x;
  fireEscapePlatform3.parallaxFactor = 0.6;
  fireEscapePlatform4.baseX = fireEscapePlatform4.x;
  fireEscapePlatform4.parallaxFactor = 0.6;
  fireEscapePlatform5.baseX = fireEscapePlatform5.x;
  fireEscapePlatform5.parallaxFactor = 0.6;
  fireEscapePlatform6.baseX = fireEscapePlatform6.x;
  fireEscapePlatform6.parallaxFactor = 0.6;
  fireEscapePlatform7.baseX = fireEscapePlatform7.x;
  fireEscapePlatform7.parallaxFactor = 0.6;
  fireEscapePlatform8.baseX = fireEscapePlatform8.x;
  fireEscapePlatform8.parallaxFactor = 0.6;
  fireEscapePlatform9.baseX = fireEscapePlatform9.x;
  fireEscapePlatform9.parallaxFactor = 0.6;
  fireEscapePlatform10.baseX = fireEscapePlatform10.x;
  fireEscapePlatform10.parallaxFactor = 0.6;
  fireEscapePlatform11.baseX = fireEscapePlatform11.x;
  fireEscapePlatform11.parallaxFactor = 0.6;
  fireEscapePlatform12.baseX = fireEscapePlatform12.x;
  fireEscapePlatform12.parallaxFactor = 0.6;
  fireEscapePlatform13.baseX = fireEscapePlatform13.x;
  fireEscapePlatform13.parallaxFactor = 0.6;
  fireEscapePlatform14.baseX = fireEscapePlatform14.x;
  fireEscapePlatform14.parallaxFactor = 0.6;
  fireEscapePlatform15.baseX = fireEscapePlatform15.x;
  fireEscapePlatform15.parallaxFactor = 0.6;
  fireEscapePlatform16.baseX = fireEscapePlatform16.x;
  fireEscapePlatform16.parallaxFactor = 0.6;
  fireEscapePlatform17.baseX = fireEscapePlatform17.x;
  fireEscapePlatform17.parallaxFactor = 0.6;
  fireEscapePlatform18.baseX = fireEscapePlatform18.x;
  fireEscapePlatform18.parallaxFactor = 0.6;

  Building01roof.baseX = Building01roof.x;
  Building01roof.parallaxFactor = 0.6;
  Building02roof.baseX = Building02roof.x;
  Building02roof.parallaxFactor = 0.6;
  Building03roof.baseX = Building03roof.x;
  Building03roof.parallaxFactor = 0.6;
  Building04roof.baseX = Building04roof.x;
  Building04roof.parallaxFactor = 0.6;
  Building05roof.baseX = Building05roof.x;
  Building05roof.parallaxFactor = 0.6;
  Building06roof.baseX = Building06roof.x;
  Building06roof.parallaxFactor = 0.6;
  Building07roof.baseX = Building07roof.x;
  Building07roof.parallaxFactor = 0.6;
  Building08roof.baseX = Building08roof.x;
  Building08roof.parallaxFactor = 0.6;
  Building09roof.baseX = Building09roof.x;
  Building09roof.parallaxFactor = 0.6;
  Building10roof.baseX = Building10roof.x;
  Building10roof.parallaxFactor = 0.6;
  Building11roof.baseX = Building11roof.x;
  Building11roof.parallaxFactor = 0.6;
  Building12roof.baseX = Building12roof.x;
  Building12roof.parallaxFactor = 0.6;

  billboardCatwalk.baseX = billboardCatwalk.x;
  billboardCatwalk.parallaxFactor = 0.6;

  this.physics.add.existing(Building01LeftWall, true);
  this.physics.add.existing(Building03LeftWall, true);
  this.physics.add.existing(Building03RightWall, true);
  this.physics.add.existing(Building04LeftWall, true);
  this.physics.add.existing(Building04RightWall, true);
  this.physics.add.existing(billboardCatwalk, true);

  // =========================
  // HIDE PLACEHOLDER PLATFORM GEOMETRY
  // =========================
  // These red/green rectangles are colliders only now that they line
  // up with the city art (fire escapes, roofs, billboard catwalk,
  // truck, scaffolds) - hiding them doesn't touch position, size, or
  // any collider/physics setup above, just visibility.
  [
    truckHoodPlatform, truckCabPlatform, truckBoxPlatform,
    truckFrontBlocker, truckBackBlocker,
    fireEscapePlatform, fireEscapePlatform2, fireEscapePlatform3,
    fireEscapePlatform4, fireEscapePlatform5, fireEscapePlatform6,
    fireEscapePlatform7, fireEscapePlatform8, fireEscapePlatform9,
    fireEscapePlatform10, fireEscapePlatform11, fireEscapePlatform12,
    fireEscapePlatform13, fireEscapePlatform14, fireEscapePlatform15,
    fireEscapePlatform16, fireEscapePlatform17, fireEscapePlatform18,
    Building01roof, Building01LeftWall,
    Building02roof,
    Building03roof, Building03LeftWall, Building03RightWall,
    Building04roof, Building04LeftWall, Building04RightWall,
    Building05roof, Building06roof, Building07roof, Building08roof,
    Building09roof, Building10roof, Building11roof, Building12roof,
    billboardCatwalk, billboardJumpScaffoldPlatform, building06ScaffoldPlatform
  ].forEach(p => {
    if (p) {
      p.setVisible(false);
    }
  });

  // STREET GROUND VISUAL
  const streetY = 520;
  const streetSpacing = 1400;
  for (let i = 0; i < 12; i++) {
    const streetGround = this.add.image(700 + (i * streetSpacing), streetY, 'streetGround');
    streetGround.setDepth(0);
  }

  // RANDOM STREET PROPS
  placeRandomStreetProps(this, 1800, LEVEL1_WIDTH - 500, 700);

  const level1Floor = this.add.rectangle(LEVEL1_WIDTH / 2, 500, LEVEL1_WIDTH, 40, 0xff0000);
  level1Floor.setVisible(false);
  this.physics.add.existing(level1Floor, true);

  // =========================
  // PLAYER
  // =========================
 const level1Start = getDebugStartPosition(150, 250);
player = createPlayer(this, level1Start.x, level1Start.y);

  // =========================
  // GROUPS / INPUT
  // =========================
  bullets = this.physics.add.group();
  casings = this.physics.add.group();

  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  invincibleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

  // =========================
  // JUNK FOOD GOBLIN CAN GROUP
  // =========================
  // Created ONCE here, before any goblin is spawned, because
  // spawnJunkFoodGoblin() needs jfgoblinCans to already exist in order to
  // register the can/player overlap for any throwing goblin.
  jfgoblinCans = this.physics.add.group();

  // =========================
  // JUNK FOOD GOBLINS - all three through one function now
  // =========================
  junkFoodGoblins = []; // reset for this scene

  // Original street-level goblin near the truck - stationary, throws cans
  // Floating (no gravity) with feet at fireEscapePlatform's exact top
  // edge: y:110, height:20 -> top = 100.
  spawnJunkFoodGoblin(this, 1000, 120, {
    canThrow: true,
    parallaxFactor: 0.6
  });

  // Second goblin - feet at fireEscapePlatform7's exact top edge:
  // y:90, height:20 -> top = 80.
  spawnJunkFoodGoblin(this, 3080, 100, {
    canThrow: true,
    parallaxFactor: 0.6
  });

  // Billboard goblin - feet at billboardCatwalk's exact top edge:
  // y:-90, height:20 -> top = -100. Patrols left/right along the
  // catwalk, also throws cans.
  spawnJunkFoodGoblin(this, 4300, -80, {
    patrolLeft: 4100,
    patrolRight: 4450,
    canThrow: true,
    parallaxFactor: 0.6
  });

  // =========================
  // ENEMIES - one line each instead of ~15 lines each
  // =========================
  slimes = [];
  bats = [];
  pickups = [];
  activeUpgrade = null;
  if (upgradeText) { upgradeText.destroy(); upgradeText = null; }

  spawnSlime(this, 1640, 300, level1Floor, 1600, 2200, 1);

  // =========================
  // PICKUPS - full level pass, roof/fire-escape heavy
  // =========================
  // Search "spawnPickup(this," to find/move any of these.
  //
  // Rebalanced so most points/upgrades sit up on fire escapes and
  // roofs - the harder, riskier path to reach - while the ground keeps
  // only a couple of baseline pickups. Every elevated pickup below
  // uses the actual platform's real top-surface Y (platform_y - 10),
  // not a guessed number, so they sit exactly on the platform instead
  // of floating above/through it.
  spawnPickup(this, 970, -90, 'pointsSmall', 0.6);     // fireEscapePlatform2 Y:-20, -70 clearance
  spawnPickup(this, 1660, -120, 'pointsLarge', 0.6);   // fireEscapePlatform5 Y:-50, -70 clearance
  spawnPickup(this, 3080, -110, 'pointsLarge', 0.6);   // fireEscapePlatform8 Y:-40, -70 clearance
  spawnPickup(this, 3900, 350, 'health');              // ground - top off before the billboard choice
  spawnPickup(this, 4000, -290, 'upgrade', 0.6);       // high-road entrance reward, billboardCatwalk-adjacent
  // Second upgrade pickup removed - the one at the billboard (x:4000)
  // is the only one in the level now.
  spawnPickup(this, 6830, 70, 'pointsLarge', 0.6);     // moved to fireEscapePlatform14 (Y:140, -70 clearance) - one platform below the goblin on platform15
  spawnPickup(this, 7530, 20, 'pointsSmall', 0.6);     // moved to fireEscapePlatform17 (Y:90, -70 clearance) - one platform below the goblin on platform18
  spawnPickup(this, 8050, -280, 'pointsLarge', 0.6);   // moved left from x:8200 - was clipping offscreen near the world edge; still on Building12roof (spans ~7850-8550)
  spawnPickup(this, 8000, 350, 'health');              // ground - late mercy refill
  spawnSlime(this, 2350, 300, level1Floor, 2200, 2600, 1);
  spawnSlime(this, 3200, 300, level1Floor, 2950, 3500, -1);

  spawnBat(this, 3400, -300, 2600, 3500, -1);
  spawnBat(this, 1200, -250, 600, 2700, -1);

  // =========================
  // HIGH ROAD / LOW ROAD CHOICE AT THE BILLBOARD (x ~4100-4450)
  // =========================
  // High road: billboard catwalk - billboard goblin (already placed) +
  // two swoop bats overhead. Harder to clear, more points available.
  // Low road: street level under the billboard - three ground slimes.
  // Easier, but no bonus points beyond the normal slime kill value.
  swoopBats = []; // reset for this scene

  spawnSwoopBat(this, 4180, -200);
  spawnSwoopBat(this, 4380, -200);

  // Low road slimes - same level1Floor collider as every other ground
  // slime, just positioned under the billboard's x range.
  spawnSlime(this, 4150, 300, level1Floor, 4050, 4250, 1);
  spawnSlime(this, 4300, 300, level1Floor, 4200, 4400, -1);
  spawnSlime(this, 4450, 300, level1Floor, 4350, 4550, 1);

  // =========================
  // 3 MORE GOBLINS - last 3 fire escape sets (each set has 3 stacked
  // platforms; using the TOP platform of each set, same as the
  // high-road pattern already established at the billboard)
  // =========================
  // Set 4: fireEscapePlatform9/10/11/12 (x:5150-5420) - top is platform12 (y:-20)
  spawnJunkFoodGoblin(this, 5420, -20, {
    canThrow: true,
    parallaxFactor: 0.6
  });

  // Set 5: fireEscapePlatform13/14/15 (x:6830) - top is platform15 (y:10)
  spawnJunkFoodGoblin(this, 6830, 10, {
    canThrow: true,
    parallaxFactor: 0.6
  });

  // Set 6: fireEscapePlatform16/17/18 (x:7520-7530) - top is platform18 (y:-50)
  spawnJunkFoodGoblin(this, 7530, -50, {
    canThrow: true,
    parallaxFactor: 0.6
  });

  // 2 new bats above the last two fire-escape goblins (x:6830, x:7530).
  // parallaxFactor 0.6 matches those goblins exactly so the bats stay
  // visually locked above them as the camera scrolls, instead of
  // drifting away the way the swoop bats originally did before that fix.
  spawnBat(this, 6830, -300, 6650, 7010, -1, 0.6);
  spawnBat(this, 7530, -350, 7350, 7710, 1, 0.6);

  // =========================
  // MORE GROUND SLIMES spread across the rest of the level
  // (level continues out past x:8200 where Building12 sits)
  // =========================
  spawnSlime(this, 5800, 300, level1Floor, 5650, 5950, 1);
  spawnSlime(this, 6500, 300, level1Floor, 6350, 6650, -1);
  spawnSlime(this, 7200, 300, level1Floor, 7050, 7350, 1);
  spawnSlime(this, 7900, 300, level1Floor, 7750, 8050, -1);

  // =========================
  // MORE SLIMES - tail end of the level (x:8300 onward). The level
  // runs out to x:12800 and was nearly empty past the Building12/bat
  // cluster at x:8200-8800, so these fill out the final stretch.
  // =========================
  spawnSlime(this, 8700, 300, level1Floor, 8550, 8850, 1);
  spawnSlime(this, 9400, 300, level1Floor, 9250, 9550, -1);
  spawnSlime(this, 10100, 300, level1Floor, 9950, 10250, 1);
  spawnSlime(this, 10800, 300, level1Floor, 10650, 10950, -1);
  spawnSlime(this, 11500, 300, level1Floor, 11350, 11650, 1);
  spawnSlime(this, 12100, 300, level1Floor, 11950, 12250, -1);

  // =========================
  // LEVEL END SIGN
  // =========================
  // Now a physics sprite with an overlap trigger (was a plain image) -
  // touching it fades to black and starts SewerScene, same pattern as
  // apartmentDoor -> enterDoor.
  const levelEndSign = this.physics.add.sprite(12350, 480, 'level1EndSign');
  levelEndSign.setScale(0.2);
  levelEndSign.setDepth(8); // same layer as the steam traps/street props
  levelEndSign.setOrigin(0.5, 1); // anchor to its base, same approach used for the goblins - so "y" means "where it touches the ground," not its visual center
  levelEndSign.body.allowGravity = false;
  levelEndSign.body.immovable = true;
  // Shrink the body to roughly the sign's actual footprint instead of
  // the full (likely tall/pole-shaped) source image bounds, and anchor
  // that body to the same bottom-center origin set above - otherwise
  // the default body covers the whole sprite rectangle including empty
  // space far above where the player's body actually runs.
  levelEndSign.body.setSize(levelEndSign.width * 0.6, levelEndSign.height * 0.5);
  levelEndSign.body.setOffset(levelEndSign.width * 0.2, levelEndSign.height * 0.5);

  this.physics.add.overlap(player, levelEndSign, enterSewer, null, this);

  // =========================
  // 2 MORE NORMAL (patrolling) BATS - above the Building08-12 roof
  // cluster (x:6100-8200, roof heights y:-150 to y:-240). Spawned a bit
  // above the highest roof in that stretch (Building08roof, y:-240) so
  // they clear everything as they patrol back and forth.
  // =========================
  spawnBat(this, 7700, -280, 7400, 8000, -1);
  spawnBat(this, 8500, -280, 8200, 8800, 1);

  // =========================
  // STEAM TRAPS - street-level manholes that periodically erupt
  // =========================
  // Spread across the level, startOffset staggered so they don't all
  // erupt in unison - gives the player a rolling pattern of safe/danger
  // windows to time their run through instead of one synchronized pulse.
  steamTraps = []; // reset for this scene

  spawnSteamTrap(this, 2540, 495, { startOffset: 0 });
  spawnSteamTrap(this, 3950, 495, { startOffset: 1000 });
  spawnSteamTrap(this, 5340, 495, { startOffset: 2000 });
  spawnSteamTrap(this, 6740, 495, { startOffset: 500 });
  spawnSteamTrap(this, 8150, 495, { startOffset: 1500 });
  spawnSteamTrap(this, 9540, 495, { startOffset: 2500 });
  spawnSteamTrap(this, 10940, 495, { startOffset: 0 });

  // =========================
  // WORLD / CAMERA
  // =========================
  this.physics.world.setBounds(0, -450, LEVEL1_WIDTH, GAME_HEIGHT + 450);
  this.cameras.main.setBounds(0, -450, LEVEL1_WIDTH, GAME_HEIGHT + 450);
  this.cameras.main.startFollow(player);

  // =========================
  // COLLIDERS
  // =========================
  this.physics.add.collider(player, level1Floor);
  this.physics.add.collider(casings, level1Floor);

  this.physics.add.collider(player, truckHoodPlatform);
  this.physics.add.collider(player, truckCabPlatform);
  this.physics.add.collider(player, truckBoxPlatform);

  this.physics.add.collider(player, fireEscapePlatform,  null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform2, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform3, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform4, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform5, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform6, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform7, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform8, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform9, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform10, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform11, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform12, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform13, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform14, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform15, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform16, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform17, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, fireEscapePlatform18, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building01roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building02roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building03roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building04roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building05roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building06roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building07roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building08roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building09roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building10roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building11roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, Building12roof, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, billboardCatwalk, null, oneWayPlatformCheck, this);

  this.physics.add.collider(player, truckFrontBlocker);
  this.physics.add.collider(player, truckBackBlocker);
  this.physics.add.collider(player, Building01LeftWall);
  this.physics.add.collider(player, Building03LeftWall);
  this.physics.add.collider(player, Building03RightWall);
  this.physics.add.collider(player, Building04LeftWall);
  this.physics.add.collider(player, Building04RightWall);

  this.physics.add.collider(casings, truckHoodPlatform);
  this.physics.add.collider(casings, truckCabPlatform);
  this.physics.add.collider(casings, truckBoxPlatform);
  this.physics.add.collider(casings, fireEscapePlatform);
  this.physics.add.collider(casings, fireEscapePlatform2);
  this.physics.add.collider(casings, fireEscapePlatform3);
  this.physics.add.collider(casings, fireEscapePlatform4);
  this.physics.add.collider(casings, fireEscapePlatform5);
  this.physics.add.collider(casings, fireEscapePlatform6);
  this.physics.add.collider(casings, fireEscapePlatform7);
  this.physics.add.collider(casings, fireEscapePlatform8);
  this.physics.add.collider(casings, fireEscapePlatform9);
  this.physics.add.collider(casings, fireEscapePlatform10);
  this.physics.add.collider(casings, fireEscapePlatform11);
  this.physics.add.collider(casings, fireEscapePlatform12);
  this.physics.add.collider(casings, fireEscapePlatform13);
  this.physics.add.collider(casings, fireEscapePlatform14);
  this.physics.add.collider(casings, fireEscapePlatform15);
  this.physics.add.collider(casings, fireEscapePlatform16);
  this.physics.add.collider(casings, fireEscapePlatform17);
  this.physics.add.collider(casings, fireEscapePlatform18);
  this.physics.add.collider(casings, Building01roof);
  this.physics.add.collider(casings, Building02roof);
  this.physics.add.collider(casings, Building03roof);
  this.physics.add.collider(casings, Building04roof);
  this.physics.add.collider(casings, Building05roof);
  this.physics.add.collider(casings, Building06roof);
  this.physics.add.collider(casings, Building07roof);
  this.physics.add.collider(casings, Building08roof);
  this.physics.add.collider(casings, Building09roof);
  this.physics.add.collider(casings, Building10roof);
  this.physics.add.collider(casings, Building11roof);
  this.physics.add.collider(casings, Building12roof);
  this.physics.add.collider(casings, billboardCatwalk);

  this.physics.add.collider(player, billboardJumpScaffoldPlatform, null, oneWayPlatformCheck, this);
  this.physics.add.collider(player, building06ScaffoldPlatform, null, oneWayPlatformCheck, this);
  this.physics.add.collider(casings, building06ScaffoldPlatform);

 // =========================
// GAME OVER SCREEN
// =========================
createGameOverScreen(this);

// =========================
// HUD / CONTROLS
// =========================
createHUD(this);

// =========================
// LEVEL TRANSITION FADE SCREEN
// =========================
createFadeScreen(this);
}


// =========================
// LEVEL 1 UPDATE
// =========================
function updateLevel1() {

  if (Phaser.Input.Keyboard.JustDown(invincibleKey)) {
    debugInvincible = !debugInvincible;
    console.log("Invincibility:", debugInvincible ? "ON" : "OFF");
  }

  if (playerIsDead) {
    player.body.setVelocityX(0);
    player.setTexture('playerDead');
    return;
  }

  // MOVE LEFT / RIGHT
  if (cursors.left.isDown || moveLeft) {
    player.body.setVelocityX(-300);
    player.setFlipX(true);
  } else if (cursors.right.isDown || moveRight) {
    player.body.setVelocityX(300);
    player.setFlipX(false);
  } else {
    player.body.setVelocityX(0);
  }

  // JUMP
  if ((cursors.up.isDown || jumpPressed) && player.body.blocked.down) {
    player.body.setVelocityY(-600);
  }

  // CROUCH
  playerIsCrouching =
    (cursors.down.isDown || crouchPressed) &&
    player.body.blocked.down;
      if (playerIsCrouching) {
    setPlayerCrouchBody();
  } else {
    setPlayerStandingBody();
  }

  if (playerIsCrouching) {
    player.body.setVelocityX(0);
    player.setTexture('playerCrouch');
  } else if (!player.body.blocked.down) {
    if (player.body.velocity.y < -100) {
      player.setTexture('playerJump1');
    } else if (player.body.velocity.y >= -100 && player.body.velocity.y <= 100) {
      player.setTexture('playerJump2');
    } else {
      player.setTexture('playerJump3');
    }
  } else if (cursors.left.isDown || cursors.right.isDown || moveLeft || moveRight) {
    player.play('run', true);
  } else {
    player.play('idle', true);
  }

  // =========================
  // ENEMY PATROL (loops, not one block per enemy)
  // =========================
  slimes.forEach(s => patrolSlime(s, 60));
  bats.forEach(b => patrolBat(b, 220, this));
  swoopBats.forEach(b => updateSwoopBat(this, b, 260));
  pickups.forEach(p => updatePickup(this, p));
  steamTraps.forEach(t => updateSteamTrap(this, t));

  // =========================
  // JUNK FOOD GOBLINS - patrol + throw, looped over every goblin
  // =========================
  junkFoodGoblins.forEach(goblin => {
    patrolJunkFoodGoblin(goblin, 30);
    updateJunkFoodGoblinThrow(this, goblin);
  });

  // SHOOTING
  if (Phaser.Input.Keyboard.JustDown(fireKey) && !playerIsDead) {
    firePlayerBullet(this);
  }

  // 'firerate' upgrade: auto-fire every frame fire is held - see the
  // matching comment in the apartment scene's update() for details.
  if (activeUpgrade === 'firerate' && !playerIsDead && (fireKey.isDown || firePressed)) {
    firePlayerBullet(this);
  }

  cullOffscreenBullets(this);
  updateHomingBullets(this, [...slimes, ...bats, ...swoopBats, ...junkFoodGoblins]);
  updateActiveUpgrade(this);
  settleCasings();

  // =========================
  // PARALLAX PLATFORM / BUILDING POSITIONING
  // =========================
  updateParallaxObject(fireEscapePlatform, this);
  updateParallaxObject(fireEscapePlatform2, this);
  updateParallaxObject(fireEscapePlatform3, this);
  updateParallaxObject(fireEscapePlatform4, this);
  updateParallaxObject(fireEscapePlatform5, this);
  updateParallaxObject(fireEscapePlatform6, this);
  updateParallaxObject(fireEscapePlatform7, this);
  updateParallaxObject(fireEscapePlatform8, this);
  updateParallaxObject(fireEscapePlatform9, this);
  updateParallaxObject(fireEscapePlatform10, this);
  updateParallaxObject(fireEscapePlatform11, this);
  updateParallaxObject(fireEscapePlatform12, this);
  updateParallaxObject(fireEscapePlatform13, this);
  updateParallaxObject(fireEscapePlatform14, this);
  updateParallaxObject(fireEscapePlatform15, this);
  updateParallaxObject(fireEscapePlatform16, this);
  updateParallaxObject(fireEscapePlatform17, this);
  updateParallaxObject(fireEscapePlatform18, this);
  updateParallaxObject(Building01roof, this);
  updateParallaxObject(Building02roof, this);
  updateParallaxObject(Building03roof, this);
  updateParallaxObject(Building04roof, this);
  updateParallaxObject(Building05roof, this);
  updateParallaxObject(Building06roof, this);
  updateParallaxObject(Building07roof, this);
  updateParallaxObject(Building08roof, this);
  updateParallaxObject(Building09roof, this);
  updateParallaxObject(Building10roof, this);
  updateParallaxObject(Building11roof, this);
  updateParallaxObject(Building12roof, this);
  updateParallaxObject(billboardCatwalk, this);
  updateParallaxObject(Building01LeftWall, this);
  updateParallaxObject(Building03LeftWall, this);
  updateParallaxObject(Building03RightWall, this);
  updateParallaxObject(Building04LeftWall, this);
  updateParallaxObject(Building04RightWall, this);
  updateParallaxObject(billboardJumpScaffoldPlatform, this);
  updateParallaxObject(building06ScaffoldPlatform, this);

  // =========================
  // JUNK FOOD GOBLIN PARALLAX - all goblins, looped
  // =========================
  // The platforms these goblins stand on (fireEscapePlatform,
  // fireEscapePlatform7, billboardCatwalk) all scroll at parallaxFactor
  // 0.6 via updateParallaxObject() above, NOT at the normal 1.0 world
  // scroll speed. A real physics-body goblin with gravity/colliders
  // still needs this same offset applied every frame, or it instantly
  // drifts away from the platform it's supposed to be standing on as
  // soon as the camera moves. Gravity keeps it seated vertically; this
  // keeps it seated horizontally in sync with its platform.
  junkFoodGoblins.forEach(goblin => {
    if (goblin && goblin.body && !goblin.isDead) {
      // Skip dead goblins entirely - once isDead is true, hitJunkFoodGoblin
      // takes over (zeroes velocity, re-asserts gravity off, plays the
      // death texture, then disableBody()s it 500ms later). Continuing to
      // touch a dead goblin's position/body here would fight that
      // sequence.
      goblin.x = goblin.baseX + this.cameras.main.scrollX * (1 - goblin.parallaxFactor);
    }
  });
}


// =========================
// SHARED: PARALLAX PHYSICS OBJECT UPDATE
// =========================
function updateParallaxObject(obj, scene) {
  if (!obj || !obj.body) {
    return;
  }

  obj.x = obj.baseX + scene.cameras.main.scrollX * (1 - obj.parallaxFactor);
  obj.body.updateFromGameObject();
}


// =========================================================
// =========================================================
//                    SEWER SCENE (Level 2)
// =========================================================
// =========================================================
// Platform-based level (no continuous floor) over an instant-death
// toxic water hazard. Reuses createPlayer, oneWayPlatformCheck,
// updateParallaxObject, cullOffscreenBullets, settleCasings, etc.
// exactly as they already exist - nothing shared is touched.
//
// SCOPE OF THIS FILE: geometry skeleton only. No enemies yet.
// Sections 1-18 per the sewer level plan, placeholder rectangles,
// toxic water kill-zone, and the level1EndSign -> fade -> SewerScene
// trigger. Enemy population comes in a later pass.
// =========================================================
// LEVEL 3 — INDUSTRIAL DISTRICT / COMFORT FACTORY
// =========================================================
const LEVEL3_WIDTH = GAME_WIDTH * 10;

let level3Floor;
let level3ExitGate;

let level3Platforms = [];
let level3Conveyors = [];
let level3EnemyMarkers = [];
let level3PickupMarkers = [];
let junkFoodDrones = [];
let junkFoodDroneProjectiles;
let reclinerChargers = [];

// Level 3 boss arena
let level3BossArenaTrigger;
let level3Boss;
let level3BossLeftWall;
let level3BossRightWall;
let level3BossFightActive = false;
let level3BossDead = false;
let level3BossHealthText;
let level3BossHealthBarBack;
let level3BossHealthBarFill;
let level3BossIntroText;
let level3BossGateStripes = [];

let level3BossFrameIndex = 0;
let level3BossNextFrameAt = 0;
let level3BossPhase = 1;
let level3BossCanTakeDamage = false;

const LEVEL3_BOSS_MAX_HEALTH = 30;
const LEVEL3_BOSS_ARENA_LEFT = 11525;
const LEVEL3_BOSS_ARENA_RIGHT = 12740;
const LEVEL3_BOSS_CHECKPOINT_X = 11380;
const LEVEL3_BOSS_CHECKPOINT_Y = 300;

const LEVEL3_PLATFORM_ART_OFFSET_Y = 28;
const LEVEL3_CONVEYOR_ART_OFFSET_Y = -15;
const LEVEL3_FLOOR_ART_Y = 545;
const LEVEL3_PLATFORM_ANIM_MS = 220;

// Level 3 placement tuning
const LEVEL3_PICKUP_OFFSET_Y = -55;
const LEVEL3_JFGOBLIN_OFFSET_Y = 55;

const LEVEL_SEWER_WIDTH = GAME_WIDTH * 10; // 12800, matches LEVEL1_WIDTH scale per your call

// Toxic water sits at the bottom of the whole level. Surface Y chosen
// lower than Level1's old floor (y:500) so platforms above it have
// room to float without feeling cramped against the kill-zone.
const TOXIC_WATER_Y = 560;

let toxicWater; // static body, instant-death overlap with player

// Sewer platform globals - one named var per platform, same pattern
// as fireEscapePlatform1-18 in Level1, so the parallax loop can
// address each one individually if/when these go parallax later.
// All currently parallaxFactor 1 (no parallax) - can be changed per
// platform if you want depth separation once we're past geometry.
let sewerPlatform01, sewerPlatform02, sewerPlatform03, sewerPlatform04,
    sewerPlatform05, sewerPlatform06, sewerPlatform07, sewerPlatform08,
    sewerPlatform09, sewerPlatform10, sewerPlatform11, sewerPlatform12,
    sewerPlatform13, sewerPlatform14, sewerPlatform15, sewerPlatform16,
    sewerPlatform17, sewerPlatform18, sewerPlatform19, sewerPlatform20,
    sewerPlatform21, sewerPlatform22, sewerPlatform23, sewerPlatform24,
    sewerPlatform25, sewerPlatform26, sewerPlatform27, sewerPlatform28,
    sewerPlatform29, sewerPlatform30, sewerPlatform31;

// The moving platform in section 13 needs its own update logic (bobs
// up/down) - kept separate from the static platform list above.
let movingPlatform13;

let sewerExitDoor;
let sewerSlimeDrops = [];
let sewerRats = [];

// =========================
// HIT TOXIC WATER (instant death, separate from hurtPlayer)
// =========================
// Does NOT go through hurtPlayer at all - no health decrement, no hurt
// tint, no knockback. Straight to the death/respawn-or-gameover flow,
// since contact with toxic water is specified as an instant kill, not
// a damage source.
function hitToxicWater(playerObject, waterObject) {

  if (debugInvincible) {
    return;
  }

  if (playerIsDead) {
    return;
  }

  playerIsDead = true;
  playerIsHurt = false;

  playerObject.setTexture('playerDead');
  playerObject.setVelocity(0, 0);
  playerObject.body.allowGravity = false; // stop sinking into the water visually

  playerLives--;
  livesDisplay.setTexture('lives' + playerLives);

  console.log("Player lives:", playerLives, "(toxic water)");

  playerObject.scene.time.delayedCall(700, () => {

    if (playerLives > 0) {

      playerHealth = 3;
      playerIsDead = false;
      playerIsHurt = false;
      playerCanTakeDamage = true;

      playerObject.clearTint();
      playerObject.body.allowGravity = true;

      // Respawn at the start of the current section's checkpoint.
      // For this skeleton pass, respawn at the level start - section
      // checkpoints can be added once the layout is confirmed.
      playerObject.x = 150;
      playerObject.y = 300;

      playerObject.setVelocity(0, 0);
      healthBar.setTexture('health3');

    } else {

      console.log("GAME OVER");
      gameOverScreen.setVisible(true);
    }
  });
}


// =========================
// SEWER SCENE CREATE
// =========================
// =========================
// CREATE SEWER PLATFORM VISUAL
// =========================
function createSewerPlatformVisual(scene, platform) {

  let textureKey;

  if (platform.width >= 400) {
    textureKey = 'sewerPlatformLong';
  } else if (platform.width >= 250) {
    textureKey = 'sewerPlatformMed';
  } else {
    textureKey = 'sewerPlatformSmall';
  }

  const visual = scene.add.image(
    platform.x,
    platform.y - 100, // offset so the visual sits above the physics body
    textureKey
  );

  visual.setOrigin(0.5, 0);
  visual.setDepth(5);

  const scale = platform.width / visual.width;
  visual.setScale(scale);

  platform.setVisible(false);
  platform.visual = visual;

  return visual;
}
// =========================
// CREATE SEWER PIPE DECOR
// =========================
function createSewerPipeDecor(scene, x, y, textureKey, scale = 0.25, flipX = false) {

  const pipe = scene.add.image(x, y, textureKey);

  pipe.setScale(scale);
  pipe.setDepth(-20);
  pipe.setFlipX(flipX);

  return pipe;
}
// =========================
// CREATE CONNECTED HORIZONTAL SEWER PIPE RUN
// =========================
function createConnectedSewerPipeRun(scene, startX, y, pieces, scale = 0.25) {

  let nextLeftEdge = startX;
  const createdPieces = [];

  pieces.forEach(piece => {

    const pipe = scene.add.image(
      0,
      y,
      piece.texture
    );

    pipe.setScale(scale);
    pipe.setDepth(-20);

    if (piece.flipX) {
      pipe.setFlipX(true);
    }

    // Position this pipe so its left edge touches the previous pipe's
    // right edge exactly.
    const PIPE_OVERLAP = 18;

pipe.x = nextLeftEdge + (pipe.displayWidth / 2);

nextLeftEdge += pipe.displayWidth - PIPE_OVERLAP;

    createdPieces.push(pipe);
  });

  return createdPieces;
}
// =========================
// HIT SEWER RAT
// =========================
function hitSewerRat(objectA, objectB) {

  let bulletObject;
  let ratObject;

  if (objectA.texture.key === 'bullet') {
    bulletObject = objectA;
    ratObject = objectB;
  } else {
    bulletObject = objectB;
    ratObject = objectA;
  }

  if (
    !bulletObject.active ||
    !ratObject.active ||
    ratObject.isDead ||
    ratObject.state === 'hidden'
  ) {
    return;
  }

  bulletObject.disableBody(true, true);

  ratObject.health =
    bulletObject.isPowerShot ? 0 : ratObject.health - 1;

   const hitEffect = ratObject.scene.add.image(
    ratObject.x,
    ratObject.y,
    'sewerRatHit'
  );

  hitEffect.setDepth(ratObject.depth + 1);
  hitEffect.setDisplaySize(
    ratObject.displayWidth,
    ratObject.displayHeight
  );
  hitEffect.setFlipX(ratObject.flipX);

  ratObject.scene.time.delayedCall(120, () => {
    hitEffect.destroy();
  });
  if (ratObject.health > 0) {
    return;
  }

   ratObject.isDead = true;
  ratObject.setVelocity(0, 0);

  const deathEffect = ratObject.scene.add.image(
    ratObject.x,
    ratObject.y,
    'sewerRatDeath'
  );

  deathEffect.setDepth(ratObject.depth + 1);
  deathEffect.setDisplaySize(
    ratObject.displayWidth,
    ratObject.displayHeight
  );
  deathEffect.setFlipX(ratObject.flipX);

  ratObject.disableBody(true, true);

  // Keep the empty pipe after an ambush rat dies.
  if (ratObject.ambushBackground) {
    ratObject.ambushBackground
      .setTexture('sewerRatAmbush01')
      .setVisible(true);
  }

  ratObject.scene.time.delayedCall(500, () => {
    deathEffect.destroy();
  });

  addScore(150);
}
// =========================
// SPAWN SEWER AMBUSH RAT
// =========================
function spawnSewerAmbushRat(
  scene,
  x,
  pipeY,
  groundY,
  groundObject,
  options = {}
) {

  const {
    triggerDistance = 220,
    chaseSpeed = 180,
    direction = -1
  } = options;

  const pipeBackground = scene.add.image(
    x,
    pipeY,
    'sewerRatAmbush01'
  );

  pipeBackground.setDepth(8);
  pipeBackground.setDisplaySize(180, 180);

  const rat = scene.physics.add.sprite(
    x,
    groundY,
    'sewerRatRun01'
  );

  rat.setDepth(18);
  rat.setDisplaySize(110, 80);
  rat.setVisible(false);
  rat.body.enable = false;

  rat.health = 2;
  rat.isDead = false;
  rat.state = 'hidden';
  rat.ratType = 'ambush';

  rat.spawnX = x;
  rat.pipeY = pipeY;
  rat.groundY = groundY;
  rat.triggerDistance = triggerDistance;
  rat.chaseSpeed = chaseSpeed;
  rat.direction = direction;
  rat.ambushBackground = pipeBackground;
  rat.blinkTimer = scene.time.now + 450;
  rat.blinkFrame = 0;
  rat.releaseAt = 0;

  if (!scene.anims.exists('sewerRatRun')) {
    scene.anims.create({
      key: 'sewerRatRun',
      frames: [
        { key: 'sewerRatRun01' },
        { key: 'sewerRatRun02' }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  if (groundObject) {
    scene.physics.add.collider(rat, groundObject);
  }

  scene.physics.add.overlap(player, rat, hurtPlayer, null, scene);
  scene.physics.add.overlap(bullets, rat, hitSewerRat, null, scene);

  sewerRats.push(rat);

  return rat;
}
// =========================
// SPAWN SEWER EATING RAT
// =========================
function spawnSewerEatingRat(
  scene,
  x,
  y,
  groundObject,
  options = {}
) {

  const {
    triggerDistance = 300,
    chaseSpeed = 180,
    direction = -1
  } = options;

  const rat = scene.physics.add.sprite(
    x,
    y,
    'sewerRatEat01'
  );

  rat.setDepth(18);
  rat.setDisplaySize(120, 90);
    const leftoverPile = scene.add.image(
    x,
    y,
    'sewerRatPile'
  );

  leftoverPile.setDepth(17);
  leftoverPile.setDisplaySize(120, 90);
  leftoverPile.setVisible(false);

  rat.leftoverPile = leftoverPile;

  rat.health = 2;
  rat.isDead = false;
  rat.state = 'eating';
  rat.ratType = 'eating';

  rat.spawnX = x;
  rat.triggerDistance = triggerDistance;
  rat.chaseSpeed = chaseSpeed;
  rat.direction = direction;

  if (!scene.anims.exists('sewerRatEat')) {
    scene.anims.create({
      key: 'sewerRatEat',
      frames: [
        { key: 'sewerRatEat01' },
        { key: 'sewerRatEat02' }
      ],
      frameRate: 4,
      repeat: -1
    });
  }

  if (!scene.anims.exists('sewerRatRun')) {
    scene.anims.create({
      key: 'sewerRatRun',
      frames: [
        { key: 'sewerRatRun01' },
        { key: 'sewerRatRun02' }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  rat.play('sewerRatEat');

  if (groundObject) {
    scene.physics.add.collider(rat, groundObject);
  }

  scene.physics.add.overlap(player, rat, hurtPlayer, null, scene);
  scene.physics.add.overlap(bullets, rat, hitSewerRat, null, scene);

  sewerRats.push(rat);

  return rat;
}
// =========================
// UPDATE SEWER RAT
// =========================
function updateSewerRat(scene, rat) {

  if (!rat || !rat.active || rat.isDead) {
    return;
  }
    // Rat fell into the toxic sludge
  if (rat.y >= TOXIC_WATER_Y - 10) {
    rat.isDead = true;
    rat.setVelocity(0, 0);

    const skeleton = scene.add.image(
      rat.x,
      TOXIC_WATER_Y - 5,
      'sewerRatSkeleton'
    );

    skeleton.setDepth(12);
    skeleton.setDisplaySize(110, 70);
    skeleton.setFlipX(rat.flipX);

    rat.disableBody(true, true);

    scene.time.delayedCall(2500, () => {
      skeleton.destroy();
    });

    return;
  }

  const distanceToPlayer = Math.abs(player.x - rat.spawnX);

  // Pipe eyes blinking
  if (rat.state === 'hidden') {

    if (scene.time.now >= rat.blinkTimer) {
      rat.blinkFrame = rat.blinkFrame === 0 ? 1 : 0;

      rat.ambushBackground.setTexture(
        rat.blinkFrame === 0
          ? 'sewerRatAmbush01'
          : 'sewerRatAmbush02'
      );

      rat.ambushBackground.setDisplaySize(180, 180);
      rat.blinkTimer = scene.time.now + 450;
    }

    if (distanceToPlayer <= rat.triggerDistance) {
      rat.state = 'jumping';

      rat.ambushBackground.setTexture('sewerRatAmbush03');
      rat.ambushBackground.setDisplaySize(180, 180);

      rat.releaseAt = scene.time.now + 350;
    }

    return;
  }

  // Brief rat-jumping-out frame
  if (rat.state === 'jumping') {

    if (scene.time.now >= rat.releaseAt) {
      rat.state = 'chasing';

            rat.ambushBackground.setTexture('sewerRatAmbush01');
      rat.ambushBackground.setVisible(true);

      rat.body.enable = true;
      rat.setActive(true);
      rat.setVisible(true);
      rat.setPosition(rat.spawnX, rat.groundY);
      rat.setDisplaySize(110, 80);
      rat.play('sewerRatRun');
    }

    return;
  }

  // Eating rat waits until approached
  if (rat.state === 'eating') {

    rat.setVelocityX(0);

    if (distanceToPlayer <= rat.triggerDistance) {
      rat.state = 'chasing';

      if (rat.leftoverPile) {
        rat.leftoverPile
          .setPosition(rat.x, rat.y)
          .setVisible(true);
      }

      rat.play('sewerRatRun');
    }

    return;
  }

  // Both rat types chase once activated
  if (rat.state === 'chasing') {

    if (player.x < rat.x) {
      rat.direction = -1;
      rat.setFlipX(false);
    } else {
      rat.direction = 1;
      rat.setFlipX(true);
    }

    rat.setVelocityX(rat.chaseSpeed * rat.direction);
  }
}
// =========================
// SPAWN SEWER SLIME DROP HAZARD
// =========================
function spawnSewerSlimeDrop(scene, x, y, options = {}) {

  const {
    warningDuration = 700,
    cooldownDuration = 2200,
    dropSpeed = 420
  } = options;

  // Permanent ceiling glob
  const baseGlob = scene.add.image(x, y, 'sewerSlimeDrop01');
  baseGlob.setDepth(35);
  baseGlob.setDisplaySize(140, 140);

  // Warning overlay
  const warning = scene.add.image(x, y, 'sewerSlimeDrop02');
  warning.setDepth(36);
  warning.setDisplaySize(140, 140);
  warning.setVisible(false);

  // Falling damaging drop
  const fallingDrop = scene.physics.add.sprite(
    x,
    y + 20,
    'sewerSlimeDrop03'
  );

  fallingDrop.setDepth(37);
    fallingDrop.setDisplaySize(80, 120);
  fallingDrop.body.allowGravity = false;
   fallingDrop.disableBody(true, true);

  const hazard = {
    x,
    y,
    baseGlob,
    warning,
    fallingDrop,
    warningDuration,
    cooldownDuration,
    dropSpeed,
    state: 'idle',
    nextStateAt: scene.time.now + cooldownDuration
  };

  scene.physics.add.overlap(
    player,
    fallingDrop,
    hurtPlayer,
    null,
    scene
  );

  sewerSlimeDrops.push(hazard);

  return hazard;
}
// =========================
// UPDATE SEWER SLIME DROP HAZARD
// =========================
function updateSewerSlimeDrop(scene, hazard) {

  if (!hazard) {
    return;
  }

  // WAITING: frame 01 remains permanently visible
  if (hazard.state === 'idle') {

    if (scene.time.now >= hazard.nextStateAt) {
      hazard.state = 'warning';

      // Frame 02 appears directly over frame 01
      hazard.warning.setPosition(hazard.x, hazard.y);
      hazard.warning.setVisible(true);

      hazard.nextStateAt =
        scene.time.now + hazard.warningDuration;
    }

    return;
  }

  // WARNING: frame 02 plays briefly before frame 03 drops
  if (hazard.state === 'warning') {

    if (scene.time.now >= hazard.nextStateAt) {
      hazard.state = 'falling';

      hazard.warning.setVisible(false);

      hazard.fallingDrop.enableBody(
        true,
        hazard.x,
        hazard.y + 25,
        true,
        true
      );
      hazard.fallingDrop.setTexture('sewerSlimeDrop03');
      hazard.fallingDrop.setActive(true);
      hazard.fallingDrop.setVisible(true);
      hazard.fallingDrop.setDepth(37);
      hazard.fallingDrop.setDisplaySize(140, 180);

      hazard.fallingDrop.body.setSize(
        hazard.fallingDrop.width * 0.35,
        hazard.fallingDrop.height * 0.55
      );

      hazard.fallingDrop.body.setOffset(
        hazard.fallingDrop.width * 0.325,
        hazard.fallingDrop.height * 0.25
      );
      hazard.fallingDrop.setVelocity(0, hazard.dropSpeed);
    }

    return;
  }

  // FALLING: frame 03 drops and damages the player
  if (hazard.state === 'falling') {

    if (
      hazard.fallingDrop.y >
      TOXIC_WATER_Y + 100
    ) {
      hazard.fallingDrop.disableBody(true, true);

      hazard.state = 'idle';
      hazard.nextStateAt =
        scene.time.now + hazard.cooldownDuration;
    }
  }
}
function createSewerScene() {

  currentLevel = 'sewer';
  levelTransitioning = false; // reset so the next level's own trigger isn't blocked

  this.cameras.main.setBackgroundColor('#0a0f0a');
    // =========================
  // SEWER BACKGROUND WALLS
  // =========================
  const sewerEyeWalls = [];

  const sewerWallPattern = [
    'sewerWallPlain',
    'sewerWallBars',
    'sewerWallPlain',
    'sewerWallEyes01'
  ];

  for (let x = 0; x < LEVEL_SEWER_WIDTH; x += GAME_WIDTH) {

    const textureKey =
      sewerWallPattern[(x / GAME_WIDTH) % sewerWallPattern.length];

    const wall = this.add.image(
      x + (GAME_WIDTH / 2),
      GAME_HEIGHT / 2,
      textureKey
    );

    wall.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    wall.setDepth(-100);

    if (textureKey === 'sewerWallEyes01') {
      sewerEyeWalls.push(wall);
    }
  }
    const sewerEyeFrames = [
    'sewerWallEyes01',
    'sewerWallEyes02',
    'sewerWallEyes03',
    'sewerWallEyes02',
    'sewerWallEyes01'
  ];

  let sewerEyeFrameIndex = 0;

  this.time.addEvent({
    delay: 180,
    loop: true,
    callback: () => {

      sewerEyeFrameIndex =
        (sewerEyeFrameIndex + 1) % sewerEyeFrames.length;

      sewerEyeWalls.forEach(wall => {
        wall.setTexture(sewerEyeFrames[sewerEyeFrameIndex]);
        wall.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      });
    }
  });

  // =========================
  // TOXIC WATER (instant-death hazard, runs the full level width)
  // =========================
    const sludgeVisual = this.add.tileSprite(
    LEVEL_SEWER_WIDTH / 2,
    TOXIC_WATER_Y - 100,
    LEVEL_SEWER_WIDTH,
    160,
    'sewerSludge'
  );

  sludgeVisual.setDepth(0);
  sludgeVisual.setOrigin(0.5, 0);
    sludgeVisual.setTileScale(0.2, 0.2);
      const sludgeFrames = [
    'sewerSludge',
    'sewerSludge02',
    'sewerSludge03'
  ];

  let sludgeFrameIndex = 0;

  this.time.addEvent({
    delay: 250,
    loop: true,
    callback: () => {
      sludgeFrameIndex = (sludgeFrameIndex + 1) % sludgeFrames.length;
      sludgeVisual.setTexture(sludgeFrames[sludgeFrameIndex]);
    }
  });
  toxicWater = this.add.rectangle(
    LEVEL_SEWER_WIDTH / 2,
    TOXIC_WATER_Y + 40,
    LEVEL_SEWER_WIDTH,
    80,
    0x4caf32,
    0.5
  );
    toxicWater.setVisible(false);
  this.physics.add.existing(toxicWater, true);

    // =========================
  // SECTION 1 - ENTRY TUNNEL
  // =========================
  sewerPlatform01 = this.add.rectangle(200, 500, 500, 20, 0xff0000);
  sewerPlatform02 = this.add.rectangle(650, 460, 260, 20, 0xff0000);

  // =========================
  // SECTION 2 - RISING CATWALKS
  // =========================
  sewerPlatform03 = this.add.rectangle(1000, 400, 260, 20, 0xff0000);
  sewerPlatform04 = this.add.rectangle(1350, 300, 220, 20, 0xff0000);

  // Drop back toward the sludge
  sewerPlatform05 = this.add.rectangle(1700, 440, 280, 20, 0xff0000);
  sewerPlatform06 = this.add.rectangle(2150, 500, 420, 20, 0xff0000);
  sewerPlatform07 = this.add.rectangle(2600, 420, 300, 20, 0xff0000);

  // =========================================================
  // ROUTE SPLIT 1
  // Lower route is easier but closer to the sludge.
  // Upper route requires more climbing and precision.
  // =========================================================

  // LOWER ROUTE
  sewerPlatform08 = this.add.rectangle(2950, 500, 260, 20, 0xff0000);
  sewerPlatform10 = this.add.rectangle(3400, 500, 260, 20, 0xff0000);
  sewerPlatform12 = this.add.rectangle(3850, 480, 260, 20, 0xff0000);
  sewerPlatform13 = this.add.rectangle(4300, 500, 300, 20, 0xff0000);

  // UPPER ROUTE
  sewerPlatform09 = this.add.rectangle(3050, 340, 220, 20, 0xff0000);
  sewerPlatform11 = this.add.rectangle(3500, 220, 220, 20, 0xff0000);
  sewerPlatform14 = this.add.rectangle(3950, 320, 240, 20, 0xff0000);
  sewerPlatform15 = this.add.rectangle(4450, 240, 240, 20, 0xff0000);

  // BOTH ROUTES REJOIN HERE
  sewerPlatform16 = this.add.rectangle(4850, 420, 260, 20, 0xff0000);

  // =========================================================
  // ROUTE SPLIT 2
  // Lower route uses the moving platform.
  // Upper route stays high over the sludge.
  // =========================================================

  // LOWER ROUTE
  sewerPlatform17 = this.add.rectangle(5300, 500, 220, 20, 0xff0000);
  sewerPlatform19 = this.add.rectangle(5800, 500, 220, 20, 0xff0000);
  sewerPlatform21 = this.add.rectangle(6300, 480, 240, 20, 0xff0000);

  movingPlatform13 = this.add.rectangle(6800, 430, 180, 20, 0xff0000);
  movingPlatform13.baseY = 430;
  movingPlatform13.bobRange = 180;
  movingPlatform13.bobSpeed = 0.0015;

  // UPPER ROUTE
  sewerPlatform18 = this.add.rectangle(5250, 300, 220, 20, 0xff0000);
  sewerPlatform20 = this.add.rectangle(5750, 200, 220, 20, 0xff0000);
  sewerPlatform22 = this.add.rectangle(6250, 320, 220, 20, 0xff0000);
  sewerPlatform23 = this.add.rectangle(6900, 220, 240, 20, 0xff0000);

  // BOTH ROUTES REJOIN HERE
  sewerPlatform24 = this.add.rectangle(7350, 420, 260, 20, 0xff0000);

  // =========================
  // LONG LOW HAZARD RUN
  // =========================
  sewerPlatform25 = this.add.rectangle(7750, 500, 500, 20, 0xff0000);

  // =========================
  // FINAL VERTICAL CLIMB
  // =========================
  sewerPlatform26 = this.add.rectangle(8250, 360, 240, 20, 0xff0000);
  sewerPlatform27 = this.add.rectangle(8600, 220, 220, 20, 0xff0000);
  sewerPlatform28 = this.add.rectangle(8950, 380, 260, 20, 0xff0000);

  // Drop low, then climb once more
  sewerPlatform29 = this.add.rectangle(9400, 500, 260, 20, 0xff0000);
  sewerPlatform30 = this.add.rectangle(9800, 340, 240, 20, 0xff0000);

  // =========================
  // EXIT CHAMBER
  // =========================
  sewerPlatform31 = this.add.rectangle(10350, 480, 700, 20, 0xff0000);

  // Exit door - same overlap-trigger pattern as apartmentDoor, just
  // pointed at whatever comes after the sewer (stubbed for now).
 sewerExitDoor = this.physics.add.sprite(10700, 410, 'sewerExit');
sewerExitDoor.setScale(0.35);
sewerExitDoor.setDepth(10);
sewerExitDoor.setOrigin(0.5, 1);
  sewerExitDoor.body.allowGravity = false;
  sewerExitDoor.body.immovable = true;

  // =========================
  // PLAYER
  // =========================
  const sewerStart = getDebugStartPosition(150, 300);
player = createPlayer(this, sewerStart.x, sewerStart.y);
  // =========================
  // SEWER SLIME DROP HAZARDS
  // =========================
  sewerSlimeDrops = [];

  spawnSewerSlimeDrop(this, 1800, 80);
  spawnSewerSlimeDrop(this, 4100, 80, {
    cooldownDuration: 1800
  });
  spawnSewerSlimeDrop(this, 7900, 80, {
    warningDuration: 400,
    cooldownDuration: 1600
  });
  // =========================
  // GROUPS / INPUT
  // =========================
  bullets = this.physics.add.group();
  casings = this.physics.add.group();

  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  invincibleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

  // =========================
  // COLLIDERS - every sewer platform, one-way via oneWayPlatformCheck
  // =========================
  const allSewerPlatforms = [
    sewerPlatform01, sewerPlatform02, sewerPlatform03, sewerPlatform04,
    sewerPlatform05, sewerPlatform06, sewerPlatform07, sewerPlatform08,
    sewerPlatform09, sewerPlatform10, sewerPlatform11, sewerPlatform12,
    sewerPlatform13, sewerPlatform14, sewerPlatform15, sewerPlatform16,
    sewerPlatform17, sewerPlatform18, sewerPlatform19, sewerPlatform20,
    sewerPlatform21, sewerPlatform22, sewerPlatform23, sewerPlatform24,
    sewerPlatform25, sewerPlatform26, sewerPlatform27, sewerPlatform28,
    sewerPlatform29, sewerPlatform30, sewerPlatform31
  ];
    allSewerPlatforms.forEach(p => {
    createSewerPlatformVisual(this, p);
  });

  // Final platform visual sits too low against its collider.
  // Move only the art up, not the actual hitbox.
  sewerPlatform31.visual.y -= 35;

  createSewerPlatformVisual(this, movingPlatform13);
  allSewerPlatforms.forEach(p => {
    this.physics.add.existing(p, true);
    this.physics.add.collider(player, p, null, oneWayPlatformCheck, this);
    this.physics.add.collider(casings, p, null, oneWayPlatformCheck, this);
  });
    // =========================
  // SEWER ENEMIES / PICKUPS
  // =========================
  slimes = [];
  junkFoodGoblins = [];
  pickups = [];
  activeUpgrade = null;
  if (upgradeText) { upgradeText.destroy(); upgradeText = null; }
  jfgoblinCans = this.physics.add.group();

// -------------------------
// SEWER SLIMES
// -------------------------
spawnSlime(
  this,
  1050,
  280,
  sewerPlatform03,
  900,
  1100,
  1,
  {
    width: 0.70,
    height: 0.55,
    offsetX: 0.15,
    offsetY: 0.05
  }
);

spawnSlime(
  this,
  3000,
  380,
  sewerPlatform08,
  2860,
  3040,
  -1,
  {
    width: 0.70,
    height: 0.55,
    offsetX: 0.15,
    offsetY: 0.05
  }
);

spawnSlime(
  this,
  4850,
  300,
  sewerPlatform16,
  4740,
  4960,
  1,
  {
    width: 0.70,
    height: 0.55,
    offsetX: 0.15,
    offsetY: 0.05
  }
);

spawnSlime(
  this,
  6300,
  360,
  sewerPlatform21,
  6200,
  6400,
  -1,
  {
    width: 0.70,
    height: 0.55,
    offsetX: 0.15,
    offsetY: 0.05
  }
);

spawnSlime(
  this,
  8950,
  260,
  sewerPlatform28,
  8840,
  9060,
  1,
  {
    width: 0.70,
    height: 0.55,
    offsetX: 0.15,
    offsetY: 0.05
  }
);
// -------------------------
// SEWER PICKUPS
// -------------------------

// Early mercy health after first climbing/slime section
spawnPickup(this, 1350, 230, 'health');

// Route split reward — upper route power-up
spawnPickup(this, 3050, 270, 'upgrade');

// Mid-level health before moving-platform / rat section
spawnPickup(this, 6300, 410, 'health');

// Late health before final climb
spawnPickup(this, 8950, 310, 'health');
  // -------------------------
  // SEWER JUNK FOOD GOBLINS
  // -------------------------

  // Stationary throwing goblin
  spawnJunkFoodGoblin(
    this,
    3500,
    210,
    {
      canThrow: true,
      parallaxFactor: 1
    }
  );

  // Stationary throwing goblin
  spawnJunkFoodGoblin(
    this,
    5750,
    190,
    {
      canThrow: true,
      parallaxFactor: 1
    }
  );

  // Patrolling goblin on the long platform
  spawnJunkFoodGoblin(
    this,
    7750,
    490,
    {
      patrolLeft: 7580,
      patrolRight: 7920,
      canThrow: true,
      parallaxFactor: 1
    }
  );
  // =========================
  // SEWER HABIT RATS
  // Platforms now have physics bodies
  // =========================
 // First ambush — rear of sewerPlatform06
 sewerRats = [];
spawnSewerAmbushRat(
  this,
  2270,
  400,
  400,
  sewerPlatform06,
  {
    triggerDistance: 180,
    chaseSpeed: 180
  }
);

// Second ambush — rear of sewerPlatform10
spawnSewerAmbushRat(
  this,
  3440,
  400,
  400,
  sewerPlatform10,
  {
    triggerDistance: 170,
    chaseSpeed: 190
  }
);

// Third ambush — rear of sewerPlatform19
spawnSewerAmbushRat(
  this,
  5820,
  400,
  400,
  sewerPlatform19,
  {
    triggerDistance: 170,
    chaseSpeed: 200
  }
);

// Fourth ambush — rear of sewerPlatform25
spawnSewerAmbushRat(
  this,
  7910,
  400,
  400,
  sewerPlatform25,
  {
    triggerDistance: 190,
    chaseSpeed: 210
  }
);
spawnSewerEatingRat(
  this,
  4300,
  400,
  sewerPlatform13
);

spawnSewerEatingRat(
  this,
  9400,
  400,
  sewerPlatform29,
  {
    triggerDistance: 325,
    chaseSpeed: 200
  }
);

  // Moving platform gets its own collider (not one-way, since it's a
  // single jump-across rather than a stack to drop through) and is
  // NOT in allSewerPlatforms above, since its Y changes every frame
  // under update logic rather than sitting static.
  this.physics.add.existing(movingPlatform13, true);
  this.physics.add.collider(player, movingPlatform13, null, oneWayPlatformCheck, this);
  this.physics.add.collider(casings, movingPlatform13, null, oneWayPlatformCheck, this);

  // Toxic water - instant death overlap, separate from every other
  // collider above.
  this.physics.add.overlap(player, toxicWater, hitToxicWater, null, this);

  // Exit door overlap - stubbed destination scene for now.
  this.physics.add.overlap(player, sewerExitDoor, enterSewerExit, null, this);

  // =========================
  // WORLD / CAMERA
  // =========================
  this.physics.world.setBounds(0, -450, LEVEL_SEWER_WIDTH, GAME_HEIGHT + 750);
  this.cameras.main.setBounds(0, -450, LEVEL_SEWER_WIDTH, GAME_HEIGHT + 450);
  this.cameras.main.startFollow(player);
// =========================
// GAME OVER SCREEN
// =========================
createGameOverScreen(this);
  // =========================
  // HUD / CONTROLS
  // =========================
  createHUD(this);

  // =========================
  // LEVEL TRANSITION FADE SCREEN
  // =========================
  createFadeScreen(this);
}


// =========================
// SEWER SCENE UPDATE
// =========================
function updateSewerScene() {

  if (Phaser.Input.Keyboard.JustDown(invincibleKey)) {
    debugInvincible = !debugInvincible;
    console.log("Invincibility:", debugInvincible ? "ON" : "OFF");
  }

  if (playerIsDead) {
    player.body.setVelocityX(0);
    player.setTexture('playerDead');
      sewerSlimeDrops.forEach(hazard => {
    updateSewerSlimeDrop(this, hazard);
  });
      sewerRats.forEach(rat => {
    updateSewerRat(this, rat);
  });

  slimes.forEach(slime => {
    patrolSlime(slime, 60);
  });

  junkFoodGoblins.forEach(goblin => {
    patrolJunkFoodGoblin(goblin, 30);
    updateJunkFoodGoblinThrow(this, goblin);
  });

  updateMovingPlatform13(this);
  return;
}

  // MOVE LEFT / RIGHT
  if (cursors.left.isDown || moveLeft) {
    player.body.setVelocityX(-300);
    player.setFlipX(true);
  } else if (cursors.right.isDown || moveRight) {
    player.body.setVelocityX(300);
    player.setFlipX(false);
  } else {
    player.body.setVelocityX(0);
  }

  // JUMP
  if ((cursors.up.isDown || jumpPressed) && player.body.blocked.down) {
    player.body.setVelocityY(-600);
  }

  // CROUCH
  playerIsCrouching =
    (cursors.down.isDown || crouchPressed) &&
    player.body.blocked.down;
      if (playerIsCrouching) {
    setPlayerCrouchBody();
  } else {
    setPlayerStandingBody();
  }

  if (playerIsCrouching) {
    player.body.setVelocityX(0);
    player.setTexture('playerCrouch');
  } else if (!player.body.blocked.down) {
    if (player.body.velocity.y < -100) {
      player.setTexture('playerJump1');
    } else if (player.body.velocity.y >= -100 && player.body.velocity.y <= 100) {
      player.setTexture('playerJump2');
    } else {
      player.setTexture('playerJump3');
    }
  } else if (cursors.left.isDown || cursors.right.isDown || moveLeft || moveRight) {
    player.play('run', true);
  } else {
    player.play('idle', true);
  }

  // SHOOTING (kept identical to Level1 - no enemies yet, but bullets
  // need to exist/cull correctly from the start)
  if (Phaser.Input.Keyboard.JustDown(fireKey) && !playerIsDead) {
    firePlayerBullet(this);
  }

  if (activeUpgrade === 'firerate' && !playerIsDead && (fireKey.isDown || firePressed)) {
    firePlayerBullet(this);
  }

    cullOffscreenBullets(this);

  updateHomingBullets(
    this,
    [
      ...slimes,
      ...junkFoodGoblins,
      ...sewerRats
    ]
  );

  updateActiveUpgrade(this);
  pickups.forEach(p => updatePickup(this, p));
  settleCasings();

   sewerSlimeDrops.forEach(hazard => {
    updateSewerSlimeDrop(this, hazard);
  });

    sewerRats.forEach(rat => {
    updateSewerRat(this, rat);
  });

  slimes.forEach(slime => {
    patrolSlime(slime, 60);
  });

  junkFoodGoblins.forEach(goblin => {
    patrolJunkFoodGoblin(goblin, 30);
    updateJunkFoodGoblinThrow(this, goblin);
  });

  updateMovingPlatform13(this);
}


// =========================
// SHARED-STYLE: UPDATE THE SECTION-13 MOVING PLATFORM
// =========================
// Scoped to this scene only (not added to the shared function block
// above the scene definitions) since no other level currently has a
// vertically-oscillating platform. Bobs between baseY - bobRange/2 and
// baseY + bobRange/2 using a sine wave, same timing style as the swoop
// bat's hover bob.
function updateMovingPlatform13(scene) {
  if (!movingPlatform13 || !movingPlatform13.body) {
    return;
  }

  movingPlatform13.y = movingPlatform13.baseY +
    Math.sin(scene.time.now * movingPlatform13.bobSpeed) * (movingPlatform13.bobRange / 2);
  if (movingPlatform13.visual) {
    movingPlatform13.visual.x = movingPlatform13.x;
        movingPlatform13.visual.y = movingPlatform13.y - 75;
  }
  movingPlatform13.body.updateFromGameObject();
}
// =========================
// LEVEL 3: INDUSTRIAL FLOATING PLATFORM
// =========================
function createLevel3Platform(scene, x, y, width, height = 20) {

  // Invisible physics platform
  const platform = scene.add.rectangle(x, y, width, height, 0xff0000);
  platform.setVisible(false);

  scene.physics.add.existing(platform, true);
  scene.physics.add.collider(player, platform, null, oneWayPlatformCheck, scene);
  scene.physics.add.collider(casings, platform, null, oneWayPlatformCheck, scene);

    // Visible floating platform art
  // Tiny platforms need their art slightly higher so the player
  // does not look like he is floating above them.
  const platformArtOffsetY =
    width <= 170
      ? LEVEL3_PLATFORM_ART_OFFSET_Y - 12
      : LEVEL3_PLATFORM_ART_OFFSET_Y;

  const visual = scene.add.image(
    x,
    y + platformArtOffsetY,
    'industrialPlatform'
  );
  visual.setOrigin(0.5, 0.5);
  visual.setDepth(5);

  const scale = width / visual.width;
  visual.setScale(scale);

  // Store exact rendered size so frame 2 cannot jitter/pulse
  platform.visual = visual;
  platform.visualWidth = visual.displayWidth;
  platform.visualHeight = visual.displayHeight;

  // Thruster animation state
  platform.frameIndex = 0;
  platform.frameKeys = [
    'industrialPlatform',
    'industrialPlatform2'
  ];
  platform.nextFrameAt =
    scene.time.now + Phaser.Math.Between(0, LEVEL3_PLATFORM_ANIM_MS);

  level3Platforms.push(platform);

  return platform;
}
// =========================
// LEVEL 3: UPDATE FLOATING PLATFORM THRUSTERS
// =========================
function updateLevel3Platforms(scene) {

  level3Platforms.forEach(platform => {
    if (!platform || !platform.visual) {
      return;
    }

    if (scene.time.now < platform.nextFrameAt) {
      return;
    }

    platform.frameIndex =
      (platform.frameIndex + 1) % platform.frameKeys.length;

    platform.visual.setTexture(platform.frameKeys[platform.frameIndex]);

    // Lock size after texture swap so frame 2 never shifts/jitters
    platform.visual.setDisplaySize(
      platform.visualWidth,
      platform.visualHeight
    );

    platform.nextFrameAt = scene.time.now + LEVEL3_PLATFORM_ANIM_MS;
  });
}
// =========================
// LEVEL 3: INDUSTRIAL CONVEYOR
// =========================
function createLevel3Conveyor(scene, x, y, width, direction = 1) {

  // Invisible physics conveyor
  const conveyor = scene.add.rectangle(x, y, width, 24, 0x00aaff);
  conveyor.setVisible(false);

  scene.physics.add.existing(conveyor, true);
  scene.physics.add.collider(player, conveyor);
  scene.physics.add.collider(casings, conveyor);

  conveyor.direction = direction;
  conveyor.pushSpeed = 90;

  // Visible conveyor art
  const visual = scene.add.image(
  x,
  y + LEVEL3_CONVEYOR_ART_OFFSET_Y,
  'industrialConveyor01'
);
  visual.setOrigin(0.5, 0.5);
  visual.setDepth(6);

  // One conveyor asset scaled to match collider width
  const scale = width / visual.width;
  visual.setScale(scale);

  // direction 1 = right, direction -1 = left/flipped
  visual.setFlipX(direction === -1);

  conveyor.visual = visual;
  conveyor.frameIndex = 0;
  conveyor.nextFrameAt = 0;

  level3Conveyors.push(conveyor);

  return conveyor;
}
// =========================
// LEVEL 3: INDUSTRIAL FLOOR VISUAL
// =========================
function createLevel3FloorVisual(scene) {

  if (!scene.textures.exists('industrialFloor')) {
    console.error('MISSING TEXTURE: industrialFloor / assets/industrial_floor.png');
    return;
  }

  const sourceImage = scene.textures
    .get('industrialFloor')
    .getSourceImage();

  // Floor collider center is y 500, height 40.
  // Collider top is around y 480.
  const floorArtTopY = 425;

  // Adjust this if floor art is too tall/short.
  const floorArtHeight = 225;

  const floorScale = floorArtHeight / sourceImage.height;
  const floorPieceWidth = sourceImage.width * floorScale;

  // Overlap hides transparent edge/seam between floor pieces.
  const floorOverlap = 24;
  const stepX = floorPieceWidth - floorOverlap;

  let x = 0;

  while (x < LEVEL3_WIDTH + floorPieceWidth) {

    const floorPiece = scene.add.image(
      x,
      floorArtTopY,
      'industrialFloor'
    );

    floorPiece.setOrigin(0, 0);
    floorPiece.setDepth(4);
    floorPiece.setScale(floorScale);

    x += stepX;
  }
}
// =========================
// LEVEL 3: UPDATE CONVEYORS
// =========================
function updateLevel3Conveyors(scene) {

  const conveyorFrames = [
    'industrialConveyor01',
    'industrialConveyor02',
    'industrialConveyor03'
  ];

  level3Conveyors.forEach(conveyor => {
    if (!conveyor || !conveyor.body) {
      return;
    }

    // Animate visible conveyor belt
    if (conveyor.visual && scene.time.now >= conveyor.nextFrameAt) {
      conveyor.frameIndex = (conveyor.frameIndex + 1) % conveyorFrames.length;
      conveyor.visual.setTexture(conveyorFrames[conveyor.frameIndex]);
      conveyor.visual.setFlipX(conveyor.direction === -1);
      conveyor.nextFrameAt = scene.time.now + 120;
    }

    const playerBottom = player.body.bottom;
    const conveyorTop = conveyor.body.top;

    // Player must be actually standing ON this conveyor, not merely
    // above it on a higher platform with the same X range.
    const playerOnThisConveyor =
      player.body.blocked.down &&
      playerBottom >= conveyorTop - 8 &&
      playerBottom <= conveyorTop + 18 &&
      player.x > conveyor.x - conveyor.width / 2 &&
      player.x < conveyor.x + conveyor.width / 2;

    // Crouching should NOT cancel conveyor movement.
    if (playerOnThisConveyor) {
      player.x += conveyor.direction * conveyor.pushSpeed / 60;
    }
  });
}
// =========================
// LEVEL 3: SPAWN JUNK FOOD DRONE
// =========================
function spawnJunkFoodDrone(scene, x, y, options = {}) {

  const {
    leftBound = x - 120,
    rightBound = x + 120,
    direction = 1,
    shootCooldown = 1800
  } = options;

  const drone = scene.physics.add.sprite(x, y, 'junkFoodDroneIdle01');

  drone.setDepth(32);
  drone.setScale(0.14);
  drone.body.allowGravity = false;

  drone.health = 4;
  drone.isDead = false;

  drone.leftBound = leftBound;
  drone.rightBound = rightBound;
  drone.direction = direction;
  drone.baseY = y;

  drone.shootCooldown = shootCooldown;
  drone.nextShotAt = scene.time.now + 1200;

  drone.frameIndex = 0;
  drone.nextFrameAt = 0;

  drone.body.setSize(drone.width * 0.65, drone.height * 0.55);
  drone.body.setOffset(drone.width * 0.175, drone.height * 0.225);

  scene.physics.add.overlap(player, drone, hurtPlayer, null, scene);
  scene.physics.add.overlap(bullets, drone, hitJunkFoodDrone, null, scene);

  junkFoodDrones.push(drone);

  return drone;
}


// =========================
// LEVEL 3: UPDATE JUNK FOOD DRONE
// =========================
function updateJunkFoodDrone(scene, drone) {

  if (!drone || !drone.active || drone.isDead) {
    return;
  }

  // Slow patrol, not bat-style aggressive movement
  drone.x += drone.direction * 0.45;
  drone.y = drone.baseY + Math.sin(scene.time.now * 0.004) * 8;

  if (drone.x <= drone.leftBound) {
    drone.direction = 1;
  }

  if (drone.x >= drone.rightBound) {
    drone.direction = -1;
  }

  // Face player
  drone.setFlipX(player.x > drone.x);

  // Idle animation
  if (scene.time.now >= drone.nextFrameAt) {
    drone.frameIndex = drone.frameIndex === 0 ? 1 : 0;
    drone.setTexture(
      drone.frameIndex === 0
        ? 'junkFoodDroneIdle01'
        : 'junkFoodDroneIdle02'
    );
    drone.nextFrameAt = scene.time.now + 180;
  }

  // Shoot at player
  const playerClose = Math.abs(player.x - drone.x) < 650;

  if (playerClose && scene.time.now >= drone.nextShotAt) {
    drone.nextShotAt = scene.time.now + drone.shootCooldown;
    fireJunkFoodDroneProjectile(scene, drone);
  }
}


// =========================
// LEVEL 3: DRONE SHOOTS PROJECTILE
// =========================
function fireJunkFoodDroneProjectile(scene, drone) {

  if (!junkFoodDroneProjectiles) {
    return;
  }

  const projectile = junkFoodDroneProjectiles.create(
    drone.x,
    drone.y + 35,
    'junkFoodDroneProjectile'
  );

  projectile.setDepth(31);
projectile.setScale(0.08);
projectile.body.allowGravity = false;

// Smaller damage box than the cheese projectile art.
// Keeps drone shots fair and prevents cheap edge hits.
projectile.body.setSize(
  projectile.width * 0.35,
  projectile.height * 0.35
);

projectile.body.setOffset(
  projectile.width * 0.325,
  projectile.height * 0.325
);
  const dx = player.x - drone.x;
  const dy = player.y - drone.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

 const speed = 280;

  projectile.setVelocity(
    (dx / dist) * speed,
    (dy / dist) * speed
  );
  projectile.setRotation(
  Phaser.Math.Angle.Between(
    drone.x,
    drone.y,
    player.x,
    player.y
  )
);


  scene.physics.add.overlap(player, projectile, hurtPlayer, null, scene);

  scene.time.delayedCall(4000, () => {
    if (projectile && projectile.active) {
      projectile.disableBody(true, true);
    }
  });
}


// =========================
// LEVEL 3: HIT JUNK FOOD DRONE
// =========================
function hitJunkFoodDrone(objectA, objectB) {

  let bulletObject;
  let droneObject;

  if (objectA.texture.key === 'bullet') {
    bulletObject = objectA;
    droneObject = objectB;
  } else {
    bulletObject = objectB;
    droneObject = objectA;
  }

  if (!bulletObject.active || bulletObject.hasHit || droneObject.isDead) {
    return;
  }

  bulletObject.hasHit = true;
  bulletObject.disableBody(true, true);

  droneObject.health = bulletObject.isPowerShot ? 0 : droneObject.health - 1;

  const hitEffect = droneObject.scene.add.image(
    droneObject.x,
    droneObject.y,
    'junkFoodDroneHit'
  );

  hitEffect.setDepth(droneObject.depth + 1);
  hitEffect.setScale(droneObject.scaleX, droneObject.scaleY);
  hitEffect.setFlipX(droneObject.flipX);

  droneObject.scene.time.delayedCall(120, () => {
    hitEffect.destroy();
  });

  if (droneObject.health > 0) {
    return;
  }

  droneObject.isDead = true;
  droneObject.body.setVelocity(0, 0);

  const deathEffect = droneObject.scene.add.image(
    droneObject.x,
    droneObject.y,
    'junkFoodDroneDeath'
  );

  deathEffect.setDepth(droneObject.depth + 1);
  deathEffect.setScale(droneObject.scaleX, droneObject.scaleY);
  deathEffect.setFlipX(droneObject.flipX);

  droneObject.disableBody(true, true);

  addScore(350);

  droneObject.scene.time.delayedCall(500, () => {
    deathEffect.destroy();
  });
}
// =========================
// LEVEL 3: SPAWN RECLINER CHARGER
// =========================
function spawnReclinerCharger(scene, triggerX, y, options = {}) {

  const {
    startOffset = 900,
    stopOffset = 420,
    exitOffset = -800
  } = options;

  const charger = scene.physics.add.sprite(
    triggerX + startOffset,
    y,
    'chargerIdle01'
  );

  charger.setDepth(29);
  charger.setScale(0.2);
  charger.body.allowGravity = false;
  charger.body.immovable = true;

  charger.body.setSize(charger.width * 0.75, charger.height * 0.42);
  charger.body.setOffset(charger.width * 0.125, charger.height * 0.50);

  charger.triggerX = triggerX;
  charger.startX = triggerX + startOffset;
  charger.stopX = triggerX + stopOffset;
  charger.exitX = triggerX + exitOffset;

  charger.baseY = y;
  charger.state = 'waiting';
  charger.nextStateAt = 0;

  charger.frameIndex = 0;
  charger.nextFrameAt = 0;

  charger.setVisible(false);
  charger.body.enable = false;

  // Hazard only. No bullet overlap. Immune to damage.
  scene.physics.add.overlap(player, charger, hurtPlayer, null, scene);

  reclinerChargers.push(charger);

  return charger;
}


// =========================
// LEVEL 3: UPDATE RECLINER CHARGER
// =========================
function updateReclinerCharger(scene, charger) {

  if (!charger || !charger.active) {
    return;
  }
    // Boss-spawned charger: starts already inside the arena,
  // shakes briefly, then charges left.
  if (charger.state === 'bossPreCharge') {

    charger.x = charger.stopX + Math.sin(scene.time.now * 0.08) * 8;
    charger.setTexture('chargerCharge01');

    if (scene.time.now >= charger.nextStateAt) {
      charger.state = 'bossCharging';
      charger.setTexture('chargerCharge02');
      charger.setVelocityX(-700);
    }

    return;
  }

  if (charger.state === 'bossCharging') {

    charger.setTexture('chargerCharge02');

    if (charger.x <= charger.exitX) {
      charger.state = 'done';
      charger.setVelocityX(0);
      charger.disableBody(true, true);
    }

    return;
  }

  // Waiting offscreen until player approaches
  if (charger.state === 'waiting') {

    if (player.x >= charger.triggerX) {
      charger.state = 'rollingIn';
      charger.setVisible(true);
      charger.body.enable = true;
      charger.setPosition(charger.startX, charger.baseY);
      charger.setTexture('chargerIdle01');
      charger.setVelocityX(-190);
    }

    return;
  }

  // Idle rolling animation while entering from the right
  if (charger.state === 'rollingIn') {

    if (scene.time.now >= charger.nextFrameAt) {
      charger.frameIndex = charger.frameIndex === 0 ? 1 : 0;
      charger.setTexture(
        charger.frameIndex === 0
          ? 'chargerIdle01'
          : 'chargerIdle02'
      );
      charger.nextFrameAt = scene.time.now + 180;
    }

    if (charger.x <= charger.stopX) {
      charger.state = 'preCharge';
      charger.setVelocityX(0);
      charger.setTexture('chargerCharge01');
      charger.nextStateAt = scene.time.now + 750;
    }

    return;
  }

  // Pre-charge shake
  if (charger.state === 'preCharge') {

    charger.x = charger.stopX + Math.sin(scene.time.now * 0.08) * 8;
    charger.setTexture('chargerCharge01');

    if (scene.time.now >= charger.nextStateAt) {
      charger.state = 'charging';
      charger.setTexture('chargerCharge02');
      charger.setVelocityX(-680);
    }

    return;
  }

  // Actual charge left across the lane
  if (charger.state === 'charging') {

    charger.setTexture('chargerCharge02');

    if (charger.x <= charger.exitX) {
      charger.state = 'done';
      charger.setVelocityX(0);
      charger.disableBody(true, true);
    }
  }
}
// =========================
// LEVEL 3: SPAWN JUNK FOOD GOBLIN ON FACTORY PLATFORM
// =========================
function spawnLevel3JunkFoodGoblin(scene, x, y, options = {}) {
  return spawnJunkFoodGoblin(
    scene,
    x,
    y + LEVEL3_JFGOBLIN_OFFSET_Y,
    {
      ...options,
      parallaxFactor: 1
    }
  );
}
// =========================
// LEVEL 3: CREATE BOSS ARENA TRIGGER
// =========================
function createLevel3BossArena(scene) {

  // Full-height invisible trigger wall.
  // The old trigger was too short vertically, so the player could pass
  // over/under it on the final platform route without starting the boss.
  level3BossArenaTrigger = scene.add.rectangle(
    11650,
    360,
    120,
    900,
    0xff00ff,
    0
  );

  level3BossArenaTrigger.setVisible(false);
  scene.physics.add.existing(level3BossArenaTrigger, true);

  scene.physics.add.overlap(
    player,
    level3BossArenaTrigger,
    startLevel3BossFight,
    null,
    scene
  );
}

// =========================
// LEVEL 3: RESET BOSS FIGHT AFTER PLAYER DEATH
// =========================
function resetLevel3BossFightAfterPlayerDeath(scene) {

  level3BossFightActive = false;
  level3BossDead = false;
  level3BossCanTakeDamage = false;
  level3BossPhase = 1;
  level3BossFrameIndex = 0;
  level3BossNextFrameAt = 0;

  if (level3Boss) {
    level3Boss.destroy();
    level3Boss = null;
  }

  if (level3BossHealthText) {
    level3BossHealthText.destroy();
    level3BossHealthText = null;
  }

  if (level3BossHealthBarBack) {
    level3BossHealthBarBack.destroy();
    level3BossHealthBarBack = null;
  }

  if (level3BossHealthBarFill) {
    level3BossHealthBarFill.destroy();
    level3BossHealthBarFill = null;
  }

  if (level3BossIntroText) {
    level3BossIntroText.destroy();
    level3BossIntroText = null;
  }

  if (level3BossLeftWall) {
    level3BossLeftWall.destroy();
    level3BossLeftWall = null;
  }

  if (level3BossRightWall) {
    level3BossRightWall.destroy();
    level3BossRightWall = null;
  }

  level3BossGateStripes.forEach(stripe => {
    if (stripe) {
      stripe.destroy();
    }
  });

  level3BossGateStripes = [];

  // Clear boss projectiles.
  if (junkFoodDroneProjectiles) {
    junkFoodDroneProjectiles.children.iterate(projectile => {
      if (projectile && projectile.active) {
        projectile.disableBody(true, true);
      }
    });
  }

  // Clear active boss chargers inside the arena.
  reclinerChargers.forEach(charger => {
    if (
      charger &&
      charger.active &&
      (
        charger.state === 'bossPreCharge' ||
        charger.state === 'bossCharging'
      )
    ) {
      charger.disableBody(true, true);
    }
  });

  // Re-enable boss trigger so player can restart the fight.
  if (level3BossArenaTrigger && level3BossArenaTrigger.body) {
    level3BossArenaTrigger.body.enable = true;
  }

  // Keep exit locked until boss dies.
  if (level3ExitGate && level3ExitGate.body) {
    level3ExitGate.body.enable = false;
    level3ExitGate.setAlpha(0.45);
  }
}
// =========================
// LEVEL 3: START BOSS FIGHT
// =========================
function startLevel3BossFight(playerObject, triggerObject) {

  const scene = playerObject.scene;

  if (level3BossFightActive || level3BossDead) {
    return;
  }

  level3BossFightActive = true;
console.log("LEVEL 3 BOSS FIGHT STARTED");

  // Disable trigger so it cannot fire twice.
  if (triggerObject && triggerObject.body) {
    triggerObject.body.enable = false;
  }

  // Lock player into boss arena.
    // Visible lockdown gate behind the player.
  level3BossLeftWall = scene.add.rectangle(
  LEVEL3_BOSS_ARENA_LEFT,
  120,
  80,
  1000,
  0x2a2a2a,
  1
);

    level3BossGateStripes = [
  scene.add.rectangle(LEVEL3_BOSS_ARENA_LEFT, -260, 80, 18, 0xffcc00, 1),
  scene.add.rectangle(LEVEL3_BOSS_ARENA_LEFT, -80, 80, 18, 0xffcc00, 1),
  scene.add.rectangle(LEVEL3_BOSS_ARENA_LEFT, 100, 80, 18, 0xffcc00, 1),
  scene.add.rectangle(LEVEL3_BOSS_ARENA_LEFT, 280, 80, 18, 0xffcc00, 1),
  scene.add.rectangle(LEVEL3_BOSS_ARENA_LEFT, 460, 80, 18, 0xffcc00, 1)
];

  level3BossGateStripes.forEach(stripe => {
    stripe.setDepth(46);
  });

  // Invisible right boundary near the exit/boss side.
  level3BossRightWall = scene.add.rectangle(
    LEVEL3_BOSS_ARENA_RIGHT,
    360,
    40,
    500,
    0xff0000,
    0
  );

  level3BossRightWall.setVisible(false);

  scene.physics.add.existing(level3BossLeftWall, true);
  scene.physics.add.existing(level3BossRightWall, true);

  scene.physics.add.collider(player, level3BossLeftWall);
  scene.physics.add.collider(player, level3BossRightWall);
  scene.physics.add.collider(casings, level3BossLeftWall);
  scene.physics.add.collider(casings, level3BossRightWall);

    // Recliner Tyrant boss sprite
    level3Boss = scene.physics.add.sprite(
    12480,
    500,
    'reclinerTyrantIdle01'
  );

  level3Boss.setDepth(35);
  level3Boss.setOrigin(0.5, 1);
  level3Boss.setScale(0.28);

  level3Boss.body.allowGravity = false;
  level3Boss.body.immovable = true;

  // Gameplay hitbox smaller than full art so decorative parts do not feel cheap.
  level3Boss.body.setSize(
    level3Boss.width * 0.62,
    level3Boss.height * 0.68
  );

  level3Boss.body.setOffset(
    level3Boss.width * 0.19,
    level3Boss.height * 0.26
  );

  level3Boss.health = LEVEL3_BOSS_MAX_HEALTH;
  level3Boss.isDead = false;
    // Boss does not attack during intro speech.
  level3Boss.nextAttackAt = Number.MAX_SAFE_INTEGER;
  level3Boss.nextChargerAt = Number.MAX_SAFE_INTEGER;

  level3BossFrameIndex = 0;
  level3BossNextFrameAt = 0;
  level3BossPhase = 1;

  scene.physics.add.overlap(player, level3Boss, hurtPlayer, null, scene);
  scene.physics.add.overlap(bullets, level3Boss, hitLevel3Boss, null, scene);

       // Boss starts immune during intro.
  level3BossCanTakeDamage = false;

  level3BossIntroText = scene.add.text(
    640,
    175,
    'Come to the Lazy side.\nWe have recliners and cookies.',
    {
      fontSize: '26px',
      fill: '#ffffff',
      align: 'center',
      backgroundColor: '#111111',
      padding: {
        x: 18,
        y: 12
      },
      stroke: '#000000',
      strokeThickness: 4
    }
  );

  level3BossIntroText.setOrigin(0.5, 0);
  level3BossIntroText.setScrollFactor(0);
  level3BossIntroText.setDepth(300);

  level3BossHealthText = scene.add.text(
    640,
    118,
    'RECLINER TYRANT',
    {
      fontSize: '26px',
      fill: '#ff4444',
      stroke: '#000000',
      strokeThickness: 4
    }
  );

  level3BossHealthText.setOrigin(0.5, 0);
  level3BossHealthText.setScrollFactor(0);
  level3BossHealthText.setDepth(300);
  level3BossHealthText.setAlpha(0);

  level3BossHealthBarBack = scene.add.rectangle(
    640,
    158,
    420,
    24,
    0x220000,
    1
  );

  level3BossHealthBarBack.setOrigin(0.5, 0.5);
  level3BossHealthBarBack.setScrollFactor(0);
  level3BossHealthBarBack.setDepth(299);
  level3BossHealthBarBack.setAlpha(0);

  level3BossHealthBarFill = scene.add.rectangle(
  640,
  158,
  400,
  14,
  0xff2222,
  1
);

level3BossHealthBarFill.setOrigin(0.5, 0.5);
level3BossHealthBarFill.setScrollFactor(0);
level3BossHealthBarFill.setDepth(300);
level3BossHealthBarFill.setAlpha(1);
level3BossHealthBarFill.setScale(0, 1);

  scene.tweens.add({
    targets: level3BossHealthText,
    alpha: 1,
    duration: 500
  });

  scene.tweens.add({
    targets: level3BossHealthBarBack,
    alpha: 1,
    duration: 500
  });

  // Grow health bar from center outward.
  scene.tweens.add({
  targets: level3BossHealthBarFill,
  scaleX: 1,
  duration: 900,
  ease: 'Cubic.easeOut'
});

    scene.time.delayedCall(3200, () => {
    level3BossCanTakeDamage = true;

    if (level3BossIntroText) {
      level3BossIntroText.destroy();
      level3BossIntroText = null;
    }

    if (level3Boss && !level3BossDead) {
      level3Boss.nextAttackAt = scene.time.now + 700;
      level3Boss.nextChargerAt = scene.time.now + 3200;
    }
  });
}

// =========================
// LEVEL 3: UPDATE BOSS FIGHT
// =========================
function updateLevel3BossFight(scene) {

  if (!level3BossFightActive || level3BossDead || !level3Boss) {
    return;
  }

  // Phase changes by health.
  if (level3Boss.health <= 10) {
    level3BossPhase = 3;
  } else if (level3Boss.health <= 20) {
    level3BossPhase = 2;
  } else {
    level3BossPhase = 1;
  }

  // Idle / damaged visual state.
  if (scene.time.now >= level3BossNextFrameAt) {

    if (level3BossPhase === 3) {
      level3Boss.setTexture('reclinerTyrantPhase3');
    } else {
      level3BossFrameIndex = level3BossFrameIndex === 0 ? 1 : 0;

      level3Boss.setTexture(
        level3BossFrameIndex === 0
          ? 'reclinerTyrantIdle01'
          : 'reclinerTyrantIdle02'
      );
    }

    level3BossNextFrameAt = scene.time.now + 220;
  }

  // No attacks during intro / immunity.
  if (!level3BossCanTakeDamage) {
    return;
  }

  let shotCooldown = 1400;

  if (level3BossPhase === 2) {
    shotCooldown = 1100;
  }

  if (level3BossPhase === 3) {
  shotCooldown = 1450;
}
  

  if (scene.time.now >= level3Boss.nextAttackAt) {
    level3Boss.nextAttackAt = scene.time.now + shotCooldown;
    fireLevel3BossProjectile(scene);
  }

  if (
    level3BossPhase >= 2 &&
    scene.time.now >= level3Boss.nextChargerAt
  ) {
    level3Boss.nextChargerAt = scene.time.now + 3600;
    spawnLevel3BossCharger(scene);
  }
}

// =========================
// LEVEL 3: BOSS PROJECTILE
// =========================
function fireLevel3BossProjectile(scene) {

  if (!junkFoodDroneProjectiles || !level3Boss || level3BossDead) {
    return;
  }

 if (level3BossPhase === 3) {
  spawnLevel3BossProjectile(scene, -45, -135);
  spawnLevel3BossProjectile(scene, -10, 135);
  return;
}

  spawnLevel3BossProjectile(scene, -35, 0);
}


// =========================
// LEVEL 3: SPAWN ONE BOSS PROJECTILE
// =========================
function spawnLevel3BossProjectile(scene, yOffset, aimOffsetY) {

  const projectile = junkFoodDroneProjectiles.create(
    level3Boss.x - 100,
    level3Boss.y + yOffset,
    'junkFoodDroneProjectile'
  );

projectile.setDepth(36);
projectile.setScale(0.09);
projectile.body.allowGravity = false;

// Smaller damage box than the cheese projectile art.
// Makes dodging feel fair instead of clipping the player.
projectile.body.setSize(
  projectile.width * 0.35,
  projectile.height * 0.35
);

projectile.body.setOffset(
  projectile.width * 0.325,
  projectile.height * 0.325
);

  const targetX = player.x;
  const targetY = player.y + aimOffsetY;

  const dx = targetX - projectile.x;
  const dy = targetY - projectile.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
 const speed = 300;

  projectile.setVelocity(
    (dx / dist) * speed,
    (dy / dist) * speed
  );

  projectile.setRotation(
    Phaser.Math.Angle.Between(
      projectile.x,
      projectile.y,
      targetX,
      targetY
    )
  );

  scene.physics.add.overlap(player, projectile, hurtPlayer, null, scene);

  scene.time.delayedCall(4000, () => {
    if (projectile && projectile.active) {
      projectile.disableBody(true, true);
    }
  });
}
// =========================
// LEVEL 3: BOSS CHARGER ATTACK
// =========================
function spawnLevel3BossCharger(scene) {

  const charger = scene.physics.add.sprite(
    LEVEL3_BOSS_ARENA_RIGHT + 180,
    430,
    'chargerCharge01'
  );

  charger.setDepth(34);
  charger.setScale(0.2);
  charger.body.allowGravity = false;
  charger.body.immovable = true;

  charger.body.setSize(charger.width * 0.75, charger.height * 0.42);
  charger.body.setOffset(charger.width * 0.125, charger.height * 0.50);

  charger.state = 'bossPreCharge';
  charger.stopX = LEVEL3_BOSS_ARENA_RIGHT - 150;
  charger.exitX = LEVEL3_BOSS_ARENA_LEFT - 500;
  charger.nextStateAt = scene.time.now + 500;

  scene.physics.add.overlap(player, charger, hurtPlayer, null, scene);

  reclinerChargers.push(charger);
}

// =========================
// LEVEL 3: HIT BOSS
// =========================
function hitLevel3Boss(objectA, objectB) {

  let bulletObject;
  let bossObject;

  if (objectA.texture && objectA.texture.key === 'bullet') {
    bulletObject = objectA;
    bossObject = objectB;
  } else {
    bulletObject = objectB;
    bossObject = objectA;
  }

    if (
    !bulletObject ||
    !bulletObject.active ||
    bulletObject.hasHit ||
    !bossObject ||
    bossObject.isDead ||
    !level3BossCanTakeDamage
  ) {
    return;
  }

  bulletObject.hasHit = true;
  bulletObject.disableBody(true, true);

  bossObject.health -= bulletObject.isPowerShot ? 3 : 1;

    if (level3BossHealthBarFill) {
  const healthPercent = Phaser.Math.Clamp(
    bossObject.health / LEVEL3_BOSS_MAX_HEALTH,
    0,
    1
  );

  level3BossHealthBarFill.setScale(healthPercent, 1);
}

  const hitEffect = bossObject.scene.add.image(
    bossObject.x - 75,
    bossObject.y - 210,
    'reclinerTyrantHitEffect'
  );

  hitEffect.setOrigin(0.5, 0.5);
  hitEffect.setScale(bossObject.scaleX);
  hitEffect.setDepth(bossObject.depth + 2);

  bossObject.scene.tweens.add({
    targets: hitEffect,
    alpha: 0,
    scaleX: bossObject.scaleX * 1.25,
    scaleY: bossObject.scaleY * 1.25,
    duration: 120,
    onComplete: () => {
      hitEffect.destroy();
    }
  });

  if (bossObject.health > 0) {
    return;
  }

  killLevel3Boss(bossObject.scene);
}


// =========================
// LEVEL 3: KILL BOSS / OPEN EXIT
// =========================
function killLevel3Boss(scene) {

  if (level3BossDead) {
    return;
  }

  level3BossDead = true;
  level3BossFightActive = false;
  level3BossCanTakeDamage = false;

  addScore(2000);

  if (level3Boss) {
    const bossX = level3Boss.x;
    const bossY = level3Boss.y;
    const bossScale = level3Boss.scaleX;

    level3Boss.isDead = true;
    level3Boss.setVelocity(0, 0);

    if (level3Boss.body) {
      level3Boss.body.enable = false;
    }

    // Chair remains in the arena after the goblin ejects.
    level3Boss.setTexture('reclinerTyrantDeath02');
    level3Boss.setOrigin(0.5, 1);
    level3Boss.setScale(bossScale);
    level3Boss.setDepth(35);

    const ejectedGoblin = scene.add.image(
      bossX - 70,
      bossY - 170,
      'reclinerTyrantEject'
    );

    ejectedGoblin.setOrigin(0.5, 0.5);
    ejectedGoblin.setScale(bossScale);
    ejectedGoblin.setDepth(60);

    scene.tweens.add({
      targets: ejectedGoblin,
      x: bossX - 620,
      y: bossY - 430,
      scaleX: bossScale * 0.22,
      scaleY: bossScale * 0.22,
      alpha: 0.15,
      angle: -35,
      duration: 1400,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        ejectedGoblin.destroy();
      }
    });
  }

  if (level3BossHealthText) {
    level3BossHealthText.destroy();
    level3BossHealthText = null;
  }

  if (level3BossHealthBarBack) {
    level3BossHealthBarBack.destroy();
    level3BossHealthBarBack = null;
  }

  if (level3BossHealthBarFill) {
    level3BossHealthBarFill.destroy();
    level3BossHealthBarFill = null;
  }

  if (level3BossIntroText) {
    level3BossIntroText.destroy();
    level3BossIntroText = null;
  }

  if (level3BossLeftWall) {
    level3BossLeftWall.destroy();
    level3BossLeftWall = null;
  }

  level3BossGateStripes.forEach(stripe => {
    if (stripe) {
      stripe.destroy();
    }
  });

  level3BossGateStripes = [];

  if (level3BossRightWall) {
    level3BossRightWall.destroy();
    level3BossRightWall = null;
  }

  // Activate exit after the eject gag has time to read.
  scene.time.delayedCall(900, () => {
    if (level3ExitGate && level3ExitGate.body) {
      level3ExitGate.body.enable = true;
      level3ExitGate.setAlpha(1);
    }
  });
}
// =========================
// LEVEL 3: FACTORY LAYOUT + ENEMY PLACEMENT
// =========================
function createLevel3FactoryLayout(scene) {

  const slimeBody = {
    width: 0.70,
    height: 0.55,
    offsetX: 0.15,
    offsetY: 0.05
  };

  // =========================================================
  // SECTION 1 — SEWER EXIT / LOADING DOCK
  // More vertical intro. No new enemies yet.
  // =========================================================
  const p01 = createLevel3Platform(scene, 600, 340, 260);
const p02 = createLevel3Platform(scene, 980, 250, 240);
const p03 = createLevel3Platform(scene, 1370, 145, 220);
const p04 = createLevel3Platform(scene, 1740, 290, 300);

  spawnSlime(scene, 850, 360, level3Floor, 700, 1050, 1, slimeBody);
spawnBat(scene, 1350, 60, 1100, 1700, -1);

level3EnemyMarkers.push({ type: 'slime', x: 850, y: 360 });
level3EnemyMarkers.push({ type: 'bat', x: 1350, y: 60 });

  // =========================================================
  // SECTION 2 — FIRST CONVEYOR TUTORIAL
  // =========================================================
  const c01 = createLevel3Conveyor(scene, 2200, 490, 750, 1);
const p05 = createLevel3Platform(scene, 2500, 330, 240);
const p06 = createLevel3Platform(scene, 2880, 220, 220);

  spawnSlime(scene, 2200, 360, c01, 1900, 2450, -1, slimeBody);

  level3EnemyMarkers.push({ type: 'slime', x: 2200, y: 360 });

  // =========================================================
  // SECTION 3 — SHIPPING CATWALKS / FIRST DRONE
  // Drone introduced high, hovering and shooting.
  // =========================================================
  const p07 = createLevel3Platform(scene, 3250, 335, 340);
  const p08 = createLevel3Platform(scene, 3650, 235, 320);
  const p09 = createLevel3Platform(scene, 4050, 335, 340);
  const c02 = createLevel3Conveyor(scene, 3550, 490, 750, -1);

  spawnLevel3JunkFoodGoblin(scene, 3650, 185, {
  canThrow: true
});

  spawnJunkFoodDrone(scene, 3950, 145, {
    leftBound: 3850,
    rightBound: 4100,
    direction: -1,
    shootCooldown: 1900
  });

  spawnSlime(scene, 3500, 360, c02, 3250, 3800, 1, slimeBody);

  level3PickupMarkers.push({ type: 'health', x: 4100, y: 430 });

  level3EnemyMarkers.push({ type: 'jfgoblin', x: 3650, y: 225 });
  level3EnemyMarkers.push({ type: 'drone', x: 3950, y: 145 });
  level3EnemyMarkers.push({ type: 'slime', x: 3500, y: 360 });

  // =========================================================
  // SECTION 4 — FIRST RECLINER CHARGER TUTORIAL
  // Clear lane. Player learns to jump it.
  // =========================================================
    // First charger lane: no low safety platform here.
  // Player should jump the charger instead of standing above it.
  createLevel3Platform(scene, 4900, 300, 280);

    spawnReclinerCharger(scene, 4300, 430, {
    startOffset: 850,
    stopOffset: 610,
    exitOffset: -700
  });

  level3EnemyMarkers.push({ type: 'reclinerCharger', x: 4300, y: 430 });

  // =========================================================
// SECTION 5 — FACTORY ROUTE SPLIT
// Low route: conveyor + charger.
// Mid route: normal factory platforms.
// High route: harder third-level catwalk.
// =========================================================
const c03 = createLevel3Conveyor(scene, 5500, 490, 850, 1);

// Mid route
createLevel3Platform(scene, 5200, 365, 240);
createLevel3Platform(scene, 5550, 275, 220);
createLevel3Platform(scene, 5900, 185, 220);
createLevel3Platform(scene, 6250, 275, 220);
createLevel3Platform(scene, 6600, 365, 240);

// Higher third-level route
createLevel3Platform(scene, 5380, 95, 180);
createLevel3Platform(scene, 5800, 15, 165);
createLevel3Platform(scene, 6220, 95, 180);

  spawnSlime(scene, 5350, 360, c03, 5100, 5650, 1, slimeBody);

  spawnLevel3JunkFoodGoblin(scene, 5900, 145, {
  canThrow: true
});

  spawnJunkFoodDrone(scene, 6300, 95, {
    leftBound: 6180,
    rightBound: 6420,
    direction: 1,
    shootCooldown: 1800
  });

    spawnReclinerCharger(scene, 5750, 430, {
    startOffset: 850,
    stopOffset: 610,
    exitOffset: -650
  });

level3PickupMarkers.push({ type: 'upgrade', x: 5800, y: -55 });

  level3EnemyMarkers.push({ type: 'slime', x: 5350, y: 360 });
  level3EnemyMarkers.push({ type: 'jfgoblin', x: 5900, y: 145 });
  level3EnemyMarkers.push({ type: 'drone', x: 6300, y: 95 });
  level3EnemyMarkers.push({ type: 'reclinerCharger', x: 5750, y: 430 });

  // =========================================================
  // SECTION 6 — STEAM / RAFTER HALL
  // More stepped factory verticality.
  // =========================================================
  const c04 = createLevel3Conveyor(scene, 7600, 490, 800, -1);

  createLevel3Platform(scene, 7050, 405, 280);
  createLevel3Platform(scene, 7400, 300, 280);
  createLevel3Platform(scene, 7750, 195, 280);
  createLevel3Platform(scene, 8100, 300, 280);

  spawnBat(scene, 7400, 120, 7050, 7750, -1);

  spawnJunkFoodDrone(scene, 8000, 110, {
    leftBound: 7860,
    rightBound: 8140,
    direction: -1,
    shootCooldown: 1700
  });

  spawnSlime(scene, 7600, 360, c04, 7300, 7900, -1, slimeBody);

  level3EnemyMarkers.push({ type: 'steamVent', x: 7150, y: 485 });
  level3EnemyMarkers.push({ type: 'steamVent', x: 7550, y: 485 });
  level3EnemyMarkers.push({ type: 'steamVent', x: 7950, y: 485 });

  level3EnemyMarkers.push({ type: 'bat', x: 7400, y: 120 });
  level3EnemyMarkers.push({ type: 'drone', x: 8000, y: 110 });
  level3EnemyMarkers.push({ type: 'slime', x: 7600, y: 360 });

  // =========================================================
  // SECTION 7 — PRESS / CRUSHER AREA
  // Stacked platform path, shorter jumps.
  // =========================================================
  createLevel3Platform(scene, 8550, 350, 240);
createLevel3Platform(scene, 8875, 250, 220);
createLevel3Platform(scene, 9200, 150, 210);
createLevel3Platform(scene, 9525, 250, 220);

  spawnLevel3JunkFoodGoblin(scene, 9200, 130, {
  canThrow: true
});

  spawnSlime(scene, 8850, 250, level3Floor, 8750, 8950, 1, slimeBody);

  level3PickupMarkers.push({ type: 'health', x: 9450, y: 245 });

  level3EnemyMarkers.push({ type: 'crusher', x: 8850, y: 220 });
  level3EnemyMarkers.push({ type: 'jfgoblin', x: 9200, y: 130 });
  level3EnemyMarkers.push({ type: 'slime', x: 8850, y: 250 });

  // =========================================================
  // SECTION 8 — RECLINER ASSEMBLY LINE
  // Main factory identity: conveyors, drone, chargers.
  // =========================================================
  const c05 = createLevel3Conveyor(scene, 10000, 490, 1050, 1);

 createLevel3Platform(scene, 9850, 300, 280);
createLevel3Platform(scene, 10250, 195, 260);
createLevel3Platform(scene, 10650, 300, 280);

    spawnReclinerCharger(scene, 9600, 430, {
    startOffset: 850,
    stopOffset: 610,
    exitOffset: -700
  });

  spawnLevel3JunkFoodGoblin(scene, 10250, 155, {
  canThrow: true
});

  spawnJunkFoodDrone(scene, 10600, 130, {
    leftBound: 10480,
    rightBound: 10720,
    direction: -1,
    shootCooldown: 1600
  });

          spawnReclinerCharger(scene, 10400, 430, {
    startOffset: 850,
    stopOffset: 610,
    exitOffset: -700
  });
  level3EnemyMarkers.push({ type: 'reclinerCharger', x: 9600, y: 430 });
  level3EnemyMarkers.push({ type: 'jfgoblin', x: 10250, y: 155 });
  level3EnemyMarkers.push({ type: 'drone', x: 10600, y: 130 });
  level3EnemyMarkers.push({ type: 'reclinerCharger', x: 10400, y: 430 });

  // =========================================================
  // SECTION 9 — HIGH / LOW FINAL ROUTE
  // =========================================================
  const c06 = createLevel3Conveyor(scene, 11150, 490, 750, -1);

 // Mid/high route
createLevel3Platform(scene, 11050, 370, 230);
createLevel3Platform(scene, 11350, 275, 220);
createLevel3Platform(scene, 11650, 180, 210);
createLevel3Platform(scene, 11950, 330, 220);

// Third-level harder route
createLevel3Platform(scene, 11180, 80, 165);
createLevel3Platform(scene, 11550, -20, 150);
createLevel3Platform(scene, 11920, 80, 165);

  spawnSlime(scene, 11150, 360, c06, 10850, 11450, -1, slimeBody);
  spawnBat(scene, 11350, 90, 11050, 11950, 1);

  spawnLevel3JunkFoodGoblin(scene, 11650, 150, {
  canThrow: true
});

  level3PickupMarkers.push({ type: 'health', x: 11550, y: -90 });

  level3EnemyMarkers.push({ type: 'slime', x: 11150, y: 360 });
  level3EnemyMarkers.push({ type: 'bat', x: 11350, y: 90 });
  level3EnemyMarkers.push({ type: 'jfgoblin', x: 11650, y: 150 });

  // =========================================================
  // SECTION 10 — FINAL FACTORY EXIT RUN
  // One last drone + charger combo.
  // =========================================================
  const c07 = createLevel3Conveyor(scene, 12300, 490, 800, 1);

  createLevel3Platform(scene, 12250, 330, 300);

  spawnReclinerCharger(scene, 11950, 430, {
  startOffset: 850,
  stopOffset: 610,
  exitOffset: -700
});

level3EnemyMarkers.push({ type: 'reclinerCharger', x: 11950, y: 430 });
// =========================================================
// LEVEL 3 PICKUPS — POINT ROUTE REWARDS
// =========================================================

// Early platform climb
level3PickupMarkers.push({ type: 'pointsSmall', x: 950, y: 260 });
level3PickupMarkers.push({ type: 'pointsSmall', x: 1300, y: 120 });

// First conveyor / platform tutorial
level3PickupMarkers.push({ type: 'pointsSmall', x: 2500, y: 260 });
level3PickupMarkers.push({ type: 'pointsSmall', x: 2880, y: 150 });

// First drone catwalk area
level3PickupMarkers.push({ type: 'pointsLarge', x: 3425, y: 150 });
level3PickupMarkers.push({ type: 'pointsSmall', x: 4050, y: 265 });

// First recliner charger tutorial reward
level3PickupMarkers.push({ type: 'pointsSmall', x: 4900, y: 230 });

// Factory route split — mid route
level3PickupMarkers.push({ type: 'pointsSmall', x: 5550, y: 205 });
level3PickupMarkers.push({ type: 'pointsSmall', x: 6250, y: 205 });

// Factory route split — high route
level3PickupMarkers.push({ type: 'pointsLarge', x: 5400, y: 25 });
level3PickupMarkers.push({ type: 'pointsLarge', x: 6200, y: 25 });

// Steam / rafter hall
level3PickupMarkers.push({ type: 'pointsSmall', x: 7400, y: 230 });
level3PickupMarkers.push({ type: 'pointsLarge', x: 7750, y: 125 });
level3PickupMarkers.push({ type: 'pointsSmall', x: 8100, y: 230 });

// Crusher / press area
level3PickupMarkers.push({ type: 'pointsSmall', x: 8850, y: 225 });
level3PickupMarkers.push({ type: 'pointsLarge', x: 9150, y: 125 });

// Assembly line
level3PickupMarkers.push({ type: 'pointsSmall', x: 9850, y: 265 });
level3PickupMarkers.push({ type: 'pointsLarge', x: 9800, y: 70 });
level3PickupMarkers.push({ type: 'pointsSmall', x: 10650, y: 265 });

// Final high route
level3PickupMarkers.push({ type: 'pointsLarge', x: 11200, y: 10 });
level3PickupMarkers.push({ type: 'pointsLarge', x: 11900, y: 10 });

// Final exit reward
level3PickupMarkers.push({ type: 'pointsSmall', x: 12450, y: 220 });

// Boss arena trigger before the exit.
// Player crosses this line, arena locks, boss starts.
createLevel3BossArena(scene);

// Exit gate
level3ExitGate = scene.physics.add.sprite(12600, 610, 'industrialExit');
level3ExitGate.setScale(0.35);
level3ExitGate.setDepth(20);
level3ExitGate.setOrigin(0.5, 1);
level3ExitGate.body.allowGravity = false;
level3ExitGate.body.immovable = true;

// Exit is visible but locked until boss dies.
level3ExitGate.body.enable = false;
level3ExitGate.setAlpha(0.45);

// Shrink trigger so the player has to actually touch the exit area.
level3ExitGate.body.setSize(
  level3ExitGate.width * 0.65,
  level3ExitGate.height * 0.75
);

level3ExitGate.body.setOffset(
  level3ExitGate.width * 0.175,
  level3ExitGate.height * 0.25
);

scene.physics.add.overlap(player, level3ExitGate, enterLevel3Exit, null, scene);
}

// =========================
// ENTER SEWER EXIT
// =========================
function enterSewerExit(playerObject, doorObject) {

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
      playerObject.scene.scene.start('Level3Scene');
    }
  });
}


// =========================================================
// =========================================================
//                    LEVEL 3 — INDUSTRIAL DISTRICT
// =========================================================
// =========================================================

function createLevel3() {

  currentLevel = 'level3';
  levelTransitioning = false;

  this.cameras.main.setBackgroundColor('#111111');

  // =========================
  // INDUSTRIAL SKYBOX
  // =========================
  const industrialSky = this.add.tileSprite(
  0,
  -250,
  LEVEL3_WIDTH,
  GAME_HEIGHT + 700,
  'industrialSky'
);

industrialSky.setOrigin(0, 0);
industrialSky.setDepth(-200);
industrialSky.setScrollFactor(0.02, 0);

  // =========================
  // RESET LEVEL 3 ARRAYS
  // =========================
  level3Platforms = [];
  level3Conveyors = [];
  level3EnemyMarkers = [];
  level3PickupMarkers = [];

  // =========================
  // PLAYER
  // =========================
const level3Start = getDebugStartPosition(150, 300);
player = createPlayer(this, level3Start.x, level3Start.y);

  // =========================
  // GROUPS / INPUT
  // =========================
  bullets = this.physics.add.group();
  casings = this.physics.add.group();

  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  invincibleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
// =========================
// LEVEL 3 ENEMY / PICKUP RESET
// =========================
slimes = [];
bats = [];
swoopBats = [];
junkFoodGoblins = [];
junkFoodDrones = [];
reclinerChargers = [];
pickups = [];

level3BossArenaTrigger = null;
level3Boss = null;
level3BossLeftWall = null;
level3BossRightWall = null;
level3BossFightActive = false;
level3BossDead = false;
level3BossCanTakeDamage = false;
level3BossGateStripes = [];

if (level3BossHealthText) {
  level3BossHealthText.destroy();
  level3BossHealthText = null;
}
if (level3BossHealthBarBack) {
  level3BossHealthBarBack.destroy();
  level3BossHealthBarBack = null;
}

if (level3BossHealthBarFill) {
  level3BossHealthBarFill.destroy();
  level3BossHealthBarFill = null;
}

if (level3BossIntroText) {
  level3BossIntroText.destroy();
  level3BossIntroText = null;
}

activeUpgrade = null;
if (upgradeText) {
  upgradeText.destroy();
  upgradeText = null;
}

jfgoblinCans = this.physics.add.group();
junkFoodDroneProjectiles = this.physics.add.group();

this.physics.add.overlap(player, jfgoblinCans, hurtPlayer, null, this);
this.physics.add.overlap(player, junkFoodDroneProjectiles, hurtPlayer, null, this);
  // =========================
  // LEVEL 3 FLOOR
  // =========================
  level3Floor = this.add.rectangle(
    LEVEL3_WIDTH / 2,
    500,
    LEVEL3_WIDTH,
    40,
    0xff0000
  );

  level3Floor.setVisible(false);
  this.physics.add.existing(level3Floor, true);

  this.physics.add.collider(player, level3Floor);
this.physics.add.collider(casings, level3Floor);

// Visible main factory floor art
createLevel3FloorVisual(this);

// Build Level 3 platforms, conveyors, enemies, and pickups
createLevel3FactoryLayout(this);

  // =========================
  // PLACE REAL PICKUPS
  // =========================
  pickups = [];
  activeUpgrade = null;
  if (upgradeText) { upgradeText.destroy(); upgradeText = null; }

level3PickupMarkers.forEach(marker => {
  spawnPickup(
    this,
    marker.x,
    marker.y + LEVEL3_PICKUP_OFFSET_Y,
    marker.type
  );
});

    // Level 3 marker visuals removed.
  // Physics debug is controlled separately in the Phaser config.

  // =========================
  // WORLD / CAMERA
  // =========================
  this.physics.world.setBounds(0, -450, LEVEL3_WIDTH, GAME_HEIGHT + 450);
  this.cameras.main.setBounds(0, -450, LEVEL3_WIDTH, GAME_HEIGHT + 450);
  this.cameras.main.startFollow(player);

  // =========================
  // GAME OVER SCREEN
  // =========================
  createGameOverScreen(this);

  // =========================
  // HUD / CONTROLS
  // =========================
  createHUD(this);

  // =========================
  // LEVEL TRANSITION FADE SCREEN
  // =========================
  createFadeScreen(this);
}


// =========================
// LEVEL 3 UPDATE
// =========================
function updateLevel3() {

  if (Phaser.Input.Keyboard.JustDown(invincibleKey)) {
    debugInvincible = !debugInvincible;
    console.log("Invincibility:", debugInvincible ? "ON" : "OFF");
  }

  if (playerIsDead) {
    player.body.setVelocityX(0);
    player.setTexture('playerDead');
    return;
  }

  // MOVE LEFT / RIGHT
  if (cursors.left.isDown || moveLeft) {
    player.body.setVelocityX(-300);
    player.setFlipX(true);
  } else if (cursors.right.isDown || moveRight) {
    player.body.setVelocityX(300);
    player.setFlipX(false);
  } else {
    player.body.setVelocityX(0);
  }

  // JUMP
  if ((cursors.up.isDown || jumpPressed) && player.body.blocked.down) {
    player.body.setVelocityY(-600);
  }

  // CROUCH
  playerIsCrouching =
    (cursors.down.isDown || crouchPressed) &&
    player.body.blocked.down;

  if (playerIsCrouching) {
    setPlayerCrouchBody();
  } else {
    setPlayerStandingBody();
  }

  if (playerIsCrouching) {
    player.body.setVelocityX(0);
    player.setTexture('playerCrouch');
  } else if (!player.body.blocked.down) {
    if (player.body.velocity.y < -100) {
      player.setTexture('playerJump1');
    } else if (player.body.velocity.y >= -100 && player.body.velocity.y <= 100) {
      player.setTexture('playerJump2');
    } else {
      player.setTexture('playerJump3');
    }
  } else if (cursors.left.isDown || cursors.right.isDown || moveLeft || moveRight) {
    player.play('run', true);
  } else {
    player.play('idle', true);
  }

  // SHOOTING
  if (Phaser.Input.Keyboard.JustDown(fireKey) && !playerIsDead) {
    firePlayerBullet(this);
  }

  if (activeUpgrade === 'firerate' && !playerIsDead && (fireKey.isDown || firePressed)) {
    firePlayerBullet(this);
  }

    updateLevel3Conveyors(this);
updateLevel3Platforms(this);

// LEVEL 3 ENEMY UPDATES
slimes.forEach(slime => {
  patrolSlime(slime, 60);
});

bats.forEach(bat => {
  patrolBat(bat, 220, this);
});

junkFoodGoblins.forEach(goblin => {
  updateJunkFoodGoblinThrow(this, goblin);
});

junkFoodDrones.forEach(drone => {
  updateJunkFoodDrone(this, drone);
});

reclinerChargers.forEach(charger => {
  updateReclinerCharger(this, charger);
});

updateLevel3BossFight(this);

cullOffscreenBullets(this);

updateHomingBullets(
  this,
  [
    ...slimes,
    ...bats,
    ...junkFoodGoblins,
    ...junkFoodDrones
  ]
);

updateActiveUpgrade(this);
pickups.forEach(p => updatePickup(this, p));
settleCasings();
}


// =========================
// ENTER LEVEL 3 EXIT
// =========================
function enterLevel3Exit(playerObject, gateObject) {

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
      console.log("Level 3 complete - boss / Level 4 not built yet.");
    }
  });
}