# Bakugan 3D Assets Research

## Sources

### 1. The Models Resource — DS/DSi
- **URL**: https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/
- **Assets**: 30 total (10 Characters + 20 Bakugan)
- **Formats**: OBJ, FBX, DAE, MTL + PNG textures
- **License**: Non-commercial use only (The Models Resource terms)
- **Status**: 20 Bakugan models downloaded to `src/assets/models/bakugan/`

### 2. The Models Resource — Wii
- **URL**: https://models.spriters-resource.com/wii/bakuganbattlebrawlers/
- **Assets**: 9 total (8 Characters + 1 Bakugan)
- **Bakugan**: Only **Dragonoid** (battle form)
- **Quality**: Higher than DS — better geometry and textures
- **Status**: Not yet downloaded
- **Priority**: Wii > DS when available

### 3. BakuganDB BakuDex
- **URL**: https://bakugandb.com/bakudex
- **Usage**: Reference for tracking which Bakugan exist
- **No models** — reference only for names and data

## Priority Order

1. **Wii models** — Highest quality, closest to console game
2. **DS models** — Decent quality, most coverage (20 Bakugan)
3. **Other game sources** — New Vestroia, Metal Fusion, etc.
4. **Fan-made models** — CC-BY or similar open licenses
5. **Placeholder** — SVG sphere with attribute coloring (current fallback)

## Asset Status Definitions

| Status | Meaning |
|--------|---------|
| `MISSING` | No model found from any source |
| `LICENSE_REVIEW` | Model found but license needs verification |
| `DOWNLOADED` | Model files exist in project |
| `CONVERTED` | Converted to GLB/glTF for web use |
| `INTEGRATED` | Working in the game UI |

## Bakugan Asset Inventory

### Game Roster (38 Bakugan from bakugan.json)

#### Pyrus (8 Bakugan)
| Bakugan | DS Model | Wii Model | Portrait | Status |
|---------|----------|-----------|----------|--------|
| Serpenoid | N | N | N | MISSING |
| Juggernoid | N | N | N | MISSING |
| Robotallion | N | N | N | MISSING |
| Saurus | N | N | N | MISSING |
| Falconeer | N | N | N | MISSING |
| Fortress | Y | N | N | DOWNLOADED |
| Dragonoid | Y | **Y** | N | DOWNLOADED |
| Delta Dragonoid II | Y (as "Delta Dragonoid") | N | N | DOWNLOADED |

#### Aquos (3 Bakugan)
| Bakugan | DS Model | Wii Model | Portrait | Status |
|---------|----------|-----------|----------|--------|
| Sirenoid | Y | N | N | DOWNLOADED |
| Preyas | Y | N | N | DOWNLOADED |
| Preyas II | N (Preyas Angelo/Diablo variants) | N | N | PARTIAL |

#### Subterra (8 Bakugan)
| Bakugan | DS Model | Wii Model | Portrait | Status |
|---------|----------|-----------|----------|--------|
| Manion | Y | N | N | DOWNLOADED |
| Ravenoid | Y | N | N | DOWNLOADED |
| Stinglash | N | N | N | MISSING |
| Centipoid | N | N | N | MISSING |
| Gargonoid | N | N | N | MISSING |
| Cycloid | Y | N | N | DOWNLOADED |
| Gorem | Y | N | N | DOWNLOADED |
| Hammer Gorem | Y | N | N | DOWNLOADED |

#### Haos (12 Bakugan)
| Bakugan | DS Model | Wii Model | Portrait | Status |
|---------|----------|-----------|----------|--------|
| Fear Ripper | N | N | N | MISSING |
| Siege | N | N | N | MISSING |
| Monarus | N | N | N | MISSING |
| Griffon | N | N | N | MISSING |
| Terrorclaw | N | N | N | MISSING |
| Laserman | N | N | N | MISSING |
| Reaper | N | N | N | MISSING |
| Leonidas | N | N | N | MISSING |
| Omega Leonidas | N | N | N | MISSING |
| Tentaclear | Y | N | N | DOWNLOADED |
| Tigrerra | Y | N | N | DOWNLOADED |
| Blade Tigrerra | Y | N | N | DOWNLOADED |

#### Darkus (4 Bakugan)
| Bakugan | DS Model | Wii Model | Portrait | Status |
|---------|----------|-----------|----------|--------|
| Hydranoid | Y | N | N | DOWNLOADED |
| Dual Hydranoid | Y | N | N | DOWNLOADED |
| Vladitor | N | N | N | MISSING |
| Battle Ax Vladitor | N | N | N | MISSING |

#### Ventus (3 Bakugan)
| Bakugan | DS Model | Wii Model | Portrait | Status |
|---------|----------|-----------|----------|--------|
| Harpus | Y | N | N | DOWNLOADED |
| Skyress | Y | N | N | DOWNLOADED |
| Storm Skyress | Y | N | N | DOWNLOADED |

## Coverage Summary

| Metric | Count |
|--------|-------|
| Total Bakugan in game | 38 |
| DS models available | 20 |
| Wii models available | 1 (Dragonoid) |
| Models downloaded | 20 |
| Models converted to GLB | 0 |
| Models integrated | 0 |
| Missing models | 18 |
| **Coverage** | **52.6%** (20/38) |

## Model Directory Structure

```
src/assets/models/bakugan/
├── Dragonoid/
│   ├── Model.obj
│   ├── Model.fbx
│   ├── Model.dae
│   ├── Model.mtl
│   ├── mat1.png ... mat8.png
├── DeltaDragonoid/
│   └── ...
├── ... (20 Bakugan total)
```

## GLB Conversion Plan

All models need conversion from OBJ/FBX/DAE → GLB for web use:

1. **Tool**: Blender CLI (headless) or gltf-pipeline
2. **Source format preference**: FBX > DAE > OBJ (FBX preserves more data)
3. **Texture handling**: Embed textures in GLB (data URIs)
4. **Optimization**: Draco compression for geometry, resize textures to max 1024px
5. **Output**: `src/assets/models/bakugan/{Name}/Model.glb`

## License Notes

- The Models Resource: Non-commercial use only per site terms
- Game data (stats, names): Referenced from GameFAQs guide — `reference_only_no_redistribution`
- All assets marked as `reference_only_no_redistribution` in the project
- No assets may be redistributed outside this project
