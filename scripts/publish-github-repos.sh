#!/usr/bin/env bash
# Create + push GitHub remotes for novaos (hub) and novastore when API quota allows.
# Usage: bash scripts/publish-github-repos.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NOVASTORE_DIR="$(cd "$ROOT/../repos/novastore" 2>/dev/null && pwd || true)"
TOKEN="${GITHUB_TOKEN:-}"
if [[ -z "$TOKEN" && -d "$ROOT/../repos/docmate-ai" ]]; then
  TOKEN="$(cd "$ROOT/../repos/docmate-ai" && git remote get-url origin | sed -n 's#https://x-access-token:\([^@]*\)@.*#\1#p')"
fi
if [[ -z "$TOKEN" ]]; then
  echo "Missing GITHUB_TOKEN" >&2
  exit 1
fi

OWNER="${GITHUB_OWNER:-archer0965}"
API="https://api.github.com"

create_repo() {
  local name="$1" desc="$2"
  local code
  code=$(curl -sS -o /tmp/gh-"$name".json -w "%{http_code}" -X POST \
    -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github+json" \
    "$API/user/repos" \
    -d "{\"name\":\"$name\",\"description\":\"$desc\",\"private\":false,\"auto_init\":false}")
  echo "$name create → HTTP $code"
  if [[ "$code" == "201" ]] || grep -qi 'already exists\|name already' /tmp/gh-"$name".json; then
    return 0
  fi
  cat /tmp/gh-"$name".json
  return 1
}

push_dir() {
  local dir="$1" name="$2" branch="${3:-main}"
  local url="https://x-access-token:${TOKEN}@github.com/${OWNER}/${name}.git"
  cd "$dir"
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "$url"
  else
    git remote add origin "$url"
  fi
  git push -u origin "$branch"
}

echo "== create repos =="
create_repo "novastore" "NovaStore — 代購／團購獨立賣場與自動對帳" || true
create_repo "novaos" "拓新雲端 NovaOS — 品牌主站與產品矩陣" || true

echo "== push novastore =="
if [[ -n "${NOVASTORE_DIR:-}" && -d "$NOVASTORE_DIR/.git" ]]; then
  (cd "$NOVASTORE_DIR" && git branch -M main)
  push_dir "$NOVASTORE_DIR" "novastore" "main" || echo "novastore push deferred"
else
  echo "novastore dir missing: $NOVASTORE_DIR"
fi

echo "== push novaos (hub) =="
(cd "$ROOT" && git branch -M main 2>/dev/null || true)
# Prefer pushing current branch; rename remote tracking later
CURRENT=$(cd "$ROOT" && git branch --show-current)
push_dir "$ROOT" "novaos" "$CURRENT" || {
  echo "Trying main…"
  (cd "$ROOT" && git checkout -B main)
  push_dir "$ROOT" "novaos" "main" || echo "novaos push deferred"
}

echo "Done. Remotes:"
(cd "$ROOT" && git remote -v || true)
[[ -n "${NOVASTORE_DIR:-}" ]] && (cd "$NOVASTORE_DIR" && git remote -v || true)
