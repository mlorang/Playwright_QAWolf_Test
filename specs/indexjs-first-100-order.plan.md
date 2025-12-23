# HN-first-100-order Test Plan

## Application Overview

Verify that the `index.js` script correctly determines whether the first 100 Hacker News `/newest` articles are sorted newest→oldest. Cover happy path, pagination, timestamp parsing, missing/malformed timestamps, dynamic inserts, and optional HN API fallback.

## Test Scenarios

### 1. Hacker News /newest — First 100 ordering

**Seed:** `tests/seed.spec.ts`

#### 1.1. Happy path — first 100 are sorted newest→oldest

**File:** `tests/hn-first-100-order.spec.ts`

**Steps:**
  1. Open a fresh browser context and navigate to `https://news.ycombinator.com/newest`.
  2. Collect timestamps from visible articles using the `.age[title]` attribute and collect until EXACTLY 100 timestamps are gathered, paginating by clicking `a.morelink` as needed.
  3. Trim to 100 entries and convert each timestamp to a Date object.
  4. Assert that for each i: Date[i] >= Date[i+1] (non-increasing order).

**Expected Results:**
  - Exactly 100 timestamps are collected and parsed to Date objects.
  - The array of Date objects is non-increasing (newest → oldest).
  - On failure, collect diagnostics: sampled DOM snippets, article ids/titles, and full collected JSON.

#### 1.2. Pagination continuity — duplicates across pages should not prevent reaching 100

**File:** `tests/hn-pagination-continuity.spec.ts`

**Steps:**
  1. Collect unique article ids while paginating via `a.morelink` until 100 unique ids are collected or `a.morelink` disappears.
  2. Ensure duplicates across page boundaries are detected and ignored while advancing the collection.

**Expected Results:**
  - 100 unique ids are collected (or a failure with diagnostic artifacts if less than 100 are reachable).
  - Each `More` click yields new articles or the collector reports page exhaustion with useful diagnostics.

#### 1.3. Missing or inconsistent timestamps — tolerant behavior

**File:** `tests/hn-missing-timestamps.spec.ts`

**Steps:**
  1. Collect timestamps and article ids for the first 100 articles (or until exhaustion).
  2. Calculate the count of parsable timestamps from `.age[title]`.
  3. If parsable coverage ≥ 70%: run ordering assertion on parsed subset and log missing items as diagnostics. If coverage < 70%: mark the ordering assertion as SKIPPED/INCONCLUSIVE and emit diagnostics (ids, DOM).

**Expected Results:**
  - If enough timestamps exist, ordering is validated; otherwise, the test is skipped and diagnostics are attached to the report.

#### 1.4. Malformed timestamps — parsing resilience

**File:** `tests/hn-malformed-timestamps.spec.ts`

**Steps:**
  1. When a timestamp string exists, attempt robust parsing (ISO → Date, fallback regex for 10-digit epoch).
  2. Log all unparsable or malformed timestamp strings with article id/title and DOM snippet. Ensure parsing errors do not crash the test run.

**Expected Results:**
  - Malformed or unparsable timestamps are reported as diagnostics; the collector continues and does not crash.

#### 1.5. Dynamic insertion & race conditions

**File:** `tests/hn-dynamic-inserts.spec.ts`

**Steps:**
  1. While paginating, detect duplicate ids and record timestamps/positions when duplicates are observed.
  2. Apply a reconciliation rule (e.g., deduplicate by id and proceed) and continue until 100 unique ids are collected.
  3. Verify ordering only when authoritative timestamps are sufficiently present and stable. If ordering anomalies are observed, emit granular diagnostics showing before/after positions and timestamps.

**Expected Results:**
  - Collector reaches 100 unique ids without being trapped by live insertions and reports meaningful diagnostics if ordering anomalies are detected.

#### 1.6. Fallback to HN API for authoritative timestamps (optional)

**File:** `tests/hn-api-fallback.spec.ts`

**Steps:**
  1. If `.age[title]` coverage is insufficient, fetch `https://hacker-news.firebaseio.com/v0/item/<id>.json` for missing ids and use the `time` field as epoch seconds.
  2. Re-run ordering checks using API-provided timestamps for items that lacked DOM timestamps. Log API failures or rate-limited responses as diagnostics.

**Expected Results:**
  - API fallback increases authoritative timestamp coverage and allows deterministic ordering checks or produces a clear failure with API diagnostics if the fallback is unavailable.

#### 1.7. Fewer than 100 reachable — fail and report diagnostics

**File:** `tests/hn-reachability.spec.ts`

**Steps:**
  1. Attempt to collect 100 unique article ids by paginating until `a.morelink` disappears or no new ids appear after multiple iterations.
  2. If <100 unique ids found, fail the test and attach collected artifacts (ids, timestamps, DOM snippets, and request logs).

**Expected Results:**
  - If fewer than 100 unique items are reachable, the test reports a clear failure with full diagnostics for manual triage.
