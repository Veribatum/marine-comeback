// =========================================================
// LEVEL 4 POPULATION PASS
// Enemy/pickup balancing kept separate from main.js so Level 4 can be
// tuned without disturbing the tower geometry, elevators, or wind code.
// =========================================================

(function () {
  let applied = false;

  function level4FloorY(floorNumber) {
    return LEVEL4_STREET_Y - ((floorNumber - 1) * LEVEL4_FLOOR_SPACING);
  }

  function destroyCollection(collection) {
    if (!Array.isArray(collection)) return;
    collection.forEach(object => {
      if (object && object.active && object.destroy) object.destroy();
    });
  }

  function populateLevel4(scene) {
    if (applied || !scene || !scene.sys || !scene.sys.isActive()) return;
    applied = true;

    const floorY = level4FloorY;

    // ---------------------------------------------------------
    // Replace the old Level 4 flying-enemy pass with one curated
    // progression. Wind/air-burst tutorial rooms intentionally get
    // lighter combat so the player can read the environmental hazard.
    // ---------------------------------------------------------
    destroyCollection(bats);
    destroyCollection(junkFoodDrones);
    bats = [];
    junkFoodDrones = [];

    // ROOM 2 — FLOORS 2-3: first aerial introduction.
    spawnBat(scene, 1550, floorY(3) - 230, 1250, 1900, 1);
    spawnBat(scene, 2250, floorY(3) - 360, 2000, 2550, -1);

    // ROOM 3 — FLOORS 4-5: WIND TUTORIAL.
    // Only one high bat. No shooting drone here: the wind is the lesson.
    spawnBat(scene, 2150, floorY(5) - 245, 1850, 2450, -1);

    // ROOM 4 — FLOORS 6-7: precision climb.
    // Pressure the route without parking enemies directly over landings.
    spawnBat(scene, 1250, floorY(7) - 300, 900, 1650, 1);
    spawnBat(scene, 2200, floorY(7) - 500, 1850, 2550, -1);

    // ROOM 5 — FLOOR 9: first real office combat room.
    spawnBat(scene, 2350, floorY(9) - 235, 1950, 2650, -1);
    spawnBat(scene, 1050, floorY(9) - 210, 700, 1450, 1);
    spawnBat(scene, 1750, floorY(9) - 330, 1450, 2050, -1);
    spawnJunkFoodDrone(scene, 1600, floorY(9) - 255, {
      leftBound: 1300,
      rightBound: 1900,
      direction: 1,
      shootCooldown: 2300
    });

    // ROOM 6 — FLOORS 10-11: WIND-SHADOW TUNNEL.
    // Deliberately no enemies. Cover blocks + full wind are the encounter.

    // ROOM 7 — FLOORS 12-13: maintenance shaft.
    spawnBat(scene, 900, floorY(13) - 250, 600, 1250, 1);
    spawnBat(scene, 2050, floorY(13) - 420, 1700, 2450, -1);
    spawnJunkFoodDrone(scene, 1500, floorY(13) - 300, {
      leftBound: 1250,
      rightBound: 1800,
      direction: -1,
      shootCooldown: 2200
    });

    // ROOM 8 — FLOORS 14-15: window-washer crossing.
    spawnBat(scene, 1200, floorY(15) - 260, 850, 1550, 1);
    spawnBat(scene, 2200, floorY(15) - 300, 1850, 2550, -1);
    spawnJunkFoodDrone(scene, 2500, floorY(15) - 235, {
      leftBound: 2250,
      rightBound: 2750,
      direction: -1,
      shootCooldown: 2400
    });

    // ROOM 9 — FLOOR 17: second major office combat floor.
    spawnBat(scene, 2400, floorY(17) - 230, 2050, 2700, -1);
    spawnBat(scene, 1650, floorY(17) - 350, 1350, 1950, 1);
    spawnBat(scene, 850, floorY(17) - 220, 550, 1150, 1);
    spawnJunkFoodDrone(scene, 1500, floorY(17) - 255, {
      leftBound: 1200,
      rightBound: 1800,
      direction: -1,
      shootCooldown: 1900
    });

    // ROOM 10 — FLOORS 18-19: master air-burst climb.
    // One high patrol only; the timed launch mechanic remains primary.
    spawnBat(scene, 2050, floorY(19) - 430, 1700, 2400, -1);

    // ROOM 11 — ROOF: short final pressure before the zip line.
    spawnBat(scene, 1650, floorY(20) - 190, 1200, 2100, 1);

    // ---------------------------------------------------------
    // LEVEL 4 PICKUPS
    // Fixed rewards: health before major fights, points on dangerous
    // traversal, and upgrades where the player has enough combat ahead
    // to actually enjoy them.
    // ---------------------------------------------------------
    spawnPickup(scene, 2300, floorY(3) - 315, 'pointsSmall');
    spawnPickup(scene, 1800, floorY(5) - 155, 'pointsSmall');
    spawnPickup(scene, 1950, floorY(7) - 485, 'pointsLarge');

    // Recovery before the first long office fight.
    spawnPickup(scene, 2550, floorY(9) - 70, 'health');
    spawnPickup(scene, 1850, floorY(9) - 85, 'upgrade');

    // Reward surviving the wind-shadow tunnel.
    spawnPickup(scene, 2550, floorY(11) - 80, 'pointsLarge');

    // Maintenance / window-washer risk rewards.
    spawnPickup(scene, 2050, floorY(13) - 485, 'pointsSmall');
    spawnPickup(scene, 1750, floorY(15) - 175, 'pointsLarge');

    // Recovery + power before the late-game office/HVAC sequence.
    spawnPickup(scene, 2550, floorY(17) - 70, 'health');
    spawnPickup(scene, 1200, floorY(17) - 85, 'upgrade');
    spawnPickup(scene, 2150, floorY(19) - 500, 'pointsLarge');

    console.log('[Level 4] curated enemy/pickup population applied');
  }

  function attachPopulationPass() {
    let scene = null;

    try {
      scene = game.scene.getScene('Level4Scene');
    } catch (error) {
      return false;
    }

    if (!scene) return false;

    // If the scene has already completed create(), populate immediately.
    if (scene.sys && scene.sys.isActive() && scene.sys.settings.status === Phaser.Scenes.RUNNING) {
      populateLevel4(scene);
      return true;
    }

    // Otherwise wait for Phaser's CREATE event, which fires after the
    // scene's createLevel4() callback has finished building the tower.
    scene.events.once(Phaser.Scenes.Events.CREATE, function () {
      populateLevel4(scene);
    });

    return true;
  }

  // Phaser boots asynchronously after main.js creates the Game object.
  // Poll only until the Level4 scene exists, then stop completely.
  const attachTimer = window.setInterval(function () {
    if (attachPopulationPass()) {
      window.clearInterval(attachTimer);
    }
  }, 50);
})();
