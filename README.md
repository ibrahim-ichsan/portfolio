# portfolio

Source of [www.ibrahimichsan.app](https://www.ibrahimichsan.app). A static site built with Astro.

## Run it

```
npm install
npm run dev      # local preview
npm run build    # repo sync, build, then the content guard
```

## Change the content

| To change | Edit |
| --- | --- |
| Home copy, evidence tiles, contact links, CV, photo | `src/data/site.yaml` |
| Project list, tags, featured order | `src/data/projects.yaml` |
| A case study | `src/case-studies/<id>.md` |
| About page | `src/data/about.yaml` |
| Blocked terms and paths | `content-guard.yaml` |

Add a project: one entry in `projects.yaml`. Add `case_study: true` and a Markdown file with the sections
Problem, What I built (or What I did), Evidence. Optional: How it works, Limits and next steps.

Public repos without an entry appear on their own. Forks and archived repos stay hidden unless the entry says `include: true`.

## What the build checks

- A case study with a missing mandatory section, or an image without alt text, stops the build.
- An entry with no repo and no case study stops the build.
- A blocked term, pattern or path from `content-guard.yaml` stops the build and prints the file and line.
- If GitHub cannot be reached, the build uses `data/repos.json` and the footer shows the date of that data.

## Deploy

Import this repo in Vercel (framework: Astro, build command: `npm run build`). Add the domain in the Vercel project.
Optional: set `GITHUB_TOKEN` as an environment variable to avoid GitHub rate limits, and add a Vercel deploy hook
URL as the repo secret `VERCEL_DEPLOY_HOOK` so the site rebuilds once a day.

## Authorship

This site was built with AI assistance, with human review, decisions and judgement.
