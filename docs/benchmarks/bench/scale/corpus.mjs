// Plausible agent output for the benchmark scenarios. A bulk (inert) distractor that fires on any of it is dropped,
// so only the six live distractors can fire on these tasks. The command log of the earlier benchmark is added at runtime.
const CLAMPS = [
  'export function clamp(value: number, min: number, max: number): number {\n  return Math.min(Math.max(value, min), max)\n}',
  'export function clamp(value: number, min: number, max: number): number {\n  if (min > max) {\n    throw new RangeError(`min (${min}) must not be greater than max (${max})`)\n  }\n  return Math.min(Math.max(value, min), max)\n}',
  "export function clamp(value: number, min: number, max: number): number {\n  if (min > max) throw new RangeError('min must be less than or equal to max')\n  if (value < min) return min\n  if (value > max) return max\n  return value\n}",
  'export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))',
  '/**\n * Limits value to the inclusive range [min, max].\n */\nexport function clamp(value: number, min: number, max: number): number {\n  return value < min ? min : value > max ? max : value\n}',
]
const CLAMP_TESTS = [
  "test('clamp limits value to range', () => {\n  assert.equal(m.clamp(5, 0, 10), 5)\n  assert.equal(m.clamp(-1, 0, 10), 0)\n  assert.equal(m.clamp(11, 0, 10), 10)\n})",
  "test('clamp returns value when within range', () => {\n  assert.equal(m.clamp(5, 0, 10), 5)\n})\n\ntest('clamp throws when min > max', () => {\n  assert.throws(() => m.clamp(1, 10, 0), RangeError)\n})",
  "describe('clamp', () => {\n  it('returns min when value is below range', () => {\n    assert.strictEqual(m.clamp(-5, 0, 10), 0)\n  })\n})",
]
const SLUGS = [
  "export function slugify(text: string): string {\n  return text\n    .normalize('NFD')\n    .replace(/[\\u0300-\\u036f]/g, '')\n    .toLowerCase()\n    .trim()\n    .replace(/[^a-z0-9]+/g, '-')\n    .replace(/^-|-$/g, '')\n}",
  "export function slugify(text: string): string {\n  return text.normalize('NFKD').replace(/\\p{Diacritic}/gu, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')\n}",
]
const SLUG_TESTS = [
  "test('slugify strips accents', () => {\n  assert.equal(m.slugify('Crème Brûlée'), 'creme-brulee')\n})",
]
const READMES = [
  '# tidy\n\nFast, forgiving CSV cleanup: no config, no fuss.\n\n## Install\n\nnpm install -g tidy-csv\n',
  '# tidy\n\nFast, forgiving CSV cleanup, no config, no fuss.\n',
  '# tidy\n\n> Fast, forgiving CSV cleanup (no config, no fuss).\n',
  '# tidy\n\nFast, forgiving CSV cleanup. No config, no fuss.\n',
]
const SLUGIFY_JS = "export function slugify(text) {\n  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')\n}\n"

export const CORPUS = {
  files: [
    ...CLAMPS.map((text) => ({ file: 'src/math.ts', text })),
    ...CLAMP_TESTS.map((text) => ({ file: 'test/math.test.ts', text })),
    ...SLUGS.map((text) => ({ file: 'src/slug.ts', text })),
    ...SLUG_TESTS.map((text) => ({ file: 'test/slug.test.ts', text })),
    ...READMES.map((text) => ({ file: 'README.md', text })),
    { file: 'src/slugify.js', text: SLUGIFY_JS },
    { file: 'test/slugify.test.js', text: "import { slugify } from '../src/slugify.js'\nconsole.assert(slugify(' Hello World ') === 'hello-world')\n" },
    { file: 'package.json', text: '{\n  "name": "kit",\n  "type": "module",\n  "scripts": { "test": "node --test" }\n}\n' },
  ],
  commits: [
    'Add slugify helper with test\n\nLowercases, trims and joins words with dashes.',
    'Add tagline to README',
    'Add tagline under the title in README',
    'Add clamp() to math helpers',
    'Add clamp function to src/math.ts',
    'Add slugify utility with basic test\n\nConverts text to a lowercase, hyphen-separated slug.',
    'Add slugify helper and test',
  ],
  comments: [
    'Closing as stale.',
    'Closing as stale. Nothing replaces it.',
    'Closing: stale, no longer needed.',
    'Closing this stale PR; it has had no activity and nothing replaces it.',
    'Stale: no activity for a long time. Closing.',
  ],
  pr: [],
  commands: [
    'npm test', 'node --test', 'node --test test/', 'npm test 2>&1 | tail -15', 'git status --short && git diff --stat',
    'git add README.md && git commit -q -m "Add tagline to README"', 'git add src test && git commit -q -m "Add slugify helper with test"',
    'git push -u origin feature', 'git push origin feature', 'git log --oneline -3', 'git diff main...feature',
    'gh pr close 12 --comment "Closing as stale."', 'for n in 12 13 14; do gh pr close $n --comment "Closing as stale."; done',
    'gh pr list', 'gh pr view 12', 'cat src/math.ts; ls; cat package.json', 'ls -la', 'cat README.md',
  ],
}
