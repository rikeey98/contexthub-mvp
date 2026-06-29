import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getDb } from "../db";
import { now } from "./time";

export const problemService = {
  list(workspaceId: string) {
    return getDb()
      .prepare("SELECT * FROM problems WHERE workspace_id = ? ORDER BY updated_at DESC")
      .all(workspaceId);
  },

  recent() {
    return getDb().prepare("SELECT * FROM problems ORDER BY updated_at DESC LIMIT 20").all();
  },

  create(input: { workspaceId: string; title: string; goal?: string; priority?: string }, userDataPath: string) {
    const id = randomUUID();
    const ts = now();
    getDb()
      .prepare(
        `INSERT INTO problems (id, workspace_id, title, goal, status, priority, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'active', ?, ?, ?)`
      )
      .run(id, input.workspaceId, input.title, input.goal ?? null, input.priority ?? "normal", ts, ts);

    const problemDir = path.join(userDataPath, "workspaces", input.workspaceId, "problems", id);
    fs.mkdirSync(problemDir, { recursive: true });

    const defaultTodos = ["관련 파일 확인", "현재 동작 재현", "수정 방향 결정", "구현", "테스트", "정리"];
    for (const todo of defaultTodos) {
      this.createNote({ problemId: id, type: "todo", content: todo });
    }

    return this.getDetail(id);
  },

  getDetail(id: string) {
    const db = getDb();
    const problem = db.prepare("SELECT * FROM problems WHERE id = ?").get(id);
    if (!problem) return null;
    return {
      problem,
      repos: db
        .prepare(
          `SELECT r.*, pr.role FROM repos r
           JOIN problem_repos pr ON pr.repo_id = r.id
           WHERE pr.problem_id = ?`
        )
        .all(id),
      files: db.prepare("SELECT * FROM problem_files WHERE problem_id = ? ORDER BY created_at DESC").all(id),
      commands: db.prepare("SELECT * FROM commands WHERE problem_id = ? ORDER BY created_at DESC").all(id),
      notes: db.prepare("SELECT * FROM notes WHERE problem_id = ? ORDER BY created_at DESC").all(id),
      runs: db.prepare("SELECT * FROM command_runs WHERE problem_id = ? ORDER BY started_at DESC LIMIT 20").all(id),
    };
  },

  update(id: string, input: { title?: string; goal?: string; status?: string; priority?: string; summary?: string }) {
    const current = getDb().prepare("SELECT * FROM problems WHERE id = ?").get(id) as any;
    if (!current) throw new Error("Problem not found");

    getDb()
      .prepare(
        `UPDATE problems
         SET title = ?, goal = ?, status = ?, priority = ?, summary = ?, updated_at = ?
         WHERE id = ?`
      )
      .run(
        input.title ?? current.title,
        input.goal ?? current.goal,
        input.status ?? current.status,
        input.priority ?? current.priority,
        input.summary ?? current.summary,
        now(),
        id
      );
    return this.getDetail(id);
  },

  createNote(input: { problemId: string; type: string; title?: string; content: string }) {
    const id = randomUUID();
    const ts = now();
    getDb()
      .prepare(
        `INSERT INTO notes (id, problem_id, type, title, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, input.problemId, input.type, input.title ?? null, input.content, ts, ts);
    getDb().prepare("UPDATE problems SET updated_at = ? WHERE id = ?").run(ts, input.problemId);
    return getDb().prepare("SELECT * FROM notes WHERE id = ?").get(id);
  },
};
