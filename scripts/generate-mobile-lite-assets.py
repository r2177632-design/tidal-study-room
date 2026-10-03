"""Generate lightweight thumbnails and farm assets for mobile startup."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]


def save_webp(source: Path, target: Path, size: tuple[int, int], quality: int) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image.thumbnail(size, Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA")
        image.save(target, "WEBP", quality=quality, method=6)
    print(f"{source.relative_to(ROOT)} -> {target.relative_to(ROOT)}")


def generate_collection_thumbnails() -> None:
    source_dir = ROOT / "assets" / "mobile" / "characters" / "collection"
    target_dir = ROOT / "assets" / "mobile" / "characters" / "collection-thumbs"
    for source in sorted(source_dir.glob("*.webp")):
        save_webp(source, target_dir / source.name, (240, 400), 68)


def generate_farm_assets() -> None:
    farm_root = ROOT / "assets" / "farm" / "doubao"
    target_root = ROOT / "assets" / "mobile" / "farm" / "doubao"
    for source in sorted(farm_root.glob("map-*-v2-2560.webp")):
        target = target_root / source.name.replace("-v2-2560.webp", "-v2-1600.webp")
        save_webp(source, target, (1600, 900), 76)

    save_webp(
        farm_root / "buildings" / "tide-meadow-cottage.png",
        target_root / "buildings" / "tide-meadow-cottage.webp",
        (420, 420),
        82,
    )
    save_webp(
        ROOT / "assets" / "farm" / "npc" / "lanyin-portrait-v1.png",
        target_root / "npc" / "lanyin-portrait-v1.webp",
        (430, 430),
        78,
    )


def generate_launcher_assets() -> None:
    source = ROOT / "assets" / "launcher" / "tidal-study-192.png"
    target = ROOT / "assets" / "launcher" / "tidal-study.ico"
    with Image.open(source) as image:
        image.convert("RGBA").save(
            target,
            "ICO",
            sizes=[(16, 16), (32, 32)],
        )
    print(f"{source.relative_to(ROOT)} -> {target.relative_to(ROOT)}")


def main() -> None:
    generate_collection_thumbnails()
    generate_farm_assets()
    generate_launcher_assets()


if __name__ == "__main__":
    main()
