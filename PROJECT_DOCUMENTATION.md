# Career GPS LMS Project Documentation

## Overview

This documentation covers the `backend/` API server and the `client/` React application in this workspace. The project is a personalized learning management system that generates career roadmaps, AI-powered study content, interview practice, spaced repetition revision, and progress analytics.

The main user journey is:
- registration/login
- onboarding with role, timeline, and daily study preferences
- AI-generated learning roadmap creation
- topic-based learning, notes, drills, quizzes, and revision
- dashboard analytics, streaks, achievements, notifications, and planner tasks

---

## Architecture Summary

### Backend

The backend is built with Node.js, Express, and MongoDB via Mongoose.

Key responsibilities:
- authentication and authorization
- user profile and onboarding
- roadmap generation and subject/topic management
- note taking, interview answer practice, quizzes, and revision
- analytics, streak tracking, gamification, notifications
- admin user management
- AI integrations via `aiService.js`

Critical backend files:
- `server.js` — server bootstrap, middleware, route mounting
- `config/db.js` — MongoDB connection
- `middleware/auth.js` — JWT bearer token protection
- `routes/*.js` — Express route definitions
- `controllers/*.js` — business logic for each feature
- `models/*.js` — MongoDB data models
- `services/aiService.js` — AI provider integration and JSON output handling
- `services/emailService.js` — email templates and SMTP delivery
- `services/gamificationService.js` — XP, streaks, achievements, helper utilities

### Client

The client is built with React, Vite, Tailwind CSS, React Router, and Axios.

Key responsibilities:
- user authentication and session restoration
- protected route gating and onboarding flow
- UI for roadmap, dashboard, planner, insights, and learning topics
- API integration with centralized Axios instance
- notifications, progress visuals, and gamified experience

Critical client files:
- `src/App.jsx` — route definitions and public/protected route wrappers
- `src/context/AuthContext.jsx` — auth state and login/register logic
- `src/services/api.js` — Axios instance, token attachment, refresh interceptor
- `src/components/Layout.jsx` — shared shell for authenticated app UI
- `src/components/ProtectedRoute.jsx` / `PublicRoute.jsx` — route guard logic
- `src/pages/*` and `src/components/*` — page components and feature UIs

---

## Backend Detailed Flow

### `server.js`

Entry point.

Features:
- loads environment variables via `dotenv`
- connects to MongoDB using `connectDB()`
- configures CORS using `CLIENT_URL`
- parses JSON and URL-encoded bodies with a 10MB limit
- parses cookies with `cookie-parser`
- mounts API route groups under `/api`
- includes a health check endpoint `/api/health`
- adds global error handler with stack traces in development

Tradeoff:
- using large body size limit supports base64 image or rich payload uploads, but should be monitored for untrusted clients.

### `config/db.js`

Connects to MongoDB using `mongoose.connect(process.env.MONGODB_URI)`.

Failure behavior:
- logs the connection error and exits process.

### `middleware/auth.js`

Protects routes using JWT access tokens.

Behavior:
- checks `Authorization: Bearer <token>` header
- verifies token using `JWT_SECRET`
- attaches user record to `req.user`
- returns `401` on missing/invalid token

### `routes/authRoutes.js`

