/**
 * model-paths.ts — Mapping from Bakugan names to their 3D model paths.
 * Models from The Models Resource (non-commercial use only).
 *
 * Priority: GLB > OBJ (GLB preferred for web performance)
 * When GLB exists at the same path, it will be preferred automatically.
 */

/* ------------------------------------------------------------------ */
/*  Model registry                                                      */
/* ------------------------------------------------------------------ */

interface ModelEntry {
  /** Best available 3D model path (GLB > OBJ) */
  primary: string;
  /** Legacy OBJ path */
  obj: string;
  /** GLB path if converted */
  glb?: string;
  /** Source platform */
  source: "DS" | "Wii" | "Other";
  /** Source URL */
  sourceUrl?: string;
}

export const BAKUGAN_MODELS: Record<string, ModelEntry> = {
  // === PYRUS ===
  Dragonoid: {
    primary: "/assets/models/bakugan/Dragonoid/Model.obj",
    obj: "/assets/models/bakugan/Dragonoid/Model.obj",
    glb: "/assets/models/bakugan/Dragonoid/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363838/",
  },
  "Delta Dragonoid": {
    primary: "/assets/models/bakugan/DeltaDragonoid/Model.obj",
    obj: "/assets/models/bakugan/DeltaDragonoid/Model.obj",
    glb: "/assets/models/bakugan/DeltaDragonoid/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363840/",
  },
  Fortress: {
    primary: "/assets/models/bakugan/Fortress/Model.obj",
    obj: "/assets/models/bakugan/Fortress/Model.obj",
    glb: "/assets/models/bakugan/Fortress/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363849/",
  },

  // === AQUOS ===
  Preyas: {
    primary: "/assets/models/bakugan/Preyas/Model.obj",
    obj: "/assets/models/bakugan/Preyas/Model.obj",
    glb: "/assets/models/bakugan/Preyas/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363633/",
  },
  "Preyas Angelo": {
    primary: "/assets/models/bakugan/PreyasAngelo/Model.obj",
    obj: "/assets/models/bakugan/PreyasAngelo/Model.obj",
    glb: "/assets/models/bakugan/PreyasAngelo/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363846/",
  },
  "Preyas Diablo": {
    primary: "/assets/models/bakugan/PreyasDiablo/Model.obj",
    obj: "/assets/models/bakugan/PreyasDiablo/Model.obj",
    glb: "/assets/models/bakugan/PreyasDiablo/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363847/",
  },
  Sirenoid: {
    primary: "/assets/models/bakugan/Sirenoid/Model.obj",
    obj: "/assets/models/bakugan/Sirenoid/Model.obj",
    glb: "/assets/models/bakugan/Sirenoid/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363637/",
  },

  // === SUBTERRA ===
  Gorem: {
    primary: "/assets/models/bakugan/Gorem/Model.obj",
    obj: "/assets/models/bakugan/Gorem/Model.obj",
    glb: "/assets/models/bakugan/Gorem/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363839/",
  },
  "Hammer Gorem": {
    primary: "/assets/models/bakugan/HammerGorem/Model.obj",
    obj: "/assets/models/bakugan/HammerGorem/Model.obj",
    glb: "/assets/models/bakugan/HammerGorem/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363844/",
  },
  Cycloid: {
    primary: "/assets/models/bakugan/Cycloid/Model.obj",
    obj: "/assets/models/bakugan/Cycloid/Model.obj",
    glb: "/assets/models/bakugan/Cycloid/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363848/",
  },
  Manion: {
    primary: "/assets/models/bakugan/Manion/Model.obj",
    obj: "/assets/models/bakugan/Manion/Model.obj",
    glb: "/assets/models/bakugan/Manion/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/362838/",
  },

  // === HAOS ===
  Tigrerra: {
    primary: "/assets/models/bakugan/Tigrerra/Model.obj",
    obj: "/assets/models/bakugan/Tigrerra/Model.obj",
    glb: "/assets/models/bakugan/Tigrerra/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363635/",
  },
  "Blade Tigrerra": {
    primary: "/assets/models/bakugan/BladeTigrerra/Model.obj",
    obj: "/assets/models/bakugan/BladeTigrerra/Model.obj",
    glb: "/assets/models/bakugan/BladeTigrerra/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363841/",
  },
  Tentaclear: {
    primary: "/assets/models/bakugan/Tentaclear/Model.obj",
    obj: "/assets/models/bakugan/Tentaclear/Model.obj",
    glb: "/assets/models/bakugan/Tentaclear/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/364384/",
  },

  // === DARKUS ===
  Hydranoid: {
    primary: "/assets/models/bakugan/Hydranoid/Model.obj",
    obj: "/assets/models/bakugan/Hydranoid/Model.obj",
    glb: "/assets/models/bakugan/Hydranoid/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363636/",
  },
  "Dual Hydranoid": {
    primary: "/assets/models/bakugan/DualHydranoid/Model.obj",
    obj: "/assets/models/bakugan/DualHydranoid/Model.obj",
    glb: "/assets/models/bakugan/DualHydranoid/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363843/",
  },

  // === VENTUS ===
  Skyress: {
    primary: "/assets/models/bakugan/Skyress/Model.obj",
    obj: "/assets/models/bakugan/Skyress/Model.obj",
    glb: "/assets/models/bakugan/Skyress/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363845/",
  },
  "Storm Skyress": {
    primary: "/assets/models/bakugan/StormSkyress/Model.obj",
    obj: "/assets/models/bakugan/StormSkyress/Model.obj",
    glb: "/assets/models/bakugan/StormSkyress/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363634/",
  },
  Harpus: {
    primary: "/assets/models/bakugan/Harpus/Model.obj",
    obj: "/assets/models/bakugan/Harpus/Model.obj",
    glb: "/assets/models/bakugan/Harpus/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/363850/",
  },
  Ravenoid: {
    primary: "/assets/models/bakugan/Ravenoid/Model.obj",
    obj: "/assets/models/bakugan/Ravenoid/Model.obj",
    glb: "/assets/models/bakugan/Ravenoid/Model.glb",
    source: "DS",
    sourceUrl: "https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/asset/362837/",
  },
};

