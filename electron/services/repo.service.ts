import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { getDb } from "../db";
import { now } from "./time";

function safeGit(cwd: string, command: string) {
  try {
    return execSync(command, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

export const repoService = {
  list(workspaceId: string) {
    return getDb().prepare("SELECT * FROM repos WHERE workspace_id = ? ORDER BY created_at DESC").all(workspaceId);
  },

  create(input: { workspaceId: string; name: string; localPath: string }) {
    const id = randomUUID();
    const ts = now();
    const remoteUrl = safeGit(input.localPath, "git remote get-url origin");
    const branch = safeGit(input.localPath, "git branch --show-current");

    getDb()
      .prepare(
        `INSERT INTO repos (id, workspace_id, name, local_path, remote_url, default_branch, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, input.workspaceId, input.name, input.localPath, remoteUrl, branch, ts, ts);

    return getDb().prepare("SELECT * FROM repos WHERE id = ?").get(id);
  },

  linkToProblem(input: { problemId: string; repoId: string; role?: string }) {
    getDb()
      .prepare("INSERT OR REPLACE INTO problem_repos (problem_id, repo_id, role) VALUES (?, ?, ?)")
      .run(input.problemId, input.repoId, input.role ?? null);
    return { ok: true };
  },

  addFile(input: { problemId: string; repoId?: string; filePath: string; reason?: string }) {
    const id = randomUUID();
    const ts = now();
    getDb()
      .prepare(
        `INSERT INTO problem_files (id, problem_id, repo_id, file_path, reason, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(id, input.problemId, input.repoId ?? null, input.filePath, input.reason ?? null, ts);
    return getDb().prepare("SELECT * FROM problem_files WHERE id = ?").get(id);
  },
};
