import { cpSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const lattice = process.env.LATTICE_SOURCE;
if (!lattice) throw new Error('Set LATTICE_SOURCE to the pinned, built Lattice checkout.');
const expected = readFileSync(join(root, 'lattice-revision.txt'), 'utf8').trim();
const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: lattice, encoding: 'utf8' });
if (revision.status !== 0 || revision.stdout.trim() !== expected) throw new Error('Lattice checkout does not match lattice-revision.txt');
const output = resolve(process.argv[2] ?? join(root, 'dist'));
if (existsSync(output)) throw new Error('Choose a new output directory; this script never deletes an existing publication.');
const stage = mkdtempSync(join(tmpdir(), 'code-fieldnotes-'));
for (const path of ['content', 'templates', 'data', 'collections.cfg']) cpSync(join(root, path), join(stage, path), { recursive: true });
function run(script, args) {
  const r = spawnSync(process.execPath, [join(lattice, script), ...args], { cwd: stage, stdio: 'inherit' });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}
run('scripts/package-search.mjs', [join(stage, 'content/static/search')]);
const cli = '_build/js/debug/build/kurisu/lattice/cmd/main/main.js';
run(cli, ['check']);
run(cli, ['build', '--strict-wikilinks', '-o', output]);
console.log(`Built code fieldnotes at ${output}`);