/* ------------------------------------------------------------------ */
/*  Name aliases                                                        */
/* ------------------------------------------------------------------ */

/**
 * Game roster name → model registry key.
 * The DS model dumps use slightly different names than bakugan.json,
 * so these aliases let more Bakugan resolve to a real 3D model.
 */
const MODEL_ALIASES: Record<string, string> = {
  // DS asset is published as "Delta Dragonoid"
  "Delta Dragonoid II": "Delta Dragonoid",
  // DS ships the Angelo/Diablo evolutions instead of a "Preyas II" asset
  "Preyas II": "Preyas Angelo",
};

function resolveModelKey(name: string): string {
  return MODEL_ALIASES[name] ?? name;
}

/* ------------------------------------------------------------------ */
/*  Backward-compatible helper functions                                */
/* ------------------------------------------------------------------ */

/**
 * Get the best available model path for a Bakugan by name.
 * Returns GLB if available, otherwise OBJ.
 * Maintains the same API as before — returns a string path or undefined.
 */
export function getModelPath(name: string): string | undefined {
  const entry = BAKUGAN_MODELS[resolveModelKey(name)];
  if (!entry) return undefined;

  // Prefer GLB if it exists (checked at runtime via fetch or build)
  // For now, return primary which defaults to OBJ
  // When GLB files are added, this can check for their existence
  return entry.primary;
}

/**
 * Get the full model entry with metadata.
 */
export function getModelEntry(name: string): ModelEntry | undefined {
  return BAKUGAN_MODELS[resolveModelKey(name)];
}

/**
 * Get all available model names.
 */
export function getAvailableModels(): string[] {
  return Object.keys(BAKUGAN_MODELS);
}

/**
 * Get the source platform for a model.
 */
export function getModelSource(name: string): string | undefined {
  return BAKUGAN_MODELS[resolveModelKey(name)]?.source;
}

/**
 * Get the source URL for a model.
 */
export function getModelSourceUrl(name: string): string | undefined {
  return BAKUGAN_MODELS[resolveModelKey(name)]?.sourceUrl;
}
