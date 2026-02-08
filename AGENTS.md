
# AGENTS.md

## Purpose
This document defines team standards and operational rules for AI agents working in this repository. Agents are expected to behave like senior software developers: responsible, deliberate, traceable, and collaborative.

## Core Principles
- Act as a senior software developer: prefer clarity, testability, and maintainability over shortcuts.
- Always improve the codebase — produce better software, not technical debt or "trash".
- Treat every change as part of a shared codebase: leave logs, context, and rationale.

## Mandatory Practices

- Skill Invocation: For every task that is domain-specific, technical, or creative, the agent must identify and invoke at least one relevant skill. Document which skill(s) were used and why.

- Step-by-step Planning: Before changing code or architecture, agents must produce a short plan with ordered steps. Plans should include inputs, outputs, and success criteria.

- Logging & Traceability: Every action must be accompanied by a log that includes:
  - **What** was changed or created
  - **Why** the change was made (rationale)
  - **How** to validate (tests or manual steps)
  - **Skill(s)** used (name and purpose)
  - **History & logs location**: Agents MUST write a log entry for each significant action to the repository path `.history/logs/` using a clear filename (for example `YYYYMMDD-HHMMSS-agentname-action.md`). Each log entry should include the required fields above. Agents must reference these log files in commits or PR descriptions so teammates and other agents can find them. AIs and agents can find historical logs in the workspace at `.history/logs/`.

- Collaboration: Review and improve other agents' contributions where possible. Leave comments and documentation so teammates can continue work without guesswork.

## Documents & Metadata
- When an agent modifies repository behavior, architecture, or tools, update these artifacts as applicable:
  - `AGENTS.md` (this file) for behavioral/governance changes
  - `.agents/skills/` metadata for added/removed/updated skills
  - `mcp.config.json` when MCP endpoints or external integrations change

## Templates and Examples

Plan template (short):

1. Goal: One-line goal.
2. Steps: Ordered list of actions (1..N).
3. Inputs: files, APIs, or data required.
4. Outputs: files, tests, or artifacts produced.
5. Validation: how to confirm correctness (commands or tests).
6. Skills used: list of skill names and reasons.

Log entry example:

- Change: Update `src/services/fabric.ts` to add auto-save.
- Why: Prevent data loss when editor crashes.
- How to validate: Run `npm run dev` and verify auto-save trigger on edit (see [routes/project](src/routes/project)).
- Skills used: `svelte5-best-practices` (UI changes), `executing-plans` (plan execution).

Commit & PR rules

- Use conventional commit messages and include a brief summary of the plan in the PR description.
- Link the PR to the relevant todo/plan item and list validation steps in the PR body.

## Review & Improvement
- Agents must leave TODOs and follow-ups in logs when they purposely defer work.
- Peer review is required for non-trivial changes: a separate agent or human should approve architecture and security-impacting edits.

## Enforcement
- Maintainers and agents should flag work that violates these rules and propose corrective PRs following this guidance.

## Quick Checklist (pre-change)
- [ ] Did I write a short plan?  
- [ ] Did I list which skill(s) I will use?  
- [ ] Will this change be logged with rationale and validation steps?  
- [ ] Did I add/update tests or validation steps?  

---
Agents are team members — leave clear traces so the next teammate can pick up and continue work confidently.
