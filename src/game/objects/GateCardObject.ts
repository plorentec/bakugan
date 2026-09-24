import Phaser from 'phaser';
import type { GateCard } from '@/data/schemas';

/**
 * GateCardObject — a Container holding the card sprite, bonus text,
 * stand-zone sensor, and occupant tracking.
 *
 * Visual: rectangle textured by tier colour.
 * Stand zone: invisible Arcade physics circle at centre — when a
 * Bakugan overlaps it, a stand check is triggered.
 */

const CARD_W = 110;
const CARD_H = 75;
const STAND_ZONE_RADIUS = 22;

export class GateCardObject extends Phaser.GameObjects.Container {
  readonly gateCard: GateCard;
  readonly slotIndex: number;
  readonly playerId: number;

  /** Bakugan IDs currently standing on this card */
  occupantBakuganIds: string[] = [];

  private cardSprite: Phaser.GameObjects.Image;
  private nameLabel: Phaser.GameObjects.Text;
  private bonusLabel: Phaser.GameObjects.Text;
  private standZone: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    gateCard: GateCard,
    slotIndex: number,
    playerId: number,
  ) {
    super(scene, x, y);
    this.gateCard = gateCard;
    this.slotIndex = slotIndex;
    this.playerId = playerId;

    // Card image
    this.cardSprite = scene.add.image(0, 0, `gatecard-${gateCard.tier}`);
    this.cardSprite.setOrigin(0.5, 0.5);
    this.add(this.cardSprite);

    // Card name
    this.nameLabel = scene.add.text(0, -18, gateCard.name, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#000000',
      align: 'center',
      fontStyle: 'bold',
    });
    this.nameLabel.setOrigin(0.5, 0.5);
    this.add(this.nameLabel);

    // Highest bonus display
    const maxBonus = Math.max(
      gateCard.bonuses.pyrus,
      gateCard.bonuses.aquos,
      gateCard.bonuses.subterra,
      gateCard.bonuses.haos,
      gateCard.bonuses.darkus,
      gateCard.bonuses.ventus,
    );
    this.bonusLabel = scene.add.text(0, 10, `+${maxBonus} G`, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#333333',
      align: 'center',
    });
    this.bonusLabel.setOrigin(0.5, 0.5);
    this.add(this.bonusLabel);

    // Stand zone (invisible physics circle for overlap detection)
    this.standZone = scene.add.image(0, 0, 'stand-zone');
    this.standZone.setOrigin(0.5, 0.5);
    this.standZone.setAlpha(0.001); // nearly invisible but still rendered for physics
    this.add(this.standZone);

    // Setup physics for stand zone
    scene.physics.add.existing(this.standZone, true); // static body
    const body = this.standZone.body as Phaser.Physics.Arcade.StaticBody;
    body.setCircle(STAND_ZONE_RADIUS);

    scene.add.existing(this);
    this.setDepth(5);
  }

  /** Expose the stand-zone physics body for overlap checks */
  getStandZoneBody(): Phaser.Physics.Arcade.Body {
    return this.standZone.body as Phaser.Physics.Arcade.Body;
  }

  getStandZoneGameObject(): Phaser.GameObjects.Image {
    return this.standZone;
  }

  /* ------------------------------------------------------------------ */
  /*  Occupancy                                                          */
  /* ------------------------------------------------------------------ */

  addOccupant(bakuganId: string): void {
    if (!this.occupantBakuganIds.includes(bakuganId)) {
      this.occupantBakuganIds.push(bakuganId);
    }
  }

  removeOccupant(bakuganId: string): void {
    this.occupantBakuganIds = this.occupantBakuganIds.filter((id) => id !== bakuganId);
  }

  hasOccupant(bakuganId: string): boolean {
    return this.occupantBakuganIds.includes(bakuganId);
  }

  isOccupied(): boolean {
    return this.occupantBakuganIds.length > 0;
  }

  /* ------------------------------------------------------------------ */
  /*  Visual effects                                                     */
  /* ------------------------------------------------------------------ */

  highlight(): void {
    this.scene.tweens.add({
      targets: this.cardSprite,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 300,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  pulse(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
    });
  }

  /** Show the G-Power bonus text for a specific attribute */
  showBonus(attribute: string): void {
    const bonus = this.gateCard.bonuses[attribute as keyof typeof this.gateCard.bonuses];
    if (bonus !== undefined) {
      this.bonusLabel.setText(`+${bonus} G`);
      this.bonusLabel.setColor('#ffffff');
      this.scene.tweens.add({
        targets: this.bonusLabel,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    }
  }

  destroy(fromScene?: boolean): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.cardSprite);
    this.scene.tweens.killTweensOf(this.bonusLabel);
    super.destroy(fromScene);
  }
}
