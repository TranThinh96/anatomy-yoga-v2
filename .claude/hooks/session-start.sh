#!/bin/bash
# Claude Code on the web: install the npm dependencies so `npm run check` / `npm run build`
# work from the first command. Idempotent; the container is cached after it completes.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund
