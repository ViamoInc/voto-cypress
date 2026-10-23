#!/usr/bin/env bash
# Publish the podcast RSS fixtures to a directory that can be served over HTTP.
#
# The CN fetches feed and enclosure URLs *server-side*, so the podcast specs need
# these files on a host the target environment can reach — a private GitHub raw
# URL will not do. Publish them (GitHub Pages, a public bucket, any static host),
# then point cypress.env.json's `podcastFeedBaseUrl` at the result.
#
#   ./scripts/publish-podcast-feeds.sh https://viamoinc.github.io/voto-cypress-fixtures ./dist-feeds
#
# The feeds reference their audio by absolute URL, so the base has to be baked in
# here rather than at request time.
set -euo pipefail

BASE_URL="${1:-}"
OUT_DIR="${2:-./dist-feeds}"

if [ -z "$BASE_URL" ]; then
  echo "usage: $0 <public-base-url> [out-dir]" >&2
  exit 1
fi

BASE_URL="${BASE_URL%/}"
SRC="$(cd "$(dirname "$0")/.." && pwd)/cypress/fixtures/feeds"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/audio"
cp "$SRC"/audio/* "$OUT_DIR/audio/"

for feed in "$SRC"/*.xml; do
  sed "s|__BASE__|${BASE_URL}|g" "$feed" > "$OUT_DIR/$(basename "$feed")"
done

echo "Published $(ls -1 "$OUT_DIR"/*.xml | wc -l | tr -d ' ') feeds to $OUT_DIR with base ${BASE_URL}"
echo "Set \"podcastFeedBaseUrl\": \"${BASE_URL}\" in cypress.env.json"
