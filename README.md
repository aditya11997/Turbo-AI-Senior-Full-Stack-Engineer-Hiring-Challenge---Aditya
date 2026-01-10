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

## Test coverage
Backend (pytest-cov):
```
cd backend
python3.11 -m pytest --cov=apps --cov=config --cov-branch --cov-report=term-missing
```

Latest backend summary (pytest-cov with branch coverage):
```
TOTAL 504 statements, 91% coverage
```

Backend coverage table (pytest-cov, branch coverage enabled):

| File | Stmts | Miss | Branch | BrPart | Cover | Missing |
| --- | --- | --- | --- | --- | --- | --- |
| apps/notes/management/commands/cleanup_empty_notes.py | 7 | 7 | 0 | 0 | 0% | 1-14 |
| apps/notes/models.py | 22 | 2 | 0 | 0 | 91% | 17, 40 |
| apps/notes/serializers.py | 47 | 4 | 12 | 4 | 86% | 38, 43, 67, 77 |
| apps/notes/views.py | 60 | 4 | 2 | 1 | 92% | 29->31, 56-57, 69-70 |
| apps/users/models.py | 31 | 10 | 6 | 1 | 59% | 9, 17-26, 41 |
| apps/users/serializers.py | 22 | 1 | 4 | 1 | 92% | 26 |
| apps/users/views.py | 43 | 2 | 2 | 1 | 93% | 60, 73 |
| config/middleware.py | 17 | 0 | 4 | 1 | 95% | 14->17 |
| config/asgi.py | 4 | 4 | 0 | 0 | 0% | 1-7 |
| config/wsgi.py | 4 | 4 | 0 | 0 | 0% | 1-7 |
| TOTAL | 504 | 38 | 34 | 9 | 91% |  |

Frontend (vitest):
```
cd frontend
npm run test:coverage
```

Latest frontend summary:
```
All files 91.09% statements, 72.37% branches, 87.30% functions, 90.97% lines
```

Frontend coverage table (vitest v8):

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| --- | --- | --- | --- | --- | --- |
| All files | 91.09 | 72.37 | 87.30 | 90.97 |  |
| app/layout.tsx | 100 | 100 | 100 | 100 |  |
| app/(auth)/login/page.tsx | 95.45 | 83.33 | 85.71 | 95.23 | 95 |
| app/(auth)/signup/page.tsx | 100 | 100 | 100 | 100 |  |
| app/notes/page.tsx | 91.83 | 59.09 | 90.90 | 91.83 | 77,84-85,100 |
| app/notes/[id]/page.tsx | 87.76 | 65.97 | 87.50 | 87.59 | 70,81,84,108,139-143,148-149,173,192,205-208,211,277,285,406 |
| components/auth/PasswordField.tsx | 100 | 100 | 100 | 100 |  |
| components/auth/SignupForm.tsx | 100 | 66.66 | 100 | 100 | 27-30 |
| components/auth/TextField.tsx | 100 | 100 | 100 | 100 |  |
| lib/api.ts | 89.18 | 87.09 | 57.14 | 89.18 | 62,89-91,102 |
| lib/auth.ts | 100 | 90 | 100 | 100 | 10 |

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
