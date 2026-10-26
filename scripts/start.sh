#!/usr/bin/env bash
set -euo pipefail
cd /code 2>/dev/null || cd "$(dirname "$0")/.."
exec ./node_modules/.bin/next start --hostname 0.0.0.0 --port "${PORT:-9000}"
