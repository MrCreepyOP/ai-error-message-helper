# AI Error Message Helper — AI-Powered Error Analysis and Debugging Assistant

A lightweight, responsive full-stack web application designed to help developers, students, and beginners understand cryptic technical errors and compiler diagnostics in plain, beginner-friendly language. Built with React 18, Express.js, and Google Gemini AI, featuring zero-database browser-native persistence via `localStorage`.

---

## Table of Contents
1. [Project Overview & Objectives](#1-project-overview--objectives)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [Five-Part Structured AI Diagnosis](#4-five-part-structured-ai-diagnosis)
5. [Prerequisites & System Requirements](#5-prerequisites--system-requirements)
6. [How to Obtain and Configure a Gemini API Key](#6-how-to-obtain-and-configure-a-gemini-api-key)
7. [Installation & Setup Instructions](#7-installation--setup-instructions)
8. [Running the Application](#8-running-the-application)
9. [How LocalStorage Persistence Works](#9-how-localstorage-persistence-works)
10. [Troubleshooting Common Issues](#10-troubleshooting-common-issues)
11. [Security & API Key Protection](#11-security--api-key-protection)
12. [Project Limitations & Future Enhancements](#12-project-limitations--future-enhancements)
13. [College Project Report](#13-college-project-report)

---

## 1. Project Overview & Objectives

When learning programming or working with complex frameworks, developers frequently encounter cryptic error messages (such as `TypeError: Cannot read properties of undefined (reading 'map')`, `ECONNREFUSED`, or segmentation faults). Beginners often struggle to parse multiline stack traces, leading to debugging fatigue and lost productivity.

**AI Error Message Helper** solves this problem by acting as an on-demand debugging mentor:
- **Demystifies Errors:** Translates intimidating tracebacks into clear, jargon-free explanations.
- **Identifies Root Causes:** Enumerates 2 to 4 likely causes ordered by probability.
- **Provides Concrete Steps:** Offers numbered, step-by-step instructions to fix the issue.
- **Shows Code Side-by-Side:** Provides before-and-after code comparisons with explanations.
- **Encourages Defensive Coding:** Delivers actionable prevention habits and testing techniques.
- **Zero Remote Database Footprint:** Keeps user privacy intact with 100% browser-local persistence using `localStorage`.

---

## 2. Key Features

- **Developer-Tool Dark Slate UI:** Ergonomic dark theme engineered for visual clarity and accessibility.
- **Wide Technology Support:** Searchable dropdown with 16 programming languages and environments (JavaScript, TypeScript, React, Node.js, Express.js, MongoDB, HTML & CSS, Python, Java, C, C++, C#, PHP, SQL, Next.js, Other / Unknown).
- **One-Click Quick Samples:** 8 preloaded realistic errors across diverse ecosystems for immediate demonstrations without typing.
- **Live Character Counter:** Real-time character tracking with a 5,000-character safety limit and color indicators (amber warning, red limit).
- **Structured 5-Part Diagnosis:** Guaranteed schema compliance from Gemini AI.
- **Code Comparison & Copy Controls:** Side-by-side or stacked buggy vs. corrected code blocks with one-click copy feedback.
- **Full Markdown Export:** Single-click copy of the entire diagnostic report as formatted GitHub-Flavored Markdown.
- **Saved History Drawer:** Search, filter by technology, toggle bookmarks, view detailed modal breakdowns, and manage saved diagnoses offline.
- **Auto-Save Toggle:** Switch between automatic saving of every analysis or manual on-demand saving.
- **Clear Storage Modal:** Accidental data loss prevention dialog when clearing browser history.
- **Real-Time Backend Status Indicator:** Live ping to `/api/health` with visual green/red connection badges.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 (Functional components with React Hooks: `useState`, `useEffect`, `useCallback`, `useMemo`).
- **Styling:** Vanilla CSS with CSS custom properties (variables), Flexbox/Grid, and responsive media queries.
- **Data Fetching:** Native Fetch API with `AbortController` timeout handling.
- **Tooling:** Vite 6 with `@vitejs/plugin-react` (Hot Module Replacement, fast bundling).
- **Icons & Graphics:** Inline SVG icons.

### Backend
- **Runtime:** Node.js (v18+ recommended; tested on v24).
- **Framework:** Express.js (REST API architecture).
- **CORS:** Configured for cross-origin local development (`http://localhost:3000`).
- **Configuration:** `dotenv` for environment variable isolation.
- **AI SDK:** Official Google Gen AI SDK (`@google/generative-ai`) communicating securely with Google Gemini models.

### Persistence
- **Storage Engine:** Browser `localStorage` (`ai_error_helper_history_v1`).
- **Database:** None (no MongoDB, Firebase, Supabase, Postgres, or remote server storage).

---

## 4. Five-Part Structured AI Diagnosis

Every analysis request returns a normalized JSON object containing:

1. **What Happened?** A plain-English, beginner-friendly summary explaining the error concept.
2. **Possible Causes:** 2 to 4 plausible root causes ordered by probability.
3. **Recommended Fix:** Actionable, numbered step-by-step instructions.
4. **Code Example:** A before/after code comparison highlighting problematic syntax vs. corrected syntax with an explanation of what changed.
5. **Prevention Tip:** A defensive coding principle, linter recommendation, or unit test pattern to avoid regressions.

---

## 5. Prerequisites & System Requirements

- **Node.js:** v18.0.0 or higher (v20+ or v24 recommended).
- **npm:** v9.0.0 or higher.
- **Modern Web Browser:** Google Chrome, Firefox, Microsoft Edge, Safari, or Brave with JavaScript and localStorage enabled.
- **Internet Connection:** Required for querying the Google Gemini API (saved diagnoses can be browsed completely offline).
- **Google Gemini API Key:** Free tier key from Google AI Studio.

---

## 6. How to Obtain and Configure a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"** and select a project (or let AI Studio generate a default project).
4. Copy the generated API key string (starts with `AIzaSy...`).
5. Open the `server/.env` file in the project folder (copied from `server/.env.example`).
6. Set the `GEMINI_API_KEY` variable:
   ```env
   PORT=5004
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   GEMINI_MODEL=gemini-3.5-flash-lite
   CLIENT_ORIGIN=http://localhost:3000
   ```
7. Save the file. The Express backend will automatically use this key.

> **Note:** The Gemini API key remains strictly on the server-side. It is never transmitted to the browser or bundled in frontend client code.

---

## 7. Installation & Setup Instructions

Clone or download the project folder. You can run the setup in two separate terminal tabs:

### Step 1: Install Server Dependencies
Open Terminal 1:
```bash
cd server
npm install
```

### Step 2: Install Client Dependencies
Open Terminal 2:
```bash
cd client
npm install
```

---

## 8. Running the Application

### Start the Backend Server
In Terminal 1 (from the `server/` directory):
```bash
npm start
```
*You should see:*
```
====================================================
 AI Error Message Helper Server running on port 5004
 Health check: http://localhost:5004/api/health
 Gemini API Key: ✓ Configured
 Active Model: gemini-2.5-flash
====================================================
```

### Start the Frontend Client
In Terminal 2 (from the `client/` directory):
```bash
npm start
```
*You should see:*
```
  VITE v6.x.x  ready in 200 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Open in Browser
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 9. How LocalStorage Persistence Works

This application intentionally avoids remote databases (like MongoDB, Firebase, or Supabase) to deliver a zero-friction, private, offline-capable developer experience:

- **Storage Location:** Diagnoses are saved in the user's browser under the key `ai_error_helper_history_v1`.
- **Stored Data Structure:**
  - `id`: Unique timestamped identifier (e.g., `diag_176051...`).
  - `timestamp`: ISO 8601 date-time string.
  - `errorMessage`: Original error snippet pasted by the user.
  - `technology`: Selected programming language or ecosystem.
  - `diagnosis`: Full 5-part AI response object.
  - `isBookmarked`: Boolean star status.
- **Storage Limits & Quotas:** The app caps history at the 100 most recent items to avoid exhausting the browser's ~5MB `localStorage` limit.
- **Data Privacy:** Your past error messages never leave your machine; they are never uploaded to a cloud database.
- **Important Warning:** Because data resides exclusively in `localStorage`:
  - Clearing browser cookies and website data will remove your saved history.
  - Browsing in Incognito/Private mode will clear history upon closing the private window.
  - Switching to a different browser on the same computer will not transfer history.

---

## 10. Troubleshooting Common Issues

### Issue 1: "Unable to reach local backend server on port 5004"
- **Cause:** The Node.js Express server is not running or crashed.
- **Fix:** In your terminal, ensure you ran `cd server && npm start`. Confirm that no other program is occupying port 5004.

### Issue 2: "Google Gemini API Key is not configured"
- **Cause:** `GEMINI_API_KEY` in `server/.env` is missing or still set to the placeholder `your_gemini_api_key_here`.
- **Fix:** Obtain a free key from [Google AI Studio](https://aistudio.google.com/app/apikey) and paste it into `server/.env`. Restart the server.

### Issue 3: "Gemini API quota or rate limit has been exceeded" (HTTP 429)
- **Cause:** You have exceeded the requests-per-minute quota on Google's free tier.
- **Fix:** Wait 30–60 seconds before submitting another request. The system also supports model fallback if configured.

### Issue 4: "Port 5004 or 3000 already in use"
- **Cause:** Another process is utilizing the port.
- **Fix (Windows PowerShell):**
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5004).OwningProcess | Stop-Process
  ```
- **Fix (Linux/macOS):**
  ```bash
  npx kill-port 5004 3000
  ```

---

## 11. Security & API Key Protection

1. **Server-Side Key Isolation:** The Gemini API key is strictly read via `process.env.GEMINI_API_KEY` on the Node.js backend.
2. **Zero Client Leakage:** The frontend React bundle never contains the secret key.
3. **Git Protection:** `.env` is included in `.gitignore` to prevent accidental credential commits.
4. **Input Sanitization:** Error input length is strictly validated (max 5,000 characters) to prevent prompt bloat and denial-of-service attempts.
5. **No Code Execution:** The application only performs static lexical analysis; it never evaluates or executes user-provided code strings.

---

## 12. Project Limitations & Future Enhancements

### Current Limitations
- **Stateless AI:** The assistant treats each analysis independently and does not maintain multi-turn chat memory across prompts.
- **Browser-Specific History:** History does not sync across different devices or browsers because it uses `localStorage`.
- **Static Context:** If the user provides a very short error without source code, the code example is illustrative rather than identical to their repository.

### Future Enhancements
- **Multi-Turn Interactive Chat:** Allow users to ask follow-up questions about a specific diagnosis.
- **IDE Extensions:** Create a VS Code extension that pipes terminal errors directly to the local backend.
- **Automated Stack Trace Demangling:** Parse minified JavaScript stack traces using uploaded source maps.
- **Export to PDF:** Allow downloading a stylized PDF report for academic submission or team sharing.

---

## 13. College Project Report

For academic evaluation, faculty review, and project vivas, a comprehensive 15-section project report is included in [PROJECT_REPORT.md](file:///y:/Rudo/PROJECT_REPORT.md). It details the system architecture, hardware/software specifications, UML data flows, test cases, and academic conclusions.
