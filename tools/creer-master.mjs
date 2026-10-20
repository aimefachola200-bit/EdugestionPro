// ÉduGestion Pro — fabrique la variante « ÉduGestion Pro Master » (bleue) à partir de cette source (verte).
//   node tools/creer-master.mjs <dossier de destination> [dossier source]
// Une seule source pour les deux applications : tout ce qui change d'une version à l'autre (écrans,
// documents, calculs, espace CP intégré, appareil photo, cachets…) n'est écrit qu'une fois.
// La variante Master a son nom, sa couleur, ses icônes, son cache hors ligne et — là où les deux
// applications sont servies à la même adresse (github.io) — sa propre base locale.
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, extname, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

const ici = dirname(new URL(import.meta.url).pathname);
const [dest, srcArg] = process.argv.slice(2);
if (!dest) { console.error('Usage : node tools/creer-master.mjs <destination> [source]'); process.exit(1); }
const src = srcArg || join(ici, '..'), M = join(ici, 'master');
const GARDER = new Set(['.git', '.gitignore']);   // ce que la destination garde à elle
const SAUTER = new Set(['.git', 'tools', 'node_modules', '.github']);

if (existsSync(dest)) for (const n of readdirSync(dest)) if (!GARDER.has(n) && !n.endsWith('.zip')) rmSync(join(dest, n), { recursive: true, force: true });
(function copier(s, d, racine) {
  mkdirSync(d, { recursive: true });
  for (const n of readdirSync(s)) {
    if (racine && (SAUTER.has(n) || n.endsWith('.zip'))) continue;
    const a = join(s, n), b = join(d, n);
    statSync(a).isDirectory() ? copier(a, b, false) : copyFileSync(a, b);
  }
})(src, dest, true);

/* ---- textes ---- */
const TEXTE = new Set(['.js', '.html', '.webmanifest', '.css', '.md', '.txt']);
function fichiers(d, acc = []) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) { if (!['memp-cp', 'donnees', 'icons', 'assets'].includes(n)) fichiers(p, acc); }
    else if (TEXTE.has(extname(n))) acc.push(p);
  }
  return acc;
}
for (const f of fichiers(dest)) {
  let t = readFileSync(f, 'utf8');
  const avant = t;
  t = t.replace(/ÉduGestion Pro(?! Master)/g, 'ÉduGestion Pro Master')
    .replace('Ce fichier n’est pas une sauvegarde ÉduGestion Pro Master', 'Ce fichier n’est pas une sauvegarde ÉduGestion Pro / ÉduGestion Pro Master');
  if (f.endsWith('index.html')) t = t.replace('<meta name="theme-color" content="#008751">', '<meta name="theme-color" content="#1256A0">')
    .replace('<meta name="apple-mobile-web-app-title" content="ÉduGestion">', '<meta name="apple-mobile-web-app-title" content="ÉduGestion Master">');
  if (f.endsWith('manifest.webmanifest')) t = t.replace('"short_name": "ÉduGestion"', '"short_name": "ÉduGestion Master"').replace('"theme_color": "#008751"', '"theme_color": "#1256A0"');
  if (f.endsWith(join('js', 'db.js'))) t = t.replace("const DB_NAME = 'edugestion_pro';",
    "/* Variante Master : sur github.io, où ÉduGestion Pro est servie à la même adresse, une base à elle ; ailleurs la base\n     d'origine (les données déjà saisies sur l'adresse de la Master restent en place). */\n  const DB_NAME = (global.location && /github\\.io$/.test(location.hostname)) ? 'edugestion_pro_master' : 'edugestion_pro';");
  if (f.endsWith('sw.js')) t = t.replace("const PREFIXE = 'edugestion-v';", "const PREFIXE = 'edugestion-master-v';");
  if (f.endsWith(join('css', 'app.css'))) t = t.replace(/  background:\n    linear-gradient\(to bottom, var\(--jaune\) 0 50%, var\(--rouge\) 50% 100%\) right \/ 58% 100% no-repeat,\n    var\(--primaire\);/,
    '  background: url(../icons/icon-192.png) center / cover no-repeat;');
  if (t !== avant) writeFileSync(f, t);
}
for (const n of ['LISEZ-MOI-PUBLIER.txt', 'publier-surge.bat', '.surgeignore']) if (existsSync(join(M, n))) copyFileSync(join(M, n), join(dest, n));
(function icones(s, d) { for (const n of readdirSync(s)) copyFileSync(join(s, n), join(d, n)); })(join(M, 'icons'), join(dest, 'icons'));

/* ---- espace CP intégré : sa propre base, la base de la Master, son propre cache ---- */
const cp = join(dest, 'memp-cp');
if (existsSync(cp)) {
  const cfg = join(cp, 'js', 'config.js');
  let c = readFileSync(cfg, 'utf8');
  c = c.replace(/"id": "edugestion"/, '"id": "edugestion-master"').replace(/"base": "edugestion-memp-cp"/, '"base": "edugestion-master-memp-cp"')
    .replace(/"bases": \[\s*"edugestion_pro"\s*\]/, '"bases": [\n      "edugestion_pro_master",\n      "edugestion_pro"\n    ]')
    .replace(/ÉduGestion Pro(?! Master)/g, 'ÉduGestion Pro Master');
  writeFileSync(cfg, c);
  const man = join(cp, 'manifest.webmanifest');
  if (existsSync(man)) writeFileSync(man, readFileSync(man, 'utf8').replace(/ÉduGestion Pro(?! Master)/g, 'ÉduGestion Pro Master'));
  // empreinte de publication du service worker de l'espace CP (même calcul que tools/gen-assets.mjs de MEMP-CP)
  const liste = [];
  (function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (n === 'sw-assets.json') continue; statSync(p).isDirectory() ? walk(p) : liste.push(relative(cp, p).split(sep).join('/')); } })(cp);
  liste.sort();
  const h = createHash('sha256'), RE = /^const BUILD = '[^']*';$/m;
  for (const f of liste) { h.update(f); const b = readFileSync(join(cp, f)); h.update(f === 'sw.js' ? b.toString('utf8').replace(RE, "const BUILD = '';") : b); }
  const v = h.digest('hex').slice(0, 12), sw = join(cp, 'sw.js');
  writeFileSync(sw, readFileSync(sw, 'utf8').replace(RE, `const BUILD = '${v}';`));
  writeFileSync(join(cp, 'sw-assets.json'), JSON.stringify({ version: v, files: ['./', ...liste] }, null, 1));
}
console.log('ÉduGestion Pro Master prête dans ' + dest);
