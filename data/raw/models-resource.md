# Raw Data: The Models Resource — Bakugan Battle Brawlers (Nintendo DS)

## Source Metadata

- **Site**: www.models-resource.com (now models.spriters-resource.com)
- **Game page**: https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/
- **Access**: Direct fetch returned 403; data retrieved via Wayback Machine snapshot 2026-07-24
- **Wayback URL**: https://web.archive.org/web/20260724233233/https://models.spriters-resource.com/ds_dsi/bakuganbattlebrawlers/

## Game Metadata (from page)

- **Category**: DS/DSi
- **Assets**: 30
- **Hits**: 34,710
- **Tags**: Company Activision, Company Nowpro, Genre Action / Card / Board Game / Strategy, Series Bakugan, Perspective Third-person
- **Confirmed**: 2008 DS video game (distinct from the toy franchise)

## Inventory

### Characters (10 assets)

Alice Gehabich, Billy Gilbert, Dan Kuso, Hal-G, Julie Makimoto, Marduk, Marucho Marukara, Masquerade, Runo Misaki, Shun Kazami

### Bakugan (20 assets)

Blade Tigrerra (Haos), Cycloid (Subterra), Delta Dragonoid (Pyrus), Dragonoid (Pyrus), Dual Hydranoid (Darkus), Fortress (Pyrus), Gorem (Subterra), Hammer Gorem (Subterra), Harpus (Ventus), Hydranoid (Darkus), Manion (Subterra), Preyas (Aquos), Preyas Angelo (Aquos), Preyas Diablo (Aquos), Ravenoid (Ventus), Sirenoid (Aquos), Skyress (Ventus), Storm Skyress (Ventus), Tentaclear (Haos), Tigrerra (Haos)

**Note**: This is a partial roster, not the game's full Bakugan list.

## File Formats

ZIPs of **converted** files (not native DS formats):
- **Characters**: `chara00.dae` + part textures `00_Dan_skin.png` etc. (submitted 2020, JJ314)
- **Bakugan**: `Model.dae/.fbx/.obj/.mtl` + `mat1..matN.png` (submitted May–Jun 2025, CameronCarsonOfficial)
- Example: asset 363840 (9 items), asset 362837 (11 items)

No native DS formats (NMD/BTX/BMD) listed — all are converted DAE/FBX/OBJ.

## Usage Policy (Terms of Use, Updated 2025-03-31)

From https://web.archive.org/web/20260724233233/https://models.spriters-resource.com/page/tou/:

- "Feel free to use the content as you wish (where legally permitted or in unpublished, non-commercial works)."
- "Content on these sites may not be used in any commercial works. These include, but are not limited to, paid games, free games with in-app purchases or advertisements, monetized videos…"
- "Taking content in its original format from this website and distributing it elsewhere without prior consent or credit to its origin will also result in contact being made with those seen fit to have it removed as this is also viewed as theft."

## Implications for Our Data Import

1. **Partial roster**: Only 20 of 38 Bakugan have models available
2. **Converted formats**: DAE/FBX/OBJ — fine as scale/naming reference, not native DS assets
3. **Non-commercial only**: TOU explicitly prohibits commercial use, ad-supported games, monetized content
4. **Attribution required**: Must credit origin for any use
5. **Set `asset_license_status: "reference_only_no_redistribution"`** for all entries sourced from this site
6. **3D assets must be self-extracted or original**: Available rips are derivative of Activision/publisher-copyrighted game assets
7. **Useful as**: Scale reference, naming convention, entity structure confirmation (per-attribute variants like "Preyas Angelo (Aquos)")
