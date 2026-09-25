/**
 * model-converter.ts — Skeleton for converting 3D model formats to GLB/glTF.
 *
 * Converts OBJ/FBX/DAE files to GLB format for web use.
 * Actual conversion requires external tools (Blender CLI or gltf-pipeline).
 *
 * Priority: FBX > DAE > OBJ (FBX preserves the most data)
 */

import * as fs from 'fs';
import * as path from 'path';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface ConversionResult {
  success: boolean;
  inputPath: string;
  outputPath: string;
  format: ConversionFormat | 'UNKNOWN';
  fileSize?: number;
  error?: string;
}

export interface ConversionOptions {
  /** Target output directory (default: same as input) */
  outputDir?: string;
  /** Output filename (default: Model.glb) */
  outputName?: string;
  /** Resize textures to max dimension (default: 1024) */
  maxTextureSize?: number;
  /** Enable Draco compression (default: true) */
  dracoCompression?: boolean;
  /** Embed textures in GLB (default: true) */
  embedTextures?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Format detection                                                    */
/* ------------------------------------------------------------------ */

type ModelFormat = 'OBJ' | 'FBX' | 'DAE' | 'UNKNOWN';
type ConversionFormat = 'OBJ' | 'FBX' | 'DAE';

function detectFormat(filePath: string): ModelFormat {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.obj': return 'OBJ';
    case '.fbx': return 'FBX';
    case '.dae': return 'DAE';
    default: return 'UNKNOWN';
  }
}

/**
 * Find the best source model in a directory.
 * Priority: FBX > DAE > OBJ
 */
export function findBestSourceModel(dirPath: string): string | null {
  const priorities: ModelFormat[] = ['FBX', 'DAE', 'OBJ'];

  for (const format of priorities) {
    const ext = format.toLowerCase();
    const files = fs.readdirSync(dirPath).filter(f =>
      f.toLowerCase().endsWith(`.${ext}`)
    );
    if (files.length > 0) {
      return path.join(dirPath, files[0]);
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Blender CLI conversion (requires Blender installed)                  */
/* ------------------------------------------------------------------ */

/**
 * Convert a 3D model to GLB using Blender's headless mode.
 *
 * Requires: Blender 3.0+ installed and accessible via `blender` command.
 *
 * @example
 * ```bash
 * blender --background --python-expr "
 * import bpy
 * bpy.ops.import_scene.obj(filepath='input.obj')
 * bpy.ops.export_scene.gltf(filepath='output.glb', export_format='GLB')
 * "
 * ```
 */
export async function convertWithBlender(
  inputPath: string,
  outputPath: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  const format = detectFormat(inputPath);
  if (format === 'UNKNOWN') {
    return {
      success: false,
      inputPath,
      outputPath,
      format: 'UNKNOWN' as ModelFormat,
      error: `Unsupported format: ${path.extname(inputPath)}`,
    };
  }

  // Blender Python script for conversion
  const importCmd = (() => {
    switch (format) {
      case 'OBJ':
        return `bpy.ops.import_scene.obj(filepath='${inputPath}')`;
      case 'FBX':
        return `bpy.ops.import_scene.fbx(filepath='${inputPath}')`;
      case 'DAE':
        return `bpy.ops.wm.collada_import(filepath='${inputPath}')`;
      default:
        return '';
    }
  })();

  const script = `
import bpy
import sys

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import model
${importCmd}

# Apply modifiers
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        for mod in obj.modifiers:
            try:
                bpy.context.view_layer.objects.active = obj
                bpy.ops.object.modifier_apply(modifier=mod.name)
            except:
                pass

# Export as GLB
bpy.ops.export_scene.gltf(
    filepath='${outputPath}',
    export_format='GLB',
    export_apply=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_colors=True,
    use_selection=False,
    export_extras=True,
)
`;

  try {
    const { execSync } = await import('child_process');
    execSync(`blender --background --python-expr "${script.replace(/"/g, '\\"')}"`, {
      timeout: 60000,
      stdio: 'pipe',
    });

    const stats = fs.statSync(outputPath);
    return {
      success: true,
      inputPath,
      outputPath,
      format,
      fileSize: stats.size,
    };
  } catch (error) {
    return {
      success: false,
      inputPath,
      outputPath,
      format,
      error: `Blender conversion failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  gltf-pipeline conversion (lightweight, npm-based)                    */
/* ------------------------------------------------------------------ */

/**
 * Convert using @gltf-transform or gltf-pipeline (if installed).
 * This is a lighter alternative to Blender CLI.
 *
 * NOTE: This is a skeleton — actual implementation depends on
 * which conversion tool is installed.
 */
export async function convertWithGltfPipeline(
  inputPath: string,
  outputPath: string,
  _options: ConversionOptions = {}
): Promise<ConversionResult> {
  // TODO: Implement with gltf-pipeline or @gltf-transform/core
  // npm install --save-dev @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions
  //
  // Example with @gltf-transform:
  // import { Document, NodeIO } from '@gltf-transform/core';
  // import { dedup, resample, prune } from '@gltf-transform/functions';
  //
  // const io = new NodeIO();
  // const doc = await io.read(inputPath);
  // await doc.transform(dedup(), resample(), prune());
  // await io.write(outputPath, doc);

  return {
    success: false,
    inputPath,
    outputPath,
    format: detectFormat(inputPath),
    error: 'gltf-pipeline conversion not yet implemented. Install @gltf-transform/core.',
  };
}

/* ------------------------------------------------------------------ */
/*  Batch conversion                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convert all Bakugan models in a directory.
 * Scans for subdirectories containing model files, converts each to GLB.
 */
export async function convertAllModels(
  modelsDir: string,
  options: ConversionOptions = {}
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];

  if (!fs.existsSync(modelsDir)) {
    console.error(`Models directory not found: ${modelsDir}`);
    return results;
  }

  const entries = fs.readdirSync(modelsDir, { withFileTypes: true });
  const bakuganDirs = entries.filter(e => e.isDirectory());

  for (const dir of bakuganDirs) {
    const dirPath = path.join(modelsDir, dir.name);
    const sourceModel = findBestSourceModel(dirPath);

    if (!sourceModel) {
      results.push({
        success: false,
        inputPath: dirPath,
        outputPath: '',
        format: 'UNKNOWN',
        error: 'No supported model file found (OBJ/FBX/DAE)',
      });
      continue;
    }

    const outputName = options.outputName || 'Model.glb';
    const outputDir = options.outputDir || dirPath;
    const outputPath = path.join(outputDir, outputName);

    const result = await convertWithBlender(sourceModel, outputPath, options);
    results.push(result);

    if (result.success) {
      console.log(`✓ Converted ${dir.name}: ${result.format} → GLB (${result.fileSize} bytes)`);
    } else {
      console.error(`✗ Failed ${dir.name}: ${result.error}`);
    }
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  Texture optimization                                                */
/* ------------------------------------------------------------------ */

/**
 * Resize textures to a maximum dimension for web performance.
 * Requires sharp or jimp (npm package).
 */
export async function optimizeTexture(
  inputPath: string,
  outputPath: string,
  maxDimension: number = 1024
): Promise<boolean> {
  try {
    // TODO: Implement with sharp or jimp
    // const sharp = require('sharp');
    // await sharp(inputPath)
    //   .resize(maxDimension, maxDimension, { fit: 'inside' })
    //   .png({ quality: 80 })
    //   .toFile(outputPath);

    console.warn(`Texture optimization not yet implemented: ${inputPath}`);
    return false;
  } catch {
    return false;
  }
}
