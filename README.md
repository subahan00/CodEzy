# CodEzy: Comprehensive Project Architecture & Context

This document serves as the master context file for the **CodEzy** platform. It details the entire technology stack, architectural design, core systems, and workflows. This is designed to help any AI agent or developer instantly understand "what it is, how it's done, and which technologies are used."

---

## 1. Project Overview
**CodEzy** is a modern, real-time competitive programming and AI-assisted learning platform. 
It allows users to solve coding challenges, engage in 1v1 multiplayer coding duels, spectate live matches, and receive context-aware help from an integrated AI Mentor. 

The system is built for scalability and security, utilizing an asynchronous background job architecture for code execution and isolated Docker containers to safely run untrusted user code.

---

## 2. Technology Stack

### Frontend (User Interface)
- **Framework**: React 19 + Vite (for fast HMR and builds).
- **Styling**: Tailwind CSS, PostCSS, Vanilla CSS.
- **Code Editor**: `@monaco-editor/react` (VS Code-like editor in the browser).
- **Animations & 3D**: `framer-motion` for UI transitions, `three.js` & `ogl` for 3D elements.
- **State/Routing**: `react-router-dom` for client-side routing.
- **Real-time**: `socket.io-client` for live duels and spectator mode.
- **Data Visualization**: `recharts` for user analytics and skill mastery charts.

### Backend (API & Business Logic)
- **Framework**: Node.js with Express.js.
- **Database**: MongoDB (via `mongoose` ORM) for persistent data (Users, Problems, Submissions, Duels).
- **Caching & Message Broker**: Redis (via `ioredis`).
- **Background Jobs**: BullMQ (Queueing system for code execution and AI processing). Includes `@bull-board/express` for visual queue monitoring.
- **Real-time Engine**: Socket.io (Handles multiplayer Arena, DuelRooms, and Spectator features).
- **AI Integrations**: Groq SDK, Google Generative AI (`@google/genai`), and OpenAI (Used for the AI Mentor and automated failure classification).
- **Process Management**: PM2 and Concurrently for managing multiple worker processes in development and production.

### Code Execution Engine (Infrastructure)
- **Containerization**: Docker.
- **Supported Languages**: C++, Java, Python, JavaScript.
- **Architecture**: A "Dumb Executor" pattern. The Docker containers simply receive the user code and test cases, compile the code (for Java/C++), execute it, and return `stdout`, `stderr`, and execution times back to the Node.js backend.

---

## 3. Core Systems & Workflows

### A. The Code Execution Workflow (Asynchronous)
To prevent the main API thread from blocking during code execution, CodEzy uses a decoupled, event-driven execution engine.

1. **Submission**: User writes code in the Monaco Editor and hits "Submit" or "Run".
2. **API Layer**: Express receives the request (`submission.routes.js`) and adds a job to the BullMQ Redis queue. It immediately returns a `jobId` to the frontend.
3. **Queue Processing**: `submissionWorker.js` or `runWorker.js` picks up the job.
4. **Docker Execution**: The worker invokes a service (`judgeRunner.js`) that spins up or utilizes a Docker container (`docker/compiler/[lang]/Dockerfile`) to execute the code against hidden/public test cases.
5. **Adaptive Engine (Post-Execution)**: 
   - If the code passes, the user's skill mastery scores are updated.
   - If the code **fails**, an LLM (via Groq) is invoked to analyze the source code and the problem statement to **classify the failure reason** (e.g., "Syntax Error", "Logic Error in loop"). This populates a "Failure Radar" on the user's profile.
6. **Completion**: The worker marks the job as complete in the database. The frontend polls or receives a socket event to fetch the final results.

### B. Real-Time Multiplayer System
Handled via `socket.io` in `backend/src/sockets/socketManager.js` and frontend pages (`Arena.jsx`, `DuelRoom.jsx`, `Spectator.jsx`).
- **Matchmaking**: Users join an "Arena" queue. The server pairs them up based on rating/availability.
- **Duel Room**: Once paired, users enter a `DuelRoom`. Their progress (test cases passed, time elapsed) is broadcasted to their opponent in real-time.
- **Spectator Mode**: Third-party users can join a duel room as a "Spectator" to watch live progress without interfering.

### C. The AI Mentor System
- **Frontend**: `AiMentor.jsx` provides a chat interface alongside the code editor.
- **Backend Routing**: Distinct endpoints separate general chat from context-aware coding help.
- **Context Injection**: When a user asks a coding question, the backend automatically injects the Problem Statement and the User's Current Code into the LLM prompt. This allows the AI to give highly specific, localized hints without giving away the full solution. 
- **Workers**: `aiWorker.js` handles heavy LLM requests via BullMQ to prevent API timeouts.

---

## 4. Database Schema Overview (`backend/src/models/`)

- **`User.js`**: Stores authentication details, rating, skill mastery arrays, and `failureProfile` (for the analytics radar chart).
- **`content.model.js` (Problems)**: Stores problem metadata (title, slug, difficulty, tags), constraints, examples, hidden test cases, and starter code templates for different languages.
- **`submission.model.js`**: Records every code submission, linking the User and Content. It stores execution time, memory used, status (Accepted, Wrong Answer, etc.), and AI failure classifications.
- **`Duel.js`**: Tracks 1v1 matches, participants, winner, and rating changes.
- **`Leaderboard.js`**: Materialized views or aggregations of user rankings.

---

## 5. Folder Structure Map

```text
CodEzy/
├── frontend/                 # React UI
│   ├── src/
│   │   ├── components/       # Reusable UI (Editor, ProblemDescription, AiMentor)
│   │   ├── pages/            # Views (HomePage, Login, Arena, DuelRoom, Spectator, Analytics)
│   │   └── services/         # API wrappers (Axios calls to backend)
│   └── package.json          
│
├── backend/                  # Node/Express API
│   ├── src/
│   │   ├── app.js / server.js# Express setup and Socket.io initialization
│   │   ├── controllers/      # API logic (Problems, Users, Submissions)
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── services/         # LLM services, recommendation engines, compiler logic
│   │   ├── sockets/          # Real-time event handlers
│   │   └── workers/          # BullMQ queue processors (runWorker, submissionWorker, aiWorker)
│   └── package.json          
│
├── docker/                   # Isolated Execution Environments
│   └── compiler/
│       ├── cpp/              # Dockerfile and entry scripts for C++
│       ├── java/             # Dockerfile and entry scripts for Java
│       ├── js/               # Dockerfile and entry scripts for Node.js
│       └── python/           # Dockerfile and entry scripts for Python
│
└── docker-compose.yml        # (If utilized for setting up Redis/Mongo locally)
```

## 6. How the Pieces Fit Together (The "Tiny Details")
1. **Starting the stack**: The developer runs the Vite dev server for the frontend, and concurrently runs the Express server and the worker processes (`npm run dev:all` in backend).
2. **Security**: The backend does NOT execute code directly on the host machine. It passes payloads to isolated Docker containers. This ensures a malicious user cannot run `rm -rf /` on the Node server.
3. **State Management**: The frontend uses standard React Context / Hooks, but relies heavily on optimistic updates and WebSocket events for state synchronization in multiplayer modes.
4. **AI integration**: The platform isn't just a leetcode clone; it actively profiles the user. If a user fails 5 graph problems in a row due to "Time Limit Exceeded", the `submissionWorker` logs this via Groq LLM, updates the `User` schema, and the `AnalyticsPage` displays this weakness visually using Recharts.

---
*End of Context Document.*
