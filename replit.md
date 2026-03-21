# AI Career Advisor

## Overview

A full-stack AI-powered career advisor web app for students. Tracks skills, projects, and internship applications, with an AI mentor powered by OpenAI GPT.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/career-advisor)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations proxy
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port via $PORT)
│   └── career-advisor/     # React + Vite frontend (serves at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server-side client
│   └── integrations-openai-ai-react/   # OpenAI React hooks
└── scripts/                # Utility scripts
```

## Features

- **Dashboard**: Overview stats for skills, projects, applications pipeline
- **Skills**: Track technical/soft skills with proficiency levels
- **Projects**: Manage portfolio projects with status and links
- **Applications**: Track internship applications with Kanban-like status pipeline
- **AI Mentor**: Chat with an AI career advisor powered by OpenAI GPT-5.2
  - Resume feedback via streaming SSE
  - Skill gap analysis for target roles
  - Personalized internship recommendations
- **Profile**: Student profile with school, major, target role

## API Routes

- `GET/PUT /api/profile` - Student profile
- `GET/POST /api/skills` - Skills CRUD
- `PUT/DELETE /api/skills/:id` - Update/delete skills
- `GET/POST /api/projects` - Projects CRUD
- `PUT/DELETE /api/projects/:id` - Update/delete projects
- `GET/POST /api/applications` - Applications CRUD
- `PUT/DELETE /api/applications/:id` - Update/delete applications
- `GET/POST /api/openai/conversations` - AI conversations
- `POST /api/openai/conversations/:id/messages` - Streaming chat (SSE)
- `POST /api/advisor/resume-feedback` - Resume feedback (SSE)
- `POST /api/advisor/skill-gap` - Skill gap analysis (SSE)
- `GET /api/advisor/recommendations` - AI internship recommendations

## Database Schema

- `profile` - Student profile
- `skills` - Skills with category and proficiency
- `projects` - Portfolio projects
- `applications` - Internship applications with status pipeline
- `conversations` - AI chat conversations
- `messages` - Chat messages

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI proxy URL (auto-provisioned)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI proxy key (auto-provisioned)
