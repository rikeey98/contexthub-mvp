import { clipboard, ipcMain } from "electron";
import { workspaceService } from "../services/workspace.service";
import { problemService } from "../services/problem.service";
import { repoService } from "../services/repo.service";
import { commandService } from "../services/command.service";
import { contextService } from "../services/context.service";
import { toolService } from "../services/tool.service";

export function registerIpcHandlers(userDataPath: string) {
  ipcMain.handle("workspaces:list", () => workspaceService.list());
  ipcMain.handle("workspaces:create", (_, input) => workspaceService.create(input));
  ipcMain.handle("workspaces:update", (_, { id, input }) => workspaceService.update(id, input));
  ipcMain.handle("workspaces:remove", (_, id) => workspaceService.remove(id));

  ipcMain.handle("problems:list", (_, workspaceId) => problemService.list(workspaceId));
  ipcMain.handle("problems:recent", () => problemService.recent());
  ipcMain.handle("problems:create", (_, input) => problemService.create(input, userDataPath));
  ipcMain.handle("problems:get", (_, id) => problemService.getDetail(id));
  ipcMain.handle("problems:update", (_, { id, input }) => problemService.update(id, input));

  ipcMain.handle("repos:list", (_, workspaceId) => repoService.list(workspaceId));
  ipcMain.handle("repos:create", (_, input) => repoService.create(input));
  ipcMain.handle("repos:linkToProblem", (_, input) => repoService.linkToProblem(input));
  ipcMain.handle("repos:addFile", (_, input) => repoService.addFile(input));

  ipcMain.handle("commands:list", (_, problemId) => commandService.list(problemId));
  ipcMain.handle("commands:create", (_, input) => commandService.create(input));
  ipcMain.handle("commands:run", (_, commandId) => commandService.run(commandId, userDataPath));
  ipcMain.handle("commands:runs", (_, problemId) => commandService.runs(problemId));

  ipcMain.handle("notes:create", (_, input) => problemService.createNote(input));

  ipcMain.handle("context:generate", (_, problemId) => contextService.generate(problemId));
  ipcMain.handle("context:save", (_, problemId) => contextService.save(problemId, userDataPath));
  ipcMain.handle("context:copy", (_, problemId) => {
    const context = contextService.generate(problemId);
    clipboard.writeText(context);
    return { ok: true };
  });

  ipcMain.handle("tools:vscode", (_, targetPath) => toolService.openVSCode(targetPath));
  ipcMain.handle("tools:terminal", (_, cwd) => toolService.openTerminal(cwd));
  ipcMain.handle("tools:claude", (_, input) => toolService.openAgent("claude-code", "claude", input.cwd, input.problemId));
  ipcMain.handle("tools:opencode", (_, input) => toolService.openAgent("opencode", "opencode", input.cwd, input.problemId));
}
