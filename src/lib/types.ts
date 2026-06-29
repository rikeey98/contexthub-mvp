export type Workspace = {
  id: string;
  name: string;
  description?: string;
  root_path?: string;
  created_at: string;
  updated_at: string;
};

export type Problem = {
  id: string;
  workspace_id: string;
  title: string;
  goal?: string;
  status: "active" | "paused" | "done" | "archived";
  priority: "low" | "normal" | "high";
  summary?: string;
  created_at: string;
  updated_at: string;
};

export type Repo = {
  id: string;
  workspace_id: string;
  name: string;
  local_path: string;
  remote_url?: string;
  default_branch?: string;
  role?: string;
};

export type Command = {
  id: string;
  problem_id: string;
  name: string;
  command: string;
  cwd?: string;
  description?: string;
};

export type Note = {
  id: string;
  problem_id: string;
  type: "note" | "decision" | "issue" | "todo" | "daily-log";
  title?: string;
  content: string;
  created_at: string;
};

export type ProblemDetail = {
  problem: Problem;
  repos: Repo[];
  files: Array<{ id: string; file_path: string; reason?: string }>;
  commands: Command[];
  notes: Note[];
  runs: unknown[];
};

export type ContextHubApi = {
  workspaces: {
    list(): Promise<Workspace[]>;
    create(input: unknown): Promise<Workspace>;
    update(id: string, input: unknown): Promise<Workspace>;
    remove(id: string): Promise<{ ok: boolean }>;
  };
  problems: {
    list(workspaceId: string): Promise<Problem[]>;
    recent(): Promise<Problem[]>;
    create(input: unknown): Promise<ProblemDetail>;
    get(id: string): Promise<ProblemDetail>;
    update(id: string, input: unknown): Promise<ProblemDetail>;
  };
  repos: {
    list(workspaceId: string): Promise<Repo[]>;
    create(input: unknown): Promise<Repo>;
    linkToProblem(input: unknown): Promise<{ ok: boolean }>;
    addFile(input: unknown): Promise<unknown>;
  };
  commands: {
    list(problemId: string): Promise<Command[]>;
    create(input: unknown): Promise<Command>;
    run(commandId: string): Promise<unknown>;
    runs(problemId: string): Promise<unknown[]>;
  };
  notes: {
    create(input: unknown): Promise<Note>;
  };
  context: {
    generate(problemId: string): Promise<string>;
    save(problemId: string): Promise<{ path: string; context: string }>;
    copy(problemId: string): Promise<{ ok: boolean }>;
  };
  tools: {
    openVSCode(path: string): Promise<unknown>;
    openTerminal(cwd: string): Promise<unknown>;
    openClaude(cwd: string, problemId: string): Promise<unknown>;
    openOpencode(cwd: string, problemId: string): Promise<unknown>;
  };
};
