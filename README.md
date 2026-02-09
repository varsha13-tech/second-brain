Second Brain

Live Application: https://second-brain-six-kappa.vercel.app

Second Brain is a personal knowledge management app — a simple “second brain” where you can capture notes, links, and ideas, and use AI to make sense of them over time.

This project was built as part of the Altibbe / Hedamo Full-Stack Engineering Internship Assessment.

Running the project locally

Requirements: Node.js & npm
(Using nvm is recommended.)

npm install
npm run dev

Once it starts, open the URL shown in your terminal (usually http://localhost:5173
).

Tech stack

Vite – frontend tooling
React + TypeScript
Tailwind CSS
shadcn-ui
Supabase – authentication & PostgreSQL database
Server-side AI – via API routes (OpenAI-compatible)

A note on using Vite instead of Next.js

The assignment mentions Next.js as the preferred frontend framework. This project uses Vite + React, and I want to briefly explain why.

By the time the core features were in place (auth flows, AI processing, background jobs, and public APIs), the app already had a clean separation between the UI and the backend logic. All AI calls run server-side, authentication is handled securely, and no secrets are exposed to the client.

At that point, migrating everything to Next.js would have meant rewriting routing and build setup, with a real risk of breaking:

Supabase auth and email verification
Background AI processing on create/update
Public API behavior

Given the assessment’s emphasis on correctness, architecture, and product thinking, I chose to keep a stable, working system and focus on demonstrating the underlying principles the requirement is meant to test.

Even without Next.js, the project still reflects those principles:

AI runs only on the server
A public API exposes the system’s intelligence
AI features run automatically in the background (non-blocking)
UX flows (like signup confirmation) are explicit and intentional

In a real production setup at Altibbe/Hedamo, this app would be implemented using Next.js App Router to take advantage of server components and edge deployment. The current setup focuses on clarity, stability, and showing how I think about system design.

Scripts

npm run dev – start the dev server
npm run build – create a production build
npm run preview – preview the production build
npm run lint – run ESLint
npm run test – run tests
