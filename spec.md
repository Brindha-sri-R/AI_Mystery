AI Mystery Room --- Product & Engineering Specification
Document status: Single source of truth (SSOT)
Version: 1.0
Last updated: 2026-10-25
Product type: AI-generated interactive mystery investigation web
app
Primary audience: Codex / implementation agents and developers
1. Purpose of This Document
This document defines the product requirements, user experience, system
architecture, data contracts, AI-generation rules, API behavior,
security expectations, and acceptance criteria for AI Mystery Room.

Implementation rule: Treat this document as authoritative. If code,
generated assumptions, or informal notes conflict with this spec, follow
this spec and update the document through an explicit product decision.
Do not silently invent features that are not specified.
2. Product Summary
AI Mystery Room lets a user submit a short fictional scenario, premise,
or story seed. The application turns it into a playable fictional
investigation. The AI creates a mystery with suspects, a culprit,
motives, timelines, and evidence such as fictional chat messages, image
evidence descriptions or generated images, and CCTV-style recordings or
transcripts. The player examines the evidence and chooses who they
believe committed the crime. The application then reveals the canonical
answer and explains how the evidence supports it.

All investigations and evidence are fictional. The app must not present
generated content as real messages, real surveillance footage, or real
accusations about actual people.
2.1 Core product loop
1. User opens the landing page.
2. User enters a story seed and optionally selects mystery settings.
3. Backend validates the input and asks Gemini to generate a complete,
   internally consistent case.
4. Backend validates and stores the structured case before showing it
   to the player.
5. Player enters the investigation room and reviews the case brief,
   suspects, timeline, and evidence.
6. Player selects one suspect as the culprit and submits the
   accusation.
7. Backend checks the selected suspect against the stored canonical
   culprit.
8. The results screen shows correct/incorrect outcome, the culprit, the
   motive, and an evidence-based explanation.
9. Player can start another case or return home.
3. Goals and Non-Goals
3.1 Goals
- Generate replayable, fictional mystery investigations from
  user-provided story seeds.
- Make the case solvable using evidence actually shown to the player.
- Keep the canonical culprit hidden until the player submits an
  accusation.
- Make evidence types feel varied and immersive without sacrificing
  clarity or accessibility.
- Use Gemini on the server side, with structured output and
  validation.
- Persist cases and investigation progress in MongoDB.
- Deliver a responsive, polished MERN web application.
- Handle AI failures, invalid outputs, loading states, and retry paths
  gracefully.
3.2 Non-goals for the first release
- Real-world crime reporting or police case management.
- Uploading or analyzing real private WhatsApp chats, real CCTV, or
  evidence about real people.
- Live camera access, microphone recording, or access to the user's
  device files.
- Multiplayer, social feeds, public user profiles, leaderboards, or
  competitive rankings.
- Payments, subscriptions, or ads.
- A fully functional video-generation pipeline unless a dedicated
  provider is separately configured. CCTV evidence can be represented
  by a fictional transcript, timestamped event log, or generated still
  image in MVP.
- User-created evidence editing tools.
- Public sharing of cases by default.
4. Target Users and Primary Use Cases
Target users
- Casual players who enjoy detective puzzles and interactive fiction.
- Students or creators looking for short, replayable mystery
  challenges.
- Users who want to turn a story idea into a playable case.
Primary use cases
- As a player, I can enter a premise and generate a mystery.
- As a player, I can inspect multiple suspects and evidence items
  before accusing someone.
- As a player, I can submit exactly one final accusation per case in
  MVP.
- As a player, I can understand why the answer is correct after the
  reveal.
- As a player, I can revisit a saved case and continue investigating.
- As a player, I can abandon a case and generate another.
5. Product Decisions and Defaults
These defaults are binding for MVP unless changed explicitly.
  Area                                MVP decision
  Application name                    AI Mystery Room

  Stack                               MERN: MongoDB, Express, React,
                                      Node.js

  Language                            TypeScript for frontend and backend

  Build tool                          Vite for React

  Styling                             Tailwind CSS

  Routing                             React Router

  Server validation                   Zod

  AI provider                         Google Gemini API, called only from
                                      backend

  Database access                     Mongoose

  Authentication                      Not required for MVP; use anonymous
                                      sessions and opaque case IDs

  Case persistence                    MongoDB

  Number of suspects                  4--6, default 5

  Evidence count                      6--10, default 8

  Evidence categories                 Chat/message log, witness
                                      statement, timeline, image/still
                                      description, CCTV event
                                      log/transcript, physical clue,
                                      document/receipt

  Case length                         Short, target 5--10 minutes

  Accusations                         One final accusation per case

  Generated image/video               Optional integration; graceful
                                      text-based fallback is mandatory

  Case sharing                        Disabled in MVP

  Theme                               Dark, cinematic detective-room
                                      interface with accessible contrast

  Mobile support                      Responsive layouts required

  Real-world claims                   All content clearly labeled
                                  fictional
