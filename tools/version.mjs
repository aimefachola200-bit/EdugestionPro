// ÉduGestion Pro — fixe la version partout : version.txt, EG.VERSION (js/schema.js), cache du service worker (sw.js).
//   node tools/version.mjs 6.33.0
import { readFileSync, writeFileSync } from 'node:fs';
const v = process.argv[2];
if (!/^[0-9]+(\.[0-9]+)*$/.test(v || '')) { console.error('usage : node tools/version.mjs X.Y.Z'); process.exit(1); }
const maj = (f, re, rep) => { const t = readFileSync(f, 'utf8'); if (!re.test(t)) throw new Error('motif absent dans ' + f); writeFileSync(f, t.replace(re, rep)); };
writeFileSync('version.txt', v + '\n');
maj('js/schema.js', /global\.EG\.VERSION = '[^']*';/, `global.EG.VERSION = '${v}';`);
maj('sw.js', /const CACHE = PREFIXE \+ '[0-9.]*';/, `const CACHE = PREFIXE + '${v}';`);
console.log('ÉduGestion Pro ' + v);
