# Repo optimization, 7-day plan

## Goal

Move One L1fe from a thoughtful early repo to a trustworthy operating repo without adding founder-killing process overhead.

## Day 1
- merge repo hygiene foundation
- merge Supabase validation workflow
- confirm README, CONTRIBUTING, and docs navigation feel right
- create GitHub Action secrets for later Supabase lint and drift checks

## Day 2
- review open docs and identify archive candidates
- move only clearly superseded docs into `docs/archive/`
- keep active planning and architecture docs easy to find

## Day 3
- define issue labels and use them consistently
- open small issues for the next 3 to 5 concrete repo and backend tasks
- keep each issue narrowly scoped

## Day 4
- verify branch workflow discipline in practice
- stop doing mixed-purpose changes on `main`
- use short-lived branches for all meaningful work

## Day 5
- add Supabase lint once secrets are configured
- decide whether schema drift detection should be activated now or after one more manual check

## Day 6
- review AI-assisted workflow quality
- tighten prompts and review habits where generated changes were too broad or too doc-heavy
- trim any duplicated or stale repo guidance

## Day 7
- reassess whether the repo now feels clearer, safer, and easier to change
- decide the next operational upgrade: branch protection, labels, or backend deploy automation

## Success criteria

By the end of the week:
- repo structure is easy to explain in 2 minutes
- `main` feels stable
- docs have clearer roles
- migrations replay cleanly from scratch
- future-you can trust what the repo says
