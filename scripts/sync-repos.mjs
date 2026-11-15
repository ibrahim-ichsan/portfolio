// Repo Sync (PF-02, Permutation Table B).
// Reads public repos from GitHub and stores them as the Snapshot in data/repos.json.
// If GitHub cannot be reached, the existing Snapshot is kept and the build continues.
import fs from 'node:fs';

const OWNER = 'ibrahim-ichsan';
const SNAPSHOT = 'data/repos.json';
const STATUS = 'data/sync-status.json';
const SELF = 'portfolio'; // the site's own repo is not a project

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function main() {
  try {
    const res = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&type=owner&sort=pushed`, { headers });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const all = await res.json();
    const repos = all
      .filter((r) => !r.private && r.name !== SELF)
      .map((r) => ({
        name: r.name,
        description: r.description || '',
        language: r.language || '',
        pushed_at: (r.pushed_at || '').slice(0, 10),
        html_url: r.html_url,
        fork: !!r.fork,
        archived: !!r.archived,
      }));
    fs.writeFileSync(SNAPSHOT, JSON.stringify({ fetched_at: new Date().toISOString().slice(0, 10), repos }, null, 2) + '\n');
    fs.writeFileSync(STATUS, JSON.stringify({ ok: true }));
    console.log(`[sync] ${repos.length} public repos read from GitHub.`);
  } catch (err) {
    fs.writeFileSync(STATUS, JSON.stringify({ ok: false, reason: String(err.message || err) }));
    if (fs.existsSync(SNAPSHOT)) {
      console.warn(`[sync] GitHub not reachable (${err.message}). Building from the Snapshot.`);
    } else {
      console.warn(`[sync] WARNING: GitHub not reachable and no Snapshot exists. Building from Curated Metadata only.`);
    }
  }
}
await main();
