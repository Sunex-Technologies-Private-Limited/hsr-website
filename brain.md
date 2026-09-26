# HSR Digital Hub - Brain & Meta-Context

## Project Context
HSR Digital Hub is a monolithic repository transitioning from a marketing prototype to a production-grade e-commerce platform handling digital goods in the Indian market.

## Security Posture
The application has recently undergone a comprehensive "Phase P0" security remediation:
- **Admin Lockdown:** All administrative endpoints are heavily protected via tRPC middleware and role-based checks.
- **Payment Lifecycle:** Razorpay integrations strictly mandate server-side HMAC validation of the raw webhook body or explicit client verification payloads prior to fulfillment.
- **IDOR Protection:** Orders are accessed exclusively via cryptographically secure `nanoid` tokens.
- **Data Protection:** Asset delivery utilizes highly restrictive, decrementing-usage tokens instead of persistent URLs.

## Known Gotchas & Architectural Decisions
- **Database Divergence:** The initial setup used SQLite. The application is strictly shifting to PostgreSQL for robust foreign key constraints and transactional integrity. 
- **Financial Arithmetic:** Always store and compute currency values as integers (Paise) to avoid floating-point drift. Divide by 100 purely for frontend UI rendering.
- **Vite and CSP:** Helmet's Content Security Policy can occasionally conflict with Vite's hot module replacement scripts during local development. CSP directives are deliberately relaxed in `development` and enforced in `production`.
- **Package Management:** The repository relies exclusively on `pnpm`. Avoid generating or committing `package-lock.json` or `yarn.lock`.

## Future Phases (P1-P3 Roadmap)
Currently, the codebase is cleared through Phase P0. Immediate next steps involve Phase P1 (Honest User Flow), which mandates building out comprehensive wishlist merging, true sorting parameters synchronized with the URL, and finalizing the My Account dashboard UI.

## Artifact Manifest
- `PRD.md` - Product Requirements Document
- `TRD.md` - Technical Requirements Document
- `UI_UX_App_Flow.md` - User journey and design specifications
