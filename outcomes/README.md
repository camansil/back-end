# Outcome log

What happened to every policy window the monitor flagged: one row per topic and window. It is the record that later window forecasts are tested against (Implementation Plan, section 8.1), so it is kept from W11 by the Friday run and was backfilled for W1–W10 on 25 Nov 2026.

| Column | What it holds |
| --- | --- |
| `topic`, `name` | Topic id and name |
| `window_type` | Problem window or political window (which stream came first) |
| `opened`, `closed` | Week the window was flagged and the week it closed (blank while open) |
| `outcome` | `open`, `closing`, `decision taken`, `decision taken, action failed`, `attention faded`, `no government step`, `blocked` |
| `weeks_open` | Weeks between flag and close |
| `closing_reason` | The reason as written in the weekly file |
| `status_now` | Status on the date recorded |
| `recorded_on`, `source` | When and how the row was written |

Rules: one row per window (a topic that reopens gets a new row); a row is updated when its window closes; "decision taken" needs a dated decision (vote, decree, law, announced measure) with its item id in `closing_reason`.
