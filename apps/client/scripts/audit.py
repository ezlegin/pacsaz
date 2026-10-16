"""Fetch the key routes from a running deployment and audit their SEO output.

Reads the rendered HTML rather than the source, so it checks what a crawler
actually receives: titles, canonicals, robots directives, Open Graph tags and the
JSON-LD graph, plus `robots.txt`, `sitemap.xml` and the `llms.txt` files.

The JSON-LD is validated as a graph, not merely for presence: dangling `@id`
references, `Product` nodes missing required fields, breadcrumb positions that
are not sequential, and `numberOfItems` disagreeing with the list it counts.

Usage (from apps/client, with a server running):
    python scripts/audit.py http://localhost:3000

Exits non-zero on any failure, so it can gate a deploy.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from typing import Any

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000").rstrip("/")

# The report contains Persian route content; a Windows console defaults to a
# legacy codepage that cannot encode it and would abort the run mid-table.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HTML_ROUTES = [
    "/",
    "/dielines",
    "/faq",
    "/subscription",
    "/about-us",
    "/contact-us",
    "/terms",
    "/login",
]

# Routes that must never be indexable, and are checked for it.
PRIVATE_ROUTES = {"/login", "/onboarding", "/payment", "/payment/result"}

PASS = "PASS"
FAIL = "FAIL"
WARN = "WARN"

results: list[tuple[str, str, str]] = []


def record(route: str, status: str, message: str) -> None:
    results.append((route, status, message))


def fetch(path: str) -> tuple[int, str, dict[str, str]]:
    request = urllib.request.Request(
        f"{BASE}{path}",
        headers={"User-Agent": "seo-audit/1.0 (+https://pacsaz.ir)"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.status, body, dict(response.headers)
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        return error.code, body, dict(error.headers)


class Head(HTMLParser):
    """Collects the SEO-relevant parts of `<head>` and every JSON-LD block."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.meta: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.jsonld: list[str] = []
        self.h1: list[str] = []
        self._in_title = False
        self._in_jsonld = False
        self._in_h1 = False
        self._buffer: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        attributes = {k: (v or "") for k, v in attrs}

        if tag == "title":
            self._in_title = True
            self._buffer = []
        elif tag == "h1":
            self._in_h1 = True
            self._buffer = []
        elif tag == "meta":
            self.meta.append(attributes)
        elif tag == "link":
            self.links.append(attributes)
        elif tag == "script" and attributes.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._buffer = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self._in_title:
            self.title = "".join(self._buffer).strip()
            self._in_title = False
        elif tag == "h1" and self._in_h1:
            self.h1.append(" ".join("".join(self._buffer).split()))
            self._in_h1 = False
        elif tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._buffer))
            self._in_jsonld = False

    def handle_data(self, data: str) -> None:
        if self._in_title or self._in_jsonld or self._in_h1:
            self._buffer.append(data)

    def meta_content(self, **match: str) -> str | None:
        for entry in self.meta:
            if all(entry.get(key) == value for key, value in match.items()):
                return entry.get("content")
        return None

    def canonical(self) -> str | None:
        for entry in self.links:
            if entry.get("rel") == "canonical":
                return entry.get("href")
        return None


def parse(path: str) -> tuple[int, Head]:
    status, body, _ = fetch(path)
    parser = Head()
    parser.feed(body)
    return status, parser