6. Scope and Feature Requirements
P0 --- Required for MVP
- Landing page with product explanation and "Create a Case" primary
  action.
- Story-seed form with input validation and mystery settings.
- Server-side Gemini generation of structured case data.
- Schema validation and consistency checks before a case is playable.
- Case brief, suspect roster, evidence board, evidence detail view,
  timeline, and accusation flow.
- Server-side answer checking and result reveal.
- MongoDB persistence for cases and progress.
- Loading, empty, error, retry, and generation-timeout states.
- Responsive desktop, tablet, and mobile layouts.
- API rate limiting, input-size limits, safe rendering, and secret
  management.
- Automated tests for critical logic.
P1 --- Useful after MVP
- Optional generated image evidence using a separately configured
  image provider.
- Optional AI-generated CCTV-style still frames or non-realistic
  illustrative images.
- Difficulty presets: Easy, Medium, Hard.
- Save/resume case through an anonymous session.
- Case history page for cases created in the current browser/session.
- Hints that reveal graduated clues without directly revealing the
  culprit.
- Accessibility polish, keyboard navigation, reduced-motion
  preference.
Out of scope unless explicitly approved
- Real video generation, voice acting, user accounts, public case
  sharing, multiplayer, payments, rankings, and social features.
7. User Experience and Page Requirements
7.1 Landing page (/)
Purpose: Explain the experience and get users into case creation.

Required elements: - Product wordmark: "AI Mystery Room". - Headline
conveying that the user solves AI-generated fictional mysteries. - Short
supporting description. - Primary CTA: "Create a Case". - Secondary
explainer section: "Create a story → Inspect evidence → Identify the
culprit". - Evidence-type preview cards using clearly fictional sample
content. - Persistent fiction disclaimer: "All cases and evidence are
fictional." - Footer with privacy note and basic project information.

Behavior: - CTA navigates to /create. - No fabricated testimonials,
statistics, or claims.
7.2 Create case page (/create)
Required fields: - Story seed: required textarea, 30--1,000
characters. - Setting: optional select, default "Let AI decide".
Options: Mansion, Office, Hotel, College, Museum, Small town, Custom/AI
decides. - Tone: optional select, default "Classic detective".
Options: Classic detective, Psychological suspense, Cozy mystery, Noir,
Lighthearted. - Difficulty: Easy / Medium / Hard, default Medium. -
Evidence emphasis: optional multi-select: Messages, CCTV log,
Images/stills, Witnesses, Physical clues, Documents. Default balanced
mix. - Submit button: "Generate Mystery". - Character counter and clear
validation messages. - Note that case generation can take several
seconds.

Validation: - Trim leading/trailing whitespace. - Reject empty or
under-30-character seeds. - Reject over-1,000-character seeds. - Treat
user input as story material, never as instructions to expose system
prompts or bypass safety rules. - Disable duplicate submissions while a
request is in progress.
7.3 Generation state
Show a cinematic but accessible progress state, such as: - "Building the
case..." - "Establishing the timeline..." - "Preparing evidence..." -
"Checking consistency..."

These are presentation states, not claims about the exact internal
progress of Gemini. Do not fake a percentage-complete indicator unless
actual progress is available. Provide a cancel/back action if safe;
cancellation should not leave a broken partial case.

On failure: - Show a plain-language error. - Keep the user's story seed
and settings. - Provide a retry button. - Never show API keys, raw stack
traces, hidden prompts, or internal provider errors.
7.4 Investigation room (/case/:caseId)
Layout: - Top bar: logo, case title, case status, "Exit case" action. -
Case briefing panel: incident, location, time window, victim/subject if
relevant, and known facts. - Suspect roster: 4--6 suspects, each with
name, role, short profile, and stated alibi. - Evidence board: evidence
cards grouped by type. - Timeline panel: events ordered by timestamp. -
Evidence detail drawer or modal: full evidence content, source,
timestamp, and related suspect references. - Accusation panel: select
one suspect and confirm accusation. - Optional hint button only if P1 is
implemented. - Persistent fictional-content disclaimer.