Auth endpoints:
- `POST /register`
- `POST /login`
- `POST /google`
- `POST /verify`
- `POST /refresh`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /logout`
- `GET /profile` (protected)
- `PUT /profile` (protected)

### `controllers/authController.js`

Key functions:
- `registerUser(req, res)`
  - checks existing user by email
  - creates user
  - generates verification token and expiration
  - creates related `Streak` and `Analytics` documents
  - currently bypasses email verification by setting `isVerified: true`

- `loginUser(req, res)`
  - validates local account and password
  - requires email verification
  - generates access token and refresh token
  - saves refresh token to user and cookie
  - returns user metadata and `accessToken`

- `googleAuth(req, res)`
  - verifies Google ID token via `google-auth-library`
  - links existing users by email or googleId
  - creates new user if needed
  - sets `isVerified: true`
  - issues tokens and stores refresh token cookie

- `verifyEmail(req, res)`
  - validates verification token and expiration
  - marks user verified

- `refreshAccessToken(req, res)`
  - accepts refresh token from cookie or body
  - verifies refresh token using `JWT_REFRESH_SECRET`
  - compares to stored refresh token on user record
  - issues new access token and refresh token

- `forgotPassword(req, res)`, `resetPassword(req, res)`
  - send reset email and update password with expiration
  - note: `sendPasswordResetEmail` is implemented in `emailService.js`

- `logoutUser(req, res)`
  - clears refresh token from user record and optionally cookie

- `getUserProfile(req, res)` / `updateUserProfile(req, res)`
  - manage user metadata and profile fields

Key backend tradeoffs:
- storing refresh tokens in the user document allows single-session revoke but is not distributed-friendly without a shared store.
- short-lived access token improves security but increases dependence on refresh flow.

### `routes/roadmapRoutes.js`

Protected onboarding and roadmap endpoints:
- `POST /onboard`
- `GET /active`
- `GET /subject/:subjectId`
- `GET /topic/:topicId`
- `GET /topic/:topicId/learn`
- `PUT /topic/:topicId/progress`
- `POST /topic/:topicId/chat`
- `POST /topic/:topicId/quiz/reward`
- `GET /topic/:topicId/quiz`
- `GET /topic/:topicId/practice`
- `GET /topic/:topicId/quiz/attempts`
- `POST /topic/:topicId/quiz/submit`

### `controllers/roadmapController.js`

Key functions:
- `onboardUser(req, res)`
  - updates user profile target data
  - cleans up existing roadmap-related documents for reset
  - generates roadmap with `generateRoadmap()` AI service
  - creates `Roadmap`, `Subject`, `Topic`, and initial `Revision` entries

- `getActiveRoadmap(req, res)`
  - returns current roadmap plus subjects enriched with topic counts

- `getSubjectDetails(req, res)`
  - returns a subject and its topics

- `getTopicDetails(req, res)`
  - returns topic, note (creates default note if missing), revision card, and interview answers

### `routes/noteRoutes.js`

Protected note endpoints:
- `GET /topic/:topicId`
- `PUT /topic/:topicId`
- `POST /topic/:topicId/ai`
- `GET /search`

### `controllers/noteController.js`

Key functions:
- `getNote(req, res)`
  - retrieves or creates a note for a topic

- `updateNote(req, res)`
  - saves note content, tags, pin state
  - auto-completes topic if the note has 100+ characters

- `getAIAssistantNote(req, res)`
  - requests AI-generated note assistance from `generateNotesAssisted()`
  - awards a small streak reward

- `searchNotes(req, res)`
  - full-text search by content and optional tag filtering

### `routes/interviewRoutes.js`

Protected interview endpoints:
- `GET /topic/:topicId`
- `PUT /answer/:questionId`

### `controllers/interviewController.js`

Key functions:
- `getTopicQuestions(req, res)`
  - returns saved interview questions for a topic
  - generates question templates via `generateInterviewQuestions()` if not present

- `saveInterviewAnswer(req, res)`
  - updates answer text
  - evaluates answer via `evaluateInterviewAnswer()` AI service
  - awards XP and streak points on first-time answer

### `routes/analyticsRoutes.js`

Protected analytics endpoint:
- `GET /`

### `controllers/analyticsController.js`

Key function:
- `getDashboardStats(req, res)`
  - reads topic, note, answer, revision, streak, achievement, drill data
  - computes readiness and progress metrics
  - writes analytics history into `Analytics`
  - returns readiness score, stats, focus areas, recent quiz summaries, and heatmap data

### `routes/notificationRoutes.js`

Protected notification endpoints:
- `GET /`
- `PUT /:id/read`
- `POST /streak-check`

### `controllers/notificationController.js`

Key functions:
- `getNotifications(req, res)`
  - returns recent notifications

- `markAsRead(req, res)`
  - updates notification status

- `checkStreakRisk(req, res)`
  - analyzes streak activity and creates risk alerts

### `routes/revisionRoutes.js`

Protected revision endpoints:
- `GET /`
- `PUT /complete/:revisionId`
- `POST /schedule`

### `controllers/revisionController.js`

Key functions:
- `getRevisionQueue(req, res)`
  - categorizes due, upcoming, mastered, and not-started revision cards

- `completeRevision(req, res)`
  - advances the spaced repetition interval
  - awards XP and updates streaks

- `scheduleRevision(req, res)`
  - manually schedules a revision card for tomorrow

### `routes/linkedinRoutes.js`

Protected LinkedIn content endpoints:
- `POST /`
- `GET /`

### `controllers/linkedinController.js`

Key functions:
- `createLinkedInPost(req, res)`
  - generates social copy via `generateLinkedInPost()` and saves it

- `getLinkedInPosts(req, res)`
  - lists saved post drafts

### `routes/adminRoutes.js`

Protected admin endpoints:
- `GET /users`
- `PUT /users/:id/role`
- `DELETE /users/:id`

Requires `admin` middleware plus auth protection.

### `controllers/adminController.js`

Key functions:
- `getAllUsers(req, res)`
- `updateUserRole(req, res)`
- `deleteUser(req, res)`
  - cascades deletion of user-owned documents across multiple collections

### `controllers/topicController.js`

Key functions:
- `getTopicLearnContent(req, res)`
  - returns cached AI learn content or generates it via `generateLearnContent()`
  - caches content in `topic.cachedLearnContent`

- `completeTopic(topicId, userId)`
  - marks topic completed, updates subject progress, awards XP, schedules revision, updates streaks

- `updateTopicProgress(req, res)`
  - updates progress and status
  - calls `completeTopic()` when completed

- `chatWithTopicTutor(req, res)`
  - generates tutor responses with `generateTopicTutorResponse()`
  - optionally caches learn content first

- `awardQuizReward(req, res)`
  - awards XP for quiz interaction

- `getTopicQuiz(req, res)`
  - returns cached quiz questions or generates them via `generateTopicQuizQuestions()`

- `getTopicPracticeBoard(req, res)`
  - returns cached practice board or generates it via `generateLearningActivity()`

- `getTopicQuizAttempts(req, res)`
  - lists past quiz attempts

- `submitTopicQuiz(req, res)`
  - grades quiz answers, stores `QuizAttempt`, awards XP, updates analytics, optionally completes topic

### `controllers/drillController.js`

Key functions:
- `generateDrill(req, res)`
  - creates practice drill records from AI-generated or provided questions

- `submitDrill(req, res)`
  - stores learner answers, evaluates with `evaluateDrillAnswers()`, awards XP, marks drill completed

- `getDrillHistory(req, res)`
  - paginated completed drill history

- `getTodaysDrills(req, res)`
  - drill records for current day

- `getDrillHistoryList(req, res)`
  - last 10 completed drills

- `getDrillStats(req, res)`
  - aggregated drill performance metrics

### `services/aiService.js`

AI orchestration and JSON parsing.

Key features:
- provider fallback from Grok/Groq to Gemini
- robust JSON parsing and sanitization
- functions for roadmap generation, learn content, note assistance, interview questions, quiz questions, drill questions, answer evaluation, LinkedIn copy, tutor chat
- skill detection between coding/IT and non-coding roles

Tradeoffs:
- using external LLM APIs increases fragility and response latency
- fallback mechanism improves availability but needs careful API key management
- caching generated results in Mongo documents reduces repeated costs

Important functions:
- `callGrokAPI(messages, expectJson)`
- `callGeminiAPI(messages, expectJson)`
- `callLLMWithRetryAndFallback(messages, expectJson)`
- `generateRoadmap(...)`
- `generateLearnContent(...)`
- `generateNotesAssisted(...)`
- `generateInterviewQuestions(...)`
- `generateDrillQuestions(...)`
- `evaluateDrillAnswers(...)`
- `evaluateInterviewAnswer(...)`
- `generateDailyTasks(...)`
- `generateLinkedInPost(...)`
- `generateTopicTutorResponse(...)`
- `generateTopicQuizQuestions(...)`

### `services/emailService.js`

Implements email sending and styled HTML wrappers.

Features:
- verified SMTP transport using `nodemailer`
- `sendVerificationEmail()`
- `sendPasswordResetEmail()`
- custom HTML templates for branding

### `services/gamificationService.js`

Responsible for XP, streaks, and achievement logic.

Key functions:
- `getLocalDateString()` / `getYesterdayDateString()`
- `addXP(userId, xpAmount, reason)`
- `updateStreakActivity(userId, hoursDelta, tasksDelta, topicsDelta, xpDelta)`
- `checkAndUnlockAchievements(userId)`

Tradeoffs:
- storing streak history in a single document is easy but can grow over time
- achievement unlocking is currently computed from thresholds and may require deduplication via unique indexes

## Backend Models

### `models/User.js`

Fields:
- name, email, googleId, password, authProvider, role, verification, reset tokens, refresh token
- profile object with targetRole, experienceLevel, targetTimeline, dailyStudyTime, social links, avatar, autoScheduleRevision
- xp, level

Methods:
- pre-save password hashing with bcrypt
- `matchPassword()` for login

Tradeoffs:
- storing `refreshToken` on the user is simple but requires DB lookups for refresh validation
- `isVerified` bypassed for registration in current code path

### `models/Roadmap.js`
- user, role, estimatedDays, difficulty

### `models/Subject.js`
- roadmap, user, name, order, estimatedTime, status, progress

### `models/Topic.js`
- subject, roadmap, user, name, difficulty, estimatedHours, status, progress
- learningObjectives, prerequisites, summary, lessonName
- AI caches: `isLearnGenerated`, `cachedLearnContent`, `isQuizGenerated`, `quizQuestions`, `isPracticeGenerated`, `cachedPracticeBoard`

### `models/Revision.js`
- user, subject, topic, status, intervalStep, nextRevisionDate, lastRevisionDate, history

### `models/Task.js`
- user, name, type, status, referenceId, date, xpRewarded

### `models/Notification.js`
- user, title, message, type, isRead

### `models/Analytics.js`
- user, careerReadinessScore, totalStudyHours, totalTopicsCompleted, totalNotesCreated, totalQuestionsAnswered, totalQuizzesTaken, averageQuizScore, revisionCompletionRate, dailyGoalCompletionRate, historicalReadiness

### `models/Achievement.js`
- user, title, description, badgeIcon, unlockedAt
- unique index on `user + title`

### `models/InterviewAnswer.js`
- user, subject, topic, question, answer, evaluation object

### `models/QuizAttempt.js`
- user, subject, topic, score, totalQuestions, passed, answers array

### `models/Drill.js`
- user, role, focusTitle, source, date, questions, evaluation, xpAwarded, status

---

## Client Detailed Flow

### `src/App.jsx`

Routes:
- public: `/`, `/signup`, `/login`
- protected: onboarding steps, `/roadmap`, `/dashboard`, `/settings`, `/subject/:subjectId`, `/topic/:topicId`, `/planner`, `/insights`

Route wrappers:
- `ProtectedRoute` ensures the user is authenticated and onboarding is complete before letting them into main app sections
- `PublicRoute` redirects authenticated users away from public pages

### `src/context/AuthContext.jsx`

Handles auth state and exposes methods:
- `register(name, email, password)`
- `login(email, password)`
- `googleLogin(credential)`
- `logout()`
- `updateProfile(profileData)`
- `reloadUserProfile()`

On mount, it restores session by calling `/auth/profile` if access token exists.
It stores access tokens and refresh tokens in `localStorage`.

Tradeoff:
- localStorage is easy for single-page apps, but vulnerable to XSS. The refresh token is also stored in localStorage even though a cookie is set by the server.

### `src/services/api.js`

Central Axios instance logic:
- base URL defaults to `http://localhost:5000/api`
- attaches stored access token to every request
- has a response interceptor that refreshes the access token on `401`
- retries the original request after refresh
- dispatches an `auth-logout` event after refresh failure

