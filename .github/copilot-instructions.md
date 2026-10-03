# Project instructions

This repo is a portfolio demo of a back-office web system for a fictional Thai small business. It will be screenshotted for a freelance service gallery, shared as a live demo, and later reused as the frontend starter for real client projects backed by a Spring Boot REST API.

## Source of truth
- docs/ARCHITECTURE.md defines the design. Follow it.
- If a task requires deviating from it, say so explicitly and explain why before making the change.

## Stack
- React + TypeScript + Vite. Frontend only, no backend.
- Tailwind CSS + shadcn/ui, Recharts, lucide-react, date-fns.
- HashRouter. Deployed to GitHub Pages; Vite `base` is the repo name.

## Rules
- All data access goes through the service layer in src/services. Components and hooks never touch localStorage or mock data directly.
- All UI text in Thai. Currency as Thai Baht (฿12,500.00). Dates in Thai format.
- Fictional names only for the business, customers, and staff. No real brand names.
- Every page must look intentional at 1440px and 390px widths. On mobile, tables become card lists and navigation becomes a drawer or bottom nav.
- Feature-based folders, typed domain models, no `any`, small focused components.
- After any change, run the production build and fix all TypeScript and lint errors before reporting back.