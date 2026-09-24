# Research Notes — Bakugan Battle Brawlers (Nintendo DS)

Primary source: `data/raw/gamefaqs-guide.md` (GameFAQs FAQ 81516, author UFVKNP, v1.2, 2025-10-01)
Secondary sources: `data/raw/profleonidas-database.md` (toy collector DB), `data/raw/models-resource.md` (3D model references)

---

## 1. Deck Building

### ORIGINAL DS BEHAVIOUR

Deck composition (mandatory, cannot omit anything): [VERBATIM from source, A]
- **Bakugan**: 3 required. Cannot own two of the same Bakugan in the same attribute. Can bring same Bakugan in different attributes (e.g. three Gargonoid in different attributes). Once all 3 used, they reset.
- **Gate Cards**: 3 required — 1 Gold, 1 Silver, 1 Copper. Won Gate Cards are removed from deck permanently.
- **Ability Cards**: 3 required — 1 Red, 1 Green, 1 Blue. Each used once per battle. Unused Red cards return to deck; Green/Blue behavior unspecified [INFERRED from section A: guide says "each used once per battle" and only Red explicitly returns; Green/Blue are consumed].

Starting deck (fixed): [VERBATIM from source, A]
- Bakugan: Pyrus Serpenoid / Ventus Falconeer / Aquos Juggernoid
- Gates: Juggernoid (Gold) / Fire Pit (Silver) / Stand Off (Copper)
- Abilities: Rewind (Red) / Negative Wave (Green) / Blaze (Blue)
- Partner: Leonidas (Level 3, 440 G-Power in chosen attribute)
- Shop-bought Bakugan get one free stat upgrade; starting Bakugan are "slightly inferior."

### OUR IMPLEMENTATION

Deck builder enforces: 3 Bakugan (no duplicate name+attribute), 3 Gate Cards (1G/1S/1C), 3 Ability Cards (1R/1G/1B). Validation via Zod schemas. Starting deck provided as default. Deck editing between battles.

### SOURCE

GameFAQs guide FAQ 81516, Section A "Deck Construction Rules"

### UNCERTAINTIES

- Green/Blue Ability Card consumption after use: guide only explicitly states Red returns [INFERRED: consumed]. Needs playtesting or additional source.
- Whether "same Bakugan different attributes" means same mold or same species — likely same species (e.g. Gargonoid in Pyrus + Aquos + Darkus).
- Permanent removal of won Gate Cards: confirmed for Gate Cards, unclear if this persists across the entire story or just per-brawl.

---

## 2. Arena Movement

### ORIGINAL DS BEHAVIOUR

Throw mechanics: [VERBATIM from source, B]
- Hold on Touch Screen with stylus, flick up. Faster flick = more force.

Control: [VERBATIM from source, B]
- D-Pad or small stylus strokes. Microphone enabled: blow to make Bakugan jump (weakens with each use; affects opponent too).

Starting speed: [VERBATIM from source, A]
- Flicking faster off Touch Screen gives starting speed bonus. Can lead to Critical KO.

Steering stat: [VERBATIM from source, A]
- How long you can control Bakugan on field before it stops and you lose the throw.

### OUR IMPLEMENTATION

Desktop: click-drag-release for throw (distance = force). Arrow keys / WASD for movement. Space = jump (with cooldown simulating microphone weakening).
Mobile/tablet: touch-drag for throw, on-screen joystick or tilt for movement, tap for jump.
Steering stat controls duration of movement control before auto-stand.

### SOURCE

GameFAQs guide FAQ 81516, Section B "Battles (Full Flow)" and Section A "Deck Construction Rules" (stats)

### UNCERTAINTIES

- Exact control mapping from DS stylus/D-pad to web input — our design choice.
- Microphone blow mechanic: replaced by keyboard/tap jump with cooldown for web compatibility.
- "Weakens with each use" — exact decay rate not quantified [NOT FOUND].

---

## 3. Gate Cards

### ORIGINAL DS BEHAVIOUR

Tiers and bonuses: [VERBATIM from source, A]
- **Gold**: High G-Power bonuses. Depict a particular Bakugan. If the depicted Bakugan stands on it, bonus applied twice. Minigames: Scratch Battle or Spin Battle.
- **Silver**: Various G-Power bonuses (high to low). No special effects. Minigames: Timing Battle or Pop Battle.
- **Copper**: Higher highs and lower lows than Silver. All have additional effects (e.g. doubling G-Power, preventing Ability Cards). Minigames: Trace Battle or Bound Battle.

