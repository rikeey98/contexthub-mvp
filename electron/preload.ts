import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("contextHub", {
  workspaces: {
    list: () => ipcRenderer.invoke("workspaces:list"),
    create: (input: unknown) => ipcRenderer.invoke("workspaces:create", input),
    update: (id: string, input: unknown) => ipcRenderer.invoke("workspaces:update", { id, input }),
    remove: (id: string) => ipcRenderer.invoke("workspaces:remove", id),
  },
  problems: {
    list: (workspaceId: string) => ipcRenderer.invoke("problems:list", workspaceId),
    recent: () => ipcRenderer.invoke("problems:recent"),
    create: (input: unknown) => ipcRenderer.invoke("problems:create", input),
    get: (id: string) => ipcRenderer.invoke("problems:get", id),
    update: (id: string, input: unknown) => ipcRenderer.invoke("problems:update", { id, input }),
  },
  repos: {
    list: (workspaceId: string) => ipcRenderer.invoke("repos:list", workspaceId),
    create: (input: unknown) => ipcRenderer.invoke("repos:create", input),
    linkToProblem: (input: unknown) => ipcRenderer.invoke("repos:linkToProblem", input),
    addFile: (input: unknown) => ipcRenderer.invoke("repos:addFile", input),
  },
  commands: {
    list: (problemId: string) => ipcRenderer.invoke("commands:list", problemId),
    create: (input: unknown) => ipcRenderer.invoke("commands:create", input),
    run: (commandId: string) => ipcRenderer.invoke("commands:run", commandId),
    runs: (problemId: string) => ipcRenderer.invoke("commands:runs", problemId),
  },
  notes: {
    create: (input: unknown) => ipcRenderer.invoke("notes:create", input),
  },
  context: {
    generate: (problemId: string) => ipcRenderer.invoke("context:generate", problemId),
    save: (problemId: string) => ipcRenderer.invoke("context:save", problemId),
    copy: (problemId: string) => ipcRenderer.invoke("context:copy", problemId),
  },
  tools: {
    openVSCode: (path: string) => ipcRenderer.invoke("tools:vscode", path),
    openTerminal: (cwd: string) => ipcRenderer.invoke("tools:terminal", cwd),
    openClaude: (cwd: string, problemId: string) => ipcRenderer.invoke("tools:claude", { cwd, problemId }),
    openOpencode: (cwd: string, problemId: string) => ipcRenderer.invoke("tools:opencode", { cwd, problemId }),
  },
});
