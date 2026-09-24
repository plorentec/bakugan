// Barrel export for all Zod schemas and inferred types

export { AttributeSchema, AttributesArraySchema } from './attribute';
export type { Attribute, AttributesArray } from './attribute';

export {
  SourceMetadataSchema,
  ConflictRecordSchema,
  AssetLicenseStatusSchema,
} from './source-metadata';
export type {
  SourceMetadata,
  ConflictRecord,
  AssetLicenseStatus,
} from './source-metadata';

export { BakuganSchema, BakuganStatsSchema } from './bakugan';
export type { Bakugan, BakuganStats } from './bakugan';

export {
  GateCardSchema,
  GateCardTierSchema,
  GateCardBattleTypeSchema,
  GateCardBonusesSchema,
  GateCardEffectSchema,
} from './gate-card';
export type {
  GateCard,
  GateCardTier,
  GateCardBattleType,
  GateCardBonuses,
  GateCardEffect,
} from './gate-card';

export { AbilityCardSchema, AbilityCardColorSchema } from './ability-card';
export type { AbilityCard, AbilityCardColor } from './ability-card';

export { DeckSchema, validateDeck } from './deck';
export type { Deck } from './deck';

export {
  ArenaSchema,
  ArenaHazardSchema,
  ArenaHazardTypeSchema,
  ArenaSpawnPointSchema,
  ArenaSpawnPointTypeSchema,
  PowerUpTypeSchema,
} from './arena';
export type {
  Arena,
  ArenaHazard,
  ArenaHazardType,
  ArenaSpawnPoint,
  ArenaSpawnPointType,
  PowerUpType,
} from './arena';

export {
  EffectDefinitionSchema,
  EffectTypeSchema,
  EffectTargetSchema,
  EffectConditionSchema,
  EffectTimingSchema,
} from './effects';
export type {
  EffectDefinition,
  EffectType,
  EffectTarget,
  EffectCondition,
  EffectTiming,
} from './effects';
