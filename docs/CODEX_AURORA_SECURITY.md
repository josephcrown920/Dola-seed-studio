# Codex Aurora Security Boundary

The Dola Seed Studio coding endpoint is a server-side bridge to the Aurora MCP director.

## Required environment variables

- `AURORA_MCP_URL`: Aurora MCP endpoint.
- `AURORA_MCP_TOKEN`: server-only Aurora MCP credential. Never expose it to browser code.
- `AURORA_CODING_ACCESS_TOKEN`: separate deployment access credential accepted by `/api/aurora/coding`.

The browser sends only the separate coding access token. It never receives or sends `AURORA_MCP_TOKEN`.

## Request boundary

The coding endpoint:
- fails closed when the access token is absent or invalid;
- rejects oversized requests and oversized instruction/code/path fields;
- accepts only Plan/Edit/Review/Debug modes;
- keeps repository writes, shell execution, deployment, package installation, and credential access outside the browser;
- returns a generic 500 response while logging details server-side.

The access token is a deployment-level gate, not per-user identity/authentication. A future user-authenticated session can replace it without changing the Aurora MCP director contract.
