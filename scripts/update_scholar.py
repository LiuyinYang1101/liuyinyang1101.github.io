#!/usr/bin/env python3
"""Refresh the Google Scholar numbers in index.html.

Reads the public Scholar profile page (no API key, standard library only) and
rewrites, in place:
  - every element marked data-scholar="citations" / "h-index" / "i10-index"
  - data-scholar="papers"  -> number of publications listed on the page
  - data-scholar="date"    -> current month, e.g. "October 2026"
  - the "N citations" line of each <li class="item" data-scholar-id="...">

The file is only written when a number actually changed. Scholar papers that
are not on the page are reported but never added: that needs a human (venue,
links, description).

Usage:  python3 scripts/update_scholar.py [--dry-run] [--force]
Exit 1 if Scholar could not be read (e.g. CAPTCHA); index.html is untouched.
"""
import datetime
import html
import pathlib
import re
import sys
import time
import urllib.request

SCHOLAR_USER = "GLgF-JMAAAAJ"
URL = f"https://scholar.google.com/citations?user={SCHOLAR_USER}&hl=en&cstart=0&pagesize=100"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")
INDEX = pathlib.Path(__file__).resolve().parent.parent / "index.html"
MAX_DROP = 0.2  # refuse a >20% fall in total citations unless --force (likely a bad parse)


def fetch(retries=3):
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(URL, headers={"User-Agent": UA, "Accept-Language": "en"})
            with urllib.request.urlopen(req, timeout=30) as r:
                page = r.read().decode("utf-8", "replace")
            if "gsc_rsb_std" in page:
                return page
            print(f"attempt {attempt}: no stats table (CAPTCHA / block page?)", file=sys.stderr)
        except Exception as e:  # network error, HTTP 429, ...
            print(f"attempt {attempt}: {e}", file=sys.stderr)
        if attempt < retries:
            time.sleep(30 * attempt)
    sys.exit("Could not read the Google Scholar profile; index.html left unchanged.")


def parse(page):
    # Stats table: citations (all, since), h-index (all, since), i10-index (all, since)
    std = [int(x) for x in re.findall(r'class="gsc_rsb_std">(\d+)<', page)]
    if len(std) < 6:
        sys.exit("Unexpected Scholar page layout (stats table).")
    totals = {"citations": std[0], "h-index": std[2], "i10-index": std[4]}

    papers = {}
    for row in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', page, re.S):
        cid = re.search(rf'citation_for_view={SCHOLAR_USER}:([^"&]+)', row)
        title = re.search(r'class="gsc_a_at">(.*?)</a>', row, re.S)
        cites = re.search(r'class="gsc_a_ac gs_ibl"[^>]*>(\d*)<', row)
        if cid and title:
            papers[cid.group(1)] = (
                int(cites.group(1)) if cites and cites.group(1) else 0,
                html.unescape(re.sub(r"<[^>]+>", "", title.group(1))),
            )
    if not papers:
        sys.exit("Unexpected Scholar page layout (no publication rows).")
    return totals, papers


def cites_label(n):
    return f"{n} citation" if n == 1 else f"{n} citations"


def update_item(block, n):
    """Set, add or remove the item-cites span inside one publication <li>."""
    span = re.search(r'\n\s*<span class="item-cites">[^<]*</span>', block)
    if n == 0:
        return block.replace(span.group(0), "") if span else block
    new = f'<span class="item-cites">{cites_label(n)}</span>'
    if span:
        return re.sub(r'<span class="item-cites">[^<]*</span>', new, block)
    # first citation: put it at the start of the item footer, matching its indentation
    foot = re.search(r'(<div class="item-foot">)(\n\s*)', block)
    return block[:foot.end(1)] + foot.group(2) + new + block[foot.end(1):]


def main():
    dry_run, force = "--dry-run" in sys.argv, "--force" in sys.argv
    src = INDEX.read_text(encoding="utf-8")
    totals, papers = parse(fetch())

    old = re.search(r'data-scholar="citations">(\d+)<', src)
    if old and not force and totals["citations"] < (1 - MAX_DROP) * int(old.group(1)):
        sys.exit(f"Total citations fell {old.group(1)} -> {totals['citations']}; "
                 "refusing (rerun with --force if that is real).")

    on_page = set()

    def item(m):
        cid = m.group(1)
        on_page.add(cid)
        if cid not in papers:
            print(f"warning: {cid} is on the page but not on Scholar; left as is", file=sys.stderr)
            return m.group(0)
        return update_item(m.group(0), papers[cid][0])

    out = re.sub(r'<li class="item[^"]*"[^>]*data-scholar-id="([^"]+)"[^>]*>.*?</li>',
                 item, src, flags=re.S)
    values = dict(totals, papers=len(on_page))
    for key, val in values.items():
        out = re.sub(rf'(data-scholar="{key}">)[^<]*(<)', rf"\g<1>{val}\2", out)

    if out != src:  # only move the "as of" date when a number moved
        today = datetime.date.today()
        out = re.sub(r'(data-scholar="date">)[^<]*(<)',
                     rf"\g<1>{today:%B} {today.year}\2", out)

    print("Scholar: " + ", ".join(f"{k} {v}" for k, v in totals.items()))
    for cid, (n, title) in papers.items():
        if cid not in on_page:
            print(f"note: not on the page: [{cid}] {title} ({cites_label(n)})")

    if out == src:
        print("index.html already up to date.")
    elif dry_run:
        print("index.html would change (dry run, not written).")
    else:
        INDEX.write_text(out, encoding="utf-8")
        print("index.html updated.")


if __name__ == "__main__":
    main()
