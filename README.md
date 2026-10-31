# AI Mystery Room

AI Mystery Room is a fictional detective game. Players create a mystery from a short story seed, review a case briefing, suspects, timeline, and evidence, then make one final accusation to reveal the solution.

> Every case, person, and piece of evidence is fictional and generated for entertainment.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Build and test](#build-and-test)
- [Deploy to Vercel](#deploy-to-vercel)
- [API](#api)
- [Troubleshooting](#troubleshooting)
- [Privacy and security](#privacy-and-security)

## Features

- Generate a mystery using a story seed, setting, tone, and difficulty.
- Investigate four to six suspects, a timeline, and six to ten evidence items.
- Submit one final accusation and see whether it is correct, with the case solution.
- Keep the culprit and solution private until the accusation is submitted.
- Save cases in MongoDB and associate them with an anonymous browser session.

## Technology

- **Client:** React, TypeScript, Vite, React Router, Tailwind CSS
- **API:** Node.js, Express, TypeScript, Zod, Mongoose
- **AI generation:** Google Gemini through `@google/genai` (server side)
- **Database:** MongoDB
- **Shared contracts:** TypeScript and Zod schemas in the `shared` workspace
- **Hosting:** Vercel Services, with the Vite client and Express API deployed together

## Project structure

```text
client/       React application
server/       Express API, Gemini case generator, MongoDB models
shared/       Shared request and response schemas and types
vercel.json   Vercel Services and public routing configuration
```

## Requirements

- Node.js 22.x and npm
- A MongoDB database, either local or MongoDB Atlas
- A Gemini API key for mystery generation

## Run locally

Run commands from the repository root.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the required values. See [Environment variables](#environment-variables).

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Make sure MongoDB is running and that `MONGODB_URI` points to it.

4. Start the client and API together:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173). The API listens on port `5000` by default.

The API health endpoint is [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health). It should return `{"status":"ok"}` when the API and database are available.

To run just one workspace during development:

```bash
npm run dev:client
npm run dev:server
```

## Environment variables

The local `.env` file is ignored by Git. Do not commit real keys or database credentials.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Runtime mode. Set to `production` in production hosting. |
| `PORT` | No | `5000` | Local API port. |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Allowed local client origin. |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/ai_mystery_room` | MongoDB connection string. Production must use a hosted database. |
| `GEMINI_API_KEY` | Yes for generation | — | Gemini API key. Keep this on the server; never use a `VITE_` prefix. |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Gemini model used for case generation. |
| `GEMINI_TIMEOUT_MS` | No | `60000` | AI request timeout in milliseconds. |
| `AI_MAX_RETRIES` | No | `2` | Maximum retry count for generation. |
| `AI_MAX_OUTPUT_TOKENS` | No | `8192` | Maximum requested model output size. |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | API rate-limit window in milliseconds. |
| `RATE_LIMIT_MAX_REQUESTS` | No | `10` | Maximum requests per rate-limit window. |
| `SESSION_SECRET` | No | — | Optional secret reserved for session configuration; use at least 32 characters if set. |

For MongoDB Atlas, create a database user, allow network access from the deployed application, and use the Atlas connection string for `MONGODB_URI`. Store production values in **Vercel → Project → Settings → Environment Variables**, targeting Production (and Preview if needed). Redeploy after changing production environment variables.

## Build and test

From the repository root:

```bash
npm run build
npm test
```

`npm run build` builds the shared schemas, API, and client. `npm test` runs the server's Vitest tests.

## Deploy to Vercel

This repository is configured as a Vercel Services project in `vercel.json`:

- The `client` service builds the Vite application.
- The `server` service runs the Express API.
- Requests under `/api/*` route to the server; other paths route to the client.

To deploy:

1. Import the GitHub repository into Vercel and use the repository root as the project root so Vercel can read `vercel.json`.
2. Add `MONGODB_URI` and `GEMINI_API_KEY` as Production environment variables. Do not put their values in Git or in this README.
3. Deploy the project. Later pushes to the connected production branch trigger deployments automatically.
4. Verify the deployed API at `https://<your-domain>/api/v1/health`. Expect HTTP `200` and `{"status":"ok"}`.
5. Open the site and create a mystery to verify Gemini generation and database persistence.

If Vercel reports a function invocation error, inspect the deployment's **Logs → Runtime Logs**. A deployment marked **Ready** only means the build completed; verify the health endpoint and generation flow too.

## API

All endpoints use the `/api/v1` prefix. JSON responses use the shared Zod contracts in `shared/src/index.ts`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Checks API readiness and database connectivity. |
| `POST` | `/api/v1/cases` | Validates the story seed, generates a case, and saves it. |
| `GET` | `/api/v1/cases/:caseId` | Returns a case belonging to the current anonymous session. Reveals the solution only after accusation. |
| `POST` | `/api/v1/cases/:caseId/accusation` | Records the final suspect selection and returns the result. |

Example case request:

```json
{
  "storySeed": "A rare star chart disappears from a locked observatory during a storm. Four guests each claim they never entered the west wing.",
  "setting": "Observatory",
  "tone": "Classic detective",
  "difficulty": "medium"
}
```

`storySeed` must be between 30 and 1,000 characters. `difficulty` accepts `easy`, `medium`, or `hard`; setting and tone have defaults. The browser must retain its anonymous session cookie to access its saved cases.

## Troubleshooting

### Mystery generation says the service is unavailable

- Confirm `GEMINI_API_KEY` is set in the environment used by the deployment.
- Check Vercel Runtime Logs for provider or request errors.
- Ensure the story seed has at least 30 characters.

### API returns a server error

- Check that production `MONGODB_URI` points to a reachable hosted MongoDB database, not `localhost`.
- Confirm MongoDB Atlas network access allows the deployed API to connect.
- Redeploy after updating environment variables.
- Check **Logs → Runtime Logs** for the specific stack trace.

### A saved case is unavailable

Cases are tied to the anonymous session cookie created by the browser. Use the same browser profile that created the case; clearing site cookies removes the session needed to retrieve it.

## Privacy and security

- The Gemini API key and MongoDB credentials are used only by the server.
- Session cookies are HttpOnly and SameSite; case access is scoped to the session hash stored with the case.
- The initial case response excludes the private solution. The API reveals it only after the final accusation.
- AI-generated content is displayed as text and marked fictional. Camera-log evidence is simulated text, not real surveillance footage.
- Keep `.env` out of version control. If a credential has been exposed, rotate it with its provider and update the deployment environment variable.