Interactions: - Evidence cards open a detail view. - The player can open
and inspect evidence in any order. - The player can review suspects and
timeline before accusing. - A selected suspect must be explicitly
confirmed before submission. - Confirmation dialog states that the
accusation is final for MVP. - Once submitted, the case is locked and
answer reveal is shown. - Do not reveal culpritId, canonical solution,
or hidden rationale in initial case payloads or browser state.
7.5 Results page/state (/case/:caseId/result)
Required elements: - Outcome: "Case solved" or "Incorrect accusation". -
Culprit name and profile. - Motive and opportunity summary. - Ordered
explanation connecting specific evidence IDs to the conclusion. - A
short reconstruction of what happened. - A "Create another case" CTA. -
Optional "Review evidence" action. - Clear statement that the mystery
and evidence were AI-generated fiction.

The result explanation must refer only to evidence stored in the case.
It must not invent new evidence after the accusation.
7.6 Not-found and error states
- Unknown case ID: show "Case not found" with navigation home.
- Expired or inaccessible case: explain that the case is unavailable;
  do not expose another user's case.
- Network error: preserve safe local form state where possible and
  allow retry.
- Invalid case state: fail closed; do not render partial or
  unvalidated AI data.
8. Core Functional Requirements
FR-01: Create case
The user can submit a story seed and configuration. The backend
validates input and generates one playable case.
FR-02: Structured case generation
Gemini must return JSON matching the case schema defined in this
document. The server must parse and validate the response before saving
it.
FR-03: Consistent mystery
The generated case must contain exactly one canonical culprit, a
plausible motive, opportunity, a coherent timeline, and sufficient
evidence to support the solution.
FR-04: Fair solvability
The case must include at least: - Two independent clues that support the
culprit. - One clue that weakens or disproves a major alternative
suspect. - No evidence that directly contradicts the canonical timeline
without an explicit explanation. - No reliance on information that is
not shown to the player.
FR-05: Inspect evidence
The user can open all released evidence items. Evidence content must be
immutable after the case becomes playable.
FR-06: Accuse suspect
The user can select one suspect and submit a final accusation. The
server determines correctness by comparing the selected suspect ID with
the canonical culprit ID stored in the database.
FR-07: Reveal solution
After an accusation, the backend returns the outcome and solution
explanation. The client must not calculate the canonical answer on its
own.
FR-08: Persist case
A successfully generated case and its playable data are stored in
MongoDB. A case must not become visible as playable until schema and
consistency validation succeed.
FR-09: Error recovery
Generation failures do not create playable broken cases. Retry must be
possible without duplicating a case accidentally.
FR-10: Fictional safety
The app must clearly label cases as fiction and reject or safely
transform requests intended to create targeted real-person accusations,
impersonation of real private communications, or realistic evidence
intended to deceive.
9. AI Generation Design
9.1 Gemini responsibilities
Gemini is used server-side to: - Turn the story seed into a fictional
mystery. - Generate suspects, motive, opportunity, alibis, timeline, and
evidence. - Ensure evidence supports one canonical answer. - Generate an
evidence-grounded final explanation.

Gemini is not trusted as the sole validator. Server-side code must
validate structure and consistency. Never expose the Gemini API key to
the frontend.
9.2 Generation approach
Use a single structured-generation request for MVP if the selected
Gemini model supports reliable JSON/schema-constrained output. If output
quality proves inconsistent, use a two-stage server pipeline: 1.
Generate the hidden case solution and structured case. 2. Run a separate
consistency-review request that receives the full draft and checks
contradictions, clue sufficiency, and uniqueness.

