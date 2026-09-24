/**
 * Data Pipeline Orchestrator
 *
 * Stages: SOURCE → RAW → NORMALIZED → VALIDATED → DATABASE
 *
 * TODO: Full implementation will:
 * - Read raw JSON files from src/data/raw/
 * - Run through normalize → validate → database pipeline
 * - Report results (success count, error details)
 * - Support incremental imports (skip unchanged records)
 */

import { SourceRecord, createSourceRecord } from './source';
import { RawRecord, saveRawData } from './raw';
import { NormalizedRecord, normalizeBakugan, normalizeGateCard, normalizeAbilityCard } from './normalize';
import { validateDataset, ValidationResult } from './validate';

const GAMEFAQS_SOURCE: SourceRecord = {
  source: 'GameFAQs guide FAQ 81516',
  source_url:
    'https://gamefaqs.gamespot.com/ds/959716-bakugan-battle-brawlers/faqs/81516',
  raw_format: 'manual',
  fetched_at: '2026-09-24T00:00:00Z',
};

/**
 * Main pipeline entry point.
 * Validates the MVP dataset against Zod schemas.
 *
 * TODO: Full implementation:
 * - Load JSON files
 * - Create RawRecords with checksums
 * - Normalize each record
 * - Validate against schemas
 * - Store in IndexedDB
 * - Report results
 */
export async function runPipeline(): Promise<void> {
  console.log('[pipeline] Starting data pipeline...');
  console.log('[pipeline] Source:', GAMEFAQS_SOURCE.source);

  // TODO: Load and process Bakugan data
  console.log('[pipeline] Stage 1: SOURCE — configured');
  console.log('[pipeline] Stage 2: RAW — skeleton (TODO: load JSON files)');
  console.log('[pipeline] Stage 3: NORMALIZE — skeleton (TODO: normalize records)');
  console.log('[pipeline] Stage 4: VALIDATE — skeleton (TODO: validate records)');
  console.log('[pipeline] Stage 5: DATABASE — skeleton (TODO: store in IndexedDB)');

  console.log('[pipeline] Pipeline skeleton complete. TODO: implement full pipeline.');
}

// Run if executed directly
if (require.main === module) {
  runPipeline().catch(console.error);
}