def audit_html(path: str) -> None:
    status, parser = parse(path)
    if status != 200:
        record(path, FAIL, f"HTTP {status}")
        return

    problems: list[str] = []
    notes: list[str] = []

    if not parser.title:
        problems.append("no <title>")
    elif len(parser.title) > 65:
        problems.append(f"title is {len(parser.title)} chars (target <= 65)")

    description = parser.meta_content(name="description")
    if not description:
        problems.append("no meta description")
    elif not 70 <= len(description) <= 175:
        problems.append(f"description is {len(description)} chars (target 70-175)")

    canonical = parser.canonical()
    if not canonical:
        problems.append("no canonical")
    elif not canonical.startswith("http"):
        problems.append(f"canonical is not absolute: {canonical}")

    robots = parser.meta_content(name="robots")

    if path in PRIVATE_ROUTES:
        if not robots or "noindex" not in robots:
            problems.append(f"private route is indexable (robots={robots!r})")
    elif robots and "noindex" in robots:
        problems.append(f"public route is noindex (robots={robots!r})")

    og_title = parser.meta_content(property="og:title")
    og_image = parser.meta_content(property="og:image")
    og_url = parser.meta_content(property="og:url")
    twitter = parser.meta_content(name="twitter:card")

    if not og_title:
        problems.append("no og:title")
    if not og_image:
        problems.append("no og:image")
    elif not og_image.startswith("http"):
        problems.append(f"og:image is not absolute: {og_image}")
    if not og_url:
        problems.append("no og:url")
    elif canonical and og_url.rstrip("/") != canonical.rstrip("/"):
        notes.append(f"og:url {og_url} != canonical {canonical}")
    if not twitter:
        problems.append("no twitter:card")

    if path not in PRIVATE_ROUTES and not parser.h1:
        problems.append("no <h1>")
    if len(parser.h1) > 1:
        problems.append(f"{len(parser.h1)} <h1> elements")

    types: list[str] = []
    for block in parser.jsonld:
        try:
            parsed: Any = json.loads(block)
        except json.JSONDecodeError as error:
            problems.append(f"invalid JSON-LD: {error}")
            continue

        nodes = parsed if isinstance(parsed, list) else [parsed]
        for node in nodes:
            if isinstance(node, dict):
                if node.get("@context") != "https://schema.org":
                    problems.append("JSON-LD node without schema.org @context")
                types.append(str(node.get("@type")))

    if not parser.jsonld:
        notes.append("no JSON-LD")
    elif path != "/" and not any("BreadcrumbList" in t for t in types):
        notes.append("no BreadcrumbList")

    summary = (
        f"title={len(parser.title)}c desc={len(description or '')}c "
        f"h1={len(parser.h1)} jsonld={types}"
    )
    if problems:
        record(path, FAIL, "; ".join(problems) + f" | {summary}")
    elif notes:
        record(path, WARN, "; ".join(notes) + f" | {summary}")
    else:
        record(path, PASS, summary)


def audit_graph(path: str) -> None:
    """Verify the JSON-LD on a route is a connected, well-formed graph.

    A present-but-broken graph is worse than none: an unresolved `@id` reference
    makes the entity look inconsistent, and a `Product` whose required fields are
    empty is rejected outright by the rich-results parser.
    """
    status, parser = parse(path)
    label = f"{path} [graph]"

    if status != 200:
        record(label, FAIL, f"HTTP {status}")
        return

    nodes: list[dict[str, Any]] = []
    for block in parser.jsonld:
        try:
            parsed = json.loads(block)
        except json.JSONDecodeError as error:
            record(label, FAIL, f"invalid JSON: {error}")
            return
        for node in parsed if isinstance(parsed, list) else [parsed]:
            if isinstance(node, dict):
                nodes.append(node)

    problems: list[str] = []
    declared_ids = {
        node["@id"] for node in nodes if isinstance(node.get("@id"), str)
    }

    def type_names(node: dict[str, Any]) -> list[str]:
        raw = node.get("@type")
        if isinstance(raw, str):
            return [raw]
        if isinstance(raw, list):
            return [str(item) for item in raw]
        return []

    def walk(value: Any, owner: str) -> None:
        if isinstance(value, dict):
            # A bare `{"@id": ...}` is a reference; its target must exist in this
            # document or the graph is left dangling.
            if set(value.keys()) == {"@id"}:
                target = value["@id"]
                if isinstance(target, str) and target.startswith("http"):
                    if target not in declared_ids and target != owner:
                        problems.append(f"dangling @id reference: {target}")
                return
            for key, item in value.items():
                if key in {"@id", "@context"}:
                    continue
                walk(item, owner)
        elif isinstance(value, list):
            for item in value:
                walk(item, owner)

    for node in nodes:
        types = type_names(node)

        if "Product" in types:
            for required in ("name", "description", "image"):
                if not node.get(required):
                    problems.append(f"Product is missing {required}")
            offers = node.get("offers")
            if isinstance(offers, dict):
                if not offers.get("priceCurrency"):
                    problems.append("Product offer has no priceCurrency")
                if offers.get("price") is None and not offers.get(
                    "priceSpecification"
                ):
                    problems.append(
                        "Product offer has neither price nor priceSpecification"
                    )
            else:
                problems.append("Product has no offers")

        if "WebApplication" in types:
            offers = node.get("offers")
            if not offers:
                problems.append("WebApplication has no offers")
            elif isinstance(offers, list):
                for offer in offers:
                    if not isinstance(offer, dict):
                        continue
                    if not offer.get("priceCurrency"):
                        problems.append(
                            "WebApplication offer has no priceCurrency"
                        )
                    if offer.get("price") is None:
                        problems.append("WebApplication offer has no price")

        if "BreadcrumbList" in types:
            items = node.get("itemListElement")
            if not isinstance(items, list) or not items:
                problems.append("BreadcrumbList has no itemListElement")
            else:
                positions = [
                    item.get("position")
                    for item in items
                    if isinstance(item, dict)
                ]
                if positions != list(range(1, len(positions) + 1)):
                    problems.append(f"BreadcrumbList positions are {positions}")

        if "ItemList" in types:
            items = node.get("itemListElement")
            count = node.get("numberOfItems")
            if isinstance(items, list) and count != len(items):
                problems.append(
                    f"ItemList numberOfItems={count} but has {len(items)} items"
                )

        walk(node, str(node.get("@id", "?")))

    summary = (
        f"{len(nodes)} nodes: "
        f"{sorted({t for n in nodes for t in type_names(n)})}"
    )
    if problems:
        record(label, FAIL, "; ".join(sorted(set(problems))) + f" | {summary}")
    else:
        record(label, PASS, summary)