Each card has per-attribute G-Power bonuses (6 attributes). Example from guide: Serpenoid Gold — Pyrus 180, Aquos 60, Subterra 90, Haos 140, Darkus 130, Ventus 50. [VERBATIM from source, G]

Character-associated Gold cards: bonus applied twice if the depicted Bakugan stands on it. [VERBATIM from source, A]

103 Gate Cards total: 39 Gold, 30 Silver, 34 Copper. [VERBATIM from source, G]

### OUR IMPLEMENTATION

Gate Cards store: name, tier (gold/silver/copper), per-attribute bonuses (6 values), effect (for Copper), battle type (scratch/spin/timing/pop/trace/bound), depicted_bakugan (for Gold bonus-twice rule). Deployed to field slots. MVP: 12 cards (4G/4S/4C).

### SOURCE

GameFAQs guide FAQ 81516, Section A "Deck Construction Rules" and Section G "Gate Card List"

### UNCERTAINTIES

- How "bonus applied twice" is computed — additive (2x bonus) or multiplicative? [INFERRED: additive, 2x the attribute bonus].
- Copper card effects: guide lists specific effects per card. Exact trigger timing (pre-battle vs during battle) varies per card — needs per-card implementation.
- "Whirlpool" appears twice in source with different battle types (Timing and Pop) — two distinct cards or same card listed twice? [NOT FOUND, guide editorial disambiguation].

---

## 4. Stand Mechanics

### ORIGINAL DS BEHAVIOUR

Magnet stat: [VERBATIM from source, A]
- Strength of magnet when rolling over Gate Card. Easier to stand when moving quickly.

Double Stand: [VERBATIM from source, B]
- Two Bakugan from same player on same Gate Card → auto-win, no battle.

Critical KO: [VERBATIM from source, B]
- Knock opponent's Bakugan off a Gate Card → win without battle.

Standing lock: [VERBATIM from source, B]
- If all 3 of your Bakugan are standing when your turn comes, select one to stay. If still standing next turn, auto-win that Gate Card.

Defense stat: [VERBATIM from source, A]
- Resistance to attacks once stood. Higher defense = less vulnerable to Critical KOs. Some methods bypass this.

### OUR IMPLEMENTATION

Stand triggered when Bakugan rolls over a Gate Card. Magnet stat determines stand probability at current speed. Double Stand = 2 of your Bakugan on same card = instant win. Critical KO = knock opponent off = win without battle. Standing lock = all 3 standing + skip turn = auto-win.

### SOURCE

GameFAQs guide FAQ 81516, Section A (stats) and Section B (Double Stand, Critical KO, standing lock)

### UNCERTAINTIES

- Exact magnet-to-stand probability curve: "easier to stand when moving quickly" — no formula given [NOT FOUND].
- "Some methods bypass" defense for Critical KOs — which methods? [NOT FOUND, likely specific Ability Cards or Special Shots].
- Critical KO detection: how is "knocked off" determined? Physical collision or proximity threshold? [NOT FOUND for web implementation].

---

## 5. Battle Sequence

### ORIGINAL DS BEHAVIOUR

Battle flow when two opposing Bakugan stand on same Gate Card: [VERBATIM from source, B]
1. Apply Gate Card bonuses (attribute G-Power bonuses from card)
2. Apply Copper Gate Card effects
3. Opportunity to play one Ability Card
4. Battle minigame begins
5. G-Power bars displayed — higher G-Power has advantage
6. Battle ends after time expires OR one player dominates (bar pushed all the way back)
7. Winner gets Gate Card

G-Power in battle: [VERBATIM from source, B]
- "The number at the bottom of each Bakugan's status screen... determines your starting position." Each Bakugan's G-Power shown as thin bar on Touch Screen. Higher G-Power = advantage. Whoever is pushed back when time runs out loses. Auto-lose if bar pushed all the way back.

### OUR IMPLEMENTATION

State machine: SETUP → APPLY_GATE_BONUSES → APPLY_COPPER_EFFECTS → ABILITY_CARD_WINDOW → MINIGAME → G_POWER_BATTLE → RESOLUTION → END_TURN. G-Power bars rendered in real-time. Timer counts down. Bar-pushed-to-end = instant loss.

### SOURCE

GameFAQs guide FAQ 81516, Section B "Battles (Full Flow)"

### UNCERTAINTIES

- Battle timer length: "after a certain amount of time" — unspecified [NOT FOUND].
- "Dominates fast enough" auto-win threshold: bar pushed all the way back triggers auto-lose, but what % pushback = "dominates"? [NOT FOUND].
- Ability Card window timing: how long does the player have to play? [NOT FOUND].

---

## 6. G-Power System

### ORIGINAL DS BEHAVIOUR

G-Power determines battle outcome: [VERBATIM from source, B]
- "The number at the bottom of each Bakugan's status screen... determines your starting position."

Leveling: [VERBATIM from source, A]
- Each level increases G-Power by a certain amount. Total L1→MAX gap = 250. Per-level increment: UNKNOWN. Each level also allows +1 to any stat. Max stat value: 4 (based on highest printed values).

Base G-Power ranges from guide: [VERBATIM from source, F]
- Lowest: Serpenoid 190/440 (min/max). Highest: Omega Leonidas 650/900, Battle Ax Vladitor 650/900.

### OUR IMPLEMENTATION

G-Power = base_g_power + (level * per_level_increment) + gate_card_bonus + ability_card_bonus + power_up_bonus. Per-level increment derived from (max_g_power - min_g_power) / max_level. Stats: 5 stats (Speed, Defense, Control, Steering, Magnet), each +1 per level, max 4.

### SOURCE

GameFAQs guide FAQ 81516, Section A (leveling rules) and Section F (Bakugan stat table)

### UNCERTAINTIES

- Per-level G-Power increment: only total gap of 250 given, per-level value unstated [NOT FOUND].
- Max level: not explicitly stated. If gap is 250 and stats max at 4, and base stats can be 1-4, max level likely around 10-15 [INFERRED from stat cap of 4].
- Stat point allocation: "+1 to any stat" per level — player choice or automatic? [INFERRED: player choice].

---

## 7. Minigames — Scratch Battle

### ORIGINAL DS BEHAVIOUR

[NOT FOUND in guide] — Scratch Battle is listed as the minigame for Gold Gate Cards paired with certain cards (Serpenoid, Juggernoid, Robotallion, Saurus, Falconeer, Stinglash, Centipoid, Gargonoid, Griffon, Leonidas, Omega Leonidas, Vladitor, Battle Ax Vladitor, Dragonoid, Delta Dragonoid II, Fortress, Preyas, Sirenoid, Cycloid, Tentaclear, Reaper, Harpus). [VERBATIM from source, G — Gold card battle type column]

Guide mentions "Scratch Battle" by name but does not describe the gameplay mechanics. "Scratch Battle Redo" is a Red Ability Card that restarts battle as Scratch Battle. [VERBATIM from source, H]

### OUR IMPLEMENTATION

[OUR DESIGN] Based on DS stylus scratch mechanic: player traces a pattern on screen. Accuracy and speed determine G-Power gain. Normalized result: 0.0–1.0. Desktop: mouse drag pattern. Mobile: finger trace. Pattern complexity increases with difficulty.

### SOURCE

GameFAQs guide FAQ 81516, Section G (battle type column) and Section H (Scratch Battle Redo card)

### UNCERTAINTIES

