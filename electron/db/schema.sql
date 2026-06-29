CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  root_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  priority TEXT DEFAULT 'normal',
  summary TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS repos (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  local_path TEXT NOT NULL,
  remote_url TEXT,
  default_branch TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS problem_repos (
  problem_id TEXT NOT NULL,
  repo_id TEXT NOT NULL,
  role TEXT,
  PRIMARY KEY (problem_id, repo_id),
  FOREIGN KEY (problem_id) REFERENCES problems(id),
  FOREIGN KEY (repo_id) REFERENCES repos(id)
);

CREATE TABLE IF NOT EXISTS problem_files (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL,
  repo_id TEXT,
  file_path TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (problem_id) REFERENCES problems(id),
  FOREIGN KEY (repo_id) REFERENCES repos(id)
);

CREATE TABLE IF NOT EXISTS commands (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL,
  name TEXT NOT NULL,
  command TEXT NOT NULL,
  cwd TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE IF NOT EXISTS command_runs (
  id TEXT PRIMARY KEY,
  command_id TEXT,
  problem_id TEXT NOT NULL,
  command TEXT NOT NULL,
  cwd TEXT,
  exit_code INTEGER,
  stdout_path TEXT,
  stderr_path TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  FOREIGN KEY (command_id) REFERENCES commands(id),
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE IF NOT EXISTS agent_sessions (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  cwd TEXT,
  command TEXT,
  summary TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);
