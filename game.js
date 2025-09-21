// Game State
let deck = [];
let playDeck = [];
let gameScene;
let deckSprites = []; // Ziehstapel Sprites
let playSprites = []; // Ablagestapel Sprites

// Card Configuration
const CARD_CONFIG = {
  values: [5, 10, 15, 20, 25],
  valueCounts: [1, 1, 2, 1, 1],
  colors: ['BLUE', 'YELLOW', 'GREEN', 'PINK'],
  scale: 0.4,
  width: 120,
  height: 170
};

function preload() {
  gameScene = this;

  console.log('Preload gestartet');

  // Load card assets
  this.load.image('card-shadow', 'assets/images/card-shadow.png');
  this.load.image('card-base', 'assets/images/card-base.png');
  this.load.image('card-back', 'assets/images/card-back.png');
  this.load.image('card-gloss', 'assets/images/card-gloss.png');

  // Load color overlays
  CARD_CONFIG.colors.forEach(color => {
    this.load.image(color.toLowerCase(), `assets/images/${color}.png`);
  });

  // Load number overlays
  CARD_CONFIG.values.forEach(value => {
    this.load.image(`value-${value}`, `assets/images/${value}.png`);
  });

  this.load.on('complete', () => {
    console.log('Assets geladen');
    // Loading screen ausblenden
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  });
}

function create() {
  console.log("Game create() gestartet");

  // Verstärkte Filz-Textur erstellen
  createFeltTexture();

  // Create deck
  createDeck();
  shuffleDeck();

  // Setup visuals
  setupDeckVisualsCSS();
  setupPlayArea();

  console.log("Game setup abgeschlossen");
}

function createFeltTexture() {
  // Graphics-Objekt für subtile Filz-Textur
  const graphics = gameScene.add.graphics();
  graphics.setDepth(-100);

  // Basis-Filz-Farbe
  graphics.fillStyle(0x1e6b1e);
  graphics.fillRect(0, 0, gameScene.cameras.main.width, gameScene.cameras.main.height);

  // DEUTLICH MEHR Punkte mit erhöhtem Kontrast
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * gameScene.cameras.main.width;
    const y = Math.random() * gameScene.cameras.main.height;
    const brightness = Math.random();

    if (brightness > 0.6) {
      // Helle Punkte - erhöhter Kontrast
      graphics.fillStyle(0x2f7f2f, 0.5);
      graphics.fillCircle(x, y, Math.random() * 1.5);
    } else if (brightness < 0.4) {
      // Dunkle Punkte - erhöhter Kontrast  
      graphics.fillStyle(0x155515, 0.6);
      graphics.fillCircle(x, y, Math.random() * 1.2);
    }
  }

  // 60° rotierte und skalierte Webstruktur (Faktor 2)
  const angle = Math.PI / 3; // 60 Grad in Radiant
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  const spacing = 12; // Skalierung der Webstruktur (war 6, jetzt 12)

  // Erste Richtung (60° rotiert)
  graphics.lineStyle(0.5, 0x2a7a2a, 0.3);
  for (let i = -gameScene.cameras.main.height; i < gameScene.cameras.main.width + gameScene.cameras.main.height; i += spacing) {
    const x1 = i;
    const y1 = 0;
    const x2 = i + gameScene.cameras.main.height * cosAngle;
    const y2 = gameScene.cameras.main.height * sinAngle;

    graphics.lineBetween(x1, y1, x2, y2);
  }

  // Zweite Richtung (120° rotiert, senkrecht zur ersten)
  graphics.lineStyle(0.5, 0x175717, 0.3);
  for (let i = -gameScene.cameras.main.height; i < gameScene.cameras.main.width + gameScene.cameras.main.height; i += spacing) {
    const x1 = i;
    const y1 = 0;
    const x2 = i - gameScene.cameras.main.height * cosAngle;
    const y2 = gameScene.cameras.main.height * sinAngle;

    graphics.lineBetween(x1, y1, x2, y2);
  }

  // Dritte Richtung (horizontale Linien, leicht versetzt)
  graphics.lineStyle(0.3, 0x246824, 0.2);
  for (let y = 0; y < gameScene.cameras.main.height; y += spacing * 1.2) {
    graphics.lineBetween(0, y, gameScene.cameras.main.width, y);
  }
}

