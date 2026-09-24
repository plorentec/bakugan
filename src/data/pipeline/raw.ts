/**
 * Raw Data Preserver — Stage 2 of the data pipeline.
 * Preserves original raw content with SHA-256 checksums for audit trail.
 */

import { createHash } from 'crypto';
import { SourceRecord } from './source';

export interface RawRecord<T> {
  /** Source metadata */
  source: SourceRecord;
  /** Parsed data (type varies by entity) */
  data: T;
  /** Original content as a string, preserved verbatim */
  raw_content: string;
  /** SHA-256 checksum of raw_content for integrity verification */
  checksum: string;
}

/**
 * Computes SHA-256 checksum of a string.
 */
export function computeChecksum(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Creates a RawRecord with checksum computed from the raw content.
 */
export function saveRawData<T>(
  source: SourceRecord,
  data: T,
  rawContent: string
): RawRecord<T> {
  return {
    source,
    data,
    raw_content: rawContent,
    checksum: computeChecksum(rawContent),
  };
}
