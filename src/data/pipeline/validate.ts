/**
 * Validator — Stage 4 of the data pipeline.
 * Validates normalized data against Zod schemas.
 *
 * TODO: Full implementation will handle:
 * - Per-entity validation with detailed error reporting
 * - Batch validation with summary statistics
 * - Conflict detection across records
 */

import { z } from 'zod';
import { SourceRecord } from './source';
import { NormalizedRecord } from './normalize';

export interface ValidatedRecord<T> {
  /** Source metadata */
  source: SourceRecord;
  /** Type-safe, validated data */
  data: T;
  /** ISO 8601 timestamp when validation occurred */
  validated_at: string;
  /** Notes about validation */
  validation_notes: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  total: number;
  passed: number;
  failed: number;
}

/**
 * Validates a single normalized record against a Zod schema.
 *
 * TODO: Full implementation:
 * - Detailed field-level error reporting
 * - Custom validation rules beyond Zod (e.g. deck 3+3+3)
 * - Conflict detection against existing records
 */
export function validateRecord<T>(
  record: NormalizedRecord<T>,
  schema: z.ZodType<T>
): ValidatedRecord<T> {
  const result = schema.safeParse(record.data);
  if (!result.success) {
    throw new Error(
      `Validation failed: ${result.error.message}\n${result.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`
    );
  }
  return {
    source: record.source,
    data: result.data,
    validated_at: new Date().toISOString(),
    validation_notes: [],
  };
}

/**
 * Validates a dataset (array of records) against a Zod schema.
 * Returns a summary with counts and error details.
 *
 * TODO: Full implementation:
 * - Parallel validation for large datasets
 * - Error aggregation and reporting
 * - Partial success handling (validate what you can, skip bad records)
 */
export function validateDataset<T>(
  records: NormalizedRecord<T>[],
  schema: z.ZodType<T>
): ValidationResult {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const record of records) {
    try {
      validateRecord(record, schema);
      passed++;
    } catch (e) {
      failed++;
      errors.push(
        `${record.source.source}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  return {
    valid: failed === 0,
    errors,
    total: records.length,
    passed,
    failed,
  };
}
