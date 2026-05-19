# Audit Note — AiMarketingCopyGenerator

Source audit: `_AUDIT/reports/batch_05.md` § 15

## Original audit recommendations

### Missing AI endpoints
- `/brand-voice-analyzer`
- `/competitor-comparison`
- `/audience-sentiment`

### Missing non-AI features
- Plagiarism detection
- Readability scoring (Flesch-Kincaid)
- CMS integration (WordPress, Ghost)
- Scheduling & publishing automation
- Performance analytics
- Collaborative editing
- Style guide enforcement

### Custom feature suggestions
- Agentic copy optimizer (continuous testing)
- Multi-language adaptation
- Real-time competitor monitoring
- Autonomous creative testing
- Brand voice consistency agent
- Vertical-specific templates

## Implemented in this pass
1. **POST `/api/ai/brand-voice-analyzer`** — alignment score, tone/voice match, issues, rewrite suggestion.
2. **POST `/api/ai/competitor-comparison`** — themes, strengths/weaknesses, differentiation angles, recommended positioning.

Both follow existing `routes/ai.js` patterns: `generateWithAI` helper + `parseAIResponse` JSON extractor + `authMiddleware`. Syntax checked.

## Backlog (priority order)

### Mechanical
- `/audience-sentiment` (predict audience reception — straightforward; left to next pass)

### Needs creds / external SDK
- Plagiarism detection (Copyscape/Originality.AI)
- CMS publishing (WordPress REST, Ghost Admin API)
- Performance analytics (GA4, ad platform APIs)
- Scheduling (cron + content calendar storage)

### Needs product decision
- Readability scoring (which metric, threshold rules)
- Style guide enforcement (vertical templates)
- Collaborative editing (multi-user state, frontend)
- Real-time competitor monitoring (scraping policy, legal review)

## Apply pass 3 (frontend)

LEFT-AS-IS. `frontend/src/AIToolsPage.js` already wires both `/api/ai/brand-voice-analyzer`
and `/api/ai/competitor-comparison` via a TOOLS array. Axios interceptor injects
`Authorization: Bearer ${localStorage.token}`. Errors (including backend 503
no-key) surface via the error banner. Route registered in `App.js` at `/ai-tools`
with nav-item already present. No FE changes required.

## Apply pass 4 (mechanical backlog)

LEFT-AS-IS. The only remaining MECHANICAL backlog item, `/audience-sentiment`,
is already implemented end-to-end:

- `POST /api/ai/audience-sentiment` — `backend/src/routes/ai.js:677` (uses
  `generateWithAI` + `parseAIResponse` + `authMiddleware`; surfaces 503 from the
  helper). FE entry at `frontend/src/AIToolsPage.js:43` (TOOLS array).

Remaining backlog is NEEDS-CREDS (plagiarism / CMS / GA4 / scheduling) or
NEEDS-PRODUCT-DECISION (readability metrics, style guide rules, collaborative
editing, competitor scraping policy). No code changes this pass.
