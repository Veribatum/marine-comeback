// =========================================================
// LEVEL 4 — MIDDLE MANAGER MINI-BOSS
// One recurring manager on each open-office combat floor.
// =========================================================
(function () {
  let attached = false;
  const managers = [];
  const paperwork = [];

  function floorY(n) {
    return LEVEL4_STREET_Y - ((n - 1) * LEVEL4_FLOOR_SPACING);
  }

  function makePaper(scene, manager, heavy) {
    if (!manager.active || !player || !player.active) return;
    const dir = player.x < manager.x ? -1 : 1;
    const p = scene.add.rectangle(manager.x + dir * 48, manager.y - 42, heavy ? 42 : 28, heavy ? 30 : 18, heavy ? 0xb3261e : 0xeee7cf, 1);
    p.setStrokeStyle(2, heavy ? 0x68140f : 0x7a7466);
    p.setDepth(35);
    p.rotation = Phaser.Math.FloatBetween(-0.35, 0.35);
    scene.physics.add.existing(p);
    p.body.allowGravity = false;
    p.body.setVelocity(dir * (heavy ? 360 : 285), Phaser.Math.Between(-35, 25));
    p.body.setAngularVelocity(dir * Phaser.Math.Between(100, 220));
    p.damage = heavy ? 2 : 1;
    paperwork.push(p);
    scene.physics.add.overlap(player, p, function (_player, paper) {
      if (!paper.active) return;
      paper.destroy();
      hurtPlayer.call(scene, player, paper);
    });
    scene.time.delayedCall(3500, () => { if (p.active) p.destroy(); });
  }

  function burstPaper(scene, manager) {
    for (let i = 0; i < 7; i++) {
      scene.time.delayedCall(i * 65, () => makePaper(scene, manager, false));
    }
  }

  function killManager(scene, manager) {
    if (!manager.active || manager.dead) return;
    manager.dead = true;
    addScore(750);
    if (manager.attackTimer) manager.attackTimer.remove(false);
    scene.tweens.killTweensOf(manager);

    for (let i = 0; i < 14; i++) {
      const scrap = scene.add.rectangle(manager.x, manager.y - 50, Phaser.Math.Between(12, 28), Phaser.Math.Between(8, 18), i % 4 === 0 ? 0xb3261e : 0xeee7cf, 1).setDepth(36);
      scene.physics.add.existing(scrap);
      scrap.body.setVelocity(Phaser.Math.Between(-240, 240), Phaser.Math.Between(-330, -90));
      scrap.body.setAngularVelocity(Phaser.Math.Between(-500, 500));
      scene.time.delayedCall(1200, () => { if (scrap.active) scrap.destroy(); });
    }

    scene.tweens.add({ targets: manager, angle: 88, alpha: 0, y: manager.y + 35, duration: 430, ease: 'Quad.easeIn', onComplete: () => manager.destroy() });
  }

  function spawnManager(scene, x, y, floorNumber) {
    const m = scene.physics.add.sprite(x, y - 92, 'middleManager');
    m.setDisplaySize(108, 126);
    m.setDepth(25);
    m.body.allowGravity = true;
    m.body.setCollideWorldBounds(false);
    m.body.setSize(120, 190, true);
    m.hp = floorNumber >= 17 ? 18 : 14;
    m.maxHp = m.hp;
    m.floorNumber = floorNumber;
    m.dead = false;
    m.homeX = x;
    m.moveDir = -1;
    m.nextMoveChange = 0;
    managers.push(m);

    // Level 4 uses its own platform array. Do not reference the old
    // `platforms` variable here; it is not defined in the current game.
    if (Array.isArray(level4Platforms)) {
      level4Platforms.forEach(platform => {
        if (platform && platform.active) scene.physics.add.collider(m, platform);
      });
    }

    scene.physics.add.overlap(bullets, m, function (bullet, manager) {
      if (!bullet.active || !manager.active || manager.dead) return;
      bullet.destroy();
      manager.hp -= bullet.damage || 1;
      manager.setTintFill(0xffffff);
      scene.time.delayedCall(65, () => { if (manager.active) manager.clearTint(); });
      if (manager.hp <= 0) killManager(scene, manager);
    });

    scene.physics.add.overlap(player, m, hurtPlayer, null, scene);

    // Alternates paperwork volleys with the heavier red URGENT folder.
    m.attackTimer = scene.time.addEvent({
      delay: floorNumber >= 17 ? 1550 : 1850,
      loop: true,
      callback: function () {
        if (!m.active || m.dead || !player || !player.active) return;
        const dx = Math.abs(player.x - m.x);
        const dy = Math.abs(player.y - m.y);
        if (dx > 850 || dy > 300) return;
        m.setFlipX(player.x < m.x);
        m.setScale(1.06, 0.96);
        scene.time.delayedCall(120, () => { if (m.active) m.setScale(1); });
        if (Phaser.Math.Between(0, 3) === 0) makePaper(scene, m, true);
        else burstPaper(scene, m);
      }
    });

    return m;
  }

  function updateManagers(scene) {
    const now = scene.time.now;
    managers.forEach(m => {
      if (!m.active || m.dead || !player || !player.active) return;
      const dist = Math.abs(player.x - m.x);
      if (Math.abs(player.y - m.y) < 260 && dist < 760) {
        if (now > m.nextMoveChange) {
          m.moveDir = player.x < m.x ? -1 : 1;
          m.nextMoveChange = now + 700;
        }
        if (dist > 260) m.setVelocityX(m.moveDir * (m.floorNumber >= 17 ? 62 : 48));
        else m.setVelocityX(0);
        m.setFlipX(player.x < m.x);
      } else {
        m.setVelocityX(0);
      }
    });
  }

  function install(scene) {
    if (attached) return;
    attached = true;

    const spawnBoth = function () {
      spawnManager(scene, 2050, floorY(9), 9);
      spawnManager(scene, 2050, floorY(17), 17);
      scene.events.on(Phaser.Scenes.Events.UPDATE, () => updateManagers(scene));
      console.log('[Level 4] Middle Managers installed on office floors 9 and 17');
    };

    if (scene.textures.exists('middleManager')) {
      spawnBoth();
      return;
    }

    scene.load.svg('middleManager', 'assets/middle_manager.svg', { width: 190, height: 220 });
    scene.load.once(Phaser.Loader.Events.COMPLETE, spawnBoth);
    scene.load.start();
  }

  function attach() {
    let scene;
    try { scene = game.scene.getScene('Level4Scene'); } catch (_) { return false; }
    if (!scene) return false;
    if (scene.sys && scene.sys.isActive() && scene.sys.settings.status === Phaser.Scenes.RUNNING) install(scene);
    else scene.events.once(Phaser.Scenes.Events.CREATE, () => install(scene));
    return true;
  }

  const timer = window.setInterval(function () {
    if (attach()) window.clearInterval(timer);
  }, 50);
})();