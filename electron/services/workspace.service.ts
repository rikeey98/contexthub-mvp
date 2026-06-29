import { randomUUID } from "crypto";
import { getDb } from "../db";
import { now } from "./time";

export const workspaceService = {
  list() {
    return getDb().prepare("SELECT * FROM workspaces ORDER BY updated_at DESC").all();
  },

  create(input: { name: string; description?: string; rootPath?: string }) {
    const id = randomUUID();
    const ts = now();
    getDb()
      .prepare(
        `INSERT INTO workspaces (id, name, description, root_path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(id, input.name, input.description ?? null, input.rootPath ?? null, ts, ts);
    return getDb().prepare("SELECT * FROM workspaces WHERE id = ?").get(id);
  },

  update(id: string, input: { name?: string; description?: string; rootPath?: string }) {
    const current = getDb().prepare("SELECT * FROM workspaces WHERE id = ?").get(id) as any;
    if (!current) throw new Error("Workspace not found");
    getDb()
      .prepare(
        `UPDATE workspaces
         SET name = ?, description = ?, root_path = ?, updated_at = ?
         WHERE id = ?`
      )
      .run(
        input.name ?? current.name,
        input.description ?? current.description,
        input.rootPath ?? current.root_path,
        now(),
        id
      );
    return getDb().prepare("SELECT * FROM workspaces WHERE id = ?").get(id);
  },

  remove(id: string) {
    getDb().prepare("DELETE FROM workspaces WHERE id = ?").run(id);
    return { ok: true };
  },
};
