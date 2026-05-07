#!/usr/bin/env bash
# Re-encode intro videos to PORTRAIT crop — eliminates ceiling/floor wasted area
# in the frame, drops file size, matches the visual subject (centered person).
# Output: 720x1080 (3:4 portrait) AV1 + H.264 per language.
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

  # Crop source 2160x2160 → centered 1620x2160 (3:4 portrait), then scale to 720x1080
  echo "[1/2] AV1 portrait..."
  ffmpeg -y -hide_banner -loglevel warning -stats \
    -i "$IN" \
    -vf "crop=1620:2160:270:0,scale=720:1080:flags=lanczos" \
    -c:v libsvtav1 -preset 6 -crf 32 -g 240 \
    -pix_fmt yuv420p10le \
    -c:a aac -b:a 128k -ac 2 \
    -movflags +faststart \
    "$SRC_DIR/intro-${LC}-portrait.av1.mp4"

  echo "[2/2] H.264 portrait..."
  ffmpeg -y -hide_banner -loglevel warning -stats \
    -i "$IN" \
    -vf "crop=1620:2160:270:0,scale=720:1080:flags=lanczos" \
    -c:v libx264 -preset slow -crf 23 \
    -profile:v high -level 4.2 \
    -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ac 2 \
    -movflags +faststart \
    "$SRC_DIR/intro-${LC}-portrait.h264.mp4"
done

echo ""
echo "==> Done. Sizes:"
ls -lh "$SRC_DIR"/intro-*-portrait*.mp4
