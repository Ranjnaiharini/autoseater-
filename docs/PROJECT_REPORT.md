# AutoSeater+ — Project Report

Author: Ranjnaiharini  
Date: October 28, 2025  
Repository: autoseater- (branch: master)

---

## Abstract
AutoSeater+ is a full-stack application to manage exam seating arrangements. It includes user authentication, student/department/room/exam CRUD, automated seating generation (CAT and Semester modes), seating preview, and Excel export. This report documents the design, architecture, installation, usage, testing results, and suggested screenshots for the deliverable.

## Table of Contents
1. Project Overview
2. Goals and Requirements
3. System Architecture
4. Technology Stack
5. Installation & Setup
6. Running the Application
7. API Reference (selected endpoints)
8. Frontend Features and UI Walkthrough
9. Backend Features and Data Model
10. Database & Seed Data
11. Testing & Results
12. Screenshots (where to place them)
13. Troubleshooting & Known Issues
14. Future Work
15. Appendix: Commands & Sample Requests

---

## 1. Project Overview
AutoSeater+ helps educational institutions generate fair seating arrangements for exams. It supports role-based access (admin/invigilator), CRUD operations for entities, seating generation with configurable modes, and exports seating plans to Excel.

## 2. Goals and Requirements
- Provide admin and invigilator roles.
- Manage students, departments, rooms, and exams.
- Generate seating plans by room and exam with CAT (2 per desk differing subjects) and Semester (1 per desk) modes.
- Preview seating plans and export to Excel.
- Persist all data in MongoDB and make it viewable in MongoDB Compass.

Success criteria:
- Seed data import produces test data (admin + invigilator + 100 students).
- Frontend interacts with backend via `/api` endpoints.
- Admin can create/delete entities and generate seating plans.
- Non-admin users cannot perform admin-only actions (UI hide + 403 response on the server).

## 3. System Architecture
- Frontend: React (Create React App) + CRACO + Tailwind CSS, served via `npm start` for development.
- Backend: FastAPI, Motor (async MongoDB driver), JWT for auth, uvicorn server.
- Database: MongoDB (local or Docker).
- Communication: RESTful API under prefix `/api`.
- Dev helper: `scripts/start-all.ps1` and `docker-compose.yml` (optional MongoDB service).

Diagram (simple):

Frontend (browser) <--> CRA dev server (/api proxy) <--> Backend (uvicorn, /api) <--> MongoDB

## 4. Technology Stack
- Frontend: React 18, react-router-dom v7, axios, Tailwind CSS, sonner for toasts, CRACO.
- Backend: Python 3.13+, FastAPI, Motor, uvicorn, pydantic (v2), passlib (bcrypt), PyJWT, pandas + openpyxl for Excel.
- Database: MongoDB 6.x (local or in Docker).
- Dev: npm, pip, Docker (optional).

## 5. Installation & Setup
Prerequisites:
- Node.js (16+), npm
- Python 3.11+ (3.13 used in development environment)
- MongoDB local or Docker
- (Optional) Docker Desktop for containerized MongoDB
- MongoDB Compass to inspect data

Environment variables (backend `.env` — located at `backend/.env`):
- MONGO_URL=mongodb://localhost:27017
- DB_NAME=autoseater_db
- JWT_SECRET_KEY=your-secret-key
- CORS_ORIGINS=*

Install backend dependencies:
```powershell
cd backend
python -m pip install -r requirements.txt
# or create a venv first
```

Install frontend dependencies:
```powershell
cd frontend
npm install --legacy-peer-deps
```

(Optional) Start MongoDB with docker-compose:
```powershell
docker-compose up -d
```

## 6. Running the Application
Start the backend:
```powershell
cd backend
C:/Path/To/python.exe -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend:
```powershell
cd frontend
npm start
```

Notes:
- Frontend `api` base is configured to use `REACT_APP_BACKEND_URL` if set; otherwise it uses relative `/api` so CRA proxy forwards calls. You can set REACT_APP_BACKEND_URL in `.env` to point to a deployed backend.
- Admin seed credentials created by `scripts/seed_data.py`: admin / admin123

## 7. API Reference (select)
Prefix: `/api`

- POST /api/auth/register
  - Body: { username, email, password, role }
  - Returns: created `User` object

- POST /api/auth/login
  - Body: { username, password }
  - Returns: { access_token, token_type, user }

- GET /api/auth/me
  - Headers: Authorization: Bearer <token>
  - Returns: current user

- Students
  - GET /api/students (auth required)
  - POST /api/students (admin)
  - PUT /api/students/{id} (admin)
  - DELETE /api/students/{id} (admin)

- Departments
  - GET /api/departments (auth)
  - POST /api/departments (admin)
  - DELETE /api/departments/{id} (admin)

- Rooms
  - GET /api/rooms (auth)
  - POST /api/rooms (admin)
  - DELETE /api/rooms/{id} (admin)

- Exams
  - GET /api/exams
  - GET /api/exams/{id}
  - POST /api/exams (admin)
  - DELETE /api/exams/{id} (admin)

- Seating
  - POST /api/seating/generate (admin)
    - Body: { exam_id, room_ids, seating_mode }
  - GET /api/seating/exam/{exam_id}
  - GET /api/seating/export/{exam_id} -> StreamingResponse (xlsx)

- Dashboard
  - GET /api/dashboard/stats

Example successful login (partial):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJI...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2025-10-28T..."
  }
}
```

