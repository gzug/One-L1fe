# Notion Workspace Structure

## Verdict

Use Notion as the **human-friendly operating layer** for One L1fe.

GitHub remains the source of truth for:
- code,
- versioned markdown documentation,
- repo history,
- architecture artifacts.

Notion should be used for:
- understandable project overview,
- navigation into the repos,
- task and question intake,
- health-related manual inputs,
- major decisions,
- condensed progress updates.

Do **not** mirror the full repos into Notion.
Link to GitHub where possible, and only summarize what helps humans orient quickly.

## Final Top-Level Structure

### 1. Project HQ
Purpose: simple overview for any human, including non-technical readers.

Contents:
- what One L1fe is,
- why the project currently starts private-first,
- why there are two repos,
- how current work is designed to avoid blocking future scale,
- current phase,
- current priorities,
- key links into GitHub and important Notion areas.

### 2. Project Structure
Purpose: understandable map of the repos, folders, and important documents.

This area should **not** duplicate markdown files.
Instead, each item should include:
- name,
- repo,
- path,
- simple explanation,
- relevance,
- direct GitHub link.

Recommended coverage:
- top-level repos,
- important root docs,
- architecture docs,
- major folders,
- key operational files.

### 3. OpenClaw Workspace & Functions
Purpose: explain how the agent workspace works for people who do not know OpenClaw.

Contents:
- what OpenClaw does in this project,
- what the workspace is,
- how GitHub, Notion, and the agent layer interact,
- what kinds of agents or roles exist,
- what they are responsible for,
- what outputs they create,
- what documentation is produced and where to find it.

This should stay human-readable, not overly technical.

### 4. Tasks, Questions & Ideas
Purpose: the shared action and thinking queue.

This should be a single database with a `Type` field rather than three separate systems.

Suggested types:
- Task
- Question
- Idea
- Review
- Follow-up

Suggested properties:
- Title
- Type
- Status
- Priority
- Area
- Related Repo
- Related Link
- Owner
- Created By
- Needs Agent Review
- Next Action
- Notes

This is the best candidate for future cron-based review or agent pickup.

### 5. Health Inputs
Purpose: one intake layer for all manual health-related input.

Do not split this into separate top-level systems unless scale forces it later.

Include:
- doctor reports,
- lab reports,
- manual notes,
- symptom/context observations,
- questions about findings,
- uploaded or transcribed information.

Suggested properties:
- Title
- Input Type
- Date
- Source
- Person
- Status
- Needs Review
- Linked Task
- Linked Recommendation
- Notes

Important: this area is not mirrored to GitHub.

### 6. Decisions
Purpose: store meaningful project decisions and why they were made.

Use this for:
- architecture decisions,
- product scope decisions,
- process decisions,
- tooling decisions,
- data-model choices.

Not for minor day-to-day choices.

Suggested properties:
- Title
- Category
- Status
- Date
- Decision
- Why
- Tradeoffs
- Related Links
- Owner

### 7. Build Log
Purpose: concise progress history.

This is where work should be summarized for humans.
It should contain:
- what changed,
- why it matters,
- what is next,
- links to the relevant GitHub commits or docs.

This should be **digest-style**, not commit-by-commit noise.

Suggested properties:
- Title
- Date
- Area
- Summary
- Why It Matters
- Next Step
- GitHub Links
- Related Decision

## What Lives in Notion vs GitHub

### Keep primarily in GitHub
- source code,
- technical markdown docs,
- architecture source docs,
- commit history,
- repo structure details,
- implementation artifacts.

### Keep primarily in Notion
- understandable summaries,
- overview pages,
- tasks/questions/ideas,
- health inputs,
- decisions,
- digest updates,
- cross-cutting navigation.

### Link instead of copy
For stable reference material:
- repo descriptions,
- folder explanations,
- key markdown files,
- architecture docs,
- operating guides.

## Sync Philosophy

Do not sync everything.

Preferred sync pattern:
- GitHub remains canonical for code and technical docs.
- Notion receives condensed updates and structured navigation.
- Human inputs can start in Notion.
- Agent work can reference, update, and close items in Notion when useful.

Good automation candidates later:
- push-to-main digest entry in Build Log,
- periodic task pickup from Tasks, Questions & Ideas,
- decision sync when a meaningful architecture or process change lands,
- project-structure refresh only occasionally, not every day.

## Recommended First Build Inside Notion

Create these first:
1. Project HQ
2. Project Structure
3. OpenClaw Workspace & Functions
4. Tasks, Questions & Ideas
5. Health Inputs
6. Decisions
7. Build Log

If we want maximum efficiency, we should create these once, then automate only the parts that are alive enough to justify it.
