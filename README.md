# Attendance Tracker

A single-user, no-login attendance tracker for your III Semester (2026–2027 Odd Sem) timetable at RVCE. Static site, no backend — all data lives in your browser's localStorage.

## Running it

Any static file server works. From this folder:

```bash
python -m http.server 8934
```

Then open http://localhost:8934 in your browser. (Opening `index.html` directly by double-clicking can work too, but some browsers restrict localStorage on `file://` pages — a local server is more reliable.)

To use it as an installable app on your phone or laptop, open it in Chrome/Edge and use "Install app" / "Add to Home Screen" — it has a manifest for that.

## What's baked in

- **Semester range**: 7 Sep 2026 – 21 Dec 2026 (from your official III Sem academic calendar)
- **Weekly timetable**: pulled from your Google Calendar "College" calendar
- **Holidays**: the full 2026 Karnataka general holiday list from your college circular
- **Attendance target**: 75%

All of the above are editable in the Settings tab — dates, timetable slots, and holidays are just data, not hardcoded logic.

## Features

- **Today tab**: log Present / Absent / Cancelled per class, with quick reason tags (Sick, Personal, College event, etc.) for absences. Navigate to any date, not just today, to back-fill.
- **Dashboard**: per-subject and overall attendance %, color-coded against your target, plus a bunk calculator — "can skip N more" or "must attend next N" to hit 75%.
- **Calendar**: month view color-coded (all attended / missed one+ / unlogged / holiday). Click any day to edit it.
- **Mark a day as an official holiday**: from the Today tab or the calendar day view, one click flags any date as a holiday (with a reason) or removes that flag — no need to go into Settings. This is the same holiday list Settings edits, just reachable inline.
- **Per-day timetable overrides**: also from Today / the calendar day view —
  - "Not held today (temporary change)" on any scheduled class removes it for *that date only*; the recurring weekly timetable is untouched.
  - "+ Add extra class for this day" adds a one-off class (any subject, including a brand-new one) for that date only — for substitutions, makeup classes, or an extra class added on a normally-free day. It even works on holidays/weekends if a makeup class is actually held.
- **Settings**: edit semester dates, weekly timetable (including per-class weight), holidays, attendance target; export/import a JSON backup (important since this is localStorage-only — clearing browser data wipes it); reset everything.
- **Bulk day actions**: "✓ Present today" / "✗ Absent today" on the Today tab (and the calendar day view) mark every class scheduled that day in one click, instead of tapping each one individually.
- **Theory/lab split advice**: for a subject with both lecture and lab sessions (e.g. DSA), the Dashboard card shows two separate bunk-calculator lines — "Theory: ..." and "Lab: ..." — instead of one blended number, since missing a lab burns through your buffer twice as fast. Subjects with only one type (Math, DTL, etc.) still show a single line.
- **Missed classes log**: at the bottom of the Dashboard, every absence you've logged (across the whole semester) is listed with subject, date, time, and reason, most recent first. Click any entry to jump to that day and edit it.
- **Theme toggle**: auto/light/dark.
- **Layout toggle**: force Phone or Laptop layout regardless of screen size, or leave it Auto (responsive).

## Notes on the class-count logic

- Each timetable slot has a **weight** (shown as a badge, e.g. "2x") — a 1-hour lecture is weight 1, a 2-hour lab is weight 2, so a lab attendance/absence counts double toward your held/attended totals. This matches how VTU-style attendance is actually computed (by hours, not by session count), not just distinct sessions. Weight is editable per slot in Settings, or per ad-hoc extra class.
- **Labs are not separate subjects.** DSA Lab counts as DSA (weight 2), ADLD Lab counts as ADLD (weight 2). DTL only exists as a lab, so it's its own subject "DTL". There's one Dashboard card per real subject — no split lecture/lab cards.
- A class only counts toward your % once you log it. Unlogged past classes show up in a banner and in the calendar as "Unlogged" so you know to back-fill.
- "Cancelled" classes are excluded from both attended and held counts — they don't help or hurt your percentage.
- The academic calendar's CIE test weeks (e.g. 9–13 Oct) are **not** automatically treated as no-class days, since tests are typically held in the normal timetable slot rather than cancelling it. If your college actually suspends classes during test week, mark those dates as holidays (from Today or Settings).
