import Phaser from 'phaser';
import type { Attribute } from '@/data/schemas';

/**
 * BakuganObject — an Arcade physics sprite representing one Bakugan on the arena.
 *
 * Modes:
 *   ball   — small circle texture, rolls on the field
 *   stand  — larger circle with glow, stationary on a Gate Card
 *
 * Movement duration is governed by the Bakugan's Steering stat:
 * each tick decrements a timer; when it expires the Bakugan auto-stops.
 *
 * FASE 7: Added throw arc animation, stand glow+scale, rolling bob,
 * and critical KO explosion effects.
 */

const STEERING_TICK_MS = 800; // ms per steering point

export interface BakuganInit {
  id: string;
  name: string;
  attribute: Attribute;
  stats: {
    speed: number;
    defense: number;
    control: number;
    steering: number;
    magnet: number;
  };
  gPower: number;
  playerId: number;
}

export class BakuganObject extends Phaser.Physics.Arcade.Sprite {
  readonly bakuganId: string;
  readonly bakuganName: string;
  readonly attribute: Attribute;
  readonly stats: BakuganInit['stats'];
  readonly gPower: number;
  readonly playerId: number;

  isStanding = false;
  isOnField = false;
  currentGateCardSlotIndex: number | null = null;

  private steeringTimeLeft = 0; // ms remaining
  private steeringDuration = 0; // total ms for this throw

  constructor(scene: Phaser.Scene, x: number, y: number, init: BakuganInit) {
    super(scene, x, y, `bakugan-${init.attribute}`);

    this.bakuganId = init.id;
    this.bakuganName = init.name;
    this.attribute = init.attribute;
    this.stats = init.stats;
    this.gPower = init.gPower;
    this.playerId = init.playerId;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(14);
    this.setBounce(0.5);
    this.setDrag(100);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.setOrigin(0.5, 0.5);

    // Make ball spin slightly while moving
    this.setAngularVelocity(120);
  }

  /* ------------------------------------------------------------------ */
  /*  Throw                                                              */
  /* ------------------------------------------------------------------ */

  /**
   * Launch the Bakugan toward (targetX, targetY) with the given force.
   * Speed stat multiplies the base velocity.
   * FASE 7: Adds arc trajectory tween + rolling bob animation.
   */
  throw(targetX: number, targetY: number, force: number): void {
    this.isOnField = true;
    this.isStanding = false;
    this.setTexture(`bakugan-${this.attribute}`);

    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const speedMultiplier = 1 + this.stats.speed * 0.25; // speed 0→×1, 4→×2
    const baseVelocity = 350 + force * 400; // force 0..1 mapped to 350..750
    const velocity = baseVelocity * speedMultiplier;

    this.setVelocity(
      Math.cos(angle) * velocity,
      Math.sin(angle) * velocity,
    );

    // Steering duration: base 2s + 0.8s per steering point
    this.steeringDuration = 2000 + this.stats.steering * 800;
    this.steeringTimeLeft = this.steeringDuration;

    // FASE 7: Arc trajectory tween — yoyo scale for "flying arc" feel
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 0.7 },
      scaleY: { from: 1, to: 0.7 },
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    // FASE 7: Rolling bob animation — subtle vertical oscillation
    this.scene.tweens.add({
      targets: this,
      angle: { from: 0, to: 360 },
      duration: 600,
      repeat: -1,
      ease: 'Linear',
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Movement (during steering phase)                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Move the Bakugan in the given direction.
   * `control` stat determines max speed of turning (higher = faster response).
   */
  move(direction: { x: number; y: number }, delta: number): void {
    if (this.isStanding || !this.isOnField) return;

    const speed = 200;
    const controlFactor = 1 + this.stats.control * 0.3;

    this.setVelocity(
      direction.x * speed * controlFactor,
      direction.y * speed * controlFactor,
    );

    // Spin while moving
    this.setAngularVelocity(direction.x !== 0 || direction.y !== 0 ? 200 : 0);
  }

  /** Decrement steering timer. Call every frame during field_movement. */
  tickSteering(delta: number): boolean {
    if (this.isStanding) return false;
    this.steeringTimeLeft -= delta;
    return this.steeringTimeLeft <= 0;
  }

  /** Normalised 0..1 of steering time remaining */
  getSteeringFraction(): number {
    if (this.steeringDuration <= 0) return 0;
    return Phaser.Math.Clamp(this.steeringTimeLeft / this.steeringDuration, 0, 1);
  }

  stopMoving(): void {
    this.setVelocity(0, 0);
    this.setAngularVelocity(0);
    // Kill all tweens (including throw bob) when stopping
    this.scene.tweens.killTweensOf(this);
    this.setScale(1);
    this.setAngle(0);
  }

  /* ------------------------------------------------------------------ */
  /*  Stand / Unstand                                                    */
  /* ------------------------------------------------------------------ */

  /**
   * Stand the Bakugan on a Gate Card.
   * FASE 7: Enhanced with scale-up + glow pulse + rotation entrance.
   */
  standOn(_gateCardSlotIndex: number): void {
    this.isStanding = true;
    this.currentGateCardSlotIndex = _gateCardSlotIndex;
    this.stopMoving();
    this.setTexture(`bakugan-${this.attribute}-stand`);
    this.setDepth(15);

    // FASE 7: Stand entrance animation — scale up from 0.5 with glow pulse
    this.setScale(0.5);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // After entrance, start glow pulse loop
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });

    // FASE 7: Subtle rotation wobble on stand
    this.scene.tweens.add({
      targets: this,
      angle: { from: -5, to: 5 },
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });

    // FASE 7: Glow ring effect
    const glowRing = this.scene.add.circle(this.x, this.y, 20, 0xffffff, 0.3);
    glowRing.setDepth(14);
    this.scene.tweens.add({
      targets: glowRing,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => glowRing.destroy(),
    });
  }

  unstand(): void {
    this.isStanding = false;
    this.currentGateCardSlotIndex = null;
    this.setTexture(`bakugan-${this.attribute}`);
    this.setDepth(10);
    this.scene.tweens.killTweensOf(this);
    this.setScale(1);
    this.setAngle(0);
  }

  /* ------------------------------------------------------------------ */
  /*  Critical KO                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * Knock the Bakugan off its Gate Card.
   * Returns true if the KO was successful (i.e. defence was overcome).
   * FASE 7: Added explosion particles + screen shake via event.
   */
  knockback(direction: { x: number; y: number }, force: number): boolean {
    // Check defense threshold: force must exceed defense-based threshold
    const defenseThreshold = 200 + this.stats.defense * 80;
    if (force < defenseThreshold) return false;

    this.unstand();
    this.isOnField = true;
    this.setVelocity(direction.x * force, direction.y * force);
    this.setDrag(200);

    // FASE 7: KO explosion particles — small circles that scatter outward
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 15 + Math.random() * 20;
      const particle = this.scene.add.circle(this.x, this.y, 3, 0xff4444, 0.8);
      particle.setDepth(50);
      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    // FASE 7: Knockback spin
    this.scene.tweens.add({
      targets: this,
      angle: 720,
      duration: 600,
      ease: 'Power2',
    });

    return true;
  }

  /* ------------------------------------------------------------------ */
  /*  Visibility helpers                                                 */
  /* ------------------------------------------------------------------ */

  showAsBall(): void {
    this.setTexture(`bakugan-${this.attribute}`);
    this.setDisplaySize(28, 28);
  }

  showAsStanding(): void {
    this.setTexture(`bakugan-${this.attribute}-stand`);
  }
}
