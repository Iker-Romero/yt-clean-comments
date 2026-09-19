import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import * as esbuild from 'esbuild';

import { makeIcons } from './make-icons.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const watch = args.includes('--watch');
const targetArg = args.find((arg) => arg.startsWith('--target='))?.split('=')[1];

/** Loads a TypeScript module by bundling it to a temporary ESM file first. */
async function importTs(entry) {
  const outfile = resolve(ROOT, 'dist', `.tmp-${Date.now()}.mjs`);
  await esbuild.build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    loader: { '.json': 'json' },
  });
  const module = await import(pathToFileURL(outfile).href);
  await rm(outfile, { force: true });
  return module;
}

async function buildTarget(target, { manifest, style }) {
  const outDir = resolve(ROOT, 'dist', target);
  await mkdir(outDir, { recursive: true });

  await writeFile(
    resolve(outDir, 'manifest.json'),
    `${JSON.stringify(manifest.buildManifest(target), null, 2)}\n`,
  );
  await writeFile(resolve(outDir, 'content.css'), style.buildContentCss());
  await makeIcons(resolve(outDir, 'icons'));

  const contentOptions = {
    entryPoints: [resolve(ROOT, 'src/content/index.ts')],
    outfile: resolve(outDir, 'content.js'),
    bundle: true,
    // A content script runs as a classic script: no module syntax allowed.
    format: 'iife',
    target: ['chrome110', 'firefox128'],
    minify: !watch,
    sourcemap: watch ? 'inline' : false,
    legalComments: 'none',
  };

  if (watch) {
    const context = await esbuild.context(contentOptions);
    await context.watch();
  } else {
    await esbuild.build(contentOptions);
  }

  const { build: viteBuild } = await import('vite');
  process.env.YCC_TARGET = target;
  await viteBuild({ configFile: resolve(ROOT, 'vite.config.ts'), build: { watch: watch ? {} : null } });

  console.log(`built dist/${target}`);
}

async function main() {
  await mkdir(resolve(ROOT, 'dist'), { recursive: true });
  const manifest = await importTs(resolve(ROOT, 'src/manifest.ts'));
  const style = await importTs(resolve(ROOT, 'src/content/style.ts'));

  const targets = targetArg ? [targetArg] : manifest.TARGETS;
  for (const target of targets) {
    await buildTarget(target, { manifest, style });
  }
}

await main();
