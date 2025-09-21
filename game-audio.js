// Phaser.js 


// Configuration
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    backgroundColor: '#eeeeee',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    audio: {
        disableWebAudio: false
    }
};

// Game State
let deck = [];
let playDeck = [];
let cardSprites = [];
let dealTimer = 0;
let lastDealTime = 0;
let gameScene;

// Card Configuration
const CARD_CONFIG = {
    values: [5, 10, 15, 20, 25],
    valueCounts: [1, 1, 2, 1, 1], // Test values
    colors: ['BLUE', 'YELLOW', 'GREEN', 'PINK'],
    scale: 0.5,
    width: 200,
    height: 285
};

// Audio Configuration
const AUDIO_CONFIG = {
    cardFlip: null,
    cardPlace: null,
    shuffle: null,
    ambient: null
};

function preload() {
    gameScene = this;

    // Debug: Zeige Lade-Ereignisse in der Konsole
    this.load.on('filecomplete', function (key, type, data) {
        console.log('Geladen:', key, type);
    });

    this.load.on('loaderror', function (file) {
        console.error('Fehler beim Laden:', file.src);
    });

    // Korrigierte Pfade für assets/images/ Struktur
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

    // Audio erstmal deaktiviert für Debug
    // this.load.audio('card-flip', ['assets/audio/card-flip.mp3']);
    // this.load.audio('card-place', ['assets/audio/card-place.mp3']);
    // this.load.audio('shuffle', ['assets/audio/shuffle.mp3']);
    // this.load.audio('ambient', ['assets/audio/ambient.mp3']);

    // Create loading progress bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    progressBox.fillStyle(0x222222);
    progressBox.fillRect(240, 270, 320, 50);

    this.load.on('progress', (value) => {
        progressBar.clear();
        progressBar.fillStyle(0xffffff);
        progressBar.fillRect(250, 280, 300 * value, 30);
        console.log('Lade-Fortschritt:', Math.round(value * 100) + '%');
    });

    this.load.on('complete', () => {
        console.log('Alle Assets geladen!');
    });
}

function create() {
    // Initialize audio
    AUDIO_CONFIG.cardFlip = this.sound.add('card-flip', { volume: 0.3 });
    AUDIO_CONFIG.cardPlace = this.sound.add('card-place', { volume: 0.5 });
    AUDIO_CONFIG.shuffle = this.sound.add('shuffle', { volume: 0.4 });
    AUDIO_CONFIG.ambient = this.sound.add('ambient', { volume: 0.2, loop: true });

    // Start ambient music
    AUDIO_CONFIG.ambient.play();

    // Create deck
    createDeck();
    shuffleDeck();

    // Set up initial card positions for deck
    setupDeckVisuals();

    // Start dealing timer
    dealTimer = this.time.addEvent({
        delay: 550,
        callback: dealCard,
        callbackScope: this,
        loop: true
    });

    // Add particle system for card effects
    this.cardParticles = this.add.particles(0, 0, 'card-gloss', {
        scale: { start: 0.1, end: 0.3 },
        alpha: { start: 1, end: 0 },
        lifespan: 800,
        emitting: false
    });
}

function update(time, delta) {
    // Update card animations and effects
    cardSprites.forEach(sprite => {
        if (sprite.active && sprite.animating) {
            updateCardAnimation(sprite, delta);
        }
    });
}

// Card Creation and Management
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
}

function shuffleDeck() {
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    AUDIO_CONFIG.shuffle.play();
}

function setupDeckVisuals() {
    const deckX = 220 + CARD_CONFIG.width * 1.4;
    const deckY = 95;

    // Create visual representation of deck (card backs)
    deck.forEach((card, index) => {
        const sprite = createCardSprite(card, deckX, deckY, false, index);
        cardSprites.push(sprite);
    });
}

function createCardSprite(cardData, x, y, isFront, stackIndex = 0) {
    const container = gameScene.add.container(x, y);

    // Random rotation for realism
    const randomRotation = (Math.random() - 0.5) * 0.1;
    const stackOffset = stackIndex * 0.5;

    container.setRotation(randomRotation);

    // Add shadow
    const shadow = gameScene.add.image(5, 5, 'card-shadow')
        .setScale(CARD_CONFIG.scale)
        .setAlpha(0.6);
    container.add(shadow);

    if (isFront) {
        // Front side layers
        const base = gameScene.add.image(0, 0, 'card-base').setScale(CARD_CONFIG.scale);
        const colorOverlay = gameScene.add.image(0, 0, cardData.color.toLowerCase()).setScale(CARD_CONFIG.scale);
        const valueOverlay = gameScene.add.image(0, 0, `value-${cardData.value}`).setScale(CARD_CONFIG.scale);
        const gloss = gameScene.add.image(0, 0, 'card-gloss').setScale(CARD_CONFIG.scale);

        container.add([base, colorOverlay, valueOverlay, gloss]);
    } else {
        // Back side
        const back = gameScene.add.image(0, 0, 'card-back').setScale(CARD_CONFIG.scale);
        const gloss = gameScene.add.image(0, 0, 'card-gloss').setScale(CARD_CONFIG.scale);
        container.add([back, gloss]);
    }

    // Add properties
    container.cardData = cardData;
    container.isFront = isFront;
    container.animating = false;

    // Add 3D hover effect
    container.setInteractive(
        new Phaser.Geom.Rectangle(-CARD_CONFIG.width / 2, -CARD_CONFIG.height / 2,
            CARD_CONFIG.width, CARD_CONFIG.height),
        Phaser.Geom.Rectangle.Contains
    );

    container.on('pointerover', () => {
        if (isFront) {
            gameScene.tweens.add({
                targets: container,
                scaleX: CARD_CONFIG.scale * 1.05,
                scaleY: CARD_CONFIG.scale * 1.05,
                y: y - 10,
                duration: 200,
                ease: 'Power2'
            });

            // Add particle effect
            gameScene.cardParticles.setPosition(container.x, container.y);
            gameScene.cardParticles.start();
        }
    });

    container.on('pointerout', () => {
        if (isFront) {
            gameScene.tweens.add({
                targets: container,
                scaleX: CARD_CONFIG.scale,
                scaleY: CARD_CONFIG.scale,
                y: y,
                duration: 200,
                ease: 'Power2'
            });
            gameScene.cardParticles.stop();
        }
    });

    return container;
}

function dealCard() {
    if (deck.length === 0) {
        dealTimer.remove();
        return;
    }

    const card = deck.pop();
    playDeck.push(card);

    // Create new card sprite for play area
    const playX = 220;
    const playY = 95;
    const newSprite = createCardSprite(card, playX + 400, playY, true);

    // Animate card dealing
    AUDIO_CONFIG.cardFlip.play();

    gameScene.tweens.add({
        targets: newSprite,
        x: playX,
        rotation: newSprite.rotation + (Math.random() - 0.5) * 0.2,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
            AUDIO_CONFIG.cardPlace.play();

            // Add screen shake effect
            gameScene.cameras.main.shake(100, 0.01);
        }
    });

    cardSprites.push(newSprite);
}

function updateCardAnimation(sprite, delta) {
    // Add subtle floating animation for dealt cards
    if (sprite.isFront) {
        sprite.y += Math.sin(gameScene.time.now * 0.001 + sprite.x * 0.01) * 0.1;
    }
}

// Initialize the game
const game = new Phaser.Game(config);