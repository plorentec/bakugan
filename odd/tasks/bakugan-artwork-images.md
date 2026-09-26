# Feature: Imágenes de personajes, Bakugan y 3D

## Objective
El juego no tenía ni una sola imagen propia: los personajes se mostraban como una bola con
una inicial y los Bakugan usaban texturas UV o un SVG de esfera. Obtener arte real desde las
fuentes documentadas del proyecto y activar los modelos 3D ya descargados.

## Problem / Why
El usuario pidió: "quiero imagenes de los personajes, de los bakugan y los 3d que se puedan".

## Scope (acordado con el usuario)
- **Personajes: 10** — Historia (Dan, Marucho, Julie, Runo, Shun, Masquerade, Marduk) + Kai, Naga, Joe.
- **Bakugan: 38** — arte 2D para todo el roster.
- **3D: reales + renders** → tras la instrucción del usuario, **sin generación por IA**:
  solo modelos 3D reales (20 DS) y el arte 2D como fallback.
- NO convertir a GLB (descartado por el usuario).
- NO arte para los 27 retadores del Parque.

## Cambio de alcance (2026-09-26, decisión del usuario)
> "no generes imagenes, te he dado muchas fuentes para que obtengas imagenes de ahi"

1. **Prohibido generar imágenes con IA.** Todo sale de las fuentes documentadas
   (`data/raw/*.md`, `docs/bakugan-assets.md`).
2. Se borraron las ~48 imágenes IA generadas al inicio (decisión: "borrarlas todas").
3. Imágenes de Bakugan → **arte del Bakugan Wiki (Fandom)** ("Arte de Bakugan Wiki").
4. Los "renders 3D" por IA se descartan: no existe fuente real de render para los 19
   Bakugan sin modelo; esos se muestran con su arte 2D (badge `2D` en la galería).

## Constraints
- Identidad de cada imagen verificable por el nombre del archivo de origen.
- Fallback obligatorio (URL explícita → arte wiki → textura del modelo → esfera SVG).
- Arte de terceros = solo uso interno/no comercial, con atribución en el manifiesto.

## Tasks

- [x] T1. Imágenes de personajes → `public/assets/images/characters/` — **9/10**
      (Kai sin imagen: no existe su página en el wiki ni está en DS/Wii Models Resource)
- [x] T2. Arte de Bakugan → `public/assets/images/bakugan/` — **38/38**
- [x] T3. ~~Renders 3D por IA~~ — **CANCELADO** por decisión del usuario (sin IA)
- [x] T4. Modelos 3D reales: 19/38 resueltos (17 exactos + alias `Delta Dragonoid II`,
      `Preyas II`); verificados con typecheck/build y servidos en runtime
- [x] T5. Cableado: `BakuganImage`, `BakuganViewer`, página de Historia (retratos),
      página de Modelos (badge `3D`/`2D`), alias en `model-paths.ts`
- [x] T6. `npm run typecheck` ✅ + `npm run build` ✅ (11/11 páginas estáticas)
      + smoke test `npm start`: `/story` 200 con los 7 retratos, imágenes 200 `image/webp`

## Acceptance criteria
- Las imágenes existen en `public/assets/images/` y se referencian por manifiesto estable. ✅
- Historia muestra retratos en lugar de la inicial. ✅
- Modelos 3D: 19 con modelo real en 3D; los 19 restantes muestran arte 2D. ✅
- `npm run typecheck` y `npm run build` pasan. ✅
- Ninguna imagen generada por IA permanece en el repo. ✅

## Progress
- [x] Exploración del proyecto (estado actual de imágenes/3D/personajes)
- [x] Alcance confirmado con el usuario
- [x] Descarga desde fuentes + verificación de identidad
- [x] Cableado de componentes
- [x] Verificación funcional

## Open items
- **Kai** (retador del Parque): sin fuente de imagen → usa el fallback de inicial.
  Opciones si se quiere: añadir otra fuente autorizada por el usuario, o dejar el fallback.

## Next step
Ninguno pendiente. Posibles mejoras futuras: retratos de los 27 retadores del Parque,
modelos DS de los 18 Bakugan restantes si aparecen en otra fuente.
