# AI Conversation Log

This directory tracks all AI-assisted development sessions for this project.

## Structure

```
AIConversationLog/
├── CONVERSATION_LOGBOOK.md  (current active sessions)
├── archive/                  (old sessions, archived when main file > 500 lines)
│   ├── 12-12-2025.md
│   └── ...
└── README.md                 (this file)
```

## Usage

**Active Development:**

- All current work goes in `CONVERSATION_LOGBOOK.md`
- Use the session summary template to update after each work session

**Archiving:**
When `CONVERSATION_LOGBOOK.md` exceeds ~500 lines:

1. Move old sessions to `archive/[MM-DD-YYYY].md` (e.g., `12-12-2025.md`)
2. Keep most recent 2-3 sessions in main logbook for context
3. Add link in main logbook: "See `archive/2025-Q4.md` for sessions before [date]"

## Quick Reference

- **Session Template:** `../.claude/agents/SESSION_SUMMARY_TEMPLATE.md`
- **Current Sessions:** `CONVERSATION_LOGBOOK.md`
- **Old Sessions:** `archive/`
