// Loads site data and applies the rules of PF-01 to PF-03 (Permutation Tables A and B).
import fs from 'node:fs';
import yaml from 'js-yaml';
import { marked } from 'marked';

const read = (p) => yaml.load(fs.readFileSync(p, 'utf8'));
const fail = (msg) => { throw new Error(`[portfolio] ${msg}`); };

export const site = read('src/data/site.yaml');
export const about = read('src/data/about.yaml');

// PF-01: a Proof Tile needs value, label and source.
export const proofTiles = (site.proof || []).filter((t) => t && t.value && t.label && t.source).slice(0, 4);

// Table B: Snapshot and sync status.
const snapshot = fs.existsSync('data/repos.json') ? JSON.parse(fs.readFileSync('data/repos.json', 'utf8')) : null;
const status = fs.existsSync('data/sync-status.json') ? JSON.parse(fs.readFileSync('data/sync-status.json', 'utf8')) : { ok: false };
export const repoDataNotice = !status.ok && snapshot ? `Repo data as of ${snapshot.fetched_at}` : '';
const repos = snapshot ? snapshot.repos : [];
const repoByName = Object.fromEntries(repos.map((r) => [r.name, r]));

const REQUIRED = ['Problem', 'Evidence'];
const BUILT = ['What I built', 'What I did'];
const ORDER = ['Problem', 'What I built', 'What I did', 'How it works', 'Evidence', 'Limits and next steps', 'Links'];

function loadCaseStudy(id) {
  const file = `src/case-studies/${id}.md`;
  if (!fs.existsSync(file)) fail(`${id}: case_study is true but ${file} does not exist`);
  const md = fs.readFileSync(file, 'utf8');
  const heads = [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  for (const h of REQUIRED) if (!heads.includes(h)) fail(`${file}: mandatory section "${h}" is missing`);
  if (!heads.some((h) => BUILT.includes(h))) fail(`${file}: mandatory section "What I built" is missing`);
  const unknown = heads.filter((h) => !ORDER.includes(h));
  if (unknown.length) fail(`${file}: unknown section "${unknown[0]}"`);
  const idx = heads.map((h) => ORDER.indexOf(h));
  if (idx.some((v, i) => i > 0 && v < idx[i - 1])) fail(`${file}: sections are out of order`);
  if (/!\[\s*\]\(/.test(md)) fail(`${file}: an image has no alt text`);
  const words = md.split(/\s+/).filter(Boolean).length;
  return { html: marked.parse(md), minutes: Math.max(1, Math.round(words / 200)) };
}

const AUTHORSHIP = {
  own: 'Written by me, AI-reviewed',
  assisted: 'AI-assisted; human review, decisions and judgement',
};

function build() {
  const curated = read('src/data/projects.yaml') || [];
  const out = [];
  const claimed = new Set();

  for (const e of curated) {
    if (!e.id) fail('projects.yaml: an entry has no id');
    if (e.repo) claimed.add(e.repo);
    if (e.hidden) continue;                                           // Table A row 4
    const repo = e.repo ? repoByName[e.repo] : null;
    if (e.repo && repos.length && !repo) fail(`projects.yaml: "${e.id}" names repo "${e.repo}", which is not a public repo`);
    if (repo && (repo.fork || repo.archived) && !e.include) continue; // row 7
    if (!e.repo && !e.case_study) fail(`projects.yaml: "${e.id}" has no repo and no case study, so it has nothing to link to`); // row 6
    const cs = e.case_study ? loadCaseStudy(e.id) : null;
    let github = '';
    if (e.repo) {
      const base = repo ? repo.html_url : `https://github.com/ibrahim-ichsan/${e.repo}`;
      github = e.repo_path ? `${base}/tree/HEAD/${e.repo_path}` : base;
    }
    out.push({
      id: e.id,
      title: e.title || (repo && repo.name) || e.id,                  // curated wins
      summary: e.summary || (repo && repo.description) || '',
      type: e.type || 'Code',
      tags: (e.tags || []).slice(0, 4),
      status: e.status || 'Active',
      language: repo ? repo.language : '',
      updated: repo ? repo.pushed_at : '',
      meta: e.meta || '',
      icon: e.icon || 'chart',
      featured_order: e.featured_order || null,
      github,
      caseStudy: cs,
      authorship: AUTHORSHIP[e.authorship] || '',
    });
  }

  // Table A row 1: public repos with no Curated Metadata.
  for (const r of repos) {
    if (claimed.has(r.name) || r.fork || r.archived) continue;
    out.push({
      id: r.name, title: r.name, summary: r.description, type: 'Code', tags: [], status: 'Active',
      language: r.language, updated: r.pushed_at, meta: '', icon: 'chart', featured_order: null,
      github: r.html_url, caseStudy: null, authorship: '',
    });
  }

  out.sort((a, b) => {
    if (a.featured_order && b.featured_order) return a.featured_order - b.featured_order;
    if (a.featured_order) return -1;
    if (b.featured_order) return 1;
    return (b.updated || '').localeCompare(a.updated || '');
  });
  return out;
}

export const projects = build();
const flagged = projects.filter((p) => p.featured_order).slice(0, 3);
// PF-01 exception 2: no Featured Project, show the three most recently pushed public repos.
export const featured = flagged.length ? flagged : projects.filter((p) => p.github).slice(0, 3);
export const caseStudies = projects.filter((p) => p.caseStudy);
export const allTags = [...new Set(projects.flatMap((p) => p.tags))].sort();
export const metaLine = (p) => [p.type, p.language, p.status].filter(Boolean).join(' · ');
