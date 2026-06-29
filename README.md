# ContextHub MVP

ContextHub is a local-first desktop app for managing AI coding work by **problem context**, not just repositories.

It helps you group the things needed to resume a task:

- Workspaces
- Problems / tasks
- Linked local repositories
- Important files
- Commands
- Notes, decisions, issues, todos
- Generated AI context markdown
- External tool launchers for VSCode, Claude Code, opencode, and terminal

## Tech Stack

- Electron
- React
- TypeScript
- Vite
- SQLite via better-sqlite3

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Main Features

- Create workspace
- Create problem/task
- Link local repo paths
- Register important files
- Add commands
- Execute commands
- Open VSCode / Claude Code / opencode from a selected repo path
- Add notes / decisions / issues / todos
- Generate `context.md`
- Copy AI context to clipboard

## Local Storage

By default, the app stores data under Electron's userData directory:

```text
<userData>/contexthub.db
<userData>/workspaces/<workspace-id>/problems/<problem-id>/context.md
<userData>/logs/<problem-id>/<run-id>.stdout.log
```

## Notes

This is an MVP scaffold. It intentionally avoids cloud sync, Jira integration, GitHub/GitLab integration, and embedded terminal complexity for the first version.

The first goal is to validate whether problem-centered context management feels useful during real AI coding workflows.
