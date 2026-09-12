# Repository Workflow

This repository uses `develop` as its integration branch and `main` as its production branch.

## Branch flow

1. Create a short-lived branch from `develop` for each change.
2. Develop and review the change locally.
3. Open a pull request from the short-lived branch into `develop`.
4. Merge the pull request after its conversations are resolved.
5. When the integrated changes are ready for production, open a pull request from `develop` into `main`.
6. Merging into `main` triggers the Cloudflare production build and deployment.

Do not push directly to `develop` or `main`. Both branches require pull requests and block deletion and force-pushes. There are no bypass actors.

## Starting work

Before creating a working branch, update the local integration branch:

```bash
git switch develop
git pull --ff-only origin develop
git switch -c <type>/<short-description>
```

Pull requests for ordinary work target `develop`, not `main`. Use `main` only as the destination for release pull requests from `develop`.

## Local review and Cloudflare

Review changes locally with the Astro development server or a production build:

```bash
npm run dev
npm run build
```

Cloudflare Pages should use `main` as its production branch and have preview branch builds disabled. Pushes and pull requests involving `develop` or short-lived branches must not trigger Cloudflare builds. This keeps deployment builds limited to merges into `main`.
