#!/usr/bin/env bash
# Package ignite-api release assets from a built dist/ tree.
set -euo pipefail

ROOT="${1:?usage: prepare-release-assets.sh <project-dir> <output-dir>}"

OUT="${2:?usage: prepare-release-assets.sh <project-dir> <output-dir>}"
PKG_JSON="$ROOT/package.json"
DIST="$ROOT/dist"

if command -v node >/dev/null 2>&1; then
  VERSION="$(node -p "require('${PKG_JSON}').version.replace(/^v/i, '')")"
else
  VERSION="$(bun -e "const p=require('${PKG_JSON}'); console.log(String(p.version||'').replace(/^v/i,''))")"
fi
PREFIX="ignite-api-${VERSION}"

mkdir -p "$OUT"

if [[ ! -d "$DIST" ]]; then
  echo "[release] error: dist/ not found at $DIST" >&2
  exit 1
fi

(
  cd "$ROOT"
  npm pack --pack-destination "$OUT" --ignore-scripts
)

PACKED="$(find "$OUT" -maxdepth 1 -name '*.tgz' -type f | head -n 1)"
if [[ -z "$PACKED" ]]; then
  echo "[release] error: npm pack produced no .tgz" >&2
  exit 1
fi

TGZ="$OUT/${PREFIX}.tgz"
mv "$PACKED" "$TGZ"
echo "[release] npm pack: $(basename "$TGZ")"

ZIP="$OUT/${PREFIX}-dist.zip"
(
  cd "$ROOT"
  zip -qr "$ZIP" dist README.md LICENSE.md package.json
)
echo "[release] dist zip: $(basename "$ZIP")"

echo "[release] Upload set:"
find "$OUT" -maxdepth 1 -type f -printf '  %f (%s bytes)\n' | sort
