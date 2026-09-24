import { z } from 'zod';

/**
 * License status for any assets associated with a record.
 * Determines what we can do with images, models, etc.
 */
export const AssetLicenseStatusSchema = z.enum([
  'original',
  'reference_only_no_redistribution',
  'public_domain',
  'unknown',
]);

export type AssetLicenseStatus = z.infer<typeof AssetLicenseStatusSchema>;

/**
 * Source metadata tracks where each piece of data came from.
 * Critical for provenance, conflict resolution, and re-import.
 */
export const SourceMetadataSchema = z.object({
  /** Human-readable source description, e.g. "GameFAQs guide FAQ 81516, Section F" */
  source: z.string(),
  /** URL to the source document (optional for manual entries) */
  source_url: z.string().url().optional(),
  /** Additional context about what this source provides */
  source_notes: z.string().optional(),
  /** License status for any associated assets */
  asset_license_status: AssetLicenseStatusSchema,
});

export type SourceMetadata = z.infer<typeof SourceMetadataSchema>;

/**
 * Records a conflict when multiple sources disagree on a value.
 * Used for audit trail and manual resolution.
 */
export const ConflictRecordSchema = z.object({
  /** The conflicting value from the alternative source */
  value: z.unknown(),
  /** Which sources provide this conflicting value */
  sources: z.array(z.string()),
  /** Literal true — this record IS a conflict */
  conflict: z.literal(true),
});

export type ConflictRecord = z.infer<typeof ConflictRecordSchema>;
