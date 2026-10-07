# Nexus: AI Research Synthesizer

> An end-to-end, production-ready research intelligence platform designed to ingest complex academic literature, extract multi-dimensional entities with Google Gemini (`@google/genai` SDK), and output structured knowledge with verbatim source citations.

---

## 🚀 Key Features

1. **User Authentication & Tenant Isolation**: Secure JWT authentication (24h expiry) and bcrypt password hashing with database-level isolation.
2. **Document Ingestion Pipeline**: Multi-part upload handling via Multer (PDF & plain text, 5MB limit, sanitized filenames) and textual extraction.
3. **Google Gemini AI Synthesis**: High-throughput LLM pipeline adhering strictly to the structured schema across 3 dimensions:
   - **Empirical Findings**: Quantified statistics, sample sizes, and verifiable outcomes.
   - **Methodological Gaps**: Limitations, sensor resolutions, and systematic biases.
   - **Strategic Insights**: Actionable policy recommendations and decision pathways.
4. **Source Citation Mapping**: Verbatim citation snippets linked directly to original document text with interactive highlight inspector.
5. **Interactive Research Workspace**: Real-time dimensional tabs, confidence score meters, and JSON export.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide React
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer, `pdf-parse`, Zod
- **Database**: Supabase Cloud PostgreSQL (with SQL migrations, RLS policies, and index optimizations)
- **AI Engine**: Google Gemini API (`@google/genai` SDK)

---

## 📁 Repository Structure

```
├── client/                      # React + Vite Frontend
│   ├── .env                     # VITE_API_BASE_URL
│   ├── src/
│   │   ├── components/          # AuthForm, Sidebar, UploadZone, InsightCard, DocumentDrawer, Navbar
│   │   ├── pages/               # LandingPage, LoginPage, RegisterPage, DashboardPage, ProjectWorkspacePage, SettingsPage
│   │   ├── context/             # AuthContext.jsx
│   │   ├── services/            # Axios API client (api.js)
│   │   ├── index.css            # Tailwind + Glassmorphism design tokens
│   │   ├── App.jsx              # Application router
│   │   └── main.jsx
├── server/                      # Node.js + Express Backend
│   ├── .env                     # PORT, DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
│   ├── config/                  # Supabase & PostgreSQL connection (db.js)
│   ├── controllers/             # auth, project, document, insight, settings
│   ├── middlewares/             # auth, upload (Multer), validation (Zod), error
│   ├── services/                # gemini.service.js, parser.service.js
│   ├── routes/                  # Express API routers
│   ├── scripts/                 # migrate.js
│   ├── test_e2e.js              # Automated integration test suite
│   └── index.js                 # Server entry point
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql # Tables, RLS policies, and seed data
```

---

## ⚙️ Environment Variables

### Client (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Server (`server/.env`):
```env
PORT=5000
DATABASE_URL=postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
JWT_SECRET=nexus_super_secret_jwt_secure_key_2025_9876543210
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
# In the server directory:
cd server
npm install

# In the client directory:
cd ../client
npm install
```

### 2. Run Database Migration
```bash
cd server
npm run migrate
```
*Note: If no remote `DATABASE_URL` is configured, Nexus runs in an automatic development fallback mode with pre-seeded demo records for Dr. Elena Vance (`demo@nexus.ai` / `Demo1234!`).*

### 3. Start Backend & Frontend
```bash
# Terminal 1 - Backend:
cd server
npm run dev

# Terminal 2 - Frontend:
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing
Run the comprehensive integration test suite:
```bash
cd server
node test_e2e.js
```
