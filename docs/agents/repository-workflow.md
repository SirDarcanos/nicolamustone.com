# Repository Workflow

This repository uses `develop` as its integration branch and `main` as its production branch.

## Branch flow

1. Update `develop`, then make and review ordinary changes there or on a short-lived branch.
2. Push reviewed changes directly to `develop`, or use a pull request when the change benefits from a review conversation.
3. When the integrated changes are ready for production, open a pull request from `develop` into `main`.
4. Merge the pull request after its conversations are resolved.
5. Merging into `main` triggers the Cloudflare production build and deployment.

`develop` accepts fast-forward pushes while blocking deletion and force-pushes. `main` requires pull requests and blocks deletion and force-pushes. There are no bypass actors.

## Starting work

Update the local integration branch before starting work:

```bash
git switch develop
git pull --ff-only origin develop
```

Work directly on `develop` for ordinary changes that have been reviewed locally. Create a short-lived branch when a pull-request conversation or isolated work is useful:

```bash
git switch -c <type>/<short-description>
```

Push direct work to `develop`, or target `develop` from an optional working-branch pull request. Use `main` only as the destination for release pull requests from `develop`.

## Local review and Cloudflare

Review changes locally with the Astro development server or a production build:

```bash
npm run dev
npm run build
```

Cloudflare Pages should use `main` as its production branch and have preview branch builds disabled. Pushes and pull requests involving `develop` or short-lived branches must not trigger Cloudflare builds. This keeps deployment builds limited to merges into `main`.
