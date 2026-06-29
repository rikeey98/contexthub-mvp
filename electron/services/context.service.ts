import fs from "fs";
import path from "path";
import { getDb } from "../db";

export const contextService = {
  generate(problemId: string) {
    const db = getDb();
    const problem = db.prepare("SELECT * FROM problems WHERE id = ?").get(problemId) as any;
    if (!problem) throw new Error("Problem not found");

    const repos = db
      .prepare(
        `SELECT r.*, pr.role FROM repos r
         JOIN problem_repos pr ON pr.repo_id = r.id
         WHERE pr.problem_id = ?`
      )
      .all(problemId) as any[];

    const files = db.prepare("SELECT * FROM problem_files WHERE problem_id = ? ORDER BY created_at ASC").all(problemId) as any[];
    const commands = db.prepare("SELECT * FROM commands WHERE problem_id = ? ORDER BY created_at ASC").all(problemId) as any[];
    const notes = db.prepare("SELECT * FROM notes WHERE problem_id = ? ORDER BY created_at ASC").all(problemId) as any[];

    const byType = (type: string) => notes.filter((note) => note.type === type);

    return `# AI Work Context\n\n## Problem\n${problem.title}\n\n## Goal\n${problem.goal || "No goal written yet."}\n\n## Status\n${problem.status}\n\n## Summary\n${problem.summary || "No summary written yet."}\n\n## Linked Repositories\n${
      repos.length
        ? repos.map((repo) => `- ${repo.name}${repo.role ? ` (${repo.role})` : ""}: ${repo.local_path}`).join("\n")
        : "- No repositories linked yet."
    }\n\n## Important Files\n${
      files.length
        ? files.map((file) => `- ${file.file_path}${file.reason ? ` — ${file.reason}` : ""}`).join("\n")
        : "- No important files registered yet."
    }\n\n## Commands\n${
      commands.length
        ? commands.map((cmd) => `- ${cmd.name}: \`${cmd.command}\`${cmd.cwd ? ` from ${cmd.cwd}` : ""}`).join("\n")
        : "- No commands registered yet."
    }\n\n## Decisions\n${
      byType("decision").length
        ? byType("decision").map((note) => `- ${note.title ? `${note.title}: ` : ""}${note.content}`).join("\n")
        : "- No decisions recorded yet."
    }\n\n## Issues\n${
      byType("issue").length
        ? byType("issue").map((note) => `- ${note.title ? `${note.title}: ` : ""}${note.content}`).join("\n")
        : "- No issues recorded yet."
    }\n\n## TODO\n${
      byType("todo").length
        ? byType("todo").map((note) => `- ${note.content}`).join("\n")
        : "- No todos recorded yet."
    }\n\n## Notes\n${
      byType("note").length
        ? byType("note").map((note) => `- ${note.title ? `${note.title}: ` : ""}${note.content}`).join("\n")
        : "- No notes recorded yet."
    }\n`;
  },

  save(problemId: string, userDataPath: string) {
    const problem = getDb().prepare("SELECT * FROM problems WHERE id = ?").get(problemId) as any;
    if (!problem) throw new Error("Problem not found");

    const context = this.generate(problemId);
    const targetDir = path.join(userDataPath, "workspaces", problem.workspace_id, "problems", problemId);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, "context.md");
    fs.writeFileSync(targetPath, context, "utf8");
    return { path: targetPath, context };
  },
};
