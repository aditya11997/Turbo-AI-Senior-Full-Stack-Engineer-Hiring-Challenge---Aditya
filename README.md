# Turbo AI: Senior Full Stack Engineer Hiring Challenge

## Repo structure
- `backend/` — Django API
- `frontend/` — Next.js UI
- `docker-compose.yml` — local dev orchestration

## Run locally
Backend:
```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
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
npm run lint
```

## Key decisions
- Auth strategy: JWT for API-first development and simpler decoupling between frontend and backend.
- Autosave: keep a client-side debounce + queued writes strategy for notes, design later when endpoints exist.

## How AI tools were used
- Placeholder: outline which tools assisted design and code decisions.
