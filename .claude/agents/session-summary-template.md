# Session Summary Template

Use this prompt at the end of any work session to generate a comprehensive summary:

---

## Prompt:

```
Please create a comprehensive session summary for the work completed:

1. **Read existing context**:
   - Check CONVERSATION_LOGBOOK.md for previous sessions
   - Review git status to see what changed

2. **Analyze current session**:
   - Files created, modified, or deleted
   - Tests written and their results
   - Bugs fixed or features implemented
   - Configuration or infrastructure changes
   - Documentation updates

3. **Document challenges**:
   - Problems encountered during the session
   - How they were resolved
   - Workarounds or alternative approaches taken
   - Tools or techniques that didn't work

4. **Append new session entry to CONVERSATION_LOGBOOK.md**:
   - Date/time and estimated duration
   - Clear, bulleted list of tasks completed
   - Files modified with brief descriptions
   - Current test suite status
   - Key technical decisions made
   - Issues resolved with explanations
   - Future improvements or next steps identified

**Guidelines**:
- Keep it concise but comprehensive
- Focus on WHAT was accomplished, not how long it took
- Use the existing logbook format as a template
- Include specific file paths and line numbers where relevant
- Highlight any breaking changes or important decisions
```

---

## Usage:

1. Copy the prompt above
2. Paste it into your conversation with Claude
3. Claude will analyze the session and update CONVERSATION_LOGBOOK.md
4. Review and adjust if needed

## Tips:

- Run this at natural breakpoints (end of day, after completing a major feature, before switching tasks)
- The more context you provide, the better the summary
- Feel free to modify the prompt for specific needs (e.g., "focus on security changes" or "emphasize performance improvements")

## Archiving:

When `CONVERSATION_LOGBOOK.md` exceeds ~500 lines:

1. Move old sessions to `archive/[YYYY-QQ].md` (e.g., `2025-Q4.md`)
2. Keep most recent 2-3 sessions in main logbook for context
3. Add note at top: "Earlier sessions: see `archive/2025-Q4.md`"
