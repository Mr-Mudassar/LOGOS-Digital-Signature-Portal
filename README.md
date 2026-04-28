# 🏛 LSDS Portal — Lagos State Digital Signature System

> Full-stack **digital contract management and signature platform** built for the Lagos State (Nigeria) market. End-to-end contract lifecycle with AI-assisted generation, secure multi-party signing, and full audit trails. Built end-to-end as the sole developer.

[![Status](https://img.shields.io/badge/Status-Pre--Launch%20Pilot-yellow?style=flat-square)]()
[![Live Demo](https://img.shields.io/badge/Demo-lsds--portal--system.vercel.app-success?style=flat-square)](https://lsds-portal-system.vercel.app/)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20Full--Stack-black?style=flat-square)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-336791?style=flat-square)]()
[![Cloud](https://img.shields.io/badge/Cloud-AWS%20S3%20%2B%20RDS%20%2B%20EC2-FF9900?style=flat-square)]()

<!-- ADD SCREENSHOT HERE — drag a screenshot of the dashboard or signing flow here -->

---

## 🎯 What It Is

LSDS Portal digitizes contract management for government and enterprise users — handling high-stakes, legally-binding documents with the security, audit trail, and compliance features required for institutional use.

Built as a **Next.js full-stack application** with a single deployment surface, shared TypeScript types between client and server, and Prisma as the data layer over PostgreSQL.

---

## 🏗 My Role

I built this platform end-to-end as the sole developer:

### Frontend (Next.js App Router + TypeScript)
- Designed and built the complete UI for contract management, signing workflows, and admin dashboard
- Implemented real-time collaborative contract editor with conflict handling
- Built signature capture component with drawing canvas and validation
- RBAC-aware UI with conditional rendering based on user permissions
- AI-assisted contract generation interface with streaming LLM responses
- Document preview, version comparison, and audit log viewer

### Backend (Next.js API Routes + Server Actions)
- Designed and implemented all API routes for auth, contracts, signing, users, organizations, and audit
- Built JWT auth flow with refresh token rotation and **multi-factor authentication** for sensitive operations
- Implemented **role-based access control** with granular per-organization permissions
- LLM integration for AI-based contract drafting (natural language → structured clauses)
- Cryptographically verifiable signature generation and validation
- Email notification service for signature requests and status changes
- Audit logging with immutable event trail for every action

### Database (PostgreSQL + Prisma)
- Designed schema from scratch covering: users, organizations, contracts, contract versions, signatures, signing workflows, audit events, templates
- Modeled complex relations (many-to-many on signers, polymorphic audit events, versioned contract history)
- Optimized queries with proper indexing for contract search and audit lookups
- Implemented Prisma migrations and seed scripts

### Cloud & Deployment (AWS)
- Set up **AWS S3** for encrypted document storage with proper IAM policies
- Configured **AWS RDS** PostgreSQL instance with backups and access controls
- Deployed application infrastructure on **AWS EC2** with environment management
- Implemented secure file upload with signed URLs and server-side validation

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router — full-stack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Database** | PostgreSQL (AWS RDS) |
| **ORM** | Prisma |
| **File Storage** | AWS S3 (encrypted at rest) |
| **Compute** | AWS EC2 |
| **Auth** | JWT + Refresh Tokens + Multi-Factor Authentication |
| **AI** | LLM integration for contract generation |
| **Email** | Transactional email service |

### Why Next.js Full-Stack?

Single framework for both client and server gave us:
- **Single deployment surface** — frontend and backend ship together
- **Shared TypeScript types** between client and API — fewer integration bugs
- **Server Actions** for type-safe mutations without REST boilerplate
- **Native streaming** for AI contract generation responses
- **Faster iteration** as a solo developer (no separate API repo to maintain)

---

## ✨ Key Features

### Contract Management
- 🤖 **AI-based contract generation** — natural language prompts → structured contract drafts with editable clauses
- ✍️ **Real-time collaborative editing** — multiple parties editing simultaneously with conflict resolution
- 📝 **Template library** — reusable contract templates with variable substitution
- 🔄 **Version history** — every change tracked with diff views and rollback support

### Signing Workflows
- 🔐 **Secure multi-party signing** — cryptographically verifiable signatures
- 📨 **Sequential or parallel signing** — configurable signing orders per contract
- ✉️ **Email + in-app notifications** for signature requests and status updates
- 🔍 **Audit trail** — immutable record of every action with timestamps and actor

### Access Control & Security
- 👥 **Role-based access control (RBAC)** — granular permissions per organization
- 🔒 **Encrypted document storage** in S3 with signed URL access
- 📜 **Compliance-ready audit logs** for institutional use
- 🛡 **Multi-factor authentication** for sensitive operations (signing, role changes)

### Lifecycle Management
- 📥 Upload, draft, review, sign, archive
- ⏰ Expiration tracking and renewal reminders
- 📊 Dashboard for active, pending, and completed contracts
- 🔍 Full-text search across contract content with filters

---

## 🏛 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              CLIENT (Next.js App Router)                     │
│  React Server Components + Client Components                 │
│  TypeScript + Tailwind + shadcn/ui                           │
│                                                              │
│  Routes: /dashboard | /contracts | /sign | /admin | /audit   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │  Server Actions + API Routes
                           │  (shared TypeScript types)
                           │
┌──────────────────────────▼───────────────────────────────────┐
│           NEXT.JS BACKEND (API Routes)                       │
│                                                              │
│  Auth Layer    │  JWT + Refresh + MFA + RBAC middleware      │
│  Contracts     │  CRUD + versioning + collaborative editing  │
│  Signing       │  Multi-party workflow + crypto signatures   │
│  AI Service    │  LLM integration for draft generation       │
│  Audit         │  Immutable event logging                    │
│  Notifications │  Email service integration                  │
└──────────┬───────────────┬───────────────┬───────────────────┘
           │               │               │
           ▼               ▼               ▼
   ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
   │  PostgreSQL  │ │   AWS S3    │ │  External    │
   │  (AWS RDS)   │ │  Documents  │ │  Services    │
   │  via Prisma  │ │  (encrypted)│ │  (LLM, Mail) │
   └──────────────┘ └─────────────┘ └──────────────┘
```

---

## 📁 Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (login, register, mfa)
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── contracts/            # Contract management pages
│   │   ├── sign/                 # Signing workflow pages
│   │   ├── admin/                # Admin & RBAC pages
│   │   └── audit/                # Audit log explorer
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Auth endpoints
│   │   ├── contracts/            # Contract CRUD
│   │   ├── sign/                 # Signing operations
│   │   ├── ai/                   # LLM contract generation
│   │   └── audit/                # Audit queries
│   └── layout.tsx
│
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── contracts/                # Contract editor, viewer, list
│   ├── signing/                  # Signature capture, signer list
│   └── admin/                    # User management, RBAC controls
│
├── lib/
│   ├── auth/                     # JWT, MFA, session utilities
│   ├── prisma/                   # Prisma client singleton
│   ├── s3/                       # AWS S3 upload/download helpers
│   ├── ai/                       # LLM client and prompt templates
│   ├── audit/                    # Audit event creation helpers
│   └── crypto/                   # Signature generation & validation
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Seed data
│
└── types/                        # Shared TypeScript types
```

---

## 🔒 Security Highlights

- **Encryption at rest** — documents stored encrypted in S3
- **Signed URLs** for document access (time-limited, scoped)
- **JWT + refresh token rotation** with proper expiry
- **Multi-factor authentication** for high-stakes operations
- **Audit trail** for every action — actor, timestamp, IP, change details
- **RBAC enforcement** at both API and UI layers (defense in depth)
- **Input validation** with Zod schemas on every API route
- **Rate limiting** on auth and signing endpoints

---

## ⚖️ Why This Project Matters

Building infrastructure for government/institutional use has uniquely high requirements:
- **Security** — handling legally-binding documents
- **Auditability** — every action must be reviewable years later
- **Reliability** — downtime affects state operations
- **Accessibility** — must work for non-technical users

This project taught me how to architect for those constraints — not just startup speed.

---

## 📝 Note on this Repository

This is a **client project for the Lagos State market**, currently in **pre-launch pilot phase** — built but not yet in active government deployment. The Vercel link above hosts a working demo of the platform. This repository is shared as a portfolio reference to demonstrate full-stack architecture and design decisions.

For demo credentials or technical walkthroughs, please contact me directly.

---

## 🤝 Connect

- 💼 **LinkedIn:** [muhammad-mudassar776](https://www.linkedin.com/in/muhammad-mudassar776/)
- 🌐 **Portfolio:** [mmudassar.vercel.app](https://mmudassar.vercel.app/)
- 📧 **Email:** mudassarmuhammad776@gmail.com

---

*Built end-to-end — frontend, backend, database design, and AWS deployment.*

<img width="1200" height="558" alt="logos-digital-signature" src="https://github.com/user-attachments/assets/7bcf6f93-cda4-46f2-9ed6-6b33bbc0f454" />
