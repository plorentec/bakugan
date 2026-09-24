/**
 * Database Interface — Stage 5 of the data pipeline.
 * Stores validated records in IndexedDB (MVP) or any other backend.
 *
 * TODO: Full implementation will handle:
 * - IndexedDB setup with object stores
 * - CRUD operations for each entity type
 * - Conflict resolution during storage
 * - Import/export functionality
 */

import { SourceMetadata, ConflictRecord } from '../schemas/source-metadata';

export interface DatabaseRecord<T> {
  /** Unique identifier (UUID) */
  id: string;
  /** The stored data */
  data: T;
  /** Source provenance metadata */
  source: SourceMetadata;
  /** Any recorded conflicts */
  conflicts: ConflictRecord[];
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** ISO 8601 last-updated timestamp */
  updated_at: string;
}

/**
 * Database interface — abstracts storage backend.
 * MVP uses IndexedDB; future versions may use PostgreSQL.
 *
 * TODO: Full implementation:
 * - openBakuganDB() — opens/creates the database
 * - Object stores: bakugan, gate_cards, ability_cards, decks, player
 * - put/get/delete/getAll for each store
 * - Conflict detection on put (compare with existing)
 */
export interface DatabaseInterface<T> {
  /** Save a record to the database */
  save(record: DatabaseRecord<T>): Promise<void>;
  /** Retrieve a record by ID */
  get(id: string): Promise<DatabaseRecord<T> | null>;
  /** Get all records */
  getAll(): Promise<DatabaseRecord<T>[]>;
  /** Delete a record by ID */
  delete(id: string): Promise<void>;
}

/**
 * Save a Bakugan record to the database.
 *
 * TODO: Full implementation:
 * - Open IndexedDB connection
 * - Check for existing record with same name+attribute
 * - Insert or update with conflict resolution
 */
export async function saveBakugan(
  record: DatabaseRecord<unknown>
): Promise<void> {
  // TODO: Implement IndexedDB storage
  console.log(`[pipeline] saveBakugan: ${record.data} (skeleton only)`);
}

/**
 * Save a Gate Card record to the database.
 *
 * TODO: Full implementation:
 * - Open IndexedDB connection
 * - Insert gate_card store
 */
export async function saveGateCard(
  record: DatabaseRecord<unknown>
): Promise<void> {
  // TODO: Implement IndexedDB storage
  console.log(`[pipeline] saveGateCard: ${record.data} (skeleton only)`);
}

/**
 * Save an Ability Card record to the database.
 *
 * TODO: Full implementation:
 * - Open IndexedDB connection
 * - Insert ability_card store
 */
export async function saveAbilityCard(
  record: DatabaseRecord<unknown>
): Promise<void> {
  // TODO: Implement IndexedDB storage
  console.log(`[pipeline] saveAbilityCard: ${record.data} (skeleton only)`);
}
