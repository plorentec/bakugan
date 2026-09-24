import Phaser from 'phaser';
import { eventBus } from '../events/EventBus';
import { BakuganObject, type BakuganInit } from '../objects/BakuganObject';
import { GateCardObject } from '../objects/GateCardObject';
import type { Attribute } from '@/data/schemas';
import type { GateCard } from '@/data/schemas';
import bakuganData from '@/data/raw/bakugan.json';
import gateCardData from '@/data/raw/gate-cards.json';
import { AttributeSchema, GateCardSchema } from '@/data/schemas';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type ArenaState =
  | 'waiting_for_throw'
  | 'throw_in_progress'
  | 'field_movement'
  | 'standing'
  | 'battle_triggered';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const FIELD_X = 62;
const FIELD_Y = 34;
const FIELD_W = 900;
const FIELD_H = 700;
const PLAYER_SPAWN_X = 512;
const PLAYER_SPAWN_Y = 710;
const OPPONENT_SPAWN_X = 512;
const OPPONENT_SPAWN_Y = 58;

/** Gate card slot positions (3 cols x 2 rows, centred in field) */
const GATE_CARD_SLOTS: { x: number; y: number }[] = [
  { x: FIELD_X + FIELD_W * 0.25, y: FIELD_Y + FIELD_H * 0.30 },
  { x: FIELD_X + FIELD_W * 0.50, y: FIELD_Y + FIELD_H * 0.30 },
  { x: FIELD_X + FIELD_W * 0.75, y: FIELD_Y + FIELD_H * 0.30 },
  { x: FIELD_X + FIELD_W * 0.25, y: FIELD_Y + FIELD_H * 0.65 },
  { x: FIELD_X + FIELD_W * 0.50, y: FIELD_Y + FIELD_H * 0.65 },
  { x: FIELD_X + FIELD_W * 0.75, y: FIELD_Y + FIELD_H * 0.65 },
];

/* ------------------------------------------------------------------ */
/*  Scene                                                               */
/* ------------------------------------------------------------------ */

export class ArenaScene extends Phaser.Scene {
  private state: ArenaState = 'waiting_for_throw';

  // --- Game objects ---
  private playerBakugan: BakuganObject | null = null;
  private opponentBakugan: BakuganObject | null = null;
  private gateCards: GateCardObject[] = [];

  // --- Input ---
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private pointerDown = false;
  private dragStartX = 0;
  private dragStartY = 0;

  // --- Trajectory graphics ---
  private trajectoryGfx: Phaser.GameObjects.Graphics | null = null;

  // --- Throwing Bakugan pool indices ---
  private playerBakuganIndex = 0;
  private opponentBakuganIndex = 0;

  // --- Player Bakugan data for this battle (3 bakugan from deck) ---
  private playerBakuganInits: BakuganInit[] = [];
  private opponentBakuganInits: BakuganInit[] = [];

  constructor() {
    super({ key: 'ArenaScene' });
  }

  /* ================================================================== */
  /*  Lifecycle                                                          */
  /* ================================================================== */

  create(): void {
    this.state = 'waiting_for_throw';
    this.playerBakuganIndex = 0;
    this.opponentBakuganIndex = 0;

    this.drawArena();
    this.setupInput();
    this.prepareDecks();
    this.placeGateCards();
    this.spawnPlayerBakugan();
    this.spawnOpponentBakugan();

    // Listen for React → Phaser events
    eventBus.on('GATE_CARD_PLACED', this.onExternalGateCardPlaced);
  }

  update(_time: number, delta: number): void {
    switch (this.state) {
      case 'field_movement':
        this.handleFieldMovement(delta);
        break;
      case 'throw_in_progress':
        // Physics handles movement; we just wait for overlap or stop
        this.checkThrowLanding();
        break;
      default:
        break;
    }
  }

  /* ================================================================== */
  /*  Arena drawing                                                       */
  /* ================================================================== */

  private drawArena(): void {
    const gfx = this.add.graphics();

    // Outer border
    gfx.fillStyle(0x0f2b0f, 1);
    gfx.fillRect(0, 0, 1024, 768);

    // Field area (slightly lighter green)
    gfx.fillStyle(0x1a4a1a, 1);
    gfx.fillRoundedRect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H, 12);

