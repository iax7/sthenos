# Sthenos

A client-side fitness tracker: a single profile plus a list of exercise test entries, scored locally and stored in the browser.

## Language

**Test**:
A single recorded session — one date with an entry for each exercise (pull-ups, push-ups, squats, v-ups, burpees) plus the Cooper test.
_Avoid_: Entry, workout, session, record

**Score**:
The total points for a Test: the sum of each exercise's points plus the Cooper points. The headline number used across the dashboard.
_Avoid_: Points (when it means the total), total

**Exercise points**:
The points contributed by one exercise in a Test, computed as reps × version multiplier (or reps when no multiplier applies).
_Avoid_: Metric points

**Improvement**:
The change in Score from the earliest Test to the latest, in points — the dashboard's plain-language progress readout.
_Avoid_: Trend, delta, progression

**Best**:
The highest Score recorded across all Tests.
_Avoid_: Max, personal record, peak

**Fitness level**:
The Cooper test's normalised rating for a Test — 1 (very bad) to 5 (very good) — derived from distance, age and gender.
_Avoid_: Cooper level number, category, band

**Laps**:
The Cooper test's input unit; multiplied by 320 m to give the distance used for scoring.
_Avoid_: Coopers, metres (as input)
