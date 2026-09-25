# T17 execution evidence (td-ad2df5)

Executed 2026-09-25 by the T17 worker, authenticated as `deppfellow` via the gh CLI (OAuth token, repo scope; token piped stdin-to-secret, never echoed). Live GitHub settings actions; records in this repo. Decision trail: D-61.

## Repo rename

`gh repo rename deppfellow.github.io -R deppfellow/deppfellow-page --yes`

New name resolves:

```
$ gh repo view deppfellow/deppfellow.github.io --json nameWithOwner -q .nameWithOwner
deppfellow/deppfellow.github.io
```

Old name redirects (querying the old slug returns the new `nameWithOwner`):

```
$ gh repo view deppfellow/deppfellow-page --json nameWithOwner -q .nameWithOwner
deppfellow/deppfellow.github.io
```

Local remote (executed from a linked worktree, where `gh repo rename` does not rewrite origin; the URL was set explicitly to the renamed target):

```
$ git remote set-url origin git@github.com:deppfellow/deppfellow.github.io.git
$ git remote -v
origin  git@github.com:deppfellow/deppfellow.github.io.git (fetch)
origin  git@github.com:deppfellow/deppfellow.github.io.git (push)
```

## Pages: build from Actions

Create attempt 409s because Pages already exists (legacy branch deploy from `main` /):

```
$ gh api repos/deppfellow/deppfellow.github.io/pages -X POST -f build_type=workflow
{"message":"GitHub Pages is already enabled.","documentation_url":"https://docs.github.com/rest/pages/pages#create-a-apiname-pages-site","status":"409"}
```

Update: the ticket's PATCH was attempted first and 404s; the "Update a GitHub Pages site" endpoint takes PUT.

```
$ gh api repos/deppfellow/deppfellow.github.io/pages -X PATCH -f build_type=workflow
{"message":"Not Found","documentation_url":"https://docs.github.com/rest","status":"404"}

$ gh api repos/deppfellow/deppfellow.github.io/pages -X PUT -f build_type=workflow
HTTP 204 (empty body, success)
```

Verified state:

```
$ gh api repos/deppfellow/deppfellow.github.io/pages --jq '{status, build_type: .build_type, html_url, source}'
{"build_type":"workflow","html_url":"https://deppfellow.github.io/","source":{"branch":"main","path":"/"},"status":"built"}
```

## Dispatch secret

```
$ gh auth token | gh secret set SITE_DISPATCH_TOKEN -R deppfellow/deppfellow-wiki
(no output, exit 0)

$ gh secret list -R deppfellow/deppfellow-wiki
SITE_DISPATCH_TOKEN	2026-09-25T10:53:49Z
```

Interim-token decision (D-61): the secret holds the operator's current gh CLI token (OAuth, repo scope) because fine-grained PATs have no creation API. Replacement contract: fine-grained PAT per the wiki PR's `.github/workflows/README.md`. Rotation due 2026-12-24 (set date + 90 days).

## Live dispatch proof

`workflow_dispatch` on the feature branch is refused by the API (exact refusal):

```
$ gh workflow run notify-site.yml -R deppfellow/deppfellow-wiki --ref feat/t16-notify-site-dispatch
HTTP 404: workflow notify-site.yml not found on the default branch (https://api.github.com/repos/deppfellow/deppfellow-wiki/actions/workflows/notify-site.yml)
```

Fallback per the ticket: direct authenticated `repository_dispatch` on the site repo.

```
$ gh api repos/deppfellow/deppfellow.github.io/dispatches -X POST -f event_type=wiki-published -i
HTTP/2.0 204 No Content
```

Site side: `Build and deploy` fires on the event and succeeds.

```
$ gh run list -R deppfellow/deppfellow.github.io --workflow=build.yml --limit 2
completed	success	wiki-published	Build and deploy	main	repository_dispatch	36126486725	34s	2026-09-25T10:54:17Z
completed	failure	Site Skeleton (#24)	Build and deploy	main	push	36037444606	33s	2026-09-24T17:53:32Z

$ gh run view 36126486725 -R deppfellow/deppfellow.github.io --json event,conclusion,status,workflowName,headBranch,createdAt,url
{"branch":"main","conclusion":"success","createdAt":"2026-09-25T10:54:17Z","event":"repository_dispatch","status":"completed","workflow":"Build and deploy","url":"https://github.com/deppfellow/deppfellow.github.io/actions/runs/36126486725"}
```

Path honestly noted: this proves token + `wiki-published` event + site receiver, but not the wiki workflow's own runtime execution - `workflow_dispatch` cannot target a non-default-branch ref, so the wiki workflow's runtime proof lands on merge of `feat/t16-notify-site-dispatch` to the wiki default branch.
