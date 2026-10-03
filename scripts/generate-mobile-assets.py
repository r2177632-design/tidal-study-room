"""Generate lightweight WebP assets for mobile devices."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
MOBILE_ROOT = ROOT / "assets" / "mobile"

JOBS = [
    (
        ROOT / "assets" / "characters" / "collection" / "final",
        MOBILE_ROOT / "characters" / "collection",
        (900, 1500),
        80,
    ),
    (
        ROOT / "assets" / "characters" / "pretty" / "cutouts",
        MOBILE_ROOT / "characters" / "pretty",
        (900, 1500),
        82,
    ),
    (
        ROOT / "assets" / "characters" / "cute" / "cutouts",
        MOBILE_ROOT / "characters" / "cute",
        (760, 1100),
        82,
    ),
    (
        ROOT / "assets" / "farm" / "doubao",
        MOBILE_ROOT / "farm" / "doubao",
        (1600, 900),
        78,
    ),
    (
        ROOT / "assets" / "farm" / "workbuddy",
        MOBILE_ROOT / "farm" / "workbuddy",
        (1400, 900),
        76,
    ),
]


def generate(source_dir: Path, target_dir: Path, size: tuple[int, int], quality: int) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)
    for source in sorted(source_dir.glob("*.png")):
        target = target_dir / f"{source.stem}.webp"
        with Image.open(source) as image:
            image.thumbnail(size, Image.Resampling.LANCZOS)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA")
            image.save(target, "WEBP", quality=quality, method=6)
        print(f"{source.relative_to(ROOT)} -> {target.relative_to(ROOT)}")


def main() -> None:
    for source_dir, target_dir, size, quality in JOBS:
        generate(source_dir, target_dir, size, quality)


if __name__ == "__main__":
    main()