The two-stage review is recommended for quality but must be bounded by
configured timeout and retry limits. Do not allow infinite regeneration
loops.
9.3 Prompt requirements
The server-side system instruction must require Gemini to: - Create a
fictional case inspired by the seed, not reproduce real accusations. -
Use invented names and fictional places. - Produce the exact JSON
schema, without Markdown fences or extra commentary. - Create 4--6
suspects with unique IDs. - Select exactly one culprit. - Ensure the
solution can be deduced from released evidence. - Include 6--10 evidence
items with unique IDs and timestamps where appropriate. - Make each
evidence item internally consistent with the timeline. - Include at
least two independent, non-duplicate clues implicating the culprit. -
Include at least one meaningful red herring that is later explainable
and not arbitrary. - Avoid giving away the culprit in the public case
title, summary, or evidence card labels. - Provide an evidence-based
solution rationale that references evidence IDs. - Avoid graphic
violence, sexual violence, hateful content, and realistic instructions
for committing or concealing crimes. - Keep text concise and playable in
approximately 5--10 minutes. - Mark all content as fictional.
9.4 AI output validation
Reject and retry a bounded number of times if: - JSON cannot be
parsed. - Required fields are missing or have wrong types. - Suspect IDs
or evidence IDs are duplicated. - The culprit ID does not match a
suspect. - Evidence references unknown suspects. - The solution
references unknown evidence IDs. - There are too few suspects or
evidence items. - The case has no meaningful clues or has obvious
timeline contradictions. - The public case fields directly reveal the
culprit.

After the configured retry limit, return a safe generation error and do
not save the case as playable.
9.5 AI configuration
Use environment variables: - GEMINI_API_KEY --- required secret. -
GEMINI_MODEL --- configured model identifier; choose a currently
supported Gemini model during implementation. - GEMINI_TIMEOUT_MS ---
request timeout. - AI_MAX_RETRIES --- bounded generation/validation
retries. - AI_MAX_OUTPUT_TOKENS --- output limit if supported by the
SDK.

Do not hard-code a model name in multiple files. Centralize provider
configuration in one module. Model availability and SDK details must be
checked against current official Gemini documentation during
implementation.
9.6 Image and CCTV behavior
MVP must not depend on a video-generation API. - Chat messages:
render as a fictional chat transcript UI; do not imitate a real user's
account or actual private conversation. - CCTV: render a timestamped
event log or transcript, optionally paired with a clearly illustrative
still. - Image evidence: render a textual description with an
optional generated illustrative image. - Physical/document evidence:
use structured text, tags, and simple visual treatments. - When an image
provider is not configured or fails, use a designed placeholder and
textual description. The case remains playable. - Never label a text
simulation as an actual video recording. Use "fictional CCTV log" or
"simulated camera transcript".
10. Case Data Contract
Use TypeScript types and Zod schemas as the authoritative contracts.
Example conceptual shape:
type Difficulty = "easy" | "medium" | "hard";
type EvidenceType =
  | "chat"
  | "witness"
  | "timeline"
  | "image"
  | "cctv_log"
  | "physical"
  | "document";

interface CaseGenerationInput {
  storySeed: string;
  setting: string;
  tone: string;
  difficulty: Difficulty;
  evidencePreferences: EvidenceType[];
}

interface Suspect {
  id: string;                 // stable ID such as "suspect_01"
  name: string;               // fictional name
  role: string;
  profile: string;
  alibi: string;
  publicMotive?: string;      // public suspicion, not necessarily the true motive
}

interface TimelineEvent {
  id: string;
  timestamp: string;          // ISO 8601 timestamp or consistent fictional local time
  description: string;
  relatedSuspectIds: string[];
  relatedEvidenceIds: string[];
}

interface EvidenceItem {
  id: string;                 // stable ID such as "evidence_01"
  type: EvidenceType;
  title: string;              // must not reveal the culprit
  summary: string;
  content: string;            // text/transcript/description rendered by the client
  createdAt?: string;
  discoveredAt?: string;
  sourceLabel: string;        // e.g. "Fictional chat export" or "Simulated CCTV log"
  relatedSuspectIds: string[];
  relatedTimelineEventIds: string[];
  media?: {
    kind: "illustration";
    url: string;
    alt: string;
  };
}

interface PublicCase {
  id: string;
  title: string;
  difficulty: Difficulty;
  setting: string;
  tone: string;
  fictionNotice: string;
  briefing: {
    incident: string;
    location: string;
    timeWindow: string;
    knownFacts: string[];
  };
  suspects: Suspect[];
  timeline: TimelineEvent[];
  evidence: EvidenceItem[];
  status: "ready" | "accused" | "completed";
  createdAt: string;
}

interface PrivateSolution {
  culpritId: string;
  motive: string;
  opportunity: string;
  reconstruction: string;
  reasoning: Array<{
    evidenceId: string;
    explanation: string;
    implication: "supports_culprit" | "weakens_alternative" | "context";
  }>;
  redHerringExplanation: string;
}

