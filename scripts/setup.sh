#!/usr/bin/env bash
set -euo pipefail
cd /code 2>/dev/null || cd "$(dirname "$0")/.."
npm ci
npm run build
