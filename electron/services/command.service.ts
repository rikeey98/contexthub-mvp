import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { getDb } from "../db";
import { now } from "./time";

export const commandService = {
  list(problemId: string) {
    return getDb().prepare("SELECT * FROM commands WHERE problem_id = ? ORDER BY created_at DESC").all(problemId);
  },

  create(input: { problemId: string; name: string; command: string; cwd?: string; description?: string }) {
    const id = randomUUID();
    const ts = now();
    getDb()
      .prepare(
        `INSERT INTO commands (id, problem_id, name, command, cwd, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(id, input.problemId, input.name, input.command, input.cwd ?? null, input.description ?? null, ts, ts);
    return getDb().prepare("SELECT * FROM commands WHERE id = ?").get(id);
  },

  run(commandId: string, userDataPath: string) {
    const command = getDb().prepare("SELECT * FROM commands WHERE id = ?").get(commandId) as any;
    if (!command) throw new Error("Command not found");

    const runId = randomUUID();
    const startedAt = now();
    const logDir = path.join(userDataPath, "logs", command.problem_id);
    fs.mkdirSync(logDir, { recursive: true });

    const stdoutPath = path.join(logDir, `${runId}.stdout.log`);
    const stderrPath = path.join(logDir, `${runId}.stderr.log`);
    const stdout = fs.createWriteStream(stdoutPath);
    const stderr = fs.createWriteStream(stderrPath);

    getDb()
      .prepare(
        `INSERT INTO command_runs (id, command_id, problem_id, command, cwd, stdout_path, stderr_path, started_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(runId, commandId, command.problem_id, command.command, command.cwd, stdoutPath, stderrPath, startedAt);

    const child = spawn(command.command, {
      cwd: command.cwd || undefined,
      shell: true,
    });

    child.stdout?.pipe(stdout);
    child.stderr?.pipe(stderr);

    child.on("exit", (code) => {
      getDb()
        .prepare("UPDATE command_runs SET exit_code = ?, ended_at = ? WHERE id = ?")
        .run(code, now(), runId);
    });

    return getDb().prepare("SELECT * FROM command_runs WHERE id = ?").get(runId);
  },

  runs(problemId: string) {
    return getDb().prepare("SELECT * FROM command_runs WHERE problem_id = ? ORDER BY started_at DESC").all(problemId);
  },
};