Key behavior:
- allows token rotation and long-lived sessions
- requires `withCredentials: true` for cookie refresh endpoint

Tradeoff:
- `retry` logic is useful but must avoid infinite loops if refresh repeatedly fails.

### `src/components/ProtectedRoute.jsx`

If user is loading, renders loader.
If no user, redirects to `/login`.
If onboarding incomplete, redirects to `/onboarding/role`.

### `src/components/PublicRoute.jsx`

If user is authenticated, redirects to `/roadmap`.
Otherwise renders child public page.

### `src/components/Layout.jsx`

Shared app chrome including sidebar, top bar, notifications, user avatar, and toast alerts.

Features:
- fetches notifications and streak count on mount
- shows unread count and mark-all-read action
- shows XP / level toast when user gains progress
- mobile and desktop navigation links

### `src/pages/SignUp.jsx` and `src/components/SignUp/*`

Registration flow:
- form validation for name, email, password strength, matching confirmation
- sends data to `/auth/register`
- on success navigates to `/login`
- supports Google sign-in via `GoogleSignInButton`

### `src/pages/Login.jsx`

Login flow:
- email/password form sends credentials to `/auth/login`
- on success stores token and navigates to dashboard or onboarding
- supports Google sign-in via `GoogleSignInButton`

### `src/components/GoogleSignInButton.jsx`

