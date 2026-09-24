/**
 * Source Record — Stage 1 of the data pipeline.
 * Tracks where data originally came from.
 */

export type RawFormat = 'html' | 'json' | 'csv' | 'manual';

export interface SourceRecord {
  /** Human-readable source name */
  source: string;
  /** URL to the source document */
  source_url: string;
  /** Format of the raw data */
  raw_format: RawFormat;
  /** ISO 8601 timestamp when the data was fetched */
  fetched_at: string;
}

/**
 * Creates a SourceRecord with the current timestamp.
 */
export function createSourceRecord(
  source: string,
  source_url: string,
  raw_format: RawFormat
): SourceRecord {
  return {
    source,
    source_url,
    raw_format,
    fetched_at: new Date().toISOString(),
  };
}