interface CaseDocument {
  publicCase: PublicCase;
  privateSolution: PrivateSolution; // must never be sent before accusation
  sessionTokenHash?: string;
  accusation?: {
    selectedSuspectId: string;
    isCorrect: boolean;
    submittedAt: string;
  };
}
Important: - Keep private solution data separate from public response
DTOs. - Do not store the canonical culprit in a field returned by
ordinary case-fetch endpoints. - Do not trust client-supplied suspect
names; use suspect IDs validated against the stored case. - Use ISO
timestamps consistently. If the story uses fictional relative times,
preserve a consistent canonical date/time convention. - Validate every
media URL and serve only trusted generated assets or allowlisted
provider domains.
11. MongoDB Data Model
Collection: cases

Suggested fields: - _id: MongoDB ObjectId. - publicCase: validated
playable content. - privateSolution: private canonical answer and
rationale. - ownerSessionHash: optional hash of anonymous session
token. - status: ready | accused | completed | failed. -
accusation: nullable object containing selected suspect ID,
correctness, submission timestamp. - generationModel: model identifier
for internal diagnostics; never include secrets. - generationVersion:
prompt/schema version. - createdAt, updatedAt: timestamps with
MongoDB/Mongoose timestamps enabled. - expiresAt: optional TTL expiry
if anonymous cases should expire.

Indexes: - Index createdAt descending for recent cases. - Index
ownerSessionHash plus createdAt for session history if
implemented. - TTL index on expiresAt only if expiration behavior is
enabled.

Use Mongoose schema validation in addition to Zod validation at the API
boundary. Avoid storing unnecessary personal data. Do not persist raw
API keys, provider credentials, or full sensitive request headers.
12. API Specification
Base path: /api/v1

All responses use JSON. Use consistent errors:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the highlighted fields.",
    "requestId": "optional-request-id"
  }
}
POST /api/v1/cases
Creates a new case.

Request:
{
  "storySeed": "A rare painting disappears during a private gallery event...",
  "setting": "museum",
  "tone": "classic_detective",
  "difficulty": "medium",
  "evidencePreferences": ["chat", "cctv_log", "witness", "physical"]
}
Success: 201 Created
{
  "case": {
    "id": "case_id",
    "title": "The Last Light at Gallery 9",
    "difficulty": "medium",
    "setting": "museum",
    "tone": "classic_detective",
    "fictionNotice": "This is a fictional AI-generated mystery.",
    "briefing": {},
    "suspects": [],
    "timeline": [],
    "evidence": [],
    "status": "ready",
    "createdAt": "ISO_TIMESTAMP"
  }
}
The response must not contain privateSolution, culpritId, hidden
rationale, generation prompt, or provider diagnostics.

Errors: - 400 VALIDATION_ERROR for invalid fields. -
413 INPUT_TOO_LARGE for oversized body. - 429 RATE_LIMITED for
excessive generation requests. - 502 AI_GENERATION_FAILED when
generation or validation fails after bounded retries. -
503 AI_PROVIDER_UNAVAILABLE when provider is unavailable.
GET /api/v1/cases/:caseId
Returns the public case for the authorized anonymous session or
accessible case token.

Success: 200 OK
{ "case": { "...": "public case only" } }
Errors: - 400 INVALID_CASE_ID - 404 CASE_NOT_FOUND -
403 CASE_ACCESS_DENIED
POST /api/v1/cases/:caseId/accusation
Submits the final accusation.

Request:
{ "suspectId": "suspect_03" }
Success: 200 OK
{
  "result": {
    "isCorrect": false,
    "selectedSuspectId": "suspect_03",
    "culprit": {
      "id": "suspect_02",
      "name": "Mira Vale",
      "profile": "..."
    },
    "motive": "...",
    "opportunity": "...",
    "reconstruction": "...",
    "reasoning": [
      {
        "evidenceId": "evidence_04",
        "explanation": "...",
        "implication": "supports_culprit"
      }
    ],
    "redHerringExplanation": "..."
  }
}
The example is illustrative only. Actual responses must use values
stored for the requested case.