    // Subtle grid lines
    gfx.lineStyle(1, 0x225522, 0.3);
    for (let x = FIELD_X; x <= FIELD_X + FIELD_W; x += 60) {
      gfx.lineBetween(x, FIELD_Y, x, FIELD_Y + FIELD_H);
    }
    for (let y = FIELD_Y; y <= FIELD_Y + FIELD_H; y += 60) {
      gfx.lineBetween(FIELD_X, y, FIELD_X + FIELD_W, y);
    }

    // Field border
    gfx.lineStyle(2, 0x3a7a3a, 0.6);
    gfx.strokeRoundedRect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H, 12);

    gfx.setDepth(0);

    // Throw zone indicator at bottom
    const throwZone = this.add.graphics();
    throwZone.fillStyle(0x2a5a2a, 0.4);
    throwZone.fillRoundedRect(FIELD_X + 100, FIELD_Y + FIELD_H - 70, FIELD_W - 200, 55, 8);
    throwZone.lineStyle(1, 0x4a8a4a, 0.5);
    throwZone.strokeRoundedRect(FIELD_X + 100, FIELD_Y + FIELD_H - 70, FIELD_W - 200, 55, 8);
    throwZone.setDepth(1);

    // "THROW ZONE" label
    this.add
      .text(FIELD_X + FIELD_W / 2, FIELD_Y + FIELD_H - 43, 'THROW ZONE', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#4a8a4a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(2);

    // Gate card slot outlines
    for (let i = 0; i < GATE_CARD_SLOTS.length; i++) {
      const slot = GATE_CARD_SLOTS[i];
      const slotGfx = this.add.graphics();
      slotGfx.lineStyle(1, 0x5a9a5a, 0.3);
      slotGfx.strokeRoundedRect(slot.x - 55, slot.y - 37, 110, 75, 4);
      slotGfx.setDepth(1);
    }
  }

  /* ================================================================== */
  /*  Input                                                               */
  /* ================================================================== */

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey('W'),
      A: this.input.keyboard!.addKey('A'),
      S: this.input.keyboard!.addKey('S'),
      D: this.input.keyboard!.addKey('D'),
    };

    this.trajectoryGfx = this.add.graphics();
    this.trajectoryGfx.setDepth(20);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.state !== 'waiting_for_throw') return;
      if (!this.playerBakugan) return;

      // Only start drag if pointer is near the Bakugan
      const dist = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.playerBakugan.x,
        this.playerBakugan.y,
      );
      if (dist > 40) return;

      this.pointerDown = true;
      this.dragStartX = this.playerBakugan.x;
      this.dragStartY = this.playerBakugan.y;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.pointerDown || this.state !== 'waiting_for_throw') return;
      this.drawTrajectory(pointer.x, pointer.y);
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.pointerDown || this.state !== 'waiting_for_throw') return;
      this.pointerDown = false;
      this.executeThrow(pointer.x, pointer.y);
    });
  }

  /* ================================================================== */
  /*  Deck preparation                                                    */
  /* ================================================================== */

  private prepareDecks(): void {
    // Player Bakugan: use all 6 as pool (simplified for MVP demo)
    this.playerBakuganInits = bakuganData.map((b) => ({
      id: b.id,
      name: b.name,
      attribute: b.attributes[0] as Attribute,
      stats: b.stats,
      gPower: b.base_g_power,
      playerId: 0,
    }));

    // Opponent: reverse order as simple AI
    this.opponentBakuganInits = [...bakuganData].reverse().map((b) => ({
      id: `opponent-${b.id}`,
      name: b.name,
      attribute: b.attributes[0] as Attribute,
      stats: b.stats,
      gPower: b.base_g_power,
      playerId: 1,
    }));
  }

  /* ================================================================== */
  /*  Gate Card placement                                                 */
  /* ================================================================== */

  private placeGateCards(): void {
    // Place all 6 gate cards (2 of each tier for demo)
    const pool = [...gateCardData];
    const selected: GateCard[] = [];

    // Pick 2 gold, 2 silver, 2 copper
    for (const tier of ['gold', 'silver', 'copper'] as const) {
      const tierCards = pool.filter((c) => c.tier === tier);
      // Validate through Zod schema to narrow types
      const parsed = GateCardSchema.parse(tierCards[0]);
      selected.push(parsed);
      const parsed2 = GateCardSchema.parse(tierCards[1]);
      selected.push(parsed2);
    }

    for (let i = 0; i < selected.length && i < GATE_CARD_SLOTS.length; i++) {
      const slot = GATE_CARD_SLOTS[i];
      const cardObj = new GateCardObject(
        this,
        slot.x,
        slot.y,
        selected[i],
        i,
        0,
      );
      this.gateCards.push(cardObj);
    }
  }

  /* ================================================================== */
  /*  Bakugan spawning                                                    */
  /* ================================================================== */

  private spawnPlayerBakugan(): void {
    if (this.playerBakuganIndex >= this.playerBakuganInits.length) return;
    const init = this.playerBakuganInits[this.playerBakuganIndex];
    this.playerBakugan = new BakuganObject(this, PLAYER_SPAWN_X, PLAYER_SPAWN_Y, init);
    this.playerBakugan.showAsBall();

    // Setup overlap with all gate card stand zones
    for (const gc of this.gateCards) {
      this.physics.add.overlap(
        this.playerBakugan,
        gc.getStandZoneGameObject(),
        () => this.handleStandOverlap(this.playerBakugan!, gc),
      );
    }
  }

  private spawnOpponentBakugan(): void {
    if (this.opponentBakuganIndex >= this.opponentBakuganInits.length) return;
    const init = this.opponentBakuganInits[this.opponentBakuganIndex];
    this.opponentBakugan = new BakuganObject(this, OPPONENT_SPAWN_X, OPPONENT_SPAWN_Y, init);
    this.opponentBakugan.showAsBall();

    // Setup overlap with all gate card stand zones
    for (const gc of this.gateCards) {
      this.physics.add.overlap(
        this.opponentBakugan,
        gc.getStandZoneGameObject(),
        () => this.handleStandOverlap(this.opponentBakugan!, gc),
      );
    }
  }

  /* ================================================================== */
  /*  Throw mechanic                                                      */
  /* ================================================================== */

  private drawTrajectory(targetX: number, targetY: number): void {
    if (!this.trajectoryGfx || !this.playerBakugan) return;
    this.trajectoryGfx.clear();

    const startX = this.playerBakugan.x;
    const startY = this.playerBakugan.y;
    const dx = startX - targetX;
    const dy = startY - targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) return;

    const angle = Math.atan2(dy, dx);
    const dotCount = Math.min(Math.floor(dist / 30), 12);

    for (let i = 1; i <= dotCount; i++) {
      const t = i / dotCount;
      const px = startX + Math.cos(angle) * dist * t;
      const py = startY + Math.sin(angle) * dist * t;
      const alpha = 0.7 - t * 0.5;
      this.trajectoryGfx.fillStyle(0xffffff, alpha);
      this.trajectoryGfx.fillCircle(px, py, 2 + (1 - t) * 2);
    }
  }

  private executeThrow(targetX: number, targetY: number): void {
    if (!this.playerBakugan) return;

    this.trajectoryGfx?.clear();
    this.pointerDown = false;

    // Calculate force from drag distance
    const dx = targetX - this.dragStartX;
    const dy = targetY - this.dragStartY;
    const dragDist = Math.sqrt(dx * dx + dy * dy);
    const force = Phaser.Math.Clamp(dragDist / 300, 0.1, 1.0);

    this.playerBakugan.throw(targetX, targetY, force);
    this.state = 'throw_in_progress';

    eventBus.emit('BAKUGAN_THROWN', {
      bakuganId: this.playerBakugan.bakuganId,
      targetX,
      targetY,
      force,
      playerId: 0,
    });
  }

  /* ================================================================== */
  /*  Throw landing                                                       */
  /* ================================================================== */

  private checkThrowLanding(): void {
    if (!this.playerBakugan) return;

    const bak = this.playerBakugan;
    const speed = Math.sqrt(bak.body!.velocity.x ** 2 + bak.body!.velocity.y ** 2);

    // Ball has slowed down enough → transition to field movement
    if (speed < 20) {
      bak.stopMoving();
      this.state = 'field_movement';

      eventBus.emit('THROW_LANDED', {
        bakuganId: bak.bakuganId,
        playerId: 0,
      });
    }
  }

  /* ================================================================== */
  /*  Field movement (WASD / arrows)                                      */
  /* ================================================================== */

  private handleFieldMovement(delta: number): void {
    if (!this.playerBakugan) return;

    const dir = { x: 0, y: 0 };

    if (this.cursors.left.isDown || this.wasd.A.isDown) dir.x = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dir.x = 1;

    if (this.cursors.up.isDown || this.wasd.W.isDown) dir.y = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dir.y = 1;

    // Normalise diagonal
    if (dir.x !== 0 && dir.y !== 0) {
      const inv = 1 / Math.SQRT2;
      dir.x *= inv;
      dir.y *= inv;
    }

    this.playerBakugan.move(dir, delta);

    // Emit position for HUD tracking
    eventBus.emit('BAKUGAN_MOVED', {
      bakuganId: this.playerBakugan.bakuganId,
      x: this.playerBakugan.x,
      y: this.playerBakugan.y,
      playerId: 0,
    });

    // Tick steering
    if (this.playerBakugan.tickSteering(delta)) {
      this.playerBakugan.stopMoving();
      this.state = 'standing';

      eventBus.emit('STEERING_EXPIRED', {
        bakuganId: this.playerBakugan.bakuganId,
        playerId: 0,
      });

      // AI opponent throws after player's turn ends
      this.time.delayedCall(1000, () => this.aiOpponentTurn());
    }
  }

  /* ================================================================== */
  /*  Stand detection                                                     */
  /* ================================================================== */

  private handleStandOverlap(bakugan: BakuganObject, gateCard: GateCardObject): void {
    if (bakugan.isStanding) return;
    if (!bakugan.isOnField) return;

    // Magnet check: probability based on magnet stat
    const magnetChance = 0.3 + bakugan.stats.magnet * 0.15; // 30% at 0 magnet, 90% at 4
    if (Math.random() > magnetChance && this.state === 'field_movement') return;

    // Place the Bakugan at the gate card center
    bakugan.x = gateCard.x;
    bakugan.y = gateCard.y;
    bakugan.standOn(gateCard.slotIndex);
    gateCard.addOccupant(bakugan.bakuganId);

    eventBus.emit('BAKUGAN_STANDING', {
      bakuganId: bakugan.bakuganId,
      gateCardId: gateCard.gateCard.id,
      playerId: bakugan.playerId,
    });

    gateCard.showBonus(bakugan.attribute);
    gateCard.highlight();

    if (bakugan.playerId === 0) {
      this.state = 'standing';

      // Check for double stand or battle
      this.time.delayedCall(600, () => this.checkStandOutcome(bakugan, gateCard));
    } else {
      // Opponent stood — check if player is also on this card
      this.time.delayedCall(400, () => this.checkStandOutcome(bakugan, gateCard));
    }
  }

  /* ================================================================== */
  /*  Stand outcome resolution                                            */
  /* ================================================================== */

  private checkStandOutcome(bakugan: BakuganObject, gateCard: GateCardObject): void {
    const occupants = gateCard.occupantBakuganIds;

    if (occupants.length >= 2) {
      // Check for double stand (2 from same player)
      const player0Count = occupants.filter((id) => {
        if (id === this.playerBakugan?.bakuganId) return true;
        if (id === this.opponentBakugan?.bakuganId) return false;
        return false;
      }).length;

      const player1Count = occupants.length - player0Count;

      if (player0Count >= 2 || player1Count >= 2) {
        // Double stand — auto-win
        this.handleDoubleStand(gateCard, player0Count >= 2 ? 0 : 1);
        return;
      }

      // Battle triggered (one from each player)
      if (player0Count === 1 && player1Count === 1) {
        this.handleBattleTriggered(gateCard);
        return;
      }
    }

    // Single occupant — waiting for more
    if (bakugan.playerId === 0 && this.state === 'standing') {
      // Ready for next throw
      this.time.delayedCall(800, () => this.prepareNextThrow());
    }
  }

  /* ================================================================== */
  /*  Double Stand                                                         */
  /* ================================================================== */

  private handleDoubleStand(gateCard: GateCardObject, winnerPlayerId: number): void {
    eventBus.emit('DOUBLE_STAND', {
      gateCardId: gateCard.gateCard.id,
      bakuganIds: [...gateCard.occupantBakuganIds],
      playerId: winnerPlayerId,
    });

    // Visual celebration
    gateCard.pulse();

    // Both Bakugan glow
    for (const id of gateCard.occupantBakuganIds) {
      const bak = id === this.playerBakugan?.bakuganId
        ? this.playerBakugan
        : id === this.opponentBakugan?.bakuganId
          ? this.opponentBakugan
          : null;
      if (bak) {
        this.tweens.add({
          targets: bak,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 500,
          yoyo: true,
          repeat: 2,
        });
      }
    }

    // Show result text
    const winnerLabel = winnerPlayerId === 0 ? 'YOU' : 'OPPONENT';
    this.showFloatingText(gateCard.x, gateCard.y - 50, `${winnerLabel} DOUBLE STAND!`, '#ffd700');

    // After animation, advance to next turn
    this.time.delayedCall(1500, () => {
      this.removeBothBakuganFromField();
      this.prepareNextThrow();
    });
  }

  /* ================================================================== */
  /*  Battle Triggered                                                    */
  /* ================================================================== */

  private handleBattleTriggered(gateCard: GateCardObject): void {
    this.state = 'battle_triggered';

    const playerBakId = this.playerBakugan?.bakuganId ?? '';
    const opponentBakId = this.opponentBakugan?.bakuganId ?? '';

    eventBus.emit('BATTLE_TRIGGERED', {
      gateCardId: gateCard.gateCard.id,
      player1BakuganId: playerBakId,
      player2BakuganId: opponentBakId,
    });

    eventBus.emit('BATTLE_PHASE_CHANGED', { phase: 'BATTLE_TRIGGERED' });

    // Show battle indicator
    this.showFloatingText(gateCard.x, gateCard.y - 50, 'BATTLE!', '#ff4444');
    gateCard.pulse();

    // Flash the field
    const flash = this.add.rectangle(512, 384, 1024, 768, 0xffffff, 0.3);
    flash.setDepth(100);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy(),
    });

    // Auto-resolve battle after visual (simplified MVP: higher G-Power wins)
    this.time.delayedCall(2000, () => this.resolveBattle(gateCard));
  }

  private resolveBattle(gateCard: GateCardObject): void {
    const playerGP = this.playerBakugan?.gPower ?? 0;
    const opponentGP = this.opponentBakugan?.gPower ?? 0;

    // Simplified: higher G-Power wins (minigame not yet implemented)
    const playerWins = playerGP >= opponentGP;
    const winnerId = playerWins ? this.playerBakugan!.bakuganId : this.opponentBakugan!.bakuganId;

    this.showFloatingText(
      gateCard.x,
      gateCard.y - 50,
      playerWins ? 'YOU WIN!' : 'OPPONENT WINS!',
      playerWins ? '#00ff88' : '#ff4444',
    );

    eventBus.emit('BATTLE_PHASE_CHANGED', { phase: 'RESOLUTION' });

    this.time.delayedCall(1500, () => {
      // Remove loser's Bakugan from card
      const loserId = playerWins ? this.opponentBakugan?.bakuganId : this.playerBakugan?.bakuganId;
      if (loserId) {
        gateCard.removeOccupant(loserId);
        const loser = playerWins ? this.opponentBakugan : this.playerBakugan;
        if (loser) {
          loser.unstand();
          loser.isOnField = false;
          loser.setVisible(false);
          loser.setActive(false);
        }
      }

      this.removeBothBakuganFromField();
      this.prepareNextThrow();
    });
  }

  /* ================================================================== */
  /*  Critical KO                                                         */
  /* ================================================================== */

  /**
   * Called when a moving Bakugan collides with a standing one.
   * Higher attack force vs defense stat determines outcome.
   */
  checkCriticalKO(attacker: BakuganObject, defender: BakuganObject): void {
    if (!defender.isStanding) return;

    const attackForce = Math.sqrt(
      attacker.body!.velocity.x ** 2 + attacker.body!.velocity.y ** 2,
    );

    const success = defender.knockback(
      {
        x: attacker.body!.velocity.x,
        y: attacker.body!.velocity.y,
      },
      attackForce,
    );

    if (success) {
      // Find the gate card the defender was on
      if (defender.currentGateCardSlotIndex !== null) {
        const gc = this.gateCards[defender.currentGateCardSlotIndex];
        if (gc) {
          gc.removeOccupant(defender.bakuganId);
        }
      }

      eventBus.emit('CRITICAL_KO', {
        attackerId: attacker.bakuganId,
        defenderId: defender.bakuganId,
        gateCardId: '',
        attackerPlayerId: attacker.playerId,
      });

      this.showFloatingText(defender.x, defender.y - 30, 'CRITICAL KO!', '#ff0000');

      // Flash effect
      const flash = this.add.circle(defender.x, defender.y, 40, 0xff4444, 0.5);
      flash.setDepth(50);
      this.tweens.add({
        targets: flash,
        scale: 2,
        alpha: 0,
        duration: 500,
        onComplete: () => flash.destroy(),
      });
    }
  }

  /* ================================================================== */
  /*  AI Opponent Turn                                                     */
  /* ================================================================== */

  private aiOpponentTurn(): void {
    if (this.state !== 'waiting_for_throw' && this.state !== 'standing') return;

    // Simple AI: throw at a random gate card
    if (!this.opponentBakugan || this.opponentBakuganIndex >= this.opponentBakuganInits.length) return;

    const targetSlot = Phaser.Math.Between(0, GATE_CARD_SLOTS.length - 1);
    const target = GATE_CARD_SLOTS[targetSlot];

    // Spawn at top
    this.opponentBakugan.setPosition(OPPONENT_SPAWN_X, OPPONENT_SPAWN_Y);
    this.opponentBakugan.setVisible(true);
    this.opponentBakugan.setActive(true);

    const force = 0.5 + Math.random() * 0.4;
    this.opponentBakugan.throw(target.x, target.y, force);

    eventBus.emit('BAKUGAN_THROWN', {
      bakuganId: this.opponentBakugan.bakuganId,
      targetX: target.x,
      targetY: target.y,
      force,
      playerId: 1,
    });

    // After a delay, check if opponent stopped (simplified AI: just place on card)
    this.time.delayedCall(1200, () => {
      if (this.opponentBakugan && this.opponentBakugan.isOnField && !this.opponentBakugan.isStanding) {
        // AI snaps to nearest gate card (simplified)
        const nearest = this.findNearestGateCard(
          this.opponentBakugan.x,
          this.opponentBakugan.y,
        );
        if (nearest && !nearest.isOccupied()) {
          this.opponentBakugan.x = nearest.x;
          this.opponentBakugan.y = nearest.y;
          this.opponentBakugan.standOn(nearest.slotIndex);
          nearest.addOccupant(this.opponentBakugan.bakuganId);
          nearest.showBonus(this.opponentBakugan.attribute);
          nearest.highlight();

          eventBus.emit('BAKUGAN_STANDING', {
            bakuganId: this.opponentBakugan.bakuganId,
            gateCardId: nearest.gateCard.id,
            playerId: 1,
          });
        } else {
          this.opponentBakugan.stopMoving();
        }
      }
    });
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  private findNearestGateCard(x: number, y: number): GateCardObject | null {
    let nearest: GateCardObject | null = null;
    let minDist = Infinity;
    for (const gc of this.gateCards) {
      const d = Phaser.Math.Distance.Between(x, y, gc.x, gc.y);
      if (d < minDist) {
        minDist = d;
        nearest = gc;
      }
    }
    return minDist < 80 ? nearest : null;
  }

  private prepareNextThrow(): void {
    this.playerBakuganIndex++;
    this.opponentBakuganIndex++;

    if (this.playerBakuganIndex < this.playerBakuganInits.length) {
      this.spawnPlayerBakugan();
      this.state = 'waiting_for_throw';

      // AI throws after a delay
      this.time.delayedCall(800, () => this.aiOpponentTurn());
    } else {
      // All Bakugan used — show results
      this.showBattleResults();
    }
  }

  private removeBothBakuganFromField(): void {
    if (this.playerBakugan) {
      this.playerBakugan.unstand();
      this.playerBakugan.stopMoving();
      this.playerBakugan.isOnField = false;
      this.playerBakugan.setVisible(false);
      this.playerBakugan.setActive(false);
    }
    if (this.opponentBakugan) {
      this.opponentBakugan.unstand();
      this.opponentBakugan.stopMoving();
      this.opponentBakugan.isOnField = false;
      this.opponentBakugan.setVisible(false);
      this.opponentBakugan.setActive(false);
    }
  }

  private showBattleResults(): void {
    this.state = 'waiting_for_throw';
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);
    overlay.setDepth(90);

    this.add
      .text(512, 350, 'BATTLE COMPLETE', {
        fontSize: '36px',
        fontFamily: 'monospace',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(91);

    this.add
      .text(512, 410, 'Click to restart', {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setDepth(91);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  private showFloatingText(x: number, y: number, message: string, color: string): void {
    const txt = this.add.text(x, y, message, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    txt.setOrigin(0.5);
    txt.setDepth(80);

    this.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  /* ================================================================== */
  /*  External event handlers                                             */
  /* ================================================================== */

  private onExternalGateCardPlaced = (_data: {
    gateCardId: string;
    slotIndex: number;
    playerId: number;
  }): void => {
    // Reserved for React-initiated gate card placement
  };
}
