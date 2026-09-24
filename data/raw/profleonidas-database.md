# Raw Data: ProfLeonDias/Bakugan-Database

## Source Metadata

- **Repository**: https://github.com/ProfLeonDias/Bakugan-Database
- **Status**: EXISTS — public, default branch `main`
- **Size**: ~430 MB
- **Language**: HTML
- **GitHub Pages**: bakugandb.com
- **License**: NONE (no LICENSE file; API `/license` endpoint 404; GitHub reports `license: null`)

## What It Actually Is

A **physical toy collector database** (BakuganDB), NOT a game-stat source. Quote from about.html: "My love for Bakugan and a strong urge to document them has inspired me to make BakuganDB so that fans and collectors… [can see] which toys are available." FAQ: "This site is run completely independently from any brand… merely a passionate fan project meant to document Bakugan releases."

## Structure

- **8,646 entries total**: 6,866 JPG + 535 PNG images, 18 HTML pages
- **NO JSON/CSV/SQL files** — data embedded in giant per-season HTML tables
- Main data file: `battle-brawlers.html` (4.1 MB)
- Image directories: `BakuganImg/Data/<season>/<mold>/<variant>.jpg` (6,968 files)
- Card scans: `Dex/` (334 JPGs)
- Other: `Images/`, `Symbols/`

## Data Format

Each variant record is an HTML `data-text` attribute containing:
- **Name**: e.g. "Aquos Blade Tigrerra (Translucent)" — 1,002 unique variant names on BB page
- **First Released**: Kit codes, e.g. "BBT-01 (Dan Vs Ace)", "BST-02 (Ace Starter Pack)"
- **Rarity/Obtain Difficulty**: "4/10 (Common)" scale 1–10 with labels Bulk→Rare
- **Non-Scalped Price**: "$100" / "TBD"
- **Notes**: B1/B2 28mm-vs-32mm, Open/Closed Core, regional/treatment info
- **Image Credit**: Third-party credits ("Image Credit: Bakucolle/Yukimo")

## Coverage

12 series categories, **514 unique season/mold folders**:
- Battle Brawlers: 55 molds
- New Vestroia: 64
- Gundalian Invaders: 65
- Mechtanium Surge: 57
- BakuTech: 72
- Accessories: 6+3
- Battle Planet: 36
- Armored Alliance: 42
- Geogan Rising: 25
- Evolutions: 38
- Legends: 51

## What's Missing (for our purposes)

- **Gate Card data**: "Gate Card" occurs **0 times** in battle-brawlers.html
- **Ability Card data**: "Ability Card" occurs **0 times** in battle-brawlers.html
- **Game-style stats**: Page states "The table does not account for varying G-Powers"
- **No game-specific data**: This is purely a physical toy collector's reference

## Implications for Our Data Import

1. **Not a game-stat source**: No JSON/CSV, no Gate/Ability Cards, no G-Power values
2. **Machine import would require**: Scraping `data-text` HTML attributes — worth it only for canonical names, attribute assignments, and evolution lines
3. **No license**: No LICENSE file, third-party image credits → link/cite, never bulk-copy
4. **Useful for**: Canonical Bakugan names, attribute assignments, evolution lines (Dragonoid→Delta→Infinity, Preyas→Diablo/II naming that matches DS roster)
5. **Treatment**: Documentation reference only. Set `asset_license_status: "reference_only_no_redistribution"`
