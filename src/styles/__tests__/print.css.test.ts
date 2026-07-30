/**
 * T14 — Print stylesheet test suite
 *
 * Strategy: Because print.css is a pure CSS file with no JS logic, we parse
 * its raw text content and assert that every required rule is present and
 * correctly scoped inside @media print. This is the only reliable way to
 * unit-test a CSS file without a full browser environment.
 *
 * We deliberately avoid snapshot tests so that cosmetic comment changes do
 * not break CI.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let css: string;

beforeAll(() => {
  css = readFileSync(resolve(__dirname, '../print.css'), 'utf-8');
});

// ---------------------------------------------------------------------------
// Helper: extract the content that lives inside @media print { … }
// Handles nested braces (e.g. @page inside @media print).
// ---------------------------------------------------------------------------
function extractMediaPrintBlock(source: string): string {
  const start = source.indexOf('@media print');
  if (start === -1) return '';
  let depth = 0;
  let i = source.indexOf('{', start);
  const blockStart = i;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(blockStart + 1, i);
    }
  }
  return '';
}

describe('print.css — file structure', () => {
  it('contains exactly one @media print block', () => {
    const matches = css.match(/@media print/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });

  it('has no rules outside the @media print block (no screen bleed)', () => {
    // Everything before the @media print declaration should be only
    // whitespace and comments — no bare selectors.
    const beforeMediaPrint = css.slice(0, css.indexOf('@media print')).trim();
    // Strip block comments
    const stripped = beforeMediaPrint.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    // After removing comments there should be nothing left
    expect(stripped).toBe('');
  });
});

describe('print.css — @page rule', () => {
  it('defines @page inside @media print', () => {
    const block = extractMediaPrintBlock(css);
    expect(block).toContain('@page');
  });

  it('sets margin to 1cm inside @page', () => {
    const block = extractMediaPrintBlock(css);
    // Locate the @page sub-block
    const pageStart = block.indexOf('@page');
    expect(pageStart).toBeGreaterThan(-1);
    const pageBlock = block.slice(pageStart, block.indexOf('}', pageStart) + 1);
    expect(pageBlock).toContain('margin: 1cm');
  });

  it('sets size to A4 inside @page', () => {
    const block = extractMediaPrintBlock(css);
    const pageStart = block.indexOf('@page');
    const pageBlock = block.slice(pageStart, block.indexOf('}', pageStart) + 1);
    expect(pageBlock).toContain('size: A4');
  });
});

describe('print.css — UI chrome hidden via display: none', () => {
  let block: string;

  beforeAll(() => {
    block = extractMediaPrintBlock(css);
  });

  it('hides <header> with display: none !important', () => {
    expect(block).toMatch(/header[^{]*\{[^}]*display\s*:\s*none\s*!important/s);
  });

  it('hides <nav> with display: none !important', () => {
    expect(block).toMatch(/nav[^{]*\{[^}]*display\s*:\s*none\s*!important/s);
  });

  it('hides .app-header with display: none !important', () => {
    expect(block).toContain('.app-header');
    expect(block).toMatch(/\.app-header[^{]*\{[^}]*display\s*:\s*none\s*!important/s);
  });

  it('hides .invoice-form with display: none !important', () => {
    expect(block).toContain('.invoice-form');
    expect(block).toMatch(/\.invoice-form[^{]*\{[^}]*display\s*:\s*none\s*!important/s);
  });

  it('hides button elements with display: none !important', () => {
    expect(block).toMatch(/button[^{]*\{[^}]*display\s*:\s*none\s*!important/s);
  });

  it('hides .btn with display: none !important', () => {
    expect(block).toContain('.btn');
    expect(block).toMatch(/\.btn[^{]*\{[^}]*display\s*:\s*none\s*!important/s);
  });

  it('hides .no-print with display: none !important', () => {
    expect(block).toContain('.no-print');
    expect(block).toMatch(/\.no-print[^{]*\{[^}]*display\s*:\s*none\s*!important/s);
  });
});

describe('print.css — .invoice-preview panel rules', () => {
  let block: string;

  beforeAll(() => {
    block = extractMediaPrintBlock(css);
  });

  it('targets .invoice-preview selector', () => {
    expect(block).toContain('.invoice-preview');
  });

  it('sets box-shadow: none !important on .invoice-preview', () => {
    // Match the direct .invoice-preview rule (not the wildcard descendant)
    // by finding the block that starts with `.invoice-preview {`
    const directRuleMatch = block.match(/\.invoice-preview\s*\{([^}]*)\}/s);
    expect(directRuleMatch).not.toBeNull();
    expect(directRuleMatch![1]).toContain('box-shadow: none !important');
  });

  it('sets width: 100% !important on .invoice-preview', () => {
    const directRuleMatch = block.match(/\.invoice-preview\s*\{([^}]*)\}/s);
    expect(directRuleMatch).not.toBeNull();
    expect(directRuleMatch![1]).toContain('width: 100% !important');
  });

  it('sets max-width: 100% !important on .invoice-preview', () => {
    const directRuleMatch = block.match(/\.invoice-preview\s*\{([^}]*)\}/s);
    expect(directRuleMatch).not.toBeNull();
    expect(directRuleMatch![1]).toContain('max-width: 100% !important');
  });

  it('sets border: none !important on .invoice-preview', () => {
    const directRuleMatch = block.match(/\.invoice-preview\s*\{([^}]*)\}/s);
    expect(directRuleMatch).not.toBeNull();
    expect(directRuleMatch![1]).toContain('border: none !important');
  });

  it('includes -webkit-print-color-adjust: exact on .invoice-preview', () => {
    const directRuleMatch = block.match(/\.invoice-preview\s*\{([^}]*)\}/s);
    expect(directRuleMatch).not.toBeNull();
    expect(directRuleMatch![1]).toContain('-webkit-print-color-adjust: exact');
  });

  it('includes print-color-adjust: exact on .invoice-preview', () => {
    const directRuleMatch = block.match(/\.invoice-preview\s*\{([^}]*)\}/s);
    expect(directRuleMatch).not.toBeNull();
    expect(directRuleMatch![1]).toContain('print-color-adjust: exact');
  });

  it('sets box-shadow: none !important on .invoice-preview * (descendant catch-all)', () => {
    expect(block).toContain('.invoice-preview *');
    const wildcardMatch = block.match(/\.invoice-preview\s*\*\s*\{([^}]*)\}/s);
    expect(wildcardMatch).not.toBeNull();
    expect(wildcardMatch![1]).toContain('box-shadow: none !important');
  });
});

describe('print.css — line-items table page-break rules', () => {
  let block: string;

  beforeAll(() => {
    block = extractMediaPrintBlock(css);
  });

  it('applies page-break-inside: avoid to .invoice-preview tr', () => {
    const trMatch = block.match(/\.invoice-preview\s+tr\s*\{([^}]*)\}/s);
    expect(trMatch).not.toBeNull();
    expect(trMatch![1]).toContain('page-break-inside: avoid');
  });

  it('applies break-inside: avoid to .invoice-preview tr', () => {
    const trMatch = block.match(/\.invoice-preview\s+tr\s*\{([^}]*)\}/s);
    expect(trMatch).not.toBeNull();
    expect(trMatch![1]).toContain('break-inside: avoid');
  });

  it('applies page-break-inside: avoid to .invoice-preview td', () => {
    const tdMatch = block.match(/\.invoice-preview\s+td\s*\{([^}]*)\}/s);
    expect(tdMatch).not.toBeNull();
    expect(tdMatch![1]).toContain('page-break-inside: avoid');
  });

  it('applies break-inside: avoid to .invoice-preview td', () => {
    const tdMatch = block.match(/\.invoice-preview\s+td\s*\{([^}]*)\}/s);
    expect(tdMatch).not.toBeNull();
    expect(tdMatch![1]).toContain('break-inside: avoid');
  });
});

describe('print.css — multi-page table header/footer groups', () => {
  let block: string;

  beforeAll(() => {
    block = extractMediaPrintBlock(css);
  });

  it('sets .invoice-preview thead to display: table-header-group', () => {
    const theadMatch = block.match(/\.invoice-preview\s+thead\s*\{([^}]*)\}/s);
    expect(theadMatch).not.toBeNull();
    expect(theadMatch![1]).toContain('display: table-header-group');
  });

  it('sets .invoice-preview tfoot to display: table-footer-group', () => {
    const tfootMatch = block.match(/\.invoice-preview\s+tfoot\s*\{([^}]*)\}/s);
    expect(tfootMatch).not.toBeNull();
    expect(tfootMatch![1]).toContain('display: table-footer-group');
  });
});
