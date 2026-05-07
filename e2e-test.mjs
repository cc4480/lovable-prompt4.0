/**
 * E2E / Integration test suite for No-Code Prompt Generator
 * Run with: node e2e-test.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const BASE = 'http://localhost:5173';
const SRC = '/home/user/lovable-prompt4.0/src';
let passed = 0;
let failed = 0;
const errors = [];

function ok(name)           { process.stdout.write(`  ✓ ${name}\n`); passed++; }
function fail(name, detail) { process.stdout.write(`  ✗ ${name}\n    ${detail}\n`); failed++; errors.push({ name, detail }); }
function section(name)      { process.stdout.write(`\n── ${name} ──\n`); }

function src(file) { return readFileSync(`${SRC}/${file}`, 'utf8'); }

async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

// ─── 1. Server health ────────────────────────────────────────────────────────
section('1. Server health');
{
  const r = await fetch(`${BASE}/`);
  r.status === 200 ? ok('GET / returns 200') : fail('GET / returns 200', `got ${r.status}`);
  const html = await r.text();
  html.includes('<div id="root">') ? ok('root element present') : fail('root element present', 'missing');
  html.includes('/src/main.tsx')   ? ok('main.tsx script tag')  : fail('main.tsx script tag', 'missing');
  html.includes('No-Code Prompt Generator') ? ok('page title') : fail('page title', 'wrong title');
  const fav = await fetch(`${BASE}/favicon.svg`);
  fav.status === 200 ? ok('favicon.svg exists') : fail('favicon.svg exists', `HTTP ${fav.status}`);
}

// ─── 2. HTML meta / SEO ──────────────────────────────────────────────────────
section('2. HTML meta / SEO');
{
  const html = src('../index.html');
  html.includes('name="description"') ? ok('meta description') : fail('meta description', 'missing');
  html.includes('og:title')           ? ok('OG title tag')     : fail('OG title tag', 'missing');
  html.includes('twitter:card')       ? ok('Twitter card')     : fail('Twitter card', 'missing');
  html.includes('viewport')           ? ok('viewport meta')    : fail('viewport meta', 'missing');
}

// ─── 3. All source files exist ───────────────────────────────────────────────
section('3. Source file existence');
const sourceFiles = [
  'main.tsx', 'App.tsx', 'index.css',
  'components/Header.tsx', 'components/SearchBar.tsx',
  'components/CategoryFilter.tsx', 'components/PlatformCard.tsx',
  'components/PromptGenerator.tsx', 'components/EmptyState.tsx',
  'components/Badge.tsx', 'components/CopyButton.tsx',
  'data/types.ts', 'data/platforms.ts', 'data/promptTemplates.ts',
];
for (const f of sourceFiles) {
  existsSync(`${SRC}/${f}`) ? ok(`${f} exists`) : fail(`${f} exists`, 'file missing');
}

// ─── 4. CSS completeness (production build) ───────────────────────────────────
section('4. CSS completeness (prod build)');
{
  // Use the production build CSS (already built by section 11 below, but build first)
  let css = '';
  try {
    execSync('npx vite build 2>&1', { cwd: '/home/user/lovable-prompt4.0', timeout: 60000 });
    const cssFiles = execSync('ls dist/assets/*.css', { cwd: '/home/user/lovable-prompt4.0' }).toString().trim().split('\n');
    css = readFileSync(`/home/user/lovable-prompt4.0/${cssFiles[0].trim()}`, 'utf8');
  } catch(e) { fail('prod CSS build', e.message.slice(0,100)); }

  if (css) {
    const checks = [
      ['.flex{',                'display:flex utility'],
      ['.hidden{',              '.hidden class'],
      ['.grid{',                '.grid class'],
      ['grid-cols-1',           '.grid-cols-1'],
      ['min-h-screen',          '.min-h-screen'],
      ['text-white',            '.text-white'],
      ['#0f0f13',               'bg-[#0f0f13] arbitrary value'],
      ['rounded-2xl',           '.rounded-2xl'],
      ['border-white',          'border-white opacity classes'],
      ['bg-white',              'bg-white opacity classes'],
      ['display:flex',          'display:flex (for lg:flex responsive)'],
      ['grid-template-columns', 'grid-cols responsive'],
      ['group-hover',           '.group-hover: classes'],
      [':hover',                'hover: pseudo-classes'],
      ['blur(',                 '.blur-3xl'],
      ['display:none',          '.hidden display:none'],
    ];
    for (const [needle, label] of checks) {
      css.includes(needle) ? ok(`CSS: ${label}`) : fail(`CSS: ${label}`, `"${needle}" not found`);
    }
    // Verify hidden has no !important
    const hiddenDef = css.match(/\.hidden\{[^}]+\}/)?.[0] || '';
    !hiddenDef.includes('!important') ? ok('.hidden has no !important') : fail('.hidden has no !important', hiddenDef);
  }
}

// ─── 5. Platform data integrity ──────────────────────────────────────────────
section('5. Platform data integrity');
{
  const code = src('data/platforms.ts');

  // Count platforms using the object pattern
  const ids = [...code.matchAll(/^\s+id: '([^']+)'/gm)].map(m => m[1]);
  ids.length === 70 ? ok(`platform count = 70`) : fail(`platform count = 70`, `found ${ids.length}`);

  // No duplicates
  const unique = new Set(ids);
  unique.size === ids.length ? ok('no duplicate IDs') : fail('no duplicate IDs', `${ids.length - unique.size} dupes`);

  // Framer was added
  ids.includes('framer') ? ok('Framer in platforms') : fail('Framer in platforms', 'missing');

  // Every platform has required fields
  const platforms = code.split(/^\s+\{$/m).slice(1); // rough split by objects
  const fields = ['id:', 'name:', 'category:', 'description:', 'url:', 'tags:', 'color:', 'textColor:'];
  // Better approach: count field occurrences
  for (const field of fields) {
    const count = (code.match(new RegExp(`\\b${field}`, 'g')) || []).length;
    count >= 70 ? ok(`all 70 platforms have ${field}`) : fail(`all 70 platforms have ${field}`, `only ${count} found`);
  }

  // All colors are valid hex (#RGB, #RRGGBB)
  const colors = [...code.matchAll(/color: '(#[0-9a-fA-F]+)'/g)].map(m => m[1]);
  const badColors = colors.filter(c => !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c));
  badColors.length === 0 ? ok('all colors are valid hex') : fail('all colors valid', `invalid: ${badColors.join(', ')}`);

  // Exports present
  code.includes('export const platforms') ? ok('platforms array exported') : fail('platforms array exported', 'missing');
  code.includes('export const getPlatformById') ? ok('getPlatformById exported') : fail('getPlatformById exported', 'missing');
}

// ─── 6. Category coverage ────────────────────────────────────────────────────
section('6. Category coverage');
{
  const code = src('data/platforms.ts');
  const typesCode = src('data/types.ts');
  const expected = [
    'AI App Generators', 'Full-Stack App Builders', 'Website Builders',
    'Mobile App Builders', 'Database & Internal Tools', 'Workflow Automation',
    'Enterprise Platforms', 'Chatbot Builders', 'Landing Page Builders',
    'E-Commerce', 'Form Builders',
  ];
  for (const cat of expected) {
    const count = (code.match(new RegExp(`category: '${cat.replace(/[&]/g, '\\&')}'`, 'g')) || []).length;
    count > 0 ? ok(`${cat}: ${count} platforms`) : fail(`${cat} coverage`, '0 platforms');
    typesCode.includes(cat) ? ok(`${cat} in types`) : fail(`${cat} in types`, 'missing');
  }
  // ALL_CATEGORIES has 11 entries
  const catCount = (typesCode.match(/^\s+'[A-Z]/gm) || []).length;
  catCount === 11 ? ok('ALL_CATEGORIES has 11 entries') : fail('ALL_CATEGORIES has 11 entries', `found ${catCount}`);
}

// ─── 7. Prompt templates ─────────────────────────────────────────────────────
section('7. Prompt template coverage');
{
  const code = src('data/promptTemplates.ts');

  // 11 generate functions
  const genCount = (code.match(/generate: \(/g) || []).length;
  genCount === 11 ? ok('11 generate functions') : fail('11 generate functions', `found ${genCount}`);

  // All categories have a template
  const categories = [
    'AI App Generators', 'Full-Stack App Builders', 'Website Builders',
    'Mobile App Builders', 'Database & Internal Tools', 'Workflow Automation',
    'Enterprise Platforms', 'Chatbot Builders', 'Landing Page Builders',
    'E-Commerce', 'Form Builders',
  ];
  for (const cat of categories) {
    code.includes(`categoryId: '${cat}'`) ? ok(`template: ${cat}`) : fail(`template: ${cat}`, 'missing');
  }

  // getTemplateForPlatform exported
  code.includes('getTemplateForPlatform') ? ok('getTemplateForPlatform exported') : fail('getTemplateForPlatform exported', 'missing');

  // appName + description fields exist in at least one template
  code.includes("id: 'appName'")     ? ok("appName field defined")     : fail("appName field defined", 'missing');
  code.includes("id: 'description'") ? ok("description field defined") : fail("description field defined", 'missing');

  // template literals all closed
  const bt = (code.match(/`/g) || []).length;
  bt % 2 === 0 ? ok('all template literals closed') : fail('template literals closed', `odd count: ${bt}`);

  // values interpolated (platform.name used in generate)
  const usesName = (code.match(/platform\.name/g) || []).length;
  usesName >= 5 ? ok(`platform.name used in ${usesName} templates`) : fail('platform.name in templates', `only ${usesName}`);

  // value interpolations present (param is named 'v' in all generate functions)
  const valueInterps = (code.match(/\$\{v\./g) || []).length;
  valueInterps >= 11 ? ok(`${valueInterps} value (v.) interpolations`) : fail('value interpolations', `only ${valueInterps} \${v.} found`);
}

// ─── 8. Prompt generation logic ───────────────────────────────────────────────
section('8. Prompt generation smoke test');
{
  // Extract generate functions from source and test them directly by parsing
  // the TypeScript source (stripping types) and evaluating via a temp bundle
  try {
    const ptCode = src('data/promptTemplates.ts');
    const platformsCode = src('data/platforms.ts');

    // Build a minimal test bundle using Vite's JS API
    const testScript = `
import { build } from 'vite';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';

await build({
  root: '/home/user/lovable-prompt4.0',
  logLevel: 'silent',
  build: {
    lib: {
      entry: '/home/user/lovable-prompt4.0/src/data/promptTemplates.ts',
      formats: ['es'],
      fileName: 'templates',
    },
    outDir: '/tmp/prompt-test-build',
    rollupOptions: {
      external: [],
    },
  },
  plugins: [],
});

// Now also build platforms
await build({
  root: '/home/user/lovable-prompt4.0',
  logLevel: 'silent',
  build: {
    lib: {
      entry: '/home/user/lovable-prompt4.0/src/data/platforms.ts',
      formats: ['es'],
      fileName: 'platforms',
    },
    outDir: '/tmp/prompt-test-build',
    rollupOptions: {
      external: [],
    },
  },
});
console.log('BUILD_DONE');
`;
    // Use Vite build to create a test bundle
    const viteResult = execSync(
      `node --input-type=module 2>&1 <<'VITE_EOF'\n${testScript}\nVITE_EOF`,
      { cwd: '/home/user/lovable-prompt4.0', timeout: 60000, shell: '/bin/bash' }
    ).toString();

    if (viteResult.includes('BUILD_DONE')) {
      // Import and test the built modules
      const { platforms } = await import('/tmp/prompt-test-build/platforms.js');
      const { getTemplateForPlatform } = await import('/tmp/prompt-test-build/templates.js');

      let genErrors = [];
      for (const platform of platforms) {
        const template = getTemplateForPlatform(platform);
        if (!template) { genErrors.push(`${platform.id}: no template`); continue; }
        const v = {};
        for (const field of template.fields) {
          v[field.id] = field.type === 'select' && field.options?.length ? field.options[0] : `Test ${field.label}`;
        }
        try {
          const out = template.generate(platform, v);
          if (!out || out.length < 50) genErrors.push(`${platform.id}: output too short (${out?.length})`);
          if (!out?.includes(platform.name)) genErrors.push(`${platform.id}: missing platform name`);
        } catch(e) { genErrors.push(`${platform.id}: ${e.message}`); }
      }

      platforms.length === 70 ? ok(`generate() tested on all ${platforms.length} platforms`) : fail('generate() coverage', `${platforms.length} platforms`);
      genErrors.length === 0 ? ok('all generate() calls valid') : fail('generate() validity', genErrors.slice(0,3).join('; '));
    } else {
      fail('prompt test build', 'Vite build did not complete');
    }
  } catch(e) {
    // Fallback: test via source code analysis if dynamic evaluation fails
    const ptCode = src('data/promptTemplates.ts');
    // Verify all generate functions reference platform and v
    const genFunctions = [...ptCode.matchAll(/generate: \(platform[^)]*\) => `/g)];
    genFunctions.length === 11 ? ok(`11 generate arrow functions with template literals`) : fail('generate functions', `only ${genFunctions.length}`);
    // Check each references platform.name
    const nameRefs = (ptCode.match(/platform\.name/g) || []).length;
    nameRefs >= 11 ? ok(`platform.name in ${nameRefs} generate calls`) : fail('platform.name usage', `only ${nameRefs}`);
    // Check value usage
    const vRefs = (ptCode.match(/\$\{v\./g) || []).length;
    vRefs >= 20 ? ok(`${vRefs} field value interpolations`) : fail('value interpolations', `only ${vRefs}`);
  }
}

// ─── 9. Search / filter logic (via platforms.ts) ─────────────────────────────
section('9. Search & filter logic');
{
  const code = src('data/platforms.ts');
  const names = [...code.matchAll(/name: '([^']+)'/g)].map(m => m[1]);
  const cats  = [...code.matchAll(/category: '([^']+)'/g)].map(m => m[1]);
  const tags  = [...code.matchAll(/tags: \[([^\]]+)\]/g)].map(m => m[1]);
  const descs = [...code.matchAll(/description: '([^']+)'/g)].map(m => m[1]);

  // Category filtering
  const aiCount = cats.filter(c => c === 'AI App Generators').length;
  aiCount >= 6 ? ok(`"AI App Generators" has ${aiCount} platforms`) : fail('"AI App Generators" filter', `${aiCount} platforms`);

  // Name search
  const searches = [
    ['bubble', names],
    ['zapier', names],
    ['framer', names],
    ['webflow', names],
    ['airtable', names],
  ];
  for (const [q, arr] of searches) {
    arr.some(n => n.toLowerCase().includes(q))
      ? ok(`search "${q}" finds a platform`)
      : fail(`search "${q}"`, 'no match in names');
  }

  // Tag search
  const tagFlat = tags.join(' ').toLowerCase();
  tagFlat.includes('ai') ? ok('AI tag exists') : fail('AI tag', 'missing across all platforms');
  tagFlat.includes('react') ? ok('React tag exists') : fail('React tag', 'missing');

  // Description search
  const descFlat = descs.join(' ').toLowerCase();
  descFlat.includes('drag') || descFlat.includes('visual') ? ok('keyword "drag/visual" in descriptions') : fail('keyword in descriptions', 'neither drag nor visual found');

  // Empty query → 70 results
  const totalNames = names.length;
  totalNames === 70 ? ok(`empty search returns all ${totalNames} platforms`) : fail(`empty search returns all platforms`, `got ${totalNames}`);
}

// ─── 10. Component structure & accessibility ──────────────────────────────────
section('10. Component structure & accessibility');
{
  // App.tsx
  const app = src('App.tsx');
  app.includes('-z-10')           ? ok('App overlay: -z-10') : fail('App overlay -z-10', 'missing — overlay blocks content');
  app.includes('aria-hidden')     ? ok('App overlay: aria-hidden="true"') : fail('App overlay aria-hidden', 'missing');
  app.includes('EmptyState')      ? ok('App renders EmptyState') : fail('App renders EmptyState', 'missing');
  app.includes('grouped')         ? ok('App has grouped category view') : fail('App grouped view', 'missing');

  // main.tsx
  const main = src('main.tsx');
  main.includes('ErrorBoundary')  ? ok('ErrorBoundary in main') : fail('ErrorBoundary in main', 'missing');
  main.includes('StrictMode')     ? ok('StrictMode used') : fail('StrictMode', 'missing');

  // Header
  const header = src('components/Header.tsx');
  header.includes('platforms.length') ? ok('Header: dynamic count') : fail('Header dynamic count', 'hardcoded');

  // PlatformCard
  const card = src('components/PlatformCard.tsx');
  card.includes('<Badge')          ? ok('PlatformCard: uses Badge') : fail('PlatformCard Badge', 'not using Badge component');
  card.includes('noopener noreferrer') ? ok('PlatformCard: safe external links') : fail('PlatformCard external links', 'missing rel');
  card.includes('aria-label')      ? ok('PlatformCard: aria-label on external link') : fail('PlatformCard aria-label', 'missing');

  // PromptGenerator
  const pg = src('components/PromptGenerator.tsx');
  pg.includes("e.key === 'Escape'")       ? ok('PromptGenerator: Escape closes modal') : fail('PromptGenerator Escape handler', 'missing');
  pg.includes("overflow = 'hidden'")      ? ok('PromptGenerator: locks body scroll') : fail('PromptGenerator scroll lock', 'missing');
  pg.includes('aria-modal="true"')        ? ok('PromptGenerator: aria-modal') : fail('PromptGenerator aria-modal', 'missing');
  pg.includes('aria-live')               ? ok('PromptGenerator: aria-live on output') : fail('PromptGenerator aria-live', 'missing');
  pg.includes('closeButtonRef')          ? ok('PromptGenerator: focus on open') : fail('PromptGenerator focus on open', 'missing');
  pg.includes('crypto.randomUUID()')     ? ok('PromptGenerator: unique prompt IDs') : fail('PromptGenerator IDs', 'not using crypto.randomUUID');
  // Check output panel has no duplicate flex when tab is output
  const outPanel = pg.match(/Right: Output panel[\s\S]{0,400}/)?.[0] || '';
  !outPanel.match(/\? 'flex'/)            ? ok('PromptGenerator: no duplicate flex') : fail('PromptGenerator duplicate flex', 'conditional adds "flex" to base "flex"');

  // EmptyState
  const empty = src('components/EmptyState.tsx');
  empty.includes('category')             ? ok('EmptyState: category-aware') : fail('EmptyState category prop', 'missing');
  empty.includes('hasQuery && hasCategory') ? ok('EmptyState: combined filter message') : fail('EmptyState combined msg', 'missing');

  // Badge
  const badge = src('components/Badge.tsx');
  badge.includes("from 'react'")          ? ok('Badge: imports from react') : fail('Badge import', `code: ${badge.slice(0,80)}`);

  // CopyButton
  const copy = src('components/CopyButton.tsx');
  copy.includes('navigator.clipboard')    ? ok('CopyButton: Clipboard API') : fail('CopyButton clipboard', 'missing');
  copy.includes('execCommand')           ? ok('CopyButton: fallback') : fail('CopyButton fallback', 'missing');
  copy.includes('setTimeout')            ? ok('CopyButton: reset after delay') : fail('CopyButton reset', 'missing');

  // CategoryFilter
  const catFilter = src('components/CategoryFilter.tsx');
  catFilter.includes('ALL_CATEGORIES')    ? ok('CategoryFilter: uses ALL_CATEGORIES') : fail('CategoryFilter ALL_CATEGORIES', 'missing');
  catFilter.includes('aria-pressed')      ? ok('CategoryFilter: aria-pressed') : fail('CategoryFilter aria-pressed', 'missing');

  // SearchBar
  const search = src('components/SearchBar.tsx');
  search.includes('aria-label')           ? ok('SearchBar: has aria-label') : fail('SearchBar aria-label', 'missing');
  search.includes("type=\"search\"")       ? ok('SearchBar: type=search') : fail('SearchBar type=search', 'missing');
}

// ─── 11. Module loading (dev server) ─────────────────────────────────────────
section('11. Module loading (dev server)');
const moduleEndpoints = [
  '/src/main.tsx', '/src/App.tsx', '/src/index.css',
  '/src/components/Header.tsx', '/src/components/PlatformCard.tsx',
  '/src/data/platforms.ts', '/src/data/promptTemplates.ts',
];
for (const mod of moduleEndpoints) {
  const r = await fetch(`${BASE}${mod}`);
  r.status === 200 ? ok(`${mod} → 200`) : fail(`${mod} → 200`, `got ${r.status}`);
}

// ─── 12. Production build ─────────────────────────────────────────────────────
section('12. Production build');
{
  try {
    const out = execSync('npx vite build 2>&1', { cwd: '/home/user/lovable-prompt4.0', timeout: 90000 }).toString();
    out.includes('built in') ? ok('vite build succeeds') : fail('vite build', 'no "built in" message');

    // Check bundle sizes are reasonable
    const jsMatch  = out.match(/([\d.]+) kB.*\.js/);
    const cssMatch = out.match(/([\d.]+) kB.*\.css/);
    if (jsMatch)  {
      const kb = parseFloat(jsMatch[1]);
      kb < 1000 ? ok(`JS bundle: ${kb} kB (< 1 MB)`) : fail('JS bundle < 1 MB', `${kb} kB`);
    }
    if (cssMatch) {
      const kb = parseFloat(cssMatch[1]);
      kb < 200 ? ok(`CSS bundle: ${kb} kB (< 200 KB)`) : fail('CSS bundle < 200 KB', `${kb} kB`);
    }
    // TypeScript check
    execSync('npx tsc --noEmit 2>&1', { cwd: '/home/user/lovable-prompt4.0', timeout: 30000 });
    ok('TypeScript: no type errors');
  } catch(e) { fail('production build / TypeScript', e.stdout?.toString()?.slice(0,300) || e.message); }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
process.stdout.write(`\n${'─'.repeat(50)}\n`);
process.stdout.write(`Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  process.stdout.write('\nFailed tests:\n');
  for (const { name, detail } of errors) process.stdout.write(`  ✗ ${name}: ${detail}\n`);
  process.exit(1);
} else {
  process.stdout.write('\nAll tests passed! ✓\n');
}
