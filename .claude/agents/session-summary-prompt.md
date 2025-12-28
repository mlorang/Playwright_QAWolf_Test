# Session Summary Prompt - QA Engineering Format

Use this prompt to create a comprehensive session summary following QA engineering best practices.

---

## Prompt Template

```
Create a comprehensive QA session summary following this structure:

## Session Header
- Session number and title
- Date and time
- Duration (estimated)
- Branch name (if applicable)
- Status (Complete/In Progress/Blocked)

## Objective
Clear statement of what needed to be accomplished this session

## Test Results (if applicable)
Table showing metrics before/after:
- Passing tests
- Failing tests
- Flakiness rate
- Runtime
- Coverage

## Critical Issues Fixed
For each issue:
- Issue #N: Title with severity (🔴 CRITICAL, 🟡 HIGH, 🟢 MEDIUM, 🔵 LOW)
- Location: file.js:line or component name
- Root Cause: Why it happened (technical explanation)
- Impact: What breaks, user effect, severity
- Resolution: How it was fixed (code changes, approach)
- Verification: Evidence the fix works (test runs, metrics, screenshots)
- Result: ✅ Status

## Files Modified
List files created, modified, or deleted with brief description:
```
file.js                    (modified - what changed)
new-file.spec.js          (created - purpose)
old-file.txt              (deleted - why removed)
```

## Technical Decisions
Document WHY certain approaches were chosen:
- Decision made
- Alternatives considered
- Trade-offs analyzed
- Rationale for choice
- Assumptions that must hold

## Achievements
Bullet points of major wins in this session

## Alternative Approaches Considered (if applicable)
Table format:
| Approach | Pros | Cons | Decision |

## Commands Reference
Useful bash commands from this session:
```bash
# Run the thing
npm run command
```

## Validation Checklist
- [x] Completed items
- [ ] Outstanding items

## Next Session Actions
- [ ] Tasks for next time
- [ ] Known issues to address
- [ ] Improvements to consider

---

## Guidelines

**Focus on QA Engineering Priorities:**
1. Quality Metrics - Pass/fail rates, coverage, flakiness
2. Evidence-Based - Root cause + verification for every fix
3. Risk-Centric - Severity levels, impact analysis
4. Traceability - Clear bug tracking from discovery to resolution
5. Decision Rationale - Why certain approaches over alternatives

**What to Include:**
✅ Test results with before/after metrics
✅ Root cause analysis for bugs
✅ Verification evidence (test runs, logs, metrics)
✅ Technical decisions and rationale
✅ Clear severity assessment for issues
✅ Reproducible commands

**What to Avoid:**
❌ Verbose narratives about process
❌ Duplicate information from test files
❌ Unactionable observations
❌ Missing evidence or verification steps
❌ Vague descriptions like "made it better"

**Tone:**
- Professional and concise
- Focus on facts and evidence
- Technical accuracy over storytelling
- Clear severity and impact assessment

---

## Session Summary Format Reference

See existing session files for examples:
- session-7-main.md - Bug fixes with verification
- session-5-performanceBenchmarks.md - Infrastructure creation
- session-4-main.md - Test suite improvements

Key sections to always include:
1. Header (date, duration, branch, status)
2. Objective (clear goal)
3. Results (metrics, evidence)
4. Issues (root cause, fix, verification)
5. Files (what changed)
6. Decisions (why certain approaches)
7. Next actions (clear priorities)
```

---

## Usage

1. **At end of session**, use this prompt to generate summary
2. **Save as**: `logbook/sessions/session-N-{branch}.md`
3. **Update**: `logbook/INDEX.md` with new session entry
4. **Verify**: All metrics, commands, and paths are accurate

---

## Example Invocation

```
I just completed a work session. Please create a QA engineering session summary using the session-summary-prompt format.

Context:
- Session focus: [describe main work]
- Files changed: [list key files]
- Tests results: [pass/fail metrics]
- Issues found/fixed: [list issues]
- Duration: [estimated time]

Use the QA engineering format with:
- Clear objective
- Test results table
- Issues with root cause and verification
- Technical decisions explained
- Evidence-based validation
```
