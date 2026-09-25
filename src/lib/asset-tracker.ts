/**
 * asset-tracker.ts — Track status of Bakugan 3D assets through the pipeline.
 *
 * Pipeline stages: MISSING → LICENSE_REVIEW → DOWNLOADED → CONVERTED → INTEGRATED
 *
 * Provides functions to query, update, and report on asset status
 * for all 38 Bakugan in the game.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type AssetPipelineStatus =
  | 'MISSING'
  | 'LICENSE_REVIEW'
  | 'DOWNLOADED'
  | 'CONVERTED'
  | 'INTEGRATED';

export interface AssetRecord {
  /** Bakugan name */
  name: string;
  /** Bakugan ID from bakugan.json */
  bakuganId: string;
  /** Primary attribute */
  attribute: string;
  /** Current pipeline status */
  status: AssetPipelineStatus;
  /** Source platform (DS, Wii, etc.) */
  sourcePlatform?: string;
  /** URL where model was found */
  sourceUrl?: string;
  /** Local path to downloaded model */
  localPath?: string;
  /** Path to converted GLB */
  glbPath?: string;
  /** Path to portrait/thumbnail */
  portraitPath?: string;
  /** Notes about this asset */
  notes?: string;
  /** Last updated timestamp */
  updatedAt: string;
}

export interface AssetReport {
  total: number;
  byStatus: Record<AssetPipelineStatus, number>;
  byAttribute: Record<string, number>;
  missing: string[];
  readyForConversion: string[];
  integrated: string[];
}

/* ------------------------------------------------------------------ */
/*  Static asset registry                                               */
/* ------------------------------------------------------------------ */

/**
 * Master list of all known Bakugan and their asset status.
 * Updated as assets move through the pipeline.
 */
