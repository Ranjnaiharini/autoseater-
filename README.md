# AutoSeater+ - Smart Exam Seating Arrangement System

## Overview
AutoSeater+ is a comprehensive web-based exam seating management system designed for educational institutions. It automates the complex process of creating exam seating arrangements, eliminating manual errors and ensuring fair distribution of students across examination halls.

## Key Features

### 🔐 Role-Based Authentication
- **Admin**: Full system access - manage students, exams, rooms, and generate seating plans
- **Invigilator**: View-only access to seating plans for assigned examinations

### 👥 Student Management
- Add students individually or via bulk import
- Manage student records (roll number, name, department, subjects, email)
- Search and filter student database
- Handle missing roll numbers intelligently
- Support for multiple departments

### 🏫 Department Management
- Create and manage academic departments
- Define department codes (CSE, IT, ECE, AIDS, etc.)
- Map subjects to departments
- Automatic student-department associations

### 🏢 Room Management
- Configure examination rooms with:
  - Room name and capacity
  - Desk count
  - Layout configuration (rows × columns)
- Visual desk layout representation
- Multi-room support for large exams

### 📅 Exam Management
- Create examinations with:
  - Exam name and type (CAT/Semester)
  - Date and time scheduling
  - Multiple departments
  - Multiple subjects
- Auto-fetch eligible students based on department and subject mappings
- View and manage all scheduled exams

### 🪑 Smart Seating Generation
Two intelligent seating modes:

**CAT Mode (2 per desk)**
- Pairs students from different subjects at the same desk
- Minimizes malpractice by separating same-subject students
- Ideal for Continuous Assessment Tests

**Semester Mode (1 per desk)**
- One student per desk
- Sequential roll number ordering
- Maximum spacing for major examinations

**Features:**
- Vertical desk pairing algorithm (Desk 1 pairs with Desk 25, etc.)
- Multi-room distribution
- Overflow handling
- Smart student distribution

### 📊 Seating Plan Visualization
- Visual classroom layout matching physical desk positions
- Clear desk numbering system
- Color-coded student assignments (Left/Right for CAT mode)
- Row and column indicators
- Front and back of classroom marked
- Print-friendly layout

### 📥 Export Capabilities
- **Excel Export**: Download complete seating plans as XLSX files
- Room-wise sheets with detailed desk assignments
- Print-ready formats for notice boards

### 📈 Admin Dashboard
- Real-time statistics: Total students, exams, rooms, departments
- System health monitoring
- Recent examination overview
- Quick action shortcuts

## Technology Stack

### Backend
- FastAPI (Python) with Motor (MongoDB async driver)
- JWT authentication with bcrypt
- Pandas + OpenPyXL for Excel export

### Frontend
- React 19 with React Router v7
- Shadcn/UI components (Radix UI)
- Tailwind CSS styling
- Axios for API calls

## Default Credentials

### Admin Account
- Username: `admin`
- Password: `admin123`

### Invigilator Account
- Username: `invigilator`
- Password: `invigi123`

## Quick Start

### Seed Database
```bash
python3 /app/scripts/seed_data.py
```

This creates 100 students, 4 departments, 4 rooms, and 2 user accounts.

### Access Application
1. Navigate to http://localhost:3000
2. Login with admin credentials
3. Create an exam in Exam Management
4. Generate seating plan in Generate Seating
5. View and export the seating arrangement

## User Workflows

### Admin Workflow
1. Add Departments → Add Students → Configure Rooms → Create Exam → Generate Seating → Export

### Invigilator Workflow
1. Login → View Exams → View Seating Plan → Print

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Core Resources
- `/api/students` - Student CRUD operations
- `/api/departments` - Department management
- `/api/rooms` - Room configuration
- `/api/exams` - Exam scheduling
- `/api/seating/generate` - Generate seating plan
- `/api/seating/export/{exam_id}` - Export to Excel

## Smart Seating Algorithm

**CAT Mode**: Groups students by subject, pairs from different subjects, distributes across desks

**Semester Mode**: Sorts by roll number, assigns sequentially (1 per desk), maintains vertical pairing

**Features**: Handles missing roll numbers, multi-room overflow, fair distribution

## Design System
- Primary: Indigo/Purple gradient
- Accent: Teal/Green
- Typography: Space Grotesk (headings), Inter (body)
- Card-based layouts with modern shadows and hover effects

## Future Enhancements
- QR code desk identification
- Live attendance tracking
- Calendar view for scheduling
- Student self-service portal
- Multi-language support
- PDF export with branding

## License
© 2025 AutoSeater+. All rights reserved.

---
**Built for educational institutions with ❤️**
