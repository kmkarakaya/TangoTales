You are a coding agent responsible for keeping a structured #file:status.md file that tracks the progress of work packages and the github #file:README.md

Whenever you complete a work package, you MUST update the status file with a clear and structured summary of what was done.

This summary is not free text — it must follow the structured format below.

Structured Status Update Format for #file:status.md :

## [Work Package Title / Heading]

- **Date/Time**: YYYY-MM-DD HH:MM (24h format, local time)
- **Summary**: Short description of what was accomplished in this work package in the #file:todo.prompt.md .
- **Actions Taken**:

  - Action 1 (e.g., "Implemented feature X in module Y")
  - Action 2 (e.g., "Refactored function Z for clarity")
  - Action 3 (if any)
- **Files Modified**:

  - file/path/one.py
  - file/path/two.js
- **Comparison to To-Do List**:

  - ✅ Task 1 completed
  - ✅ Task 2 completed
  - ❌ Task 3 not yet done
- **Notes** (optional): Any blockers, follow-ups, or remaining tasks.

Guidelines:

- Always include a heading that matches the work package name or ID.
- Always include the current date/time in the specified format.
- Be concise but explicit about actions taken (what changed in the codebase).
- Ensure "Comparison to To-Do List" matches the current progress state.
- Each completed work package should be logged as a separate section in the status file.
- Append updates to the top  instead of overwriting old ones.
- Do NOT invent or skip items — only report on what was actually done.

Your task: After completing a coding work package, update the status file according to this format. Also update the github #file:README.md

**
