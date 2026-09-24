// =========================================================
// LEVEL 4 ENHANCEMENTS
// Collapsing-platform visuals + elevator pacing pass.
// Kept separate from main.js so this pass is easy to tune/remove.
// =========================================================

(function () {
  // God mode ON while Level 4 is being playtested. The existing I-key
  // toggle still works normally if damage testing is needed.
  debugInvincible = true;

  // ---------------------------------------------------------
  // COLLAPSING PLATFORM VISUAL
  // ---------------------------------------------------------
  // main.js already owns the actual drop/reset physics. We leave that
  // untouched and attach a visible industrial catwalk sprite to each
  // invisible/placeholder platform, following its x/y every frame.
  const originalCreateDropPlatform = createLevel4DropPlatform;

  function ensureCollapseTexture(scene) {
    if (scene.textures.exists('level4CollapsePlatform')) return;

    const texture = scene.textures.createCanvas('level4CollapsePlatform', 256, 48);
    const ctx = texture.getContext();

    // Dark steel body.
    const steel = ctx.createLinearGradient(0, 0, 0, 48);
    steel.addColorStop(0, '#89939a');
    steel.addColorStop(0.35, '#4f5960');
    steel.addColorStop(1, '#252b2f');
    ctx.fillStyle = steel;
    ctx.strokeStyle = '#111619';
    ctx.lineWidth = 4;
    ctx.fillRect(2, 4, 252, 34);
    ctx.strokeRect(2, 4, 252, 34);

    // Cross-braced grate.
    ctx.fillStyle = '#24292d';
    ctx.fillRect(10, 9, 236, 22);
    ctx.strokeStyle = '#59636a';
    ctx.lineWidth = 2;
    for (let x = 10; x < 246; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 9);
      ctx.lineTo(x + 24, 31);
      ctx.moveTo(x + 24, 9);
      ctx.lineTo(x, 31);
      ctx.stroke();
    }

    // Worn yellow hazard edge.
    ctx.strokeStyle = '#d0a642';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(12, 37);
    ctx.lineTo(244, 37);
    ctx.stroke();

    // Cracks make it readable as the unstable platform.
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

    // Hide the old brown rectangle but keep its physics body active.
    platform.setAlpha(0);

    const visual = scene.add.image(x, y, 'level4CollapsePlatform');
    visual.setDisplaySize(width, 48);
    visual.setDepth(8);

    scene.events.on('update', function syncCollapsePlatformVisual() {
      if (!platform || !platform.active || !visual || !visual.active) return;
      visual.x = platform.x;
      visual.y = platform.y;
      visual.visible = platform.visible !== false;

      // During the warning shake, tint slightly warmer so the player gets
      // a visual cue without adding another HUD message.
      if (platform.state === 'shaking') {
        visual.setTint(0xffd27a);
      } else {
        visual.clearTint();
      }
    });

    return platform;
  };

  // ---------------------------------------------------------
  // ELEVATOR PACING / VARIETY
  // ---------------------------------------------------------
  // The tower already uses normal, freight and express elevators. Give
  // those labels meaningful pacing instead of letting long rides all feel
  // alike. Explicit moveSpeed values in main.js still win.
  const originalCreateElevator = createLevel4Elevator;

  createLevel4Elevator = function (
    scene,
    x,
    bottomY,
    topY,
    type = 'normal',
    options = {}
  ) {
    const tunedOptions = Object.assign({}, options);

    if (tunedOptions.moveSpeed == null) {
      if (type === 'express') {
        tunedOptions.moveSpeed = 600;
      } else if (type === 'freight') {
        tunedOptions.moveSpeed = 390;
      } else {
        tunedOptions.moveSpeed = 460;
      }
    }

    const elevator = originalCreateElevator(
      scene,
      x,
      bottomY,
      topY,
      type,
      tunedOptions
    );

    // Long late-game rides get a small speed bonus so they do not become
    // dead time. Short window-washer lifts keep their normal character.
    const travelDistance = Math.abs(bottomY - topY);
    if (travelDistance > 900 && type !== 'express') {
      elevator.moveSpeed = Math.max(elevator.moveSpeed, 520);
    }

    return elevator;
  };

  console.log('[Level 4] collapse visuals + elevator pacing enhancements loaded');
})();
