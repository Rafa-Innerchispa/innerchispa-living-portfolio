#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import {
  MAX_PAYLOAD_BYTES,
  normalizeSnapshot,
  payloadSize,
  stableStringify,
} from '../src/lib/build-story-contract.js';

const root = resolve(new URL('..', import.meta.url).pathname);
const inputPath = resolve(process.argv[2] || `${root}/src/data/build-story-fallback.json`);
const outputPath = resolve(process.argv[3] || `${root}/public/data/build-story.json`);
const allowedOutput = resolve(root, 'public/data');

function fail(message) {
  process.stderr.write(`build-story: ${message}\n`);
  process.exitCode = 1;
}

try {
  if (extname(inputPath).toLowerCase() !== '.json') throw new Error('input must be a .json file');
  const outputRelative = relative(allowedOutput, outputPath);
  if (outputRelative.startsWith('..') || outputRelative === '') throw new Error('output must be a JSON file inside public/data');
  if (extname(outputPath).toLowerCase() !== '.json') throw new Error('output must use a .json extension');

  const raw = await readFile(inputPath, 'utf8');
  if (payloadSize(raw) > MAX_PAYLOAD_BYTES) throw new Error(`input exceeds ${MAX_PAYLOAD_BYTES} bytes`);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`malformed JSON: ${error.message}`);
  }
  const normalized = normalizeSnapshot(parsed);
  const output = stableStringify(normalized);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output, { encoding: 'utf8', mode: 0o644 });
  process.stdout.write(`build-story: wrote ${outputPath} (${payloadSize(output)} bytes)\n`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
