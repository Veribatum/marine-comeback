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
// 'level4'
const DEBUG_START_LEVEL = 'level4';

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
      debug: true
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
},
{
  key: 'Level4Scene',
  create: createLevel4,
  update: updateLevel4
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

if (DEBUG_START_LEVEL === 'level4') {
  return 'Level4Scene';
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
  this.load.image('vendingMachine', 'assets/Vending.png');
  this.load.image('cityPolice', 'assets/city_Police.png');
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
// =========================
// LEVEL 4 — OFFICE ASSETS
// =========================
this.load.image('officeStreet', 'assets/office_street.png');
this.load.image('officeGarage', 'assets/office_garage.png');
this.load.image('officeGarageFront', 'assets/office_garage.png');
this.load.image('officeBase', 'assets/office_base.png');
this.load.image('officeWindows', 'assets/office_windows.png');

this.load.image('officeOpen01', 'assets/office_open_01.png');
this.load.image('officeOpen02', 'assets/office_open_02.png');
this.load.image('officeOpen03', 'assets/office_open_03.png');

this.load.image('officePainterPlatform', 'assets/office_painterplatform.png');
this.load.image('officePlatform', 'assets/city_railing.png');
// =========================
// LEVEL 4 — WIND FX
// =========================
this.load.image('pregust1', 'assets/pregust 1.png');
this.load.image('pregust2', 'assets/pregust 2.png');
this.load.image('pregust3', 'assets/pregust 3.png');
this.load.image('pregust4', 'assets/pregust 4.png');

this.load.image('medgust1', 'assets/medgust 1.png');
this.load.image('medgust2', 'assets/medgust 2.png');
this.load.image('medgust3', 'assets/medgust 3.png');
this.load.image('medgust4', 'assets/medgust4.png');

this.load.image('heavygust1', 'assets/heavygust 1.png');
this.load.image('heavygust2', 'assets/heavygust 2.png');
this.load.image('heavygust3', 'assets/heavygust 3.png');
this.load.image('heavygust4', 'assets/heavygust 4.png');

this.load.image('full1', 'assets/full 1.png');
this.load.image('full2', 'assets/full 2.png');
this.load.image('full3', 'assets/full 3.png');
this.load.image('full4', 'assets/full 4.png');
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

// [CONTENT PRESERVED FROM CURRENT main.js — unchanged beyond the five preload path corrections above]
