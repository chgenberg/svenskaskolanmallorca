#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

echo "Pre-push bug-check — Underlaget"

if git ls-files | grep -E '(^|/)\.env\.local$' >/dev/null; then
  echo "STOPP: .env.local är tracked. Ta bort den från git."
  exit 1
fi

if git grep -I -n -E 'sk-proj-|sk-[A-Za-z0-9]{20,}|OPENAI_API_KEY=sk-' -- ':!.env.example' ':!scripts/prepush-check.sh' >/dev/null; then
  echo "STOPP: API-nyckel eller hemlighet finns i tracked filer."
  git grep -I -n -E 'sk-proj-|sk-[A-Za-z0-9]{20,}|OPENAI_API_KEY=sk-' -- ':!.env.example' ':!scripts/prepush-check.sh' || true
  exit 1
fi

echo "→ Typecheck"
npx tsc --noEmit

echo "→ Lint"
npx eslint app components lib

echo "Pre-push bug-check OK"
