# Policy Window Monitor — back end

The reviewers' side of the [Policy Window Monitor](https://github.com/camansil/policy-windows): source logs, reviewer leads, the Signal Review page and the weekly runbook, with a small site to read them. The public site (Overview, Topics, Method, Data) is in `camansil/policy-windows`.

Countries: **Chile** (weekly runs since September 2026) and **Colombia** (pilot in preparation: source log drafted, no runs yet). Switch country with the menu at the top right.

## Views

- **Review signals:** the latest week's status, the stream levels with each decision, the questions from the second check, and a to-do list of audio, video or paywalled items a person needs to obtain for the next run. Decisions themselves are made on the Signal Review page on claude.ai (Chile: https://claude.ai/artifact/RWMPPYMYwcmQ9hfegbZtPh).
- **Source log:** every source the runs read, which run reads it (Thursday or Friday), how it is read and how many items it produced, with a form to add a source.
- **This run:** the week's frame, steps, limitations, validation, completeness check and discovery net.

## Structure

```
index.html                 the back-end site (no build step)
assets/backend.js, style.css
data/cl.js                 Chile data, written by policy-windows/scripts/build_data.py
data/co.js                 Colombia stub, written by scripts/build_stub.py
sources/<iso>.csv          one source log per country (cl.csv, co.csv); _template.csv to start one
leads/<ISO>/<year>-W<nn>.md   reviewer leads for a week, read first by the run
review/signal-review.html  source of the Signal Review page (published on claude.ai)
docs/WEEKLY_RUN.md         how to do the Thursday and Friday runs
scripts/review_seed.py     writes a week's signals as documents for the Signal Review page
scripts/build_stub.py      data file for a country with no run yet
```

Clone this repository next to `policy-windows`; `policy-windows/scripts/build_data.py` reads the source log and leads from here and writes `data/cl.js`.

## Visibility

This repository is public on GitHub, so its files can be read by anyone with the address even though the public site no longer links to it. To keep the back end private, make the repository private in **Settings → General → Danger zone** (GitHub Pages for private repositories needs a paid plan), or open `index.html` locally.
