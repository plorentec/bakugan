/**
 * Normalizer — Stage 3 of the data pipeline.
 * Cleans, standardizes, and fills defaults for raw data.
 *
 * TODO: Full implementation will handle:
 * - Name cleaning and standardization
 * - Attribute name normalization
 * - Default value filling
 * - Data type coercion
 * - Conflict detection
 */

import { SourceRecord } from './source';
import { RawRecord } from './raw';

export interface NormalizedRecord<T> {
  /** Source metadata */
  source: SourceRecord;
  /** Normalized data */
  data: T;
  /** ISO 8601 timestamp when normalization occurred */
  normalized_at: string;
  /** Notes about what normalization steps were applied */
  normalization_notes: string[];
}

/**
 * Normalizer interface — each entity type implements its own normalizer.
 */
export interface Normalizer<TInput, TOutput> {
  normalize(raw: RawRecord<TInput>): NormalizedRecord<TOutput>;
}

/**
 * Normalize a Bakugan record from raw data.
 *
 * TODO: Full implementation:
 * - Standardize attribute names (e.g. "Fire" → "pyrus")
 * - Fill default stats if missing
 * - Compute max_g_power from base_g_power + 250
 * - Assign UUID if missing
 */
export function normalizeBakugan(
  raw: RawRecord<unknown>
): NormalizedRecord<unknown> {
  const notes: string[] = ['Bakugan normalization — skeleton only'];
  // TODO: Implement full normalization
  return {
    source: raw.source,
    data: raw.data,
    normalized_at: new Date().toISOString(),
    normalization_notes: notes,
  };
}

/**
 * Normalize a Gate Card record from raw data.
 *
 * TODO: Full implementation:
 * - Standardize tier names
 * - Normalize attribute bonus keys
 * - Assign UUID if missing
 */
export function normalizeGateCard(
  raw: RawRecord<unknown>
): NormalizedRecord<unknown> {
  const notes: string[] = ['Gate Card normalization — skeleton only'];
  // TODO: Implement full normalization
  return {
    source: raw.source,
    data: raw.data,
    normalized_at: new Date().toISOString(),
    normalization_notes: notes,
  };
}

/**
 * Normalize an Ability Card record from raw data.
 *
 * TODO: Full implementation:
 * - Standardize color names
 * - Parse effect descriptions into structured EffectDefinition
 * - Assign UUID if missing
 */
export function normalizeAbilityCard(
  raw: RawRecord<unknown>
): NormalizedRecord<unknown> {
  const notes: string[] = ['Ability Card normalization — skeleton only'];
  // TODO: Implement full normalization
  return {
    source: raw.source,
    data: raw.data,
    normalized_at: new Date().toISOString(),
    normalization_notes: notes,
  };
}