function update() {
  // Game loop
}

// Card Creation
function createDeck() {
  deck = [];
  CARD_CONFIG.colors.forEach(color => {
    CARD_CONFIG.values.forEach((value, index) => {
      const count = CARD_CONFIG.valueCounts[index];
      for (let i = 0; i < count; i++) {
        deck.push({ color, value });
      }
    });
  });
  console.log(`Deck erstellt: ${deck.length} Karten`);
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  console.log("Deck gemischt");
}

// LINKS: Korrigierte Deck-Visuals mit CSS-Overlay
function setupDeckVisualsCSS() {
  const deckX = gameScene.cameras.main.width * 0.8;
  const deckY = gameScene.cameras.main.height * 0.5;

  // Phaser-Karte mit grünem Tint
  const deckPlaceholder = gameScene.add.image(deckX, deckY, 'card-back')
    .setScale(CARD_CONFIG.scale)
    .setTint(0x1a4a1a)
    .setAlpha(0.6)
    .setDepth(0);

  // CSS-Element für Präge-Effekt
  const canvas = gameScene.game.canvas;
  const cssCardWidth = (CARD_CONFIG.width * CARD_CONFIG.scale) * 5;
  const cssCardHeight = (CARD_CONFIG.height * CARD_CONFIG.scale) * 5;

  const placeholder = document.createElement('div');
  placeholder.className = 'card-placeholder deck-placeholder';
  placeholder.id = 'deck-area-overlay'; // ID zum späteren Zugriff
  placeholder.style.cssText = `
    position: absolute;
    left: ${deckX - cssCardWidth / 2}px;
    top: ${deckY - cssCardHeight / 2}px;
    width: ${cssCardWidth}px;
    height: ${cssCardHeight}px;
    background: transparent;
    border-radius: 16px;
    box-shadow: 
      inset 2px 2px 4px rgba(0,0,0,0.4),
      inset -2px -2px 4px rgba(255,255,255,0.5);
    opacity: 0.7;
    pointer-events: none;
    z-index: 1;
    display: ${deck.length === 0 ? 'block' : 'none'};
  `;
  canvas.parentElement.appendChild(placeholder);

  // Echte Karten erstellen
  deckSprites = [];
  deck.forEach((card, index) => {
    const sprite = createCardSprite(card, deckX, deckY, false);
    sprite.x += index * 0.5;
    sprite.y -= index * 0.3;
    sprite.setDepth(index + 1);
    deckSprites.push(sprite);
  });

  // Vergrößerter Klick-Bereich mit Doppelklick-Reset
  const clickWidth = (CARD_CONFIG.width * CARD_CONFIG.scale) * 5;
  const clickHeight = (CARD_CONFIG.height * CARD_CONFIG.scale) * 5;
  const clickArea = gameScene.add.rectangle(deckX, deckY, clickWidth, clickHeight, 0x000000, 0);
  clickArea.setInteractive();

  // Einzelklick für Karte ziehen
  clickArea.on('pointerdown', () => {
    if (deck.length > 0) {
      dealCard();
    }
  });

  // Doppelklick für Reset (nur wenn Deck leer)
  let clickTimeout;
  let clickCount = 0;

  clickArea.on('pointerdown', () => {
    clickCount++;

    if (clickCount === 1) {
      clickTimeout = setTimeout(() => {
        clickCount = 0;
      }, 300); // 300ms Fenster für Doppelklick
    } else if (clickCount === 2) {
      clearTimeout(clickTimeout);
      clickCount = 0;

      // Reset nur wenn Deck leer ist
      if (deck.length === 0) {
        resetGame();
      }
    }
  });

  clickArea.on('pointerover', () => gameScene.input.setDefaultCursor('pointer'));
  clickArea.on('pointerout', () => gameScene.input.setDefaultCursor('default'));

  console.log(`Links: Klick-Bereich ${clickWidth}x${clickHeight} (×5)`);
}

