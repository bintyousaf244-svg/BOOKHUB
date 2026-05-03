# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui

## Project: Al-Qalam Bookstore

A complete professional online bookstore for learning books in English and Arabic.

### Features
- **Storefront**: Home page with featured books, on-sale section, free books strip, categories
- **Catalog**: Full book catalog with filters (category, language, age group, free/paid/sale), search, pagination
- **Book Detail**: Cover, description, author, price/sale badge, add to cart
- **Shopping Cart**: Cart context (localStorage-backed), item management
- **Checkout**: Customer info form, payment method selector (Bank Transfer, JazzCash, EasyPaisa)
- **Order Success**: Confirmation page with payment instructions
- **Free Resources**: Free books and articles with download links
- **Admin Panel**: Dashboard, book management (CRUD), order management with status updates
- **Admin Login**: Username/password (default: admin / bookstore2024)

### DB Tables
- `books` — All book data including sale, free, featured flags
- `orders` — Orders with items (JSONB), payment method, status
- `categories` — Book categories with counts

### Admin Credentials
- Username: `admin`
- Password: `bookstore2024`
- Can be overridden via env vars: `ADMIN_USERNAME`, `ADMIN_PASSWORD`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