Integrates Google Identity Services.
Key behavior:
- waits for `window.google.accounts.id` to load
- renders a Google button
- passes returned credential to `onSuccess`

### `src/pages/Roadmap.jsx` and `src/components/roadmap/*`

Roadmap view:
- loads `/roadmap/active`
- displays subject progress and roadmap timeline
- uses `RoadmapTimeline` and `RoadmapDetailGrid`

### `src/components/Dashboard/*`

Dashboard view features:
- loads `/analytics`, `/planner`, and `/roadmap/active`
- displays readiness score, stats grid, progress heatmap, badges, active subjects, and drill CTA
- toggles planner tasks and refreshes analytics
- triggers drill generation via `/drill/generate` and submission via `/drill/submit`

### `src/components/Planner/*`

Planner view features:
- loads `/planner`, `/revision`, `/analytics`
- shows today's custom tasks and revision queue
- supports adding tasks, completing tasks, deleting tasks
- active recall card feedback and revision completion flows
- schedules revisions via `/revision/schedule`

### `src/components/Insights/*`

Insights view features:
- loads `/analytics`, `/roadmap/active`, `/drill/history`
- displays charts, heatmaps, drill and quiz details, and performance history
- provides modals for drill and quiz insights

### Onboarding flow

The user is routed through:
- `/onboarding/role`
- `/onboarding/timeline`
- `/onboarding/hours`
- `/onboarding/loading`

