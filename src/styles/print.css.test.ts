/**
 * print.css.test.ts
 *
 * Reads print.css from disk and asserts that the @media print block
 * contains the expected rules. Uses a brace-depth–tracking helper so
 * that nested blocks (e.g. @page { margin: 1cm; }) do NOT cause
 * premature termination of the extracted block.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect, beforeAll } from 'vitest';

// ---------------------------------------------------------------------------
// Resolve the CSS file path relative to this test file
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CSS_PATH = resolve(__dirname, 'print.css');

// ---------------------------------------------------------------------------
// Helper — extract the full content of the @media print { … } block
// ---------------------------------------------------------------------------

/**
 * Extracts the inner content of the first `@media print { … }` block found
 * in `css`, using brace-depth tracking so that nested blocks (e.g.
 * `@page { margin: 1cm; }`) do not cause premature termination.
 *
 * @param css - Full CSS source string.
 * @returns The text inside the outermost `@media print { … }` braces,
 *          or an empty string if no such block is found.
 */
export function extractMediaPrintBlock(css: string): string {
  const marker = '@media print';
  const markerIndex = css.indexOf(marker);
  if (markerIndex === -1) {
    return '';
  }

  // Advance past the marker to find the opening '{' of @media print
  let i = markerIndex + marker.length;
  while (i < css.length && css[i] !== '{') {
    i++;
  }
  if (i >= css.length) {
    // No opening brace found
    return '';
  }

  // i is now pointing at the opening '{' of @media print
  // Start capturing AFTER this brace; depth begins at 1
  i++; // move past the opening '{'
  let depth = 1;
  let block = '';

  while (i < css.length && depth > 0) {
    const ch = css[i];
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        // This is the closing '}' of @media print — stop, don't include it
        break;
      }
    }
    block += ch;
    i++;
  }

  return block;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

let cssSource: string;
let mediaPrintBlock: string;

beforeAll(() => {
  cssSource = readFileSync(CSS_PATH, 'utf-8');
  mediaPrintBlock = extractMediaPrintBlock(cssSource);
});

describe('print.css — @media print block exists', () => {
  it('contains an @media print block', () => {
    expect(cssSource).toContain('@media print');
  });

  it('extractMediaPrintBlock returns a non-empty string', () => {
    expect(mediaPrintBlock.length).toBeGreaterThan(0);
  });

  it('extractMediaPrintBlock handles nested @page block without premature termination', () => {
    // The block must contain @page content AND rules that come AFTER @page
    expect(mediaPrintBlock).toContain('@page');
    // Rules after @page must also be present (proves no premature termination)
    expect(mediaPrintBlock).toContain('.invoice-preview');
  });
});

describe('print.css — UI chrome hiding', () => {
  it('hides <header> elements', () => {
    expect(mediaPrintBlock).toMatch(/\bheader\b/);
  });

  it('hides <nav> elements', () => {
    expect(mediaPrintBlock).toMatch(/\bnav\b/);
  });

  it('hides <form> elements', () => {
    expect(mediaPrintBlock).toMatch(/\bform\b/);
  });

  it('hides <button> elements', () => {
    expect(mediaPrintBlock).toMatch(/\bbutton\b/);
  });

  it('hides .no-print elements', () => {
    expect(mediaPrintBlock).toContain('.no-print');
  });

  it('uses body > *:not(.invoice-preview) to hide unlisted wrappers', () => {
    expect(mediaPrintBlock).toContain('body > *:not(.invoice-preview)');
  });

  it('applies display: none !important to chrome selectors', () => {
    expect(mediaPrintBlock).toContain('display: none !important');
  });
});

describe('print.css — .invoice-preview panel rules', () => {
  it('removes box-shadow on .invoice-preview', () => {
    expect(mediaPrintBlock).toContain('.invoice-preview');
    expect(mediaPrintBlock).toContain('box-shadow: none !important');
  });
});

describe('print.css — page-break rules on tr', () => {
  it('sets page-break-inside: avoid on tr (legacy browsers)', () => {
    expect(mediaPrintBlock).toContain('page-break-inside: avoid');
  });

  it('sets break-inside: avoid on tr (modern standard)', () => {
    expect(mediaPrintBlock).toContain('break-inside: avoid');
  });

  it('applies both page-break rules inside a tr selector block', () => {
    // Extract the tr { … } block from within @media print
    const trMatch = mediaPrintBlock.match(/\btr\s*\{([^}]*)\}/);
    expect(trMatch).not.toBeNull();
    const trBlock = trMatch![1];
    expect(trBlock).toContain('page-break-inside: avoid');
    expect(trBlock).toContain('break-inside: avoid');
  });
});

describe('print.css — thead and tfoot rules', () => {
  it('sets thead to display: table-header-group', () => {
    expect(mediaPrintBlock).toContain('display: table-header-group');
  });

  it('sets tfoot to display: table-footer-group', () => {
    expect(mediaPrintBlock).toContain('display: table-footer-group');
  });

  it('applies table-header-group inside a thead selector block', () => {
    const theadMatch = mediaPrintBlock.match(/\bthead\s*\{([^}]*)\}/);
    expect(theadMatch).not.toBeNull();
    expect(theadMatch![1]).toContain('table-header-group');
  });

  it('applies table-footer-group inside a tfoot selector block', () => {
    const tfootMatch = mediaPrintBlock.match(/\btfoot\s*\{([^}]*)\}/);
    expect(tfootMatch).not.toBeNull();
    expect(tfootMatch![1]).toContain('table-footer-group');
  });
});

describe('print.css — @page margin', () => {
  it('defines @page with margin: 1cm', () => {
    expect(mediaPrintBlock).toContain('@page');
    expect(mediaPrintBlock).toContain('margin: 1cm');
  });
});
