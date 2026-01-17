# Predusk Portfolio Manager

A full-stack portfolio management application with Django REST API backend and React frontend. Manage candidate profiles, skills, projects, and work history.


---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React + Vite  │────▶│   Django REST   │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Neon Cloud)  │
│   Port: 5173    │     │   Port: 8000    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Tech Stack:**
- **Backend:** Django 5.x, Django REST Framework, PostgreSQL (Neon)
- **Frontend:** React 18, Vite, Axios
- **Deployment:** Render (backend), Vercel/Netlify (frontend)

---

## Database Schema

See [`schema.sql`](./schema.sql) for the complete SQL schema.

| Table | Description |
|-------|-------------|
| `api_profile` | User profiles (name, email, education, links) |
| `api_skill` | Skills linked to profiles |
| `api_project` | Projects with title, description, links |
| `api_work` | Work experience with dates and descriptions |

**Indexes:** Email, skill name, project title, and composite indexes for optimized queries.

---

## API Endpoints

Base URL: `http://localhost:8000/api/`

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health/` | Liveness check |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles/` | List all profiles with nested skills, projects, work |
| POST | `/profiles/` | Create a new profile |
| GET | `/profiles/{id}/` | Get profile by ID |
| PUT/PATCH | `/profiles/{id}/` | Update profile |
| DELETE | `/profiles/{id}/` | Delete profile |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/skills/` | List all skills |
| GET | `/skills/?profile={id}` | Filter skills by profile |
| POST | `/skills/` | Create a new skill |
| GET | `/skills/{id}/` | Get skill by ID |
| PUT/PATCH | `/skills/{id}/` | Update skill |
| DELETE | `/skills/{id}/` | Delete skill |
| GET | `/skills/top/` | Get skills ranked by frequency |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/` | List all projects |
| GET | `/projects/?skill={name}` | Filter projects by skill name |
| POST | `/projects/` | Create a new project |
| GET | `/projects/{id}/` | Get project by ID |
| PUT/PATCH | `/projects/{id}/` | Update project |
| DELETE | `/projects/{id}/` | Delete project |

### Work Experience
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/work/` | List all work entries |
| GET | `/work/?profile={id}` | Filter work by profile |
| POST | `/work/` | Create a new work entry |
| GET | `/work/{id}/` | Get work entry by ID |
| PUT/PATCH | `/work/{id}/` | Update work entry |
| DELETE | `/work/{id}/` | Delete work entry |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search/?q={query}` | Search projects by title |

---

## Sample curl Commands

```bash
# Health check
curl http://localhost:8000/health/

# Get all profiles
curl http://localhost:8000/api/profiles/

# Get projects filtered by skill
curl "http://localhost:8000/api/projects/?skill=python"

# Get top skills
curl http://localhost:8000/api/skills/top/

# Search projects
curl "http://localhost:8000/api/search/?q=portfolio"

# Create a new profile
curl -X POST http://localhost:8000/api/profiles/ \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "education": "BS Computer Science"}'

# Create a new skill
curl -X POST http://localhost:8000/api/skills/ \
  -H "Content-Type: application/json" \
  -d '{"profile": 1, "name": "Python"}'

# Create a new project
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{"profile": 1, "title": "My Project", "description": "A cool project", "links": "https://github.com/example"}'

# Create work experience
curl -X POST http://localhost:8000/api/work/ \
  -H "Content-Type: application/json" \
  -d '{"profile": 1, "company": "Tech Corp", "role": "Developer", "start_date": "2023-01-01", "end_date": "2024-01-01", "description": "Built amazing things"}'

# Update a skill
curl -X PATCH http://localhost:8000/api/skills/1/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Python 3"}'

# Delete a skill
curl -X DELETE http://localhost:8000/api/skills/1/
```

---

## Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or use SQLite for local dev)

### Backend Setup

```bash
# Clone and navigate to project
cd 05_Predusk

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (create .env file)
echo "DATABASE_URL=postgresql://user:pass@host:5432/dbname" > .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and expects API at `http://localhost:8000/api`.



## Known Limitations

1. **No Authentication:** API endpoints are open; add Django auth for production
2. **Cache Invalidation:** Currently clears entire cache on any write operation
3. **File Uploads:** No image/file upload support for profile pictures
4. **Pagination:** Large datasets may need pagination implementation
5. **Rate Limiting:** No rate limiting configured; add for production

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Ensure virtual environment is activated |
| CORS errors | Verify `CORS_ALLOWED_ORIGINS` includes frontend URL |
| 404 on API routes | Check backend is running on port 8000 |
| Database connection failed | Verify `DATABASE_URL` format and credentials |
| Frontend can't reach API | Update `VITE_API_BASE` in frontend `.env` |

---

## License

MIT