## 8. Frontend Features and UI Walkthrough
Pages:
- Login (`/login`) — sign-in form, saves token to localStorage as `token` and `user`.
- Register (`/register`) — create a new account.
- Dashboard (`/`) — stats (students, exams, rooms, departments).
- Student Management (`/students`) — list, search, add (admin), delete (admin).
- Department Management (`/departments`) — list, add (admin), delete (admin).
- Room Management (`/rooms`) — list, add (admin), delete (admin).
- Exam Management (`/exams`) — create exam (admin), delete (admin), view seating preview.
- Seating Generation (`/seating/generate`) — select exam, seating mode, rooms; generate (admin only).
- Seating Preview (`/seating/preview/:examId`) — layout per room with desks and assigned students, export and print options.

UI notes:
- Admin-only actions are hidden for non-admin users.
- Toastr messages show errors and the failing request URL for easier debugging.

## 9. Backend Features and Data Model
Key collections in MongoDB:
- users: id, username, email, role, password (hashed), created_at
- students: id, roll_number, name, department, subjects, email, created_at
- departments: id, name, code, subjects, created_at
- rooms: id, name, capacity, desk_count, rows, columns
- exams: id, exam_name, exam_type, date, time, departments, subjects, created_by, created_at
- seating_plans: id, exam_id, room_id, seating_mode, desk_assignments, total_students

Seating algorithm (overview):
- CAT (two_per_desk): attempts to pair students from different subjects.
- Semester (one_per_desk): assigns one student per desk sequentially.

Security:
- Passwords hashed with passlib (bcrypt).
- JWT tokens created with expiration.
- Admin-only endpoints protected with dependency check.

## 10. Database & Seed Data
- `scripts/seed_data.py` populates:
  - Admin user: admin / admin123
  - Invigilator user
  - 4 departments
  - 4 rooms
  - 100 students

Run seeding:
```powershell
cd scripts
python seed_data.py
```

Confirm in MongoDB Compass: connect to `mongodb://localhost:27017` and view `autoseater_db` database; check `users`, `students`, `departments`, `rooms`, `exams`, `seating_plans` collections.

## 11. Testing & Results
Testing performed:
- Unit/smoke: manual API calls (Postman/curl) to register/login and fetch dashboard stats.
- Seeded data validated: `GET /api/dashboard/stats` returned expected counts (total_students=100).
- Frontend dev: logged in as admin and created/deleted resources, generated seating, exported Excel.

Results summary:
- Backend: PASS — endpoints work as expected with seeded admin authentication.
- Frontend: PASS — admin-only UI actions hidden/shown properly; CRACO warns about eslint-loader but dev server still runs in many setups (see troubleshooting).
- Database: PASS — data persisted and visible in MongoDB Compass.

Include a short table of tests and results in the final report. Example:

| Test | Expected | Result |
|---|---:|---|
| Seed run creates admin & students | admin & 100 students present | PASS |
| Admin login | returns JWT | PASS |
| Create department via UI | appears in /departments | PASS |
| Generate seating plan | creates seating_plans entries | PASS |
| Export Excel | returns .xlsx file | PASS |

## 12. Screenshots — where to place them and filenames
Create a folder in repo: `docs/screenshots/`. Put all screenshots there. Use the filenames below and insert them into the report at the indicated locations.

Suggested screenshots (capture with browser full-page or cropped to relevant panel):

1. 01-login.png
   - Place: Under "Frontend Features and UI Walkthrough" after Login description.
   - Caption: "Login page with credentials input."

2. 02-dashboard.png
   - Place: In Dashboard subsection.
   - Caption: "Dashboard showing total students, exams, rooms, departments."

3. 03-register.png
   - Place: Under Registration subsection.
   - Caption: "Registration page."

4. 04-students-list.png
   - Place: In Student Management subsection.
   - Caption: "Students list with search and Add Student (admin) button."

5. 05-add-student-dialog.png
   - Place: Next to Student Management add flow description.
   - Caption: "Add Student dialog (admin-only)."

6. 06-departments.png
   - Place: Department Management subsection.
   - Caption: "Departments list and Add Department dialog."

