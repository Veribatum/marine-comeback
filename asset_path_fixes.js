// Asset-path compatibility fixes.
// Keep the repository asset filenames authoritative and correct the
// stale paths requested by main.js without renaming or duplicating art.
(function () {
  const originalImage = Phaser.Loader.LoaderPlugin.prototype.image;

  const pathFixes = {
    'assets/vending.png': 'assets/Vending.png',
    'assets/city_police.png': 'assets/city_Police.png',
    'assets/medgust 4.png': 'assets/medgust4.png',
    // The garage is intentionally layered in Level 4. There is no
    // separate office_garage_front.png file; the existing garage art is
    // reused under the front-layer texture key so the hand-built depth
    // setup in main.js remains intact.
    'assets/office_garage_front.png': 'assets/office_garage.png',
    // Level 4 exterior ledges/catwalks use the existing catwalk art.
    'assets/office_platform.png': 'assets/city_railing.png'
  };

  Phaser.Loader.LoaderPlugin.prototype.image = function (key, url, xhrSettings) {
    if (typeof url === 'string' && pathFixes[url]) {
      url = pathFixes[url];
    }
    return originalImage.call(this, key, url, xhrSettings);
  };
})();