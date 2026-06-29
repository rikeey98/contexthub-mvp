import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./lib/api";
import type { Problem, ProblemDetail, Repo, Workspace } from "./lib/types";
import "./styles/app.css";

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProblemDetail | null>(null);
  const [contextText, setContextText] = useState("");

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === currentWorkspaceId),
    [workspaces, currentWorkspaceId]
  );

  async function refreshWorkspaces() {
    const rows = await api.workspaces.list();
    setWorkspaces(rows);
    if (!currentWorkspaceId && rows.length) setCurrentWorkspaceId(rows[0].id);
  }

  async function refreshProblems(workspaceId = currentWorkspaceId) {
    if (!workspaceId) return;
    const rows = await api.problems.list(workspaceId);
    setProblems(rows);
    if (!currentProblemId && rows.length) setCurrentProblemId(rows[0].id);
  }

  async function refreshDetail(problemId = currentProblemId) {
    if (!problemId) return;
    const next = await api.problems.get(problemId);
    setDetail(next);
    const context = await api.context.generate(problemId);
    setContextText(context);
  }

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  useEffect(() => {
    refreshProblems();
  }, [currentWorkspaceId]);

  useEffect(() => {
    refreshDetail();
  }, [currentProblemId]);

  async function createWorkspace() {
    const name = prompt("Workspace name");
    if (!name) return;
    const description = prompt("Description") || "";
    const rootPath = prompt("Root path") || "";
    const workspace = await api.workspaces.create({ name, description, rootPath });
    await refreshWorkspaces();
    setCurrentWorkspaceId(workspace.id);
  }

  async function createProblem() {
    if (!currentWorkspaceId) return alert("Create a workspace first");
    const title = prompt("Problem title");
    if (!title) return;
    const goal = prompt("Goal") || "";
    const created = await api.problems.create({ workspaceId: currentWorkspaceId, title, goal });
    await refreshProblems(currentWorkspaceId);
    setCurrentProblemId(created.problem.id);
  }

  async function addRepo() {
    if (!currentWorkspaceId || !currentProblemId) return alert("Select workspace and problem first");
    const name = prompt("Repo name");
    if (!name) return;
    const localPath = prompt("Local path") || "";
    if (!localPath) return;
    const role = prompt("Role: frontend/backend/script/docs/infra") || "";
    const repo = await api.repos.create({ workspaceId: currentWorkspaceId, name, localPath });
    await api.repos.linkToProblem({ problemId: currentProblemId, repoId: repo.id, role });
    await refreshDetail();
  }

  async function addFile() {
    if (!currentProblemId) return;
    const filePath = prompt("Important file path");
    if (!filePath) return;
    const reason = prompt("Why is it important?") || "";
    await api.repos.addFile({ problemId: currentProblemId, filePath, reason });
    await refreshDetail();
  }

  async function addCommand() {
    if (!currentProblemId) return;
    const name = prompt("Command name");
    if (!name) return;
    const command = prompt("Command") || "";
    if (!command) return;
    const cwd = prompt("Working directory") || "";
    await api.commands.create({ problemId: currentProblemId, name, command, cwd });
    await refreshDetail();
  }

  async function addNote(type: string) {
    if (!currentProblemId) return;
    const title = type === "todo" ? "" : prompt("Title") || "";
    const content = prompt(`${type} content`);
    if (!content) return;
    await api.notes.create({ problemId: currentProblemId, type, title, content });
    await refreshDetail();
  }

  async function saveContext() {
    if (!currentProblemId) return;
    const result = await api.context.save(currentProblemId);
    alert(`Saved to ${result.path}`);
    await refreshDetail();
  }

  async function copyContext() {
    if (!currentProblemId) return;
    await api.context.copy(currentProblemId);
    alert("Copied context to clipboard");
  }

  async function runCommand(commandId: string) {
    await api.commands.run(commandId);
    alert("Command started. Check run logs after it finishes.");
    await refreshDetail();
  }

  function firstRepo(): Repo | undefined {
    return detail?.repos?.[0];
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">ContextHub</div>
        <button onClick={createWorkspace}>+ Workspace</button>
        <button onClick={createProblem}>+ Problem</button>

        <section>
          <h3>Workspaces</h3>
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              className={workspace.id === currentWorkspaceId ? "selected item" : "item"}
              onClick={() => {
                setCurrentWorkspaceId(workspace.id);
                setCurrentProblemId(null);
                setDetail(null);
              }}
            >
              {workspace.name}
            </button>
          ))}
        </section>

        <section>
          <h3>Problems</h3>
          {problems.map((problem) => (
            <button
              key={problem.id}
              className={problem.id === currentProblemId ? "selected item" : "item"}
              onClick={() => setCurrentProblemId(problem.id)}
            >
              {problem.title}
            </button>
          ))}
        </section>
      </aside>

      <main className="main">
        {!detail ? (
          <div className="empty-state">
            <h1>Problem-centered AI workspaces</h1>
            <p>Create a workspace and a problem to start collecting context.</p>
          </div>
        ) : (
          <>
            <header className="problem-header">
              <div>
                <p className="muted">{currentWorkspace?.name}</p>
                <h1>{detail.problem.title}</h1>
                <p>{detail.problem.goal || "No goal written yet."}</p>
              </div>
              <div className="actions">
                <button onClick={addRepo}>Add repo</button>
                <button onClick={addFile}>Add file</button>
                <button onClick={addCommand}>Add command</button>
              </div>
            </header>

            <div className="grid">
              <section className="card">
                <h2>Linked Repos</h2>
                {detail.repos.length === 0 && <p className="muted">No repos linked yet.</p>}
                {detail.repos.map((repo) => (
                  <div key={repo.id} className="row">
                    <div>
                      <strong>{repo.name}</strong> <span className="pill">{repo.role || "repo"}</span>
                      <p className="mono">{repo.local_path}</p>
                    </div>
                    <div className="row-actions">
                      <button onClick={() => api.tools.openVSCode(repo.local_path)}>VSCode</button>
                      <button onClick={() => api.tools.openTerminal(repo.local_path)}>Terminal</button>
                      <button onClick={() => api.tools.openClaude(repo.local_path, detail.problem.id)}>Claude</button>
                      <button onClick={() => api.tools.openOpencode(repo.local_path, detail.problem.id)}>opencode</button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="card">
                <h2>Important Files</h2>
                {detail.files.map((file) => (
                  <div key={file.id} className="row compact">
                    <span className="mono">{file.file_path}</span>
                    <span className="muted">{file.reason}</span>
                  </div>
                ))}
              </section>

              <section className="card">
                <h2>Commands</h2>
                {detail.commands.map((command) => (
                  <div key={command.id} className="row">
                    <div>
                      <strong>{command.name}</strong>
                      <p className="mono">{command.command}</p>
                      {command.cwd && <p className="muted">cwd: {command.cwd}</p>}
                    </div>
                    <button onClick={() => runCommand(command.id)}>Run</button>
                  </div>
                ))}
              </section>

              <section className="card">
                <h2>Notes</h2>
                <div className="actions small">
                  <button onClick={() => addNote("note")}>Note</button>
                  <button onClick={() => addNote("decision")}>Decision</button>
                  <button onClick={() => addNote("issue")}>Issue</button>
                  <button onClick={() => addNote("todo")}>Todo</button>
                </div>
                {detail.notes.map((note) => (
                  <div key={note.id} className="note">
                    <span className="pill">{note.type}</span>
                    {note.title && <strong>{note.title}</strong>}
                    <p>{note.content}</p>
                  </div>
                ))}
              </section>
            </div>
          </>
        )}
      </main>

      <aside className="context-panel">
        <h2>AI Context</h2>
        <div className="actions small">
          <button onClick={() => refreshDetail()}>Regenerate</button>
          <button onClick={copyContext}>Copy</button>
          <button onClick={saveContext}>Save</button>
        </div>
        {firstRepo() && (
          <div className="actions small">
            <button onClick={() => api.tools.openClaude(firstRepo()!.local_path, detail!.problem.id)}>Open Claude</button>
            <button onClick={() => api.tools.openOpencode(firstRepo()!.local_path, detail!.problem.id)}>Open opencode</button>
          </div>
        )}
        <pre>{contextText}</pre>
      </aside>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
