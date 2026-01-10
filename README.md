# Turbo AI: Senior Full Stack Engineer Hiring Challenge

## Repo structure
- `backend/` — Django + DRF API
- `frontend/` — Next.js App Router UI
- `docker-compose.yml` — local dev orchestration

## Run locally
Backend:
```
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3.11 manage.py migrate
python3.11 manage.py runserver
```

Frontend:
```
cd frontend
npm install
npm run dev
```

Docker (both):
```
docker compose up --build
```

## Run tests
Backend:
```
cd backend
pytest
```

Frontend:
```
cd frontend
npm run test
npm run test:coverage
```

## Summary of My Process
This project was built using a **design-first, behavior-driven approach**. I began by translating the Figma designs into strict layout constraints (fixed widths, spacing, typography, and alignment) before implementing any data or API logic.

Core user flows—such as note creation, editing, autosave, and authentication—were defined first at a **behavioral level** (what should and should not happen), and only then implemented in code. Special attention was paid to preventing accidental database writes, preserving ID integrity, and ensuring predictable UI behavior across edge cases.

The application was developed incrementally, with continuous validation through browser inspection tools, manual testing, and unit tests to confirm correctness at each step.

## Key Design and Technical Decisions
- **Auth strategy**
  - Stateless JWT tokens via DRF SimpleJWT for API sessions.
- **Virtual note creation**
  - Navigating to `/notes/new` does **not** immediately create a database record.
  - A note is persisted only after a meaningful user change (title, content, or category).
  - Closing the editor without changes does not consume an ID or create a record.
- **Strict layout enforcement**
  - Note cards follow fixed dimensions with exact padding and top-aligned content.
  - Text never vertically centers or overflows unintentionally.
  - Sidebar, grid, and editor alignment strictly follow the Figma specifications.
- **Category-based styling**
  - Note card backgrounds reflect their assigned category color.
  - Colors and borders are applied consistently using a shared design system.
- **Guarded autosave**
  - Autosave is disabled until default values are fully initialized.
  - Placeholder values never trigger persistence.
  - Saves occur only when the current state differs from the last saved state.
- **Test-driven confidence**
  - Unit tests focus on behavioral correctness and edge cases.
  - Coverage reports are used to validate reliability of critical flows such as creation, editing, and navigation.
- **Consistent design system**
  - Typography, spacing, colors, and component behavior remain consistent across Notes and Login flows.
  - Design accuracy was prioritized over implementation convenience.

## AI Tools Used and How They Were Used
AI tools were used **selectively as an engineering assistant**, not as an automated code generator.

AI was used for:
- Reasoning through complex edge cases (autosave timing, virtual creation, lifecycle sequencing)
- Validating layout assumptions (padding, overflow, alignment behavior)
- Reviewing implementation logic for potential bugs or race conditions
- Suggesting meaningful unit test scenarios and coverage gaps
- Assisting with UX and accessibility considerations

AI was **not** used to:
- Automatically generate architecture or business logic
- Replace manual implementation or design decisions
- Blindly generate or paste production code
- Override Figma-defined UI or UX intent

Overall, AI served as a **review and validation layer**, while final implementation, correctness guarantees, and design fidelity were driven manually.
