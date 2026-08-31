#!/usr/bin/env python3
"""Build the GitHub Pages site.

index.html is generated from tools/index.template.html + data.json so that the
full dataset is INLINE in the page. (External <script src="data.json"
type="application/json"> tags do NOT expose their fetched content through
textContent in browsers, so the app previously parsed an empty string and the
whole page rendered blank.)

Usage:  python3 tools/build-site.py
Output: index.html  (committed; data.json remains the canonical dataset)
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "tools", "index.template.html")
DATA = os.path.join(ROOT, "data.json")
OUT = os.path.join(ROOT, "index.html")

template = open(TPL, encoding="utf-8").read()
if "__SITE_DATA__" not in template:
    raise SystemExit("template marker __SITE_DATA__ not found in " + TPL)

data = open(DATA, encoding="utf-8").read()
# Validate JSON before inlining.
json.loads(data)

# Escape "</" (e.g. "</script" inside string values) so the inline data block
# cannot be terminated early by the HTML parser. "\/" is a valid JSON escape.
safe = data.replace("</", "<\\/")

html = template.replace("__SITE_DATA__", safe)
open(OUT, "w", encoding="utf-8").write(html)

# Sanity checks
assert html.count('<script id="site-data" type="application/json">') == 1
assert "</script" not in re.sub(r'<\\/script', '', safe)  # no raw close tags in data
print("index.html built: %d bytes (data block %d bytes)" % (len(html.encode('utf-8')), len(safe)))
