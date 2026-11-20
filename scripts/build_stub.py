"""Write data/<iso>.js for a country that has no weekly run yet, from its source log.

Usage: python3 scripts/build_stub.py co Colombia "Pilot in preparation: source log drafted 20 Nov 2026."
Countries with weekly runs (Chile) get data/<iso>.js from policy-windows/scripts/build_data.py instead.
"""
import csv, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
code, country, status = sys.argv[1].lower(), sys.argv[2], sys.argv[3]
log = list(csv.DictReader(open(os.path.join(ROOT, "sources", code + ".csv"), encoding="utf-8")))
data = dict(meta=dict(country=country, iso=code.upper(), status=status), sourceLog=log, weeks=[], reviews=[], topics=[], items=[])
with open(os.path.join(ROOT, "data", code + ".js"), "w", encoding="utf-8") as f:
    f.write(f"(window.PWM_BACKEND = window.PWM_BACKEND || {{}}).{code.upper()} = ")
    json.dump(data, f, ensure_ascii=False)
    f.write(";\n")
print("ok", code, len(log), "sources")
