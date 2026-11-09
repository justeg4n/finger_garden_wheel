import { mkdir, cp, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const out = new URL('dist/', root);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'art.js', 'game.js', 'assets']) {
  await cp(new URL(file, root), new URL(file, out), { recursive: true });
}
console.log('Built static website → dist/');