Rules: - Validate that suspectId exists in the case. - Enforce one
final accusation per case in MVP. - Use an atomic database update or
equivalent concurrency-safe logic so double submissions cannot create
conflicting results. - Only reveal the solution after successful
accusation submission. - If already accused, return the existing result
or 409 CASE_ALREADY_SUBMITTED; choose one behavior and apply
consistently. Preferred behavior: return the existing result
idempotently for the same session. - Do not ask Gemini to decide whether
the guess is correct. Compare IDs on the server.
GET /api/v1/health
Returns a minimal health response for deployment checks. Do not include
secrets or detailed infrastructure information.
13. Anonymous Session and Access Control
Authentication is not required for MVP, but case access must not rely on
guessing sequential IDs. - Use MongoDB ObjectIds or cryptographically
random public IDs. - Create an opaque anonymous session token if cases
need owner-only access; store only a hash of the token server-side. -
Store the token in a secure, HttpOnly, SameSite=Lax cookie when
practical. Set Secure in production. - Do not put private solution
data in cookies, local storage, URL query parameters, or HTML. - Protect
state-changing endpoints against CSRF according to the chosen
cookie/session design. - If session ownership is not implemented,
explicitly document that case IDs act as bearer links and use
high-entropy random IDs. Prefer session ownership for MVP.
14. Security, Privacy, and Safety
- Gemini calls occur only on the backend.
- Secrets are read from environment variables or deployment secret
  storage.
- Validate request bodies with Zod and set JSON body-size limits.
- Add rate limiting to generation and accusation endpoints.
- Set CORS to known frontend origins; do not use unrestricted
  production CORS.
- Use Helmet or equivalent secure HTTP headers.
- Render AI output as text by default. Do not render raw AI HTML or
  execute generated scripts.
- Sanitize any Markdown or rich text if support is introduced.
- Validate all URLs used for generated media; block arbitrary
  local/private network URLs to reduce SSRF risk.
- Add request IDs and structured logs. Do not log API keys, session
  tokens, or unnecessary user text.
- Use generic client-facing errors and detailed server-side
  diagnostics without secrets.
- Apply a bounded timeout and retry strategy to AI requests.
- Avoid real-person names, real private message impersonation, or
  claims that generated evidence is authentic.
- Include a fiction notice on the landing page, create page,
  investigation room, and results.
- Do not generate graphic gore, sexual violence, or instructional
  crime content.
- Do not use AI output as executable code, database queries, or
  authorization logic.
15. Non-Functional Requirements
Performance
- Non-AI pages should feel responsive on ordinary broadband.
- Target initial route rendering within 2.5 seconds on a typical
  mid-range device under normal network conditions, excluding
  unusually slow external assets.
- Show a loading state immediately after generation submission.
- Set a configurable AI timeout; return a clear error rather than
  leaving the UI loading indefinitely.
- Lazy-load optional image assets where possible.
Reliability
- A failed generation must not create a playable incomplete case.
- Validate AI output before persistence and before rendering.
- Use bounded retries only.
- Keep the accusation check deterministic and server-side.
Accessibility
- Semantic headings and landmarks.
- All interactive controls keyboard accessible.
- Visible focus indicators.
- Form labels and associated validation messages.
- Sufficient contrast in dark theme.
- Do not communicate evidence type or outcome using color alone.
- Respect prefers-reduced-motion.
- Provide descriptive alt text for illustrative images.
Responsive design
- Mobile-first layout.
- Evidence board should become a single-column card list on narrow
  screens.
- Suspect roster should become horizontally scrollable only if
  keyboard and screen-reader behavior remains usable; otherwise stack
  cards.