// RECHTS: Container für blaue Kartenvorderseite ohne Wert
function setupPlayArea() {
  playSprites = [];
  playDeck = [];

  const playX = gameScene.cameras.main.width * 0.3;
  const playY = gameScene.cameras.main.height * 0.5;

  // Container für blaue Kartenvorderseite
  const playPlaceholder = gameScene.add.container(playX, playY);
  playPlaceholder.setDepth(-1); // Niedrigere Depth als CSS-Overlay

  // Basis-Karte
  const base = gameScene.add.image(0, 0, 'card-base')
    .setScale(CARD_CONFIG.scale)
    .setTint(0x1a4a1a) // Gleicher grüner Tint wie Ziehstapel
    .setAlpha(0.4);

  // Blauer Layer (PNG)
  const blue = gameScene.add.image(0, 0, 'blue')
    .setScale(CARD_CONFIG.scale)
    .setTint(0x1a4a1a) // Gleicher grüner Tint wie Ziehstapel
    .setAlpha(0.3);

  playPlaceholder.add([base, blue]);

  // CSS-Overlay für Präge-Effekt
  const canvas = gameScene.game.canvas;
  const cssCardWidth = CARD_CONFIG.width * 2;
  const cssCardHeight = CARD_CONFIG.height * 2;

  const placeholder = document.createElement('div');
  placeholder.className = 'card-placeholder play-placeholder';
  placeholder.id = 'play-area-overlay'; // ID zum späteren Zugriff
  placeholder.style.cssText = `
    position: absolute;
    left: ${playX - cssCardWidth / 2}px;
    top: ${playY - cssCardHeight / 2}px;
    width: ${cssCardWidth}px;
    height: ${cssCardHeight}px;
    background: transparent;
    border-radius: 16px;
    box-shadow: 
      inset 2px 2px 4px rgba(0,0,0,0.4),
      inset -2px -2px 4px rgba(255,255,255,0.5);
    opacity: 0.7;
    pointer-events: none;
    z-index: 1;
    display: block;
  `;
  canvas.parentElement.appendChild(placeholder);

  console.log("Rechts: Blaue Kartenvorderseite ohne Wert");
}

function createCardSprite(cardData, x, y, isFront) {
  const container = gameScene.add.container(x, y);

  // Zufällige Rotation
  container.setRotation((Math.random() - 0.5) * 0.1);

  // Verstärkter Schatten rechts und unten (angepasste Größe)
  const shadow = gameScene.add.image(6, 7, 'card-shadow')
    .setScale(CARD_CONFIG.scale)
    .setTint(0x333333) // Dunkelgrau statt schwarz
    .setAlpha(0.6);
  container.add(shadow);

  if (isFront) {
    // Vorderseite
    const base = gameScene.add.image(0, 0, 'card-base').setScale(CARD_CONFIG.scale);
    const color = gameScene.add.image(0, 0, cardData.color.toLowerCase()).setScale(CARD_CONFIG.scale);
    const value = gameScene.add.image(0, 0, `value-${cardData.value}`).setScale(CARD_CONFIG.scale);
    const gloss = gameScene.add.image(0, 0, 'card-gloss').setScale(CARD_CONFIG.scale);

    container.add([base, color, value, gloss]);
  } else {
    // Rückseite
    const back = gameScene.add.image(0, 0, 'card-back').setScale(CARD_CONFIG.scale);
    const gloss = gameScene.add.image(0, 0, 'card-gloss').setScale(CARD_CONFIG.scale);

    container.add([back, gloss]);
  }

  container.cardData = cardData;
  return container;
}

function dealCard() {
  if (deck.length === 0) {
    console.log("Deck ist leer");
    return;
  }

  console.log(`Dealing card. Deck: ${deck.length}, DeckSprites: ${deckSprites.length}, PlaySprites: ${playSprites.length}`);

  // Karte aus dem Deck nehmen
  const card = deck.pop();
  playDeck.push(card);

  // Oberste Karte vom Ziehstapel entfernen
  if (deckSprites.length > 0) {
    const topSprite = deckSprites.pop();
    topSprite.destroy();
    console.log(`Deck-Sprite entfernt. Verbleibend: ${deckSprites.length}`);
  }

  // Neue Karte für Ablagestapel erstellen
  const playX = gameScene.cameras.main.width * 0.3;
  const playY = gameScene.cameras.main.height * 0.5;

  // Position für Stapel berechnen (weniger weit nach rechts)
  const stackIndex = playSprites.length;
  const finalX = playX + (stackIndex * 1); // War 2, jetzt 1
  const finalY = playY + (stackIndex * 1);

  const newSprite = createCardSprite(card, playX + 180, playY - 25, true);

  // WICHTIG: Neue Karte über Pseudokarte setzen
  newSprite.setDepth(playSprites.length + 1);

  // Animation zur finalen Position
  gameScene.tweens.add({
    targets: newSprite,
    x: finalX,
    y: finalY,
    duration: 300,
    ease: 'Power2'
  });

  playSprites.push(newSprite);

  // CSS-Overlays aktualisieren
  const playOverlay = document.getElementById('play-area-overlay');
  if (playOverlay) {
    playOverlay.style.display = playSprites.length > 0 ? 'none' : 'block';
  }

  const deckOverlay = document.getElementById('deck-area-overlay');
  if (deckOverlay) {
    deckOverlay.style.display = deck.length === 0 ? 'block' : 'none';
  }

  // UI updaten
  updateUI();

  console.log(`Karte ausgeteilt: ${card.color} ${card.value}. Play-Stapel: ${playSprites.length}`);
}

function updateUI() {
  const deckCount = document.getElementById('deckCount');
  const playedCount = document.getElementById('playedCount');
  const currentCard = document.getElementById('currentCard');

  if (deckCount) deckCount.textContent = deck.length;
  if (playedCount) playedCount.textContent = playDeck.length;

  if (currentCard && playDeck.length > 0) {
    const lastCard = playDeck[playDeck.length - 1];
    currentCard.textContent = `${lastCard.color} ${lastCard.value}`;
  } else if (currentCard) {
    currentCard.textContent = '-';
  }
}

function resetGame() {
  console.log("Spiel wird zurückgesetzt...");

  // Alle Sprites zerstören
  deckSprites.forEach(sprite => sprite.destroy());
  playSprites.forEach(sprite => sprite.destroy());

  // Arrays leeren
  deckSprites = [];
  playSprites = [];
  playDeck = [];

  // Deck neu erstellen
  createDeck();
  shuffleDeck();

  // Deck-Sprites neu erstellen
  const deckX = gameScene.cameras.main.width * 0.8;
  const deckY = gameScene.cameras.main.height * 0.5;

  deck.forEach((card, index) => {
    const sprite = createCardSprite(card, deckX, deckY, false);
    sprite.x += index * 0.5;
    sprite.y -= index * 0.3;
    sprite.setDepth(index + 1);
    deckSprites.push(sprite);
  });

  // CSS-Overlays aktualisieren
  const deckOverlay = document.getElementById('deck-area-overlay');
  if (deckOverlay) {
    deckOverlay.style.display = 'none'; // Deck ist nicht leer
  }

  const playOverlay = document.getElementById('play-area-overlay');
  if (playOverlay) {
    playOverlay.style.display = 'block'; // Ablagestapel ist leer
  }

  // UI aktualisieren
  updateUI();

  console.log("Spiel zurückgesetzt!");
}

// Game initialization
window.addEventListener('load', function () {
  console.log('Window loaded, starting game...');

  const gameContainer = document.getElementById('game-canvas');
  if (!gameContainer) {
    console.error('game-canvas nicht gefunden!');
    return;
  }

  const rect = gameContainer.getBoundingClientRect();
  console.log('Container Größe:', rect.width, 'x', rect.height);

  const config = {
    type: Phaser.AUTO,
    width: rect.width,
    height: rect.height,
    parent: 'game-canvas',
    backgroundColor: '#1e6b1e',
    scene: {
      preload: preload,
      create: create,
      update: update
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };

  new Phaser.Game(config);
});