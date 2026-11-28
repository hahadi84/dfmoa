"""Extract public facility facts from the MHLW foreign-patient workbook. Requires openpyxl.
Usage: python scripts/import-japan-medical-directory.py path/to/001753496.xlsx
Source: https://www.mhlw.go.jp/stf/newpage_05774.html
"""
import json
import re
import sys
from pathlib import Path
from openpyxl import load_workbook


def clean(value):
    return str(value or "").strip()


def website(value):
    for url in clean(value).split():
        if re.fullmatch(r"https?://[^\s<>]+", url):
            return url
    return ""


book = load_workbook(sys.argv[1], read_only=True, data_only=True)
records = []
seen = set()
for sheet in book:
    if not re.match(r"^\d+\.", sheet.title):
        continue
    region = int(sheet.title.split(".")[0])
    headers = next(sheet.iter_rows(min_row=2, max_row=2, values_only=True))
    assert "医療機関" in clean(headers[2]) and "外国語" in clean(headers[12]), sheet.title
    for row in sheet.iter_rows(min_row=4, values_only=True):
        name, address = clean(row[2]), clean(row[5])
        if not name or not address or (name, address) in seen:
            continue
        seen.add((name, address))
        records.append(dict(region=region, name=name, english=clean(row[3]),
                            address=address, area=clean(row[6]), phone=clean(row[7]),
                            hours=clean(row[8]), url=website(row[9]) or website(row[10]),
                            departments=clean(row[12])))
assert len({r['region'] for r in records}) == 47
out = Path(__file__).resolve().parents[1] / 'public/data/japan-medical-20261128.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(records, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(len(records), 'facilities;', out.stat().st_size, 'bytes')