These pages collect role goals, experience level, timeline, daily hours, and then generate the roadmap.

### Auth and session flow

Client-side flow:
1. User registers or signs in
2. server issues `accessToken` and `refreshToken`
3. client stores tokens in `localStorage`
4. `api.js` adds `Authorization` header to requests
5. on `401`, refresh endpoint restores session and retries request
6. `AuthContext` fetches `GET /auth/profile` on app load

Security considerations:
- `accessToken` is short-lived (15m)
- `refreshToken` is long-lived (7d)
- `refreshToken` is also saved in HTTP-only cookie by server
- The client still stores `refreshToken` in localStorage for the refresh endpoint body

---

## Libraries and Technologies Used

### Backend
- `express` — HTTP server and routing
- `mongoose` — MongoDB ODM
- `dotenv` — environment config
- `cors` — CORS policy
- `cookie-parser` — cookie parsing
- `jsonwebtoken` — JWT auth
- `bcryptjs` — password hashing
- `google-auth-library` — Google OAuth token validation
- `axios` — HTTP client for AI provider APIs
- `nodemailer` — email delivery
- `cloudinary` — likely included for media uploads (not clearly used in current code)
- `nodemon` (dev) — development auto restart

### Client
- `react` / `react-dom` — UI library
- `react-router-dom` — routing
- `axios` — API client
- `vite` — build tool
- `tailwindcss` — styling
- `oxlint` — linting

### AI Providers
- Grok / Groq endpoint via `GROK_API_KEY`
- Gemini API via `GEMINI_API_KEY`
- AI logic chooses provider with retry and fallback

### Data & UX Patterns
- JWT access + refresh token pair
- React Context for auth state
- protected routes + onboarding gating
- cache AI-generated content in DB for repeat requests
- gamify learning with XP, streaks, achievements, and notifications
- revision spaced repetition with interval steps

---

## Tradeoffs and Design Considerations

### Backend
- **Express/Mongoose**: fast to build, flexible schema design, but can become unwieldy without strict validation.
- **AI caching**: caching generated `learnContent`, `quizQuestions`, `practiceBoard`, and `notes` avoids repeated API cost, but increases document size and stale data risk.
- **Refresh token storage**: storing refresh tokens in user records enables session revocation but is not ideal for multi-device scaling unless a shared store or token blacklist is used.
- **Email verification**: currently registration bypasses email verification, so the account creation path is simpler but less secure.
- **Single endpoint cleanup on onboarding**: deleting old roadmap data and recreating ensures consistency, but could lose historical progress data.
- **AI fallback logic**: good reliability strategy, but increases complexity and debugging when provider outputs invalid JSON.

### Client
- **localStorage token storage**: usable in SPAs, but watch for XSS. Better alternatives are secure cookies for both tokens.
- **Axios interceptor retry**: improves UX for expired access tokens, yet adds complexity around token refresh loops.
- **Route protection**: gating onboarding before main pages ensures consistent user state.
- **UI component layering**: `Layout` provides shared navigation and notification fetching, while page-level components load data and manage feature state.

---

## Interview Preparation Questions

### Architecture
1. How does the backend separate concerns between routes, controllers, and services?
2. Why use both access tokens and refresh tokens? What are the security benefits and risks?
3. How does the project handle AI provider failure?
4. Why is caching AI-generated content useful in this app?
5. What are the pros and cons of using MongoDB for this application?