const ASSET_REGISTRY: AssetRecord[] = [
  // === PYRUS ===
  { name: 'Dragonoid', bakuganId: 'b0000001-0000-0000-0000-000000000021', attribute: 'pyrus', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Dragonoid/Model.obj', notes: 'DS model available; Wii model also exists on The Models Resource', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Delta Dragonoid II', bakuganId: 'b0000001-0000-0000-0000-000000000022', attribute: 'pyrus', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/DeltaDragonoid/Model.obj', notes: 'DS model mapped as "DeltaDragonoid"', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Fortress', bakuganId: 'b0000001-0000-0000-0000-000000000020', attribute: 'pyrus', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Fortress/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Serpenoid', bakuganId: 'b0000001-0000-0000-0000-000000000001', attribute: 'pyrus', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Juggernoid', bakuganId: 'b0000001-0000-0000-0000-000000000002', attribute: 'pyrus', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Robotallion', bakuganId: 'b0000001-0000-0000-0000-000000000003', attribute: 'pyrus', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Saurus', bakuganId: 'b0000001-0000-0000-0000-000000000004', attribute: 'pyrus', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Falconeer', bakuganId: 'b0000001-0000-0000-0000-000000000005', attribute: 'pyrus', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },

  // === AQUOS ===
  { name: 'Sirenoid', bakuganId: 'b0000001-0000-0000-0000-000000000023', attribute: 'aquos', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Sirenoid/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Preyas', bakuganId: 'b0000001-0000-0000-0000-000000000024', attribute: 'aquos', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Preyas/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Preyas II', bakuganId: 'b0000001-0000-0000-0000-000000000025', attribute: 'aquos', status: 'MISSING', notes: 'Preyas Angelo/Diablo variants exist but not exact match', updatedAt: '2026-09-25T00:00:00Z' },

  // === SUBTERRA ===
  { name: 'Cycloid', bakuganId: 'b0000001-0000-0000-0000-000000000026', attribute: 'subterra', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Cycloid/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Gorem', bakuganId: 'b0000001-0000-0000-0000-000000000027', attribute: 'subterra', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Gorem/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Hammer Gorem', bakuganId: 'b0000001-0000-0000-0000-000000000028', attribute: 'subterra', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/HammerGorem/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Manion', bakuganId: 'b0000001-0000-0000-0000-000000000006', attribute: 'subterra', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Manion/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Ravenoid', bakuganId: 'b0000001-0000-0000-0000-000000000007', attribute: 'subterra', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Ravenoid/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Stinglash', bakuganId: 'b0000001-0000-0000-0000-000000000008', attribute: 'subterra', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Centipoid', bakuganId: 'b0000001-0000-0000-0000-000000000009', attribute: 'subterra', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Gargonoid', bakuganId: 'b0000001-0000-0000-0000-000000000010', attribute: 'subterra', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },

  // === HAOS ===
  { name: 'Tigrerra', bakuganId: 'b0000001-0000-0000-0000-000000000030', attribute: 'haos', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Tigrerra/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Blade Tigrerra', bakuganId: 'b0000001-0000-0000-0000-000000000031', attribute: 'haos', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/BladeTigrerra/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Tentaclear', bakuganId: 'b0000001-0000-0000-0000-000000000029', attribute: 'haos', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Tentaclear/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Fear Ripper', bakuganId: 'b0000001-0000-0000-0000-000000000011', attribute: 'haos', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Siege', bakuganId: 'b0000001-0000-0000-0000-000000000012', attribute: 'haos', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Monarus', bakuganId: 'b0000001-0000-0000-0000-000000000013', attribute: 'haos', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Griffon', bakuganId: 'b0000001-0000-0000-0000-000000000014', attribute: 'haos', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Terrorclaw', bakuganId: 'b0000001-0000-0000-0000-000000000015', attribute: 'haos', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Laserman', bakuganId: 'b0000001-0000-0000-0000-000000000016', attribute: 'haos', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Reaper', bakuganId: 'b0000001-0000-0000-0000-000000000017', attribute: 'haos', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Leonidas', bakuganId: 'b0000001-0000-0000-0000-000000000018', attribute: 'haos', status: 'MISSING', notes: 'Game-only Bakugan, no model source found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Omega Leonidas', bakuganId: 'b0000001-0000-0000-0000-000000000019', attribute: 'haos', status: 'MISSING', notes: 'Game-only Bakugan, no model source found', updatedAt: '2026-09-25T00:00:00Z' },

  // === DARKUS ===
  { name: 'Hydranoid', bakuganId: 'b0000001-0000-0000-0000-000000000032', attribute: 'darkus', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Hydranoid/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Dual Hydranoid', bakuganId: 'b0000001-0000-0000-0000-000000000033', attribute: 'darkus', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/DualHydranoid/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Vladitor', bakuganId: 'b0000001-0000-0000-0000-000000000034', attribute: 'darkus', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Battle Ax Vladitor', bakuganId: 'b0000001-0000-0000-0000-000000000035', attribute: 'darkus', status: 'MISSING', notes: 'No DS/Wii model found', updatedAt: '2026-09-25T00:00:00Z' },

  // === VENTUS ===
  { name: 'Skyress', bakuganId: 'b0000001-0000-0000-0000-000000000037', attribute: 'ventus', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Skyress/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Storm Skyress', bakuganId: 'b0000001-0000-0000-0000-000000000038', attribute: 'ventus', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/StormSkyress/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
  { name: 'Harpus', bakuganId: 'b0000001-0000-0000-0000-000000000036', attribute: 'ventus', status: 'DOWNLOADED', sourcePlatform: 'DS', localPath: '/assets/models/bakugan/Harpus/Model.obj', updatedAt: '2026-09-25T00:00:00Z' },
];

/* ------------------------------------------------------------------ */
/*  Query functions                                                     */
/* ------------------------------------------------------------------ */

/**
 * Get all asset records.
 */
export function getAllAssets(): AssetRecord[] {
  return [...ASSET_REGISTRY];
}

/**
 * Get asset record for a specific Bakugan by name.
 */
export function getAssetByName(name: string): AssetRecord | undefined {
  return ASSET_REGISTRY.find(a => a.name === name);
}

/**
 * Get asset record for a specific Bakugan by ID.
 */
export function getAssetById(bakuganId: string): AssetRecord | undefined {
  return ASSET_REGISTRY.find(a => a.bakuganId === bakuganId);
}

/**
 * Get all assets at a specific pipeline status.
 */
export function getAssetsByStatus(status: AssetPipelineStatus): AssetRecord[] {
  return ASSET_REGISTRY.filter(a => a.status === status);
}

/**
 * Get all assets for a specific attribute.
 */
export function getAssetsByAttribute(attribute: string): AssetRecord[] {
  return ASSET_REGISTRY.filter(a => a.attribute === attribute);
}

/**
 * Check if a Bakugan has a downloadable model available.
 */
export function hasModel(name: string): boolean {
  const asset = getAssetByName(name);
  return asset !== undefined && asset.status !== 'MISSING';
}

/**
 * Check if a Bakugan has a converted GLB model ready.
 */
export function hasGLB(name: string): boolean {
  const asset = getAssetByName(name);
  return asset !== undefined &&
    (asset.status === 'CONVERTED' || asset.status === 'INTEGRATED') &&
    asset.glbPath !== undefined;
}

/**
 * Get the best available model path for a Bakugan.
 * Priority: GLB > OBJ > null
 */
export function getBestModelPath(name: string): string | null {
  const asset = getAssetByName(name);
  if (!asset) return null;

  if (asset.glbPath && (asset.status === 'CONVERTED' || asset.status === 'INTEGRATED')) {
    return asset.glbPath;
  }
  if (asset.localPath && asset.status === 'DOWNLOADED') {
    return asset.localPath;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Update functions                                                    */
/* ------------------------------------------------------------------ */

/**
 * Update the status of a Bakugan asset.
 */
export function updateAssetStatus(
  name: string,
  status: AssetPipelineStatus,
  extra?: Partial<Pick<AssetRecord, 'glbPath' | 'portraitPath' | 'notes'>>
): boolean {
  const asset = ASSET_REGISTRY.find(a => a.name === name);
  if (!asset) return false;

  asset.status = status;
  asset.updatedAt = new Date().toISOString();
  if (extra?.glbPath) asset.glbPath = extra.glbPath;
  if (extra?.portraitPath) asset.portraitPath = extra.portraitPath;
  if (extra?.notes) asset.notes = extra.notes;

  return true;
}

/* ------------------------------------------------------------------ */
/*  Reporting                                                           */
/* ------------------------------------------------------------------ */

/**
 * Generate a comprehensive asset report.
 */
export function generateReport(): AssetReport {
  const report: AssetReport = {
    total: ASSET_REGISTRY.length,
    byStatus: {
      MISSING: 0,
      LICENSE_REVIEW: 0,
      DOWNLOADED: 0,
      CONVERTED: 0,
      INTEGRATED: 0,
    },
    byAttribute: {},
    missing: [],
    readyForConversion: [],
    integrated: [],
  };

  for (const asset of ASSET_REGISTRY) {
    report.byStatus[asset.status]++;

    report.byAttribute[asset.attribute] = (report.byAttribute[asset.attribute] || 0) + 1;

    if (asset.status === 'MISSING') {
      report.missing.push(asset.name);
    }
    if (asset.status === 'DOWNLOADED') {
      report.readyForConversion.push(asset.name);
    }
    if (asset.status === 'INTEGRATED') {
      report.integrated.push(asset.name);
    }
  }

  return report;
}

/**
 * Print a human-readable status report to console.
 */
export function printReport(): void {
  const report = generateReport();

  console.log('\n=== Bakugan Asset Status Report ===');
  console.log(`Total Bakugan: ${report.total}`);
  console.log(`\nBy Status:`);
  console.log(`  MISSING:         ${report.byStatus.MISSING}`);
  console.log(`  LICENSE_REVIEW:  ${report.byStatus.LICENSE_REVIEW}`);
  console.log(`  DOWNLOADED:      ${report.byStatus.DOWNLOADED}`);
  console.log(`  CONVERTED:       ${report.byStatus.CONVERTED}`);
  console.log(`  INTEGRATED:      ${report.byStatus.INTEGRATED}`);
  console.log(`\nBy Attribute:`);
  for (const [attr, count] of Object.entries(report.byAttribute)) {
    console.log(`  ${attr}: ${count}`);
  }
  console.log(`\nReady for GLB conversion: ${report.readyForConversion.length}`);
  console.log(`Missing models: ${report.missing.length}`);
  console.log(`Fully integrated: ${report.integrated.length}`);
  console.log('===================================\n');
}