def audit_text(path: str, expect: list[str], min_bytes: int = 40) -> None:
    status, body, _ = fetch(path)
    if status != 200:
        record(path, FAIL, f"HTTP {status}")
        return

    if len(body) < min_bytes:
        record(path, FAIL, f"only {len(body)} bytes")
        return

    missing = [token for token in expect if token not in body]
    if missing:
        record(path, FAIL, f"missing: {missing}")
    else:
        record(path, PASS, f"{len(body)} bytes, all expected tokens present")


def main() -> None:
    for route in HTML_ROUTES:
        try:
            audit_html(route)
        except Exception as error:  # noqa: BLE001 - a report, not a library
            record(route, FAIL, f"request failed: {error}")

    # The category and dieline routes are data-dependent; take one of each from
    # the sitemap. Those URLs carry the configured public origin, which is not
    # necessarily the origin under test, so only the path is reused.
    status, sitemap, _ = fetch("/sitemap.xml")
    categories = re.findall(
        r"<loc>([^<]*?/dielines/category/[^<]+)</loc>", sitemap
    )
    dielines = re.findall(r"<loc>([^<]*?/dieline/[^<]+)</loc>", sitemap)

    if categories:
        audit_html(urllib.parse.urlparse(categories[0]).path)
    else:
        record("/dielines/category/*", WARN, "no category URLs in the sitemap")

    if dielines:
        audit_html(urllib.parse.urlparse(dielines[0]).path)
    else:
        record("/dieline/*", WARN, "no dieline URLs in the sitemap")

    # Graph-level checks on the routes that carry a non-trivial entity.
    for route in ["/", "/dielines", "/faq", "/subscription"]:
        audit_graph(route)
    if categories:
        audit_graph(urllib.parse.urlparse(categories[0]).path)
    if dielines:
        audit_graph(urllib.parse.urlparse(dielines[0]).path)

    audit_text(
        "/robots.txt",
        [
            "Sitemap:",
            "GPTBot",
            "ClaudeBot",
            "PerplexityBot",
            "Google-Extended",
            "Disallow: /panel/",
        ],
    )
    audit_text(
        "/sitemap.xml",
        ["<urlset", "/dielines/category/", "/dieline/", "<image:image"],
    )
    audit_text("/llms.txt", ["# پک‌ساز", "## قالب‌های دایلاین"])
    audit_text(
        "/llms-full.txt",
        ["# پک‌ساز", "## سوالات متداول", "## قوانین و مقررات"],
        min_bytes=2000,
    )

    width = 34
    print(f"SEO audit of {BASE}")
    print("=" * 110)
    for route, status_label, message in results:
        print(f"{route:<{width}} {status_label:<5} {message}")

    print("=" * 110)
    print(
        f"sitemap: {len(categories)} category URL(s), {len(dielines)} dieline URL(s)"
    )

    failures = [r for r in results if r[1] == FAIL]
    warnings = [r for r in results if r[1] == WARN]
    print(
        f"{len(results) - len(failures) - len(warnings)} pass, "
        f"{len(warnings)} warn, {len(failures)} fail"
    )

    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