- Exact scratch pattern mechanics: what patterns? Speed vs accuracy weighting? [NOT FOUND — guide does not describe Scratch Battle gameplay].
- G-Power scale from minigame actions: "Never quantified. Guide says actions 'gain G-Power' but gives no per-tick/per-hit values." [VERBATIM from source, Key Uncertainties #1].

---

## 8. Minigames — Spin Battle

### ORIGINAL DS BEHAVIOUR

[NOT FOUND in guide] — Spin Battle is listed as the minigame for Gold Gate Cards (Warius, Manion, Ravenoid, Fear Ripper, Siege, Monarus, Terrorclaw, Laserman, Dragonoid, Delta Dragonoid II, Preyas, Gorem, Hammer Gorem, Tigrerra, Blade Tigrerra, Hydranoid, Dual Hydranoid, Skyress, Storm Skyress). [VERBATIM from source, G]

"Spin Battle Redo" is a Red Ability Card. [VERBATIM from source, H]

### OUR IMPLEMENTATION

[OUR DESIGN] Based on DS spin mechanic: player spins Bakugan by rotating stylus/mouse. Spin speed and duration determine G-Power gain. Normalized result: 0.0–1.0. Desktop: mouse wheel or drag-rotate. Mobile: two-finger twist or swipe.

### SOURCE

GameFAQs guide FAQ 81516, Section G (battle type column) and Section H (Spin Battle Redo card)

### UNCERTAINTIES

- Exact spin mechanics: what determines success? [NOT FOUND].
- How spin translates to G-Power: [NOT FOUND].

---

## 9. Minigames — Timing Battle

### ORIGINAL DS BEHAVIOUR

[NOT FOUND in guide] — Timing Battle is listed as the minigame for Silver Gate Cards (Fire Pit, Muddy Ground, Light-Burst, Tsunami, Dusk, High Energy, Whirlpool(a), Aquos Vortex, Heavy Surf, Elevated Field, Earthen Mound, Sand Storm, The Cliffs, Black Hole, Tornado Alley, Force Wind). [VERBATIM from source, G]

"Timing Battle Redo" is a Red Ability Card. [VERBATIM from source, H]

### OUR IMPLEMENTATION

[OUR DESIGN] Timing-based minigame: player must press button at precise moments (like rhythm game). Accuracy windows determine G-Power gain. Normalized result: 0.0–1.0. Desktop: keyboard press. Mobile: tap.

### SOURCE

GameFAQs guide FAQ 81516, Section G (battle type column) and Section H (Timing Battle Redo card)

### UNCERTAINTIES

- Exact timing mechanics: rhythm pattern? Single press? Multiple presses? [NOT FOUND].
- Timing windows: perfect/good/miss thresholds? [NOT FOUND].

---

## 10. Minigames — Pop Battle

### ORIGINAL DS BEHAVIOUR

[NOT FOUND in guide] — Pop Battle is listed as the minigame for Silver Gate Cards (The Spires, Wind Farm, Blue Sky, Vacuum, Volcanic Lake, Powder Keg, Earthen Wave, Low Energy, Sunrise, Spitting Fire, Sun Spot, Haunted Night, Pit Dweller, Nightmare, Whirlpool(b), Fields Of Lava). [VERBATIM from source, G]

"Pop Battle Redo" is a Red Ability Card. [VERBATIM from source, H]

### OUR IMPLEMENTATION

[OUR DESIGN] Timing/reaction minigame: targets appear and player must pop/tap them before they disappear. Number of successful pops determines G-Power gain. Normalized result: 0.0–1.0. Desktop: mouse click. Mobile: tap.

### SOURCE

GameFAQs guide FAQ 81516, Section G (battle type column) and Section H (Pop Battle Redo card)

### UNCERTAINTIES

- Exact pop mechanics: what pops up? How many? Time limit? [NOT FOUND].
- Pop-to-G-Power conversion: [NOT FOUND].

---

## 11. Minigames — Trace Battle

### ORIGINAL DS BEHAVIOUR

[NOT FOUND in guide] — Trace Battle is listed as the minigame for Copper Gate Cards (Lockdown, G-Power Exchange, Mega Warrior, Stand Off, Stand Your Ground, Trick Jump, Overtake, Reflexes, Power Siphon, Sand Trap, Amped, Down For The Count, Take Cover, G-Power Swap, Molten Rock, Flaming Wind). [VERBATIM from source, G]

"Trace Battle Redo" is a Red Ability Card. [VERBATIM from source, H]

### OUR IMPLEMENTATION

[OUR DESIGN] Pattern-tracing minigame: player traces a shape/path shown on screen. Accuracy determines G-Power gain. Normalized result: 0.0–1.0. Desktop: mouse drag. Mobile: finger trace.

### SOURCE

GameFAQs guide FAQ 81516, Section G (battle type column) and Section H (Trace Battle Redo card)

### UNCERTAINTIES

- Exact trace mechanics: what shapes? Speed requirement? [NOT FOUND].
- Trace accuracy scoring: [NOT FOUND].

---

## 12. Minigames — Bound Battle

### ORIGINAL DS BEHAVIOUR

[NOT FOUND in guide] — Bound Battle is listed as the minigame for Copper Gate Cards (Waist Deep, Lucky Find, Blinding Flash, Elements, Delayed Attack, Heavy Load, Clipped Wings, Wind Tunnel, Flat Out, Scuttle, Electrified, Bait and Switch, Darkus Dealings, Naga's Wrath, Heat Haze, Load Up). [VERBATIM from source, G]

"Bound Battle Redo" is a Red Ability Card. [VERBATIM from source, H]

### OUR IMPLEMENTATION

[OUR DESIGN] Bouncing/reflex minigame: objects bounce around screen and player must catch or deflect them. Success rate determines G-Power gain. Normalized result: 0.0–1.0. Desktop: mouse/keyboard. Mobile: tap/swipe.

### SOURCE

GameFAQs guide FAQ 81516, Section G (battle type column) and Section H (Bound Battle Redo card)

### UNCERTAINTIES

- Exact bound mechanics: what bounces? Catch or deflect? [NOT FOUND].
- Bound success scoring: [NOT FOUND].

---

## 13. Special Shots

### ORIGINAL DS BEHAVIOUR

Rules: [VERBATIM from source, D]
- Only Bakugan level 3+ can use Special Shot. Requires full Special Meter. Meter fills faster when losing. Activate by pressing Special button in top left when preparing to throw. In 1v1, if up 2-0 in Gate Cards, opponent can use Special Shot by third turn. Fill rate: UNKNOWN.

Per-attribute effects: [VERBATIM from source, D]
- **Pyrus Strike**: Cloaked in fiery aura, shoots like rocket. If hits opposing Bakugan while active → Critical KO, win Gate Card without fight.
- **Aquos Spiral**: Blue aura. Infinite Steering for this throw — can move around field as long as player wants before standing. AI farms power-ups with it.
- **Subterra Quake**: Brown aura with shockwave. Launches high, comes down with force. Lands on Gate Card with opposing Bakugan → Critical KO. Even without Bakugan, removes every other Bakugan from adjacent Gate Cards.
- **Ventus Storm**: Wind. Touches stood Bakugan → launched off and removed. When stands, gains greater defense (shield icon). Cannot be defeated with Critical KO. Scratches appear but author never seen it get to vulnerability.
- **Haos Lightning**: Bright light. Touches stood Bakugan → that Bakugan AND every other opposing Bakugan on field launched away and removed.
- **Darkus Critical**: Dark aura. Completely intangible — moves through other Bakugan. Disables opponent influence on angle. When stands, remains intangible → immune to Critical KOs from Pyrus Strike. Still vulnerable to Subterra Quake.

### OUR IMPLEMENTATION

Special Shot meter: fills during battle (faster when losing). At full meter + level 3+, player can activate before throw. Each attribute has unique effect matching DS behaviour. AI can use Special Shots on Hard difficulty.

### SOURCE

GameFAQs guide FAQ 81516, Section D "Special Shots"

### UNCERTAINTIES

- Special Meter fill rate: "Fills up faster when you're losing" — no numeric rate [NOT FOUND].
- "Full-by-third-turn-at-0-2" advantage rule: exact trigger [VERBATIM but ambiguous].
- Small S-Power item fill amount: UNKNOWN [VERBATIM from source, C].
- Darkus Critical "disables opponent influence on angle" — what angle? Throw angle? [NOT FOUND].

---

## 14. Power-ups

### ORIGINAL DS BEHAVIOUR

Field power-ups: [VERBATIM from source, C]
- **G-Power Boost** (yellow circles with "G"): +30 G-Power. Also increases money earned.
- **Experience Boost** (green circles with "E"): More experience after brawl. Story Mode only. Amount: UNKNOWN.
- **S-Power Boost** (grey circles with blue dot/S): Small ones increase Special Meter partially. Big ones fill completely + increase money. Small ones only in Battle Arena (replace Experience Boosts). Small fill amount: UNKNOWN.

### OUR IMPLEMENTATION

Power-ups spawn at fixed positions on field. G-Power Boost: +30 G to collecting Bakugan. Experience Boost: +20% XP for that brawl (OUR DESIGN). S-Power Boost: +25% meter (small), +100% meter (large) (OUR DESIGN). Removed after collection.

### SOURCE

GameFAQs guide FAQ 81516, Section C "Fields and Power-Ups"

### UNCERTAINTIES

- Experience Boost exact amount: UNKNOWN [VERBATIM from source].
- S-Power Boost small fill amount: UNKNOWN [VERBATIM from source].
- Power-up spawn positions: per-arena, per-difficulty placement [VERBATIM: "Each field has 3 difficulty levels affecting power-up/platform placements"].

---

## 15. Field Hazards

### ORIGINAL DS BEHAVIOUR

8 fields total: [VERBATIM from source, C]

| Field | Advantage | Disadvantage | Hazards |
|---|---|---|---|
| Arena (Standard) | none | none | "very small map without anything particularly interesting" |
| Aquos | Aquos | Pyrus | Fountains push back non-Aquos or launch up. Circular river moves non-Aquos counterclockwise. |
| Subterra | Subterra | Ventus | Biggest map. Four lanes, rest is quicksand (slows non-Subterra). Pillars impossible to reach without boosts. |
| Ventus | Ventus | Subterra | Vents blow non-Ventus up and away. Tornado picks up and flings non-Ventus randomly (path marked). |
| Pyrus | Pyrus | Aquos | Geysers repel non-Pyrus or launch up (more forceful than fountains). Lava lines: non-Pyrus lose 10 G-Power and get launched if on too long. |
| Haos | Haos | Darkus | Floating cubes suck in and launch non-Haos randomly. Warp strips teleport all Bakugan to opposite side. |
| Darkus | Darkus | Haos | Lightning rains down: non-Darkus struck lose 50 G-Power and get launched. |

Movement elements: [VERBATIM from source, C]
- **Trampolines**: Small circles with lightning circuits. Launch in facing direction.
- **Boost pads**: Small treads with circles. Shoot in facing direction along ground.

### OUR IMPLEMENTATION

Each arena has: elemental advantage (+G-Power for matching attribute), disadvantage (-G-Power for weak attribute), hazard triggers (proximity-based), trampolines, boost pads, power-up spawn points, gate card slots. Standard arena has no hazards.

### SOURCE

GameFAQs guide FAQ 81516, Section C "Fields and Power-Ups"

### UNCERTAINTIES

- Exact G-Power offset for advantage/disadvantage: "No stated number — only 'stronger in battle'/'disadvantage in battle'" [VERBATIM from source, Key Uncertainties #3].
- Hazard damage values: Pyrus lava = -10 G-Power [VERBATIM], Darkus lightning = -50 G-Power [VERBATIM]. Other hazards: launch effect only, no G-Power penalty stated.
- "Each field has 3 difficulty levels" — how do difficulty levels affect layout? [NOT FOUND].

---

## 16. Shop System

### ORIGINAL DS BEHAVIOUR

Unlock progression: [VERBATIM from source, E]
- New Bakugan and cards unlock after winning tournaments and fulfilling requirements.
- Generic Bakugan have same starting G-Power and price across all available attributes.
- Cards have no attribute restrictions.

Shop tiers (unlock order): [VERBATIM from source, E]
1. From the Start
2. After Neo Challengers Tournament
3. After Supreme Tag Team Tournament
4. After Brave Battlers Tournament
5. After Maximum Power Tournament
6. After Bakugan Master Cup Tournament
7. After Completing Story Mode
8. Available from Park Battles

Prices range from 200 (basic Silver Gate Cards) to 84,000 (Battle Ax Vladitor from Park Battles). [VERBATIM from source, E]

### OUR IMPLEMENTATION

Shop with unlock tiers tied to progression. Each tier unlocks new Bakugan, Gate Cards, and Ability Cards. Money earned from brawls. Prices match DS values. Shop UI shows available/unlocked items per tier.

### SOURCE

GameFAQs guide FAQ 81516, Section E "Shop Inventory"

### UNCERTAINTIES

- "Fulfilling requirements" beyond tournaments: what other unlock conditions exist? [NOT FOUND].
- Money earned per brawl formula: "Per Bakugan defeated bonus + power-up pickups. Total doubled if opponent never won any Gate Cards." [VERBATIM] — exact amounts not quantified.
- Ravenoid/Manion shop price listed as "0" — likely bundle bonus or guide error [VERBATIM from source, suspect data].

---

## 17. Progression

### ORIGINAL DS BEHAVIOUR

Leveling system: [VERBATIM from source, A]
- Each level increases G-Power by a certain amount. Total L1→MAX gap = 250. Per-level increment: UNKNOWN.
- Each level also allows +1 to any stat. Max stat value: 4 (based on highest printed values).

Money from brawls: [VERBATIM from source, B]
- Per Bakugan defeated bonus + power-up pickups. Total doubled if opponent never won any Gate Cards.

Story progression: [VERBATIM from source, B]
- Every opponent has Bakugan G-Power reduced by 100 in story mode. Postgame Park battles use full values.

### OUR IMPLEMENTATION

XP earned from battles (scaled by difficulty). Levels increase G-Power by fixed increment (derived from 250 gap). Each level: +1 stat point to allocate. G-Power formula: base + (level × increment). Max level determined by stat cap.

### SOURCE

GameFAQs guide FAQ 81516, Section A (leveling), Section B (money, story handicap)

### UNCERTAINTIES

- Per-level G-Power increment: UNKNOWN [VERBATIM from source].
- XP curve: how much XP per level? [NOT FOUND].
- Max level: not explicitly stated [NOT FOUND].
- Story mode opponent G-Power reduction: confirmed -100 [VERBATIM]. Exact calculation (from base? from total?) [INFERRED: from base G-Power].

---

## 18. AI Behavior

### ORIGINAL DS BEHAVIOUR

AI patterns: [VERBATIM from source, B]
- Enemy AI uses Gate Cards randomly. Always uses Bakugan in same order (left to right on status screen).

Special Shot AI: [VERBATIM from source, D]
- AI farms power-ups with Aquos Spiral (infinite steering).

Story difficulty: [VERBATIM from source, B]
- Every opponent has Bakugan G-Power reduced by 100 in story mode. Postgame Park battles use full values.

### OUR IMPLEMENTATION

3 difficulty levels: Easy (random plays, no Special Shots), Normal (some strategy, basic Special Shots), Hard (optimal plays, full Special Shots, information parity). AI uses Bakugan in fixed order. Gate Card placement: random on Easy, weighted on Normal/Hard.

### SOURCE

GameFAQs guide FAQ 81516, Section B (AI behavior) and Section D (AI Special Shot use)

### UNCERTAINTIES

- AI difficulty scaling beyond G-Power handicap: [NOT FOUND] — DS game likely has single AI level; our 3-tier system is [OUR DESIGN].
- AI Gate Card placement strategy on higher difficulties: [OUR DESIGN].
- "Always uses Bakugan in same order" — does this apply to all difficulty levels? [INFERRED: yes, based on source].

---

## 19. Field-pickup Ability Cards

### ORIGINAL DS BEHAVIOUR

12 field-pickup cards: [VERBATIM from source, C]
- All For One: Double field G-Power boosts for you
- Addition: Double field G-Power boosts for every active Bakugan
- Subtraction: Remove field G-Power boosts for every active Bakugan
- Road Trip: Move to different Gate Card on field
- Sleight of Hand: Swap landed Gate Card for another in deck
- Invulnerable: Immune to Critical KOs
- Second Chance: Negate last throw, redo
- Surprise Attack: Start battle with Bakugan standing on another Gate Card
- Trickster: Switch thrown Bakugan with another in hand
- Fill 'er Up: Fully fill Special Gauge
- Another Throw: Throw a second Bakugan that turn

Usage: [VERBATIM from source, C]
- Used after standing on Gate Card, one at a time.

Note: Only 11 listed in source — "Surprise Attack" is the 12th? Count shows 11 items. [NOT FOUND — possible source omission].

### OUR IMPLEMENTATION

Field-pickup cards appear on the arena. Collected when Bakugan passes over them. Stored in hand, played after standing on a Gate Card. Effects implemented via the effects engine.

### SOURCE

GameFAQs guide FAQ 81516, Section C "Fields and Power-Ups" (field-pickup Ability Cards)

### UNCERTAINTIES

- Exact spawn mechanics: when/where do field-pickup cards appear? [NOT FOUND].
- Whether field-pickup cards are separate from the 3 ability cards in deck: [INFERRED: yes, they are additional cards found on the field].
- Only 11 cards listed despite "12 cards" in project requirements — source may be incomplete.

---

## 20. Collection/Bakudex

### ORIGINAL DS BEHAVIOUR

[NOT FOUND] — The GameFAQs guide does not describe a "Bakudex" or collection tracking system. The guide focuses on gameplay mechanics, not collection UI.

ProfLeonDias database tracks physical toy variants (8,646 entries across 514 season/mold folders) but has no game-stat data. [VERBATIM from source, profleonidas-database.md]

### OUR IMPLEMENTATION

[OUR DESIGN] Bakudex tracks all discovered Bakugan, Gate Cards, and Ability Cards. Shows: name, attribute, stats, G-Power range, 3D model placeholder, acquisition source. Completion percentage. Unlocked entries persist across saves.

### SOURCE

No DS source for Bakudex — our design addition.

### UNCERTAINTIES

- Whether the DS game has any collection tracker: [NOT FOUND] — likely no dedicated system.
- Bakudex scope: all 38 Bakugan from guide + all 103 Gate Cards + all 97 Ability Cards.

---

## 21. Bakugan Wiki — Supplementary Findings

**Source**: Bakugan Wiki (Fandom) — multiple pages accessed 2026-09-24. See `data/raw/bakugan-wiki.md` for full raw data.

### G-Power Limits (NEW from Wiki)

- **Maximum printed G-Power outside battle**: 990 Gs [VERBATIM — wiki trivia]
- **Maximum Power Level in battle**: 2530 Gs, achieved via a Gate Card that doubles G-Power (like Waist Deep) + one of the 2 Triple Nodes; requires specific G-Power difference (opponent at 990 Gs, your Bakugan at 980 Gs) [VERBATIM — wiki trivia]
- **Field pickups** can increase G during exploration phase before battle

### Double Stand Behaviour (NEW from Wiki)

[VERBATIM] "Double Stands also now allow for the player to choose whether they want to move the Bakugan to another card or simply take the card." — This adds a strategic choice not documented in the GameFAQs guide.

### Gate Cards on Field (NEW from Wiki)

[VERBATIM] "Gate Cards can now be set at any time, as in the anime, whereas this is not allowed by the official rules of the real game." — Confirms that our implementation should allow placing Gate Cards at any time during the field phase.

### Ability Card Simplification (CONTRADICTION with GameFAQs)

[VERBATIM from Wiki] "Ability Card effects are now extremely simplified; all of them give simple G-Power boosts instead of allowing a re-roll, etc."

**CONTRADICTION**: The GameFAQs guide documents complex Ability Card effects (Swap, Time Breaker, Double Input, Redo, Skip Battle, etc.). The Wiki may be:
1. Describing a different version of the game
2. Oversimplifying for a general audience
3. Referring to the physical TCG simplification in the video game adaptation

**RESOLUTION**: We follow the GameFAQs guide as primary source, which documents 97 Ability Cards with specific effects. The Wiki's "simplified" statement is likely an oversimplification.

### Battle Type Names (DISCREPANCY)

The Wiki documents three battle types:
- **Shooting Battle** (Gold Gate Cards)
- **Timing Battle** (Silver Gate Cards)
- **Power Battle** (Copper Gate Cards)

The GameFAQs guide documents six minigame names:
- Gold: Scratch Battle, Spin Battle
- Silver: Timing Battle, Pop Battle
- Copper: Trace Battle, Bound Battle

**RESOLUTION**: The Wiki's three types likely correspond to the GameFAQs guide's six, with each tier having two variants. We follow the GameFAQs guide's naming (Scratch/Spin/ Timing/Pop/Trace/Bound) as the authoritative source.

### Bakugan Unlock Conditions (NEW from Wiki)

The Wiki provides detailed unlock conditions for all Bakugan:
- **Starter**: Leonidas (exclusive to game)
- **Park battles**: Dragonoid, Preyas, Gorem, Tigrerra, Skyress, Hydranoid
- **Evolved forms**: Delta Dragonoid, Blade Tigrerra, Hammer Gorem, Storm Skyress, Dual Hydranoid, Battle Ax Vladitor (via battle royale challenges)
- **Top brawler unlocks**: Fourtress, Sirenoid, Cycloid, Tentaclear, Harpus
- **Special**: Vladitor (Marduk hard mode), Bronze Warius (AR/code, 500 Gs), Ravenoid/Manion (Toys 'R' Us, free), White Naga (Collector's Edition, 650 Gs)

### Gate Card Art Bakugan (NEW from Wiki)

16 Bakugan appear on Gate Card art but are NOT playable: Alpha Hydranoid, Lars Lion, Oberus, Exedra, Apollonir, Clayf, Frosch, Limulus, Ultimate Dragonoid, Bee Striker, Mantris, El Condor, Tuskor, Hynoid, Wormquake, Fifth Paladin.

### Final Battle Mechanic (NEW from Wiki)

[VERBATIM] "The final battle in the first video game plays somewhat differently; players take turns placing one Gate Card at a time and only use their partner Bakugan, similar to the battles from late Season 1 onwards in the anime."

### TCG vs DS Differences (EXPLICIT from Wiki)

| Mechanic | TCG/Physical | DS Video Game |
|---|---|---|
| Rolling/throwing | Roll toward Gate Card | Manually steered; can pick up items |
| Gate Cards on field | 3 Gate Cards (one per color) | Can be set at any time |
| Battle resolution | Highest G wins | Three minigame types by Gate Card color |
| Ability Cards | Complex effects | Simplified to G-Power boosts |
| Field items | None | G-Power boosts, Hyper Ability Cards |
| Throwing into Bakugan | Not allowed | Allowed; causes G-Power loss or Critical K.O. |
| Win condition | First to 3 Gate Cards | 3 Gate Cards (standard); final = 1 at a time |

### Key Wiki Uncertainties

1. The six specific minigame names (Scratch/Spin/Timing/Pop/Trace/Bound) are NOT found on the Wiki — only three types documented
2. Exact G-Power bonuses for individual Gate Cards not documented
3. Whether Ability Cards are truly simplified or Wiki is oversimplifying
4. Exact arena controls (stylus vs D-pad) not documented
5. Progression system, shop inventory, unlock tiers beyond Bakugan not documented
