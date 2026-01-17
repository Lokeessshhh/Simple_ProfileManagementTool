# Predusk Portfolio Manager

A full-stack portfolio management application with Django REST API backend and React frontend. Manage candidate profiles, skills, projects, and work history.

**Live :** https://simple-profile-management-tool.vercel.app/
**Production API base:** https://simple-profilemanagementtool.onrender.com/api/

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
curl https://simple-profilemanagementtool.onrender.com/health/

# Fetch the single seeded profile (Lokesh Lohar)
curl https://simple-profilemanagementtool.onrender.com/api/profiles/1/

# Fetch all supporting collections tied to profile 1
curl "https://simple-profilemanagementtool.onrender.com/api/skills/?profile=1"
curl "https://simple-profilemanagementtool.onrender.com/api/projects/?profile=1"
curl "https://simple-profilemanagementtool.onrender.com/api/work/?profile=1"

# Search for profile projects mentioning "AI"
curl "https://simple-profilemanagementtool.onrender.com/api/search/?q=AI"

# View top skills across the single profile
curl https://simple-profilemanagementtool.onrender.com/api/skills/top/
```

### Browser Quick Checks

- Backend health: https://simple-profilemanagementtool.onrender.com/health/
- Profile API response: https://simple-profilemanagementtool.onrender.com/api/profiles/1/
- Skills list for profile 1: https://simple-profilemanagementtool.onrender.com/api/skills/?profile=1
- Projects list for profile 1: https://simple-profilemanagementtool.onrender.com/api/projects/?profile=1
- Frontend UI: https://simple-profile-management-tool.vercel.app/

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

---

## Production Deployment

### Backend on Render

1. **Push code to GitHub** (if not already)

2. **Create Web Service on Render:**
   - Go to [render.com](https://render.com) and click "New" > "Web Service"
   - Connect your GitHub repository
   - Select the repository root (where `render.yaml` is located)

3. **Configure Settings:**
   - **Name:** `predusk-api` (or your choice)
   - **Region:** Choose nearest to your users
   - **Branch:** `main`
   - **Runtime:** Python
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn backend.wsgi:application`

4. **Set Environment Variables:**
   ```
   DATABASE_URL=postgresql://neondb_owner:xxxx@ep-xxx.neon.tech/neondb?sslmode=require
   SECRET_KEY=<generate-a-random-64-char-string>
   DEBUG=False
   ```

5. **Deploy:** Click "Create Web Service" and wait for build to complete

6. **Your API URL:** `https://predusk-api.onrender.com`

---

### Frontend on Vercel

1. **Push frontend to GitHub** (can be same repo, deploy from `/frontend` folder)

2. **Create Project on Vercel:**
   - Go to [vercel.com](https://vercel.com) and click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`

3. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Set Environment Variables:**
   ```
   VITE_API_BASE=https://predusk-api.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

5. **Deploy:** Click "Deploy" and wait for build to complete

6. **Your Frontend URL:** `https://your-project.vercel.app`

---

### Post-Deployment Checklist

- [ ] Test health endpoint: `curl https://your-api.onrender.com/health/`
- [ ] Test API endpoints via frontend
- [ ] Verify CORS is working (no console errors)
- [ ] Check database connection
- [ ] Add your deployed URLs to CORS settings if needed

---

## Environment Variables Reference

### Backend (Render)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET_KEY` | Django secret key (64+ chars) | Yes |
| `DEBUG` | Set to `False` for production | Yes |

### Frontend (Vercel)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE` | Backend API URL (e.g., `https://api.onrender.com/api`) | Yes |

---

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
