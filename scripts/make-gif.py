#!/usr/bin/env python3
"""
Curates the best frames from scripts/frames/ into a polished animated GIF.
Story: 3D heart → default star → color changes to blue → chrome spin
Output: public/sculptr-demo.gif
"""
import os, sys
from pathlib import Path
from PIL import Image

FRAMES_DIR = Path(__file__).parent / "frames"
OUTPUT = Path(__file__).parent.parent / "public" / "sculptr-demo.gif"

def load(n):
    """Load frame by index number."""
    f = FRAMES_DIR / f"{str(n).zfill(3)}_frame.png"
    if not f.exists():
        return None
    return Image.open(f).convert("RGB")

def resize(img, w=720, h=540):
    return img.resize((w, h), Image.LANCZOS)

def main():
    total = len(list(FRAMES_DIR.glob("*.png")))
    print(f"Total frames available: {total}")

    # ── Scene 1: 3D heart floating (~frames 1–55) ──────────────────────────
    # Heart is visible in early frames while draw panel state has it
    heart_frames = list(range(1, 55, 4))   # every 4th frame ≈ 14 frames

    # ── Scene 2: Red star appears (~frames 90–195) ──────────────────────────
    star_red_frames = list(range(100, 200, 7))  # every 7th = ~14 frames

    # ── Scene 3: Color transition red → blue (~frames 365–420) ─────────────
    # Blue was set around frame ~380 (after the 2s wait + settings open time)
    color_change_frames = list(range(365, 420, 5))  # ~11 frames

    # ── Scene 4: Blue star floating (~frames 420–510) ───────────────────────
    star_blue_frames = list(range(420, 510, 8))  # every 8th = ~11 frames

    # ── Scene 5: Chrome spinning star (~frames 520–721) ─────────────────────
    spin_frames = list(range(520, min(722, total+1), 5))  # every 5th = ~40 frames

    # Build frame sequence with durations (ms)
    sequence = (
        [(n, 140) for n in heart_frames] +
        [(n, 130) for n in star_red_frames] +
        [(n, 110) for n in color_change_frames] +
        [(n, 130) for n in star_blue_frames] +
        [(n, 100) for n in spin_frames]
    )

    print(f"Selected {len(sequence)} frames for GIF")

    frames = []
    durations = []
    for (n, ms) in sequence:
        img = load(n)
        if img is None:
            print(f"  Warning: frame {n} missing, skipping")
            continue
        frames.append(resize(img))
        durations.append(ms)

    if not frames:
        print("No frames loaded!")
        sys.exit(1)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    print(f"Saving GIF to {OUTPUT}")

    frames[0].save(
        OUTPUT,
        save_all=True,
        append_images=frames[1:],
        optimize=True,
        duration=durations,
        loop=0,
    )

    size_mb = OUTPUT.stat().st_size / 1024 / 1024
    print(f"Done! {size_mb:.1f} MB  ({len(frames)} frames, ~{sum(durations)/1000:.1f}s)")

if __name__ == "__main__":
    main()
