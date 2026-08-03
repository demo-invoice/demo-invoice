#!/usr/bin/env node
/**
 * Verifies that all expected TTF font files exist in assets/fonts/.
 * Exits with code 1 if any are missing.
 * Wired into package.json as `prepare` and `verify:fonts`.
 */
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = resolve(__dirname, '..', 'assets', 'fonts');

const EXPECTED_FILES = [
  'Inter-Regular.ttf',
  'Roboto-Regular.ttf',
  'Lato-Regular.ttf',
  'OpenSans-Regular.ttf',
  'Merriweather-Regular.ttf',
  'PlayfairDisplay-Regular.ttf',
  'SourceSansPro-Regular.ttf',
];

if (!existsSync(FONTS_DIR)) {
  console.error(
    `[check-fonts] ERROR: Font directory not found: ${FONTS_DIR}\n` +
    `Create the directory and add the required TTF files.\n` +
    `See README.md § "Custom Branding — Font Setup" for instructions.`
  );
  process.exit(1);
}

const missing = EXPECTED_FILES.filter(
  (file) => !existsSync(resolve(FONTS_DIR, file))
);

if (missing.length > 0) {
  console.error('[check-fonts] ERROR: The following required TTF font files are missing:');
  for (const file of missing) {
    console.error(`  ✗  ${resolve(FONTS_DIR, file)}`);
  }
  console.error(
    '\nDownload them from https://fonts.google.com and place them in assets/fonts/.\n' +
    'See README.md § "Custom Branding — Font Setup" for exact filenames and instructions.'
  );
  process.exit(1);
}

console.log(`[check-fonts] ✓ All ${EXPECTED_FILES.length} font files present in ${FONTS_DIR}`);
