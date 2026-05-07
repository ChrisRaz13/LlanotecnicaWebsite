#!/usr/bin/env bash
# Re-encode the EN/ES introduction videos: 2160x2160 @ ~48MB → 1080x1080 AV1+H.264.
# Output: ~3-5 MB per language per codec.
set -euo pipefail

SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)/src/assets/compressedvideos"

for LANG in English Spanish; do
  IN="$SRC_DIR/Introduction${LANG}.mp4"
  if [[ ! -f "$IN" ]]; then
    echo "ERROR: not found: $IN"
    exit 1
  fi
  LC=$(echo "$LANG" | tr '[:upper:]' '[:lower:]')

  echo "==> $LANG"

  echo "[1/2] AV1..."
  ffmpeg -y -hide_banner -loglevel warning -stats \
    -i "$IN" \
    -vf "scale=1080:1080:flags=lanczos" \
    -c:v libsvtav1 -preset 6 -crf 32 -g 240 \
    -pix_fmt yuv420p10le \
    -c:a aac -b:a 128k -ac 2 \
    -movflags +faststart \
    "$SRC_DIR/intro-${LC}.av1.mp4"

  echo "[2/2] H.264..."
  ffmpeg -y -hide_banner -loglevel warning -stats \
    -i "$IN" \
    -vf "scale=1080:1080:flags=lanczos" \
    -c:v libx264 -preset slow -crf 23 \
    -profile:v high -level 4.2 \
    -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ac 2 \
    -movflags +faststart \
    "$SRC_DIR/intro-${LC}.h264.mp4"
done

echo ""
echo "==> Done. Sizes:"
ls -lh "$SRC_DIR"/intro-*.mp4
