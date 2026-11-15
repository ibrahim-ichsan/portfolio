// Content Guard (PF-06, Permutation Table C).
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const cfg = yaml.load(fs.readFileSync('content-guard.yaml', 'utf8')) || {};
const terms = (cfg.blocked_terms || []).map((t) => String(t).toLowerCase());
const patterns = (cfg.blocked_patterns || []).map((p) => new RegExp(p, 'i'));
const blockedPaths = cfg.blocked_paths || [];
const allow = cfg.allow || [];
const ROOTS = (process.env.GUARD_ROOTS || 'src,data,public,dist').split(',');
const TEXT = /\.(astro|md|ya?ml|json|html|txt|xml|css|js|mjs|ts|svg)$/i;

const problems = [];
const exceptions = [];

for (const a of allow) {
  if (!a.term || !a.reason || !String(a.reason).trim()) {
    problems.push(`content-guard.yaml: allow-list entry for "${a.term || '?'}" has no reason`);
  }
}
const allowed = (term, file) =>
  allow.some((a) => a.reason && String(a.reason).trim() && String(a.term).toLowerCase() === term && (!a.file || file.endsWith(a.file)));

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

// Map an index in the whitespace-collapsed text back to a line number in the original.
function lineOf(raw, needleRe) {
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const two = (lines[i] + ' ' + (lines[i + 1] || '')).replace(/\s+/g, ' ');
    if (needleRe.test(two)) return i + 1;
  }
  return 1;
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = file.split(path.sep).join('/');
    for (const bp of blockedPaths) {
      if (rel.includes(bp)) problems.push(`${rel}: file from blocked path "${bp}"`);
    }
    if (!TEXT.test(file)) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const flat = raw.replace(/\s+/g, ' ').toLowerCase();
    for (const t of terms) {
      const re = new RegExp(esc(t).replace(/ /g, '\\s+'), 'i');
      if (flat.includes(t)) {
        if (allowed(t, rel)) exceptions.push(`${rel}: "${t}" allowed`);
        else problems.push(`${rel}:${lineOf(raw, re)}: blocked term "${t}"`);
      }
    }
    for (const p of patterns) {
      const m = flat.match(p);
      if (m) {
        const key = m[0].toLowerCase();
        if (allowed(key, rel)) exceptions.push(`${rel}: "${key}" allowed`);
        else problems.push(`${rel}:${lineOf(raw, p)}: blocked pattern "${m[0]}"`);
      }
    }
  }
}

for (const e of exceptions) console.log(`[guard] exception: ${e}`);
if (problems.length) {
  console.error('[guard] FAILED');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log('[guard] passed.');
