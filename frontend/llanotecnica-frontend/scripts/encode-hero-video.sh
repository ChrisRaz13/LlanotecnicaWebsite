#!/usr/bin/env bash
# Re-encode the hero master video into AV1 (modern) + H.264 (fallback)
# variants for desktop (1280x720) and mobile (720x720 center-cropped).
#
# Output goes to src/assets/compressedvideos/. Re-run any time: idempotent.
set -euo pipefail

SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)/src/assets/compressedvideos"
MASTER="$SRC_DIR/FinishedHeroSection.mp4"
OUT_DIR="$SRC_DIR"

if [[ ! -f "$MASTER" ]]; then
  echo "ERROR: master not found at $MASTER"
  exit 1
fi

echo "==> Encoding hero variants from $MASTER"

# --- Desktop AV1 (1280x720) ---
echo "[1/4] desktop AV1 (libsvtav1)..."
ffmpeg -y -hide_banner -loglevel warning -stats \
  -i "$MASTER" \
  -c:v libsvtav1 -preset 6 -crf 32 -g 240 \
  -pix_fmt yuv420p10le \
  -an -movflags +faststart \
  "$OUT_DIR/hero-desktop.av1.mp4"

# --- Desktop H.264 fallback (1280x720) ---
echo "[2/4] desktop H.264 fallback..."
ffmpeg -y -hide_banner -loglevel warning -stats \
  -i "$MASTER" \
  -c:v libx264 -preset slow -crf 22 \
  -profile:v high -level 4.2 \
  -pix_fmt yuv420p \
  -an -movflags +faststart \
  "$OUT_DIR/hero-desktop.h264.mp4"

# --- Mobile AV1 (720x720 center crop) ---
echo "[3/4] mobile AV1 (square)..."
ffmpeg -y -hide_banner -loglevel warning -stats \
  -i "$MASTER" \
  -vf "crop=720:720:280:0,scale=720:720" \
  -c:v libsvtav1 -preset 6 -crf 34 -g 240 \
  -pix_fmt yuv420p10le \
  -an -movflags +faststart \
  "$OUT_DIR/hero-mobile.av1.mp4"

# --- Mobile H.264 fallback (720x720 center crop) ---
echo "[4/4] mobile H.264 fallback..."
ffmpeg -y -hide_banner -loglevel warning -stats \
  -i "$MASTER" \
  -vf "crop=720:720:280:0,scale=720:720" \
  -c:v libx264 -preset slow -crf 23 \
  -profile:v high -level 4.0 \
  -pix_fmt yuv420p \
  -an -movflags +faststart \
  "$OUT_DIR/hero-mobile.h264.mp4"

echo ""
echo "==> Done. Output sizes:"
ls -lh "$OUT_DIR"/hero-desktop.* "$OUT_DIR"/hero-mobile.*
