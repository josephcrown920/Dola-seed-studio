# Codex Aurora — Dola Seed Studio

## Goal
Bring a safe, agentic coding workspace into the Dola Seed Studio GUI. The first slice uses the existing Aurora MCP director as the reasoning/coordination layer; it does not grant the browser arbitrary shell or filesystem access.

## Current integration
- Dola Seed Studio already has an AI Code Editor.
- ModelArk chat routing already exists.
- `app/lib/aurora-director.js` already calls Aurora's `aurora_modelark_director` MCP tool.
- This branch adds a dedicated coding endpoint that sends structured coding context to that director.

## Modes
1. **Plan** — analyze the task and propose an implementation plan.
2. **Edit** — produce a reviewable patch/diff for the supplied code/context.
3. **Review** — inspect code for correctness, security, performance, and regressions.
4. **Debug** — diagnose an error and propose a minimal fix.

## Security boundary
The GUI must not expose provider keys or give an LLM unrestricted browser-side shell access. Repository writes, shell execution, package installation, deployment, credential access, network access, and destructive operations belong behind an authenticated server-side workspace/agent boundary with explicit approval and audit logging.

## Next implementation slice
- Add a workspace/repository selector.
- Add file-tree and diff views.
- Add patch approval/rejection.
- Add server-side workspace tools with an allowlist.
- Add test/lint/build actions behind the same workspace boundary.
- Add job telemetry so successful coding tasks improve routing recommendations without silently changing production policy.
