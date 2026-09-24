// =========================================================
// LEVEL 4 ENHANCEMENTS
// Collapsing-platform visuals + elevator pacing + wind checkpoint.
// =========================================================

(function () {
  debugInvincible = true;

  // ---------------------------------------------------------
  // COLLAPSING PLATFORM VISUAL
  // ---------------------------------------------------------
  const originalCreateDropPlatform = createLevel4DropPlatform;

  function ensureCollapseTexture(scene) {
    if (scene.textures.exists('level4CollapsePlatform')) return;
    const texture = scene.textures.createCanvas('level4CollapsePlatform', 256, 48);
    const ctx = texture.getContext();
    const steel = ctx.createLinearGradient(0, 0, 0, 48);
    steel.addColorStop(0, '#89939a');
    steel.addColorStop(0.35, '#4f5960');
    steel.addColorStop(1, '#252b2f');
    ctx.fillStyle = steel;
    ctx.strokeStyle = '#111619';
    ctx.lineWidth = 4;
    ctx.fillRect(2, 4, 252, 34);
    ctx.strokeRect(2, 4, 252, 34);
    ctx.fillStyle = '#24292d';
    ctx.fillRect(10, 9, 236, 22);
    ctx.strokeStyle = '#59636a';
    ctx.lineWidth = 2;
    for (let x = 10; x < 246; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 9); ctx.lineTo(x + 24, 31);
      ctx.moveTo(x + 24, 9); ctx.lineTo(x, 31);
      ctx.stroke();
    }
    ctx.strokeStyle = '#d0a642';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(12, 37); ctx.lineTo(244, 37); ctx.stroke();
    ctx.strokeStyle = '#161a1d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(118, 5); ctx.lineTo(111, 17); ctx.lineTo(120, 22); ctx.lineTo(112, 37);
    ctx.moveTo(137, 5); ctx.lineTo(142, 15); ctx.lineTo(134, 22); ctx.lineTo(143, 37);
    ctx.stroke();
    texture.refresh();
  }

  createLevel4DropPlatform = function (scene, x, y, width, options = {}) {
    const platform = originalCreateDropPlatform(scene, x, y, width, options);
    ensureCollapseTexture(scene);
    platform.setAlpha(0);
    const visual = scene.add.image(x, y, 'level4CollapsePlatform');
    visual.setDisplaySize(width, 48);
    visual.setDepth(8);
    scene.events.on('update', function () {
      if (!platform || !platform.active || !visual || !visual.active) return;
      visual.x = platform.x;
      visual.y = platform.y;
      visual.visible = platform.visible !== false;
      if (platform.state === 'shaking') visual.setTint(0xffd27a);
      else visual.clearTint();
    });
    return platform;
  };

  // ---------------------------------------------------------
  // ELEVATORS
  // ---------------------------------------------------------
  const originalCreateElevator = createLevel4Elevator;
  const STANDARD_ELEVATOR_SPEED = 520;

  createLevel4Elevator = function (scene, x, bottomY, topY, type = 'normal') {
    const elevator = originalCreateElevator(scene, x, bottomY, topY, type);
    const travelDistance = Math.abs(bottomY - topY);
    const isWindowWasherPuzzle =
      travelDistance <= 360 &&
      (Math.abs(x - 950) < 20 || Math.abs(x - 1550) < 20 || Math.abs(x - 2150) < 20);

    if (!isWindowWasherPuzzle) {
      elevator.speed = STANDARD_ELEVATOR_SPEED;
      elevator.waitTime = 850;
      elevator.moveAgainAt = scene.time.now + elevator.waitTime;
    }
    return elevator;
  };

  // ---------------------------------------------------------
  // WIND-TUNNEL CHECKPOINT
  // ---------------------------------------------------------
  function installWindCheckpoint(scene) {
    const floor11Y = LEVEL4_STREET_Y - (10 * LEVEL4_FLOOR_SPACING);
    const trigger = scene.add.zone(300, floor11Y - 70, 300, 220);
    scene.physics.add.existing(trigger, true);
    let activated = false;

    scene.physics.add.overlap(player, trigger, function () {
      if (activated) return;
      activated = true;
      level4CheckpointX = 300;
      level4CheckpointY = floor11Y - 90;

      const text = scene.add.text(300, floor11Y - 155, 'CHECKPOINT', {
        fontSize: '24px',
        fill: '#ffd84a',
        stroke: '#000000',
        strokeThickness: 5
      }).setOrigin(0.5).setDepth(80);

      scene.tweens.add({
        targets: text,
        alpha: 0,
        y: text.y - 35,
        duration: 1300,
        delay: 500,
        onComplete: () => text.destroy()
      });
      console.log('[Level 4] wind tunnel checkpoint activated');
    });
  }

  function installSceneEnhancements() {
    let scene = null;
    try { scene = game.scene.getScene('Level4Scene'); } catch (_) { return false; }
    if (!scene) return false;

    const apply = function () {
      installWindCheckpoint(scene);
      console.log('[Level 4] wind checkpoint + elevator retune applied');
    };

    if (scene.sys && scene.sys.isActive() && scene.sys.settings.status === Phaser.Scenes.RUNNING) apply();
    else scene.events.once(Phaser.Scenes.Events.CREATE, apply);
    return true;
  }

  const installTimer = window.setInterval(function () {
    if (installSceneEnhancements()) window.clearInterval(installTimer);
  }, 50);

  console.log('[Level 4] collapse visuals + elevator pacing enhancements loaded');
})();