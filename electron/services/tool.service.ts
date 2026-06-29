import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { getDb } from "../db";
import { now } from "./time";

function spawnDetached(command: string, cwd?: string) {
  const child = spawn(command, {
    cwd: cwd || undefined,
    shell: true,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  return { pid: child.pid };
}

export const toolService = {
  openVSCode(targetPath: string) {
    return spawnDetached(`code "${targetPath}"`, targetPath);
  },

  openTerminal(cwd: string) {
    if (process.platform === "win32") return spawnDetached(`wt -d "${cwd}"`, cwd);
    if (process.platform === "darwin") return spawnDetached(`open -a Terminal "${cwd}"`, cwd);
    return spawnDetached(`gnome-terminal --working-directory="${cwd}"`, cwd);
  },

  openAgent(tool: string, command: string, cwd: string, problemId: string) {
    const id = randomUUID();
    getDb()
      .prepare(
        `INSERT INTO agent_sessions (id, problem_id, tool, cwd, command, started_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(id, problemId, tool, cwd, command, now());

    if (process.platform === "win32") {
      return spawnDetached(`wt -d "${cwd}" ${command}`, cwd);
    }
    if (process.platform === "darwin") {
      return spawnDetached(`osascript -e 'tell app "Terminal" to do script "cd ${cwd.replace(/"/g, "\\\"")} && ${command}"'`, cwd);
    }
    return spawnDetached(`gnome-terminal --working-directory="${cwd}" -- ${command}`, cwd);
  },
};