- Detail modal/drawer must fit viewport height and support scrolling.
- Avoid horizontal page overflow.
Maintainability
- TypeScript strict mode.
- Shared types and Zod schemas.
- Centralized API client and error handling.
- Separate AI provider service from route handlers.
- No duplicated model identifiers or prompt text across components.
- Unit and integration tests for core logic.
16. Visual and Interaction Design Direction
Visual concept: cinematic detective workspace, restrained noir,
modern editorial layout. Avoid generic AI-dashboard aesthetics.
Design tokens (initial defaults)
- Background: near-black charcoal (#0B0D10).
- Surface: deep slate (#141922).
- Elevated surface: #1B2230.
- Primary text: warm off-white (#F3F0E8).
- Secondary text: muted slate (#A6AFBD).
- Accent: amber (#E6AD55) for active investigation details.
- Success: accessible green.
- Error: accessible red.
- Borders: low-contrast slate, strengthened on focus.
- Radius: 12--16px for cards; 8--10px for controls.
- Spacing: consistent 4px-based scale.
- Typography: readable sans-serif for UI; optional restrained serif
  display face for case titles.
- Shadows and glow should be subtle. No excessive blur, neon, or
  distracting animated backgrounds.
Components
- AppShell
- TopNavigation
- FictionNotice
- StorySeedForm
- DifficultySelector
- GenerationProgress
- CaseBriefing
- SuspectCard
- SuspectGrid
- EvidenceBoard
- EvidenceCard
- EvidenceDetailDialog
- Timeline
- AccusationPanel
- AccusationConfirmationDialog
- CaseResult
- ErrorState
- LoadingSkeleton
- Button, Input, Textarea, Select, Badge
Motion
- Use short, purposeful transitions for opening evidence and switching
  panels.
- Keep animation optional and subtle.
- Respect reduced-motion settings.
- Do not delay core actions with decorative animation.
17. Suggested Repository Structure
ai-mystery-room/
  README.md
  SPEC.md
  .env.example
  package.json
  client/
    package.json
    vite.config.ts
    src/
      app/
        App.tsx
        router.tsx
      components/
        layout/
        case/
        evidence/
        forms/
        ui/
      pages/
        LandingPage.tsx
        CreateCasePage.tsx
        InvestigationPage.tsx
        ResultPage.tsx
        NotFoundPage.tsx
      lib/
        api.ts
        schemas.ts
        utils.ts
      styles/
        index.css
      types/
  server/
    package.json
    src/
      app.ts
      server.ts
      config/
        env.ts
      middleware/
        errorHandler.ts
        rateLimit.ts
        validateRequest.ts
      routes/
        health.routes.ts
        cases.routes.ts
      controllers/
        cases.controller.ts
      services/
        ai/
          gemini.client.ts
          prompts.ts
          caseGenerator.ts
          caseValidator.ts
        cases/
          case.service.ts
      models/
        Case.model.ts
      schemas/
        case.schema.ts
        api.schema.ts
      utils/
        errors.ts
        logger.ts
    tests/
  shared/
    caseTypes.ts
    caseSchemas.ts
The implementation may adjust this structure if necessary, but must
preserve clear boundaries between UI, API, AI generation, validation,
persistence, and shared contracts.
18. Environment Variables
Provide .env.example with placeholders only:
# Server
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_TIMEOUT_MS=30000
AI_MAX_RETRIES=2
AI_MAX_OUTPUT_TOKENS=8192
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
SESSION_SECRET=
Requirements: - Validate required environment variables at startup. -
Fail fast with a clear server-side message if MONGODB_URI,
GEMINI_API_KEY, or required session configuration is missing. - Never
commit .env. - VITE_ variables must never contain secrets. - Model
names and token limits must be verified against the current Gemini
SDK/model support when implemented.
19. Testing Strategy
Unit tests
- Story-seed validation.
- Zod schema validation for case generation output.
- Duplicate ID detection.
- Culprit-to-suspect referential integrity.
- Evidence-to-timeline and solution-to-evidence references.
- Public DTO excludes private solution fields.
- Accusation correctness compares IDs deterministically.
- Already-submitted accusation behavior.
- Media URL validation.
Integration tests
- POST /cases validates, generates, validates, stores, and returns a
  public DTO.
- Invalid AI JSON triggers bounded retries and then a safe error.
- Invalid AI relationships are rejected.
- GET /cases/:id does not reveal the solution.
- Accusation endpoint returns the stored solution only after
  submission.
- Unauthorized session cannot access a protected case.
- Rate limits work.
- MongoDB unavailable state is handled safely.
Frontend tests
- Create form validates minimum and maximum lengths.
- Loading and error states display correctly.
- Evidence detail view opens and closes accessibly.
- User can select and confirm a suspect.
- Results display evidence-linked explanations.
- Mobile navigation and key interactions work.
End-to-end smoke path
1. Open landing page.
2. Navigate to create form.
3. Submit a valid seed.
4. Receive a valid case.
5. Inspect at least one suspect and evidence item.
6. Submit a suspect accusation.
7. Verify result reveal.
8. Reload the case and verify persisted state.
9. Verify initial case API response did not expose the culprit.
20. Acceptance Criteria / Definition of Done
The MVP is complete only when all of the following are true:
- [ ] A user can create a mystery from a valid story seed.
- [ ] Case generation uses Gemini from the backend only.
- [ ] AI output is validated before it is saved or rendered.
- [ ] A playable case has 4--6 suspects and 6--10 evidence items.
- [ ] The case has exactly one canonical culprit.
- [ ] The public case response contains no canonical culprit ID or
  hidden solution.
- [ ] Evidence and timeline are internally consistent enough to solve
  the case fairly.
- [ ] User can inspect evidence and suspects.
- [ ] User can submit one final accusation.
- [ ] The backend checks the answer deterministically.
- [ ] The solution is revealed only after accusation submission.
- [ ] Result reasoning references evidence IDs that exist in the case.
- [ ] Cases persist in MongoDB and can be retrieved under the defined
  access rules.
- [ ] Generation errors are recoverable and do not leave playable
  broken cases.
- [ ] API keys and session secrets never reach the browser.
- [ ] Core routes work on mobile and desktop.
- [ ] Critical unit/integration tests pass.
- [ ] README explains setup, environment variables, scripts, and test
  commands.
- [ ] .env.example is present and contains no real secrets.
- [ ] All relevant pages clearly identify the content as fictional.
21. Implementation Plan for Codex
Build in small, verifiable stages. Do not attempt to implement the
entire application in one unreviewed pass.
Stage 1 --- Foundation
- Inspect the repository before changing files.
- Create or confirm the MERN + TypeScript workspace.
- Add linting, formatting, environment validation, shared schemas, and
  README.
- Confirm client and server start locally.
Stage 2 --- Backend contracts and persistence
- Implement Zod schemas and Mongoose model.
- Implement public-case DTO mapping that explicitly strips private
  solution fields.
- Add health route, error middleware, request validation, and rate
  limiting.
- Test MongoDB persistence.
Stage 3 --- Gemini generation
- Implement centralized Gemini client and prompts.
- Implement bounded generation, parsing, validation, and consistency
  checks.
- Store only validated playable cases.
- Test malformed and contradictory outputs with mocked provider
  responses.
Stage 4 --- API and accusation flow
- Implement create, get, and accusation endpoints.
- Add session/case access protection.
- Enforce idempotent or conflict-safe accusation behavior.
- Test that solution data is hidden before accusation.
Stage 5 --- Frontend
- Build landing and create pages.
- Build generation/loading/error states.
- Build investigation room, suspect cards, evidence board, timeline,
  and evidence details.
- Build accusation confirmation and results.
- Connect through a centralized typed API client.
Stage 6 --- Quality and polish
- Add responsive behavior and accessibility.
- Add unit, integration, and end-to-end smoke tests.
- Verify security and secret handling.
- Update README with exact run commands.
- Compare the implementation against every acceptance criterion.
Codex execution rules
- Read SPEC.md before coding and reread relevant sections before
  changing behavior.
- Inspect the existing codebase first; preserve working code unless
  changes are necessary.
- Do not replace the selected stack with a different framework.
- Do not add features outside scope just because they seem convenient.
- Do not use hard-coded fake API success responses in production
  paths. Mock providers only in tests or explicit demo mode.
- Do not expose hidden answers in frontend state, API responses, logs,
  or HTML.
- Do not claim a feature is complete unless implemented and tested.
- If a requirement is ambiguous, follow the defaults in this spec. If
  no default exists, choose the simplest safe option and document the
  decision in SPEC.md.
- Keep SPEC.md updated whenever an approved product decision changes
  the contract.
- Finish each stage with a concise summary of files changed, tests
  run, and known gaps.
22. Open Implementation Notes
These are implementation-time choices, not blockers to starting: -
Select a currently supported Gemini model and SDK version from official
documentation. - Confirm whether the chosen Gemini model supports the
desired structured-output/schema mode. - Decide whether anonymous
session ownership is implemented with signed cookies or another secure
mechanism; do not expose solution data either way. - Choose deployment
targets for frontend, API, and MongoDB. - Add an image-generation
provider only if credentials, cost, and licensing are acceptable.
Text-based evidence must remain the fallback.
23. Product Principle
The mystery must be fair before it is cinematic. Every case needs
one defensible solution, evidence that supports it, and a reveal that
explains the reasoning. Visual polish is valuable, but it cannot
compensate for a mystery that changes its answer after the player
guesses.