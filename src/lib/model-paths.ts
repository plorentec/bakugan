/**
 * model-paths.ts — Mapping from Bakugan names to their 3D model paths.
 * Models from The Models Resource (non-commercial use only).
 */

export const BAKUGAN_MODELS: Record<string, string> = {
  // Pyrus
  Dragonoid: "/assets/models/bakugan/Dragonoid/Model.obj",
  "Delta Dragonoid": "/assets/models/bakugan/DeltaDragonoid/Model.obj",
  Fortress: "/assets/models/bakugan/Fortress/Model.obj",

  // Aquos
  Preyas: "/assets/models/bakugan/Preyas/Model.obj",
  "Preyas Angelo": "/assets/models/bakugan/PreyasAngelo/Model.obj",
  "Preyas Diablo": "/assets/models/bakugan/PreyasDiablo/Model.obj",
  Sirenoid: "/assets/models/bakugan/Sirenoid/Model.obj",

  // Subterra
  Gorem: "/assets/models/bakugan/Gorem/Model.obj",
  "Hammer Gorem": "/assets/models/bakugan/HammerGorem/Model.obj",
  Cycloid: "/assets/models/bakugan/Cycloid/Model.obj",
  Manion: "/assets/models/bakugan/Manion/Model.obj",

  // Haos
  Tigrerra: "/assets/models/bakugan/Tigrerra/Model.obj",
  "Blade Tigrerra": "/assets/models/bakugan/BladeTigrerra/Model.obj",
  Tentaclear: "/assets/models/bakugan/Tentaclear/Model.obj",

  // Darkus
  Hydranoid: "/assets/models/bakugan/Hydranoid/Model.obj",
  "Dual Hydranoid": "/assets/models/bakugan/DualHydranoid/Model.obj",

  // Ventus
  Skyress: "/assets/models/bakugan/Skyress/Model.obj",
  "Storm Skyress": "/assets/models/bakugan/StormSkyress/Model.obj",
  Harpus: "/assets/models/bakugan/Harpus/Model.obj",
  Ravenoid: "/assets/models/bakugan/Ravenoid/Model.obj",
};

/**
 * Get the model path for a Bakugan by name.
 */
export function getModelPath(name: string): string | undefined {
  return BAKUGAN_MODELS[name];
}

/**
 * Get all available model names.
 */
export function getAvailableModels(): string[] {
  return Object.keys(BAKUGAN_MODELS);
}
