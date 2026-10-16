"""Generate the favicon set from the brand SVG.

`public/icons/favicon.svg` is the single source of truth: this reads the disc
radius and the glyph path straight out of it, so re-exporting the artwork and
re-running this script is all it takes to refresh every icon.

The glyph is filled with Pillow's polygon rasteriser, which uses the same
non-zero winding rule a browser applies to the SVG's default `fill-rule`, so the
self-intersecting counter of the mark comes out correctly.

Run from `apps/client`:
    python scripts/make-icons.py
"""

from __future__ import annotations

import re
from pathlib import Path

from PIL import Image, ImageDraw

PUBLIC = Path(__file__).resolve().parents[1] / "public"
SVG = PUBLIC / "icons" / "favicon.svg"

# The brand purple, read from the SVG's `.st1` rule.
BRAND = (129, 88, 255, 255)
WHITE = (255, 255, 255, 255)

# Rendered well above the largest target so the downscale antialiases the glyph.
SUPERSAMPLE = 8
MASTER = 512

# Sizes Windows and browsers actually pick from a multi-size .ico.
ICO_SIZES = [16, 32, 48, 64]

CURVE_STEPS = 48


def flatten_path(data: str) -> list[list[tuple[float, float]]]:
    """Flatten an SVG path into subpaths of points.

    Handles the absolute and relative forms of M, L, H, V, C and Z, which is the
    complete vocabulary of this artwork. It is deliberately not a general SVG
    engine — anything it does not understand raises instead of silently drawing
    the wrong thing.
    """
    tokens = re.findall(r"[MmLlHhVvCcZz]|-?\d*\.?\d+", data)

    subpaths: list[list[tuple[float, float]]] = []
    current: list[tuple[float, float]] = []
    x = y = 0.0
    start = (0.0, 0.0)
    command = ""
    index = 0

    def number() -> float:
        nonlocal index
        value = float(tokens[index])
        index += 1
        return value

    def cubic(
        p0: tuple[float, float],
        c1: tuple[float, float],
        c2: tuple[float, float],
        p1: tuple[float, float],
    ) -> list[tuple[float, float]]:
        points = []
        for step in range(1, CURVE_STEPS + 1):
            t = step / CURVE_STEPS
            u = 1 - t
            points.append(
                (
                    u**3 * p0[0]
                    + 3 * u * u * t * c1[0]
                    + 3 * u * t * t * c2[0]
                    + t**3 * p1[0],
                    u**3 * p0[1]
                    + 3 * u * u * t * c1[1]
                    + 3 * u * t * t * c2[1]
                    + t**3 * p1[1],
                )
            )
        return points

    while index < len(tokens):
        token = tokens[index]

        if re.fullmatch(r"[MmLlHhVvCcZz]", token):
            command = token
            index += 1
            if command in "Zz":
                if len(current) > 2:
                    subpaths.append(current)
                current = []
                x, y = start
                continue
        elif not command:
            raise SystemExit("SVG path data begins with a coordinate")

        if command in "Mm":
            x, y = number(), number()
            if command == "m":
                x, y = start[0] + x, start[1] + y
            if len(current) > 2:
                subpaths.append(current)
            current = [(x, y)]
            start = (x, y)
        elif command in "Ll":
            nx, ny = number(), number()
            if command == "l":
                nx, ny = x + nx, y + ny
            x, y = nx, ny
            current.append((x, y))
        elif command in "Hh":
            nx = number()
            x = x + nx if command == "h" else nx
            current.append((x, y))
        elif command in "Vv":
            ny = number()
            y = y + ny if command == "v" else ny
            current.append((x, y))
        elif command in "Cc":
            p0 = (x, y)
            c1x, c1y = number(), number()
            c2x, c2y = number(), number()
            px, py = number(), number()
            if command == "c":
                c1x, c1y = x + c1x, y + c1y
                c2x, c2y = x + c2x, y + c2y
                px, py = x + px, y + py
            x, y = px, py
            current.extend(cubic(p0, (c1x, c1y), (c2x, c2y), (px, py)))
        else:  # pragma: no cover - unreachable, the token regex guards it
            raise SystemExit(f"unsupported SVG path command: {command}")

    if len(current) > 2:
        subpaths.append(current)

    if not subpaths:
        raise SystemExit("SVG path produced no closed subpaths")

    return subpaths


def read_artwork() -> tuple[float, float, list[list[tuple[float, float]]]]:
    """Return `(viewbox, disc_radius, glyph_subpaths)` from the brand SVG."""
    source = SVG.read_text(encoding="utf-8")

    viewbox_match = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', source)
    if not viewbox_match:
        raise SystemExit(f"no viewBox found in {SVG}")
    width = float(viewbox_match.group(1))

    circle = re.search(r'<circle[^>]*\sr="([\d.]+)"', source)
    if not circle:
        raise SystemExit(f"no backdrop <circle r=...> found in {SVG}")
    radius = float(circle.group(1))

    path = re.search(r'<path[^>]*\sd="([^"]+)"', source)
    if not path:
        raise SystemExit(f"no glyph <path d=...> found in {SVG}")

    return width, radius, flatten_path(path.group(1))


def render(
    size: int,
    viewbox: float,
    radius: float,
    glyph: list[list[tuple[float, float]]],
    transparent: bool,
) -> Image.Image:
    """Draw the disc and glyph at `size`, optionally with a transparent field."""
    big = size * SUPERSAMPLE
    scale = big / viewbox

    image = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    if not transparent:
        # Most consumers composite onto an unknown background; an opaque field
        # keeps the white glyph legible in dark browser chrome.
        draw.rectangle((0, 0, big, big), fill=BRAND)

    centre = big / 2
    extent = radius * scale
    draw.ellipse(
        (centre - extent, centre - extent, centre + extent, centre + extent),
        fill=BRAND,
    )

    for subpath in glyph:
        draw.polygon([(px * scale, py * scale) for px, py in subpath], fill=WHITE)

    return image.resize((size, size), Image.LANCZOS)


def main() -> None:
    if not SVG.exists():
        raise SystemExit(f"missing source artwork: {SVG}")

    viewbox, radius, glyph = read_artwork()

    opaque = render(MASTER, viewbox, radius, glyph, transparent=False)
    masked = render(MASTER, viewbox, radius, glyph, transparent=True)

    opaque.save(PUBLIC / "favicon.ico", sizes=[(s, s) for s in ICO_SIZES])
    opaque.resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon.png")
    masked.resize((512, 512), Image.LANCZOS).save(PUBLIC / "icon-512.png")
    masked.resize((192, 192), Image.LANCZOS).save(PUBLIC / "icon-192.png")

    for name in (
        "favicon.ico",
        "apple-touch-icon.png",
        "icon-512.png",
        "icon-192.png",
    ):
        path = PUBLIC / name
        with Image.open(path) as image:
            print(
                f"{name}: {image.size[0]}x{image.size[1]}, {path.stat().st_size} bytes"
            )


if __name__ == "__main__":
    main()