### Authentication & Authorization
1. Explain the flow from login to protected route access in this app.
2. How does `ProtectedRoute` enforce onboarding completion?
3. Why is `cookie-parser` used alongside localStorage auth?
4. How would you improve this auth system for production security?

### Data Modeling
1. Why are `Subject` and `Topic` separate collections?
2. What is the purpose of `Revision` and how does it support spaced repetition?
3. Why does the app store both `topic.status` and `topic.progress`?
4. How do `Analytics` and `Achievement` documents differ in responsibility?

### AI Integration
1. What does `aiService.js` do, and why is JSON parsing critical there?
2. How does the app distinguish coding vs non-coding roles in prompts?
3. What are the main AI-generated features in the app?
4. How would you make the AI prompts more robust or safer?

### Frontend User Flow
1. How does the dashboard refresh when a planner task is completed?
2. Explain the onboarding / roadmap generation process.
3. How are notifications handled and displayed?
4. What happens if the access token expires while the user is active?

### Potential Challenges and Improvements
1. What challenge arises from storing refresh tokens in user documents?
2. How can AI-generated content create stability issues?
3. What are the limits of the current revision scheduler?
4. How can this app be made more scalable for many simultaneous users?

---

## Challenges Faced and Possible Improvements

### AI Reliability
- issue: AI providers can return broken JSON or time out
- improvement: add stricter response validation, fallback prompts, and cached safe defaults

### Authentication & Security
- issue: localStorage storage of tokens exposes XSS risk
- improvement: use secure, HttpOnly cookies for both access and refresh tokens; add CSRF protection

### Data Consistency
- issue: onboarding wipes old roadmaps by deleting multiple collections
- improvement: use transactions or versioned roadmap saves, keep history of previous plans

### Performance
- issue: large `Topic` documents with cached content could slow reads
- improvement: split cached AI content into separate collection or use a CDN/cache layer

### User Experience
- issue: onboarding may feel linear and long if user does not complete each step
- improvement: more flexible onboarding with partial saves and optional timeline update

### Scale
- issue: `checkAndUnlockAchievements()` uses many aggregate queries per user
- improvement: schedule background jobs or incremental counters rather than on each write

---

## How to Explain the Project

Use this structure in interviews:
1. Problem statement: "I built a personalized career learning platform that blends AI-generated study plans, progress tracking, interview preparation, and gamified learning."
2. Architecture: "Backend is Node/Express with MongoDB. Frontend is React/Vite/Tailwind. Auth uses JWT access and refresh tokens."
3. Major flows: "Onboarding generates a roadmap using AI. Users learn topics, take notes, answer interview questions, and revise content. The dashboard shows readiness score." 
4. AI integration: "I wrote a service layer that can call multiple LLM providers, parse their JSON, and cache results. It generates everything from roadmap structure to quiz questions and LinkedIn posts."
5. Tradeoffs: "I chose MongoDB for schema flexibility and fast development. I used token refresh for security, but there is room to improve cookie handling and multi-device session management."
6. Improvements: "I would add stronger validation, background analytics jobs, a more robust AI prompt guard, and better production token security."

---

## Appendix: Key File Roles

### Backend by folder
- `backend/server.js` — app startup and routes
- `backend/config/db.js` — DB connection
- `backend/middleware/auth.js` — JWT validation
- `backend/routes/*.js` — routes grouped by feature
- `backend/controllers/*.js` — business logic for each route group
- `backend/services/*.js` — AI, email, gamification logic
- `backend/models/*.js` — Mongo schema definitions

### Client by folder
- `client/src/App.jsx` — route structure
- `client/src/context/AuthContext.jsx` — app auth state
- `client/src/services/api.js` — HTTP and token handling
- `client/src/components/Layout.jsx` — app shell UI
- `client/src/components/ProtectedRoute.jsx` — auth gating
- `client/src/components/PublicRoute.jsx` — public page gating
- `client/src/components/GoogleSignInButton.jsx` — Google OIDC integration
- `client/src/pages/*` — high-level feature pages
- `client/src/components/Dashboard/*`, `Planner/*`, `Insights/*`, `roadmap/*` — feature-specific UI

---

## Final Notes

This project demonstrates full-stack app design with a strong emphasis on AI-driven learning, user progress gamification, and a modern React experience. The key strengths are its end-to-end flow, AI prompt orchestration, and adaptive learning features. The main areas to discuss in interviews are the auth model, AI integration, caching strategy, and how the app balances data modeling with UX needs.
