"""Print the JSON-LD graph of a route, pretty-printed, for manual review.

    python scripts/jsonld.py http://localhost:3000 /dieline/<slug>
"""

from __future__ import annotations

import json
import sys
import urllib.request
from html.parser import HTMLParser

url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
path = sys.argv[2] if len(sys.argv) > 2 else "/"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


class Collector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[str] = []
        self._capture = False
        self._buffer: list[str] = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "script" and attributes.get("type") == "application/ld+json":
            self._capture = True
            self._buffer = []

    def handle_endtag(self, tag):
        if tag == "script" and self._capture:
            self.blocks.append("".join(self._buffer))
            self._capture = False

    def handle_data(self, data):
        if self._capture:
            self._buffer.append(data)


with urllib.request.urlopen(f"{url}{path}", timeout=60) as response:
    body = response.read().decode("utf-8", errors="replace")

collector = Collector()
collector.feed(body)

print(f"--- JSON-LD for {path} ({len(collector.blocks)} block(s)) ---")
for index, block in enumerate(collector.blocks, start=1):
    print(f"\n===== block {index} =====")
    print(json.dumps(json.loads(block), ensure_ascii=False, indent=2))