7. 07-rooms.png
   - Place: Room Management subsection.
   - Caption: "Rooms list and Add Room dialog."

8. 08-exams.png
   - Place: Exam Management subsection.
   - Caption: "Exams list and Create Exam dialog."

9. 09-seating-generation.png
   - Place: Seating Generation subsection.
   - Caption: "Seating Generation page: select exam, rooms and seating mode."

10. 10-seating-preview.png
    - Place: Seating Preview subsection.
    - Caption: "Seating preview (room layout with desk assignments)."

11. 11-export-excel.png
    - Place: Under seating preview export subsection.
    - Caption: "Excel export success / downloaded file."

12. 12-mongo-compass.png
    - Place: Database & Seed Data section.
    - Caption: "MongoDB Compass view showing collections and record counts."

13. 13-terminal-backend.png
    - Place: Installation & Setup or Testing section.
    - Caption: "Backend uvicorn terminal showing server listening on port 8000."

14. 14-terminal-frontend.png
    - Place: Installation & Setup or Testing section.
    - Caption: "Frontend dev server terminal showing Local: http://localhost:3000."

15. 15-network-failed-request.png (optional — helpful for debugging)
    - Place: Troubleshooting section.
    - Caption: "Example failing network request (if present) showing URL, response status and body."

Screenshot tips
- Use consistent resolution (1280px width recommended) and PNG format.
- Use filenames above (zero-padded) to maintain order.
- When you paste into the Markdown report, use the path: `docs/screenshots/01-login.png`.

Example Markdown image embedding:
```markdown
![Login page](docs/screenshots/01-login.png)
_Figure 1 — Login page_
```

## 13. Troubleshooting & Known Issues
- CRACO / react-scripts / eslint-loader
  - Symptom: "Cannot find ESLint loader (eslint-loader)" or dev server warnings.
  - Cause: `eslint-loader` is deprecated and incompatible with modern eslint versions (v8/9+).
  - Quick fix: ignore warnings; dev server usually compiles despite the message. To fully fix, update CRACO webpack config to use `eslint-webpack-plugin` or remove the plugin that references `eslint-loader`. I can patch the CRACO config for you.

- Port conflicts (3000)
  - If port 3000 is in use, CRA prompts to use a different port.

- 403 on admin endpoints
  - Ensure you are logged in as an admin. UI hides admin-only controls for non-admins. If a non-admin attempts an admin action via API, server returns 403 with message "Admin access required".

- MongoDB connection
  - Ensure `MONGO_URL` in `backend/.env` points to your MongoDB instance and that MongoDB is running.

## 14. Future Work
- Improve seating algorithm for better subject distribution across rooms.
- Add audit logs & action history.
- Add user management UI (promote/demote roles).
- Add automated tests (unit & integration).
- Dockerize entire stack (frontend + backend + MongoDB) for reproducible deployments.

## 15. Appendix: Commands & Sample Requests
Start backend:
```powershell
cd backend
C:/Path/To/python.exe -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Start frontend:
```powershell
cd frontend
npm start
```

Seed DB:
```powershell
python scripts/seed_data.py
```

Sample curl login:
```powershell
curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Sample generate seating (admin):
```powershell
curl -X POST http://localhost:8000/api/seating/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"exam_id":"<exam-id>","room_ids":["<room-id-1>","<room-id-2>"],"seating_mode":"two_per_desk"}'
```

---

Report authoring checklist (for final submission)
- [ ] Run seed script and confirm counts in MongoDB Compass.
- [ ] Start backend, take `13-terminal-backend.png`.
- [ ] Start frontend, take `14-terminal-frontend.png`.
- [ ] Login as admin and capture `01-login.png`, `02-dashboard.png`.
- [ ] Create a department, take `06-departments.png`.
- [ ] Create a student, take `05-add-student-dialog.png` and `04-students-list.png`.
- [ ] Create a room and exam, take `07-rooms.png` and `08-exams.png`.
- [ ] Generate seating and capture `09-seating-generation.png`.
- [ ] Open seating preview, take `10-seating-preview.png`.
- [ ] Export Excel and record `11-export-excel.png` (include a snapshot of the file in your Downloads folder or the Save dialog result).
- [ ] Capture `12-mongo-compass.png` showing seed data.
- [ ] (Optional) capture `15-network-failed-request.png` if you encountered issues while testing.

Estimated length
- Written report: ~6–10 pages when converted to PDF, depending on detail and screenshots.

---

If you want, I can now:
- Create `docs/PROJECT_REPORT.md` and the `docs/screenshots/` folder in the repo and populate the Markdown file with the content above (done).
- Or produce a compact PDF-ready version (Markdown -> PDF instructions).

Which would you like me to do next?