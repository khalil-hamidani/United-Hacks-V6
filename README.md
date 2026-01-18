# I Am Only Human

A private, calm space for relationships and legacy. Not a social network. Not therapy. Not urgent.

## Overview

I Am Only Human is a human-centered application designed to help you:

- **Track relationships** — Notice which connections feel steady and which feel distant
- **Write private messages** — Keep thoughts safe until you're ready to send them
- **Create a legacy vault** — Leave messages to be delivered only if something happens to you
- **Track obligations** — Ensure nothing is forgotten or left unresolved
- **Check in periodically** — Confirm your presence to prevent automatic legacy release

Everything is private. Nothing is automated without your explicit control. Nothing pressures you to act.

## Philosophy

This application is built on three principles:

1. **Presence over productivity** — We don't measure how often you connect or how quickly you respond
2. **Privacy over sharing** — Nothing you write is visible to anyone unless you explicitly choose to send it
3. **Calm over urgency** — No streaks, no badges, no push notifications demanding attention

## Features

### Relationship Tracking
- Add people who matter to you
- Mark the current state of each relationship (strong, good but distant, unclear, tense, hurt)
- Write private notes about your connections
- Request gentle AI reflections (optional, never judgmental)

### Private Messages
- Write things you need to say but aren't ready to send
- Keep messages encrypted and private
- Send them later or keep them indefinitely
- No one sees your messages unless you explicitly send them

### Legacy Vault
- Create messages to be delivered after you're gone
- Designate trusted recipients for each message
- Set up a check-in system to confirm you're still present
- Messages are encrypted and released only through manual confirmation

### Financial Obligations
- Track debts and obligations
- Mark status as outstanding or settled
- Ensure nothing is forgotten
- All changes are logged for transparency

### Check-in System
- Configure check-in intervals (default: 7 days)
- Confirm your presence periodically
- Trusted person is notified if check-ins stop
- Prevents automatic legacy release

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Three.js** for Ghost Cursor effect
- **OGL** for Aurora background
- **Axios** for API communication

### Backend
- **FastAPI** (Python)
- **SQLAlchemy 2.0** ORM
- **PostgreSQL** database
- **JWT** authentication
- **Fernet** encryption for legacy messages
- **Featherless AI** for relationship reflections (optional)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=your-secret-key-here
LEGACY_ENCRYPTION_KEY=your-encryption-key-here
FEATHERLESS_API_KEY=your-api-key-here  # Optional
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── core/         # Configuration and security
│   │   ├── db/           # Database connection
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── main.py       # Application entry point
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── types/        # TypeScript types
│   │   └── main.tsx      # Application entry point
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` — Create account
- `POST /auth/login` — Login and receive JWT token

### Relationships
- `GET /api/relationships` — List all relationships
- `POST /api/relationships` — Create relationship
- `PUT /api/relationships/{id}` — Update relationship
- `DELETE /api/relationships/{id}` — Delete relationship

### AI
- `POST /ai/relationship-support` — Get AI reflection (optional)

### Legacy
- `GET /api/legacy/items` — List legacy messages
- `POST /api/legacy/items` — Create legacy message
- `GET /api/legacy/recipients` — List trusted recipients
- `POST /api/legacy/recipients` — Add trusted recipient

### Check-in
- `GET /api/checkin` — Get check-in status
- `POST /api/checkin` — Perform check-in
- `PUT /api/checkin` — Update check-in interval

### Obligations
- `GET /api/obligations` — List financial obligations
- `POST /api/obligations` — Create obligation
- `POST /api/obligations/{id}/settle` — Mark as settled

## Security & Privacy

- **Encryption**: Legacy messages are encrypted using Fernet (AES-128)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Data isolation**: Users can only access their own data
- **No tracking**: No analytics, no third-party scripts
- **No automation**: Legacy messages require manual confirmation to release

## AI Integration

AI is used for one purpose only: providing gentle reflections on relationships.

**What AI can do:**
- Offer empathetic observations
- Suggest gentle possibilities
- Provide warm encouragement

**What AI cannot do:**
- Diagnose conditions
- Assign blame
- Use imperative language
- Access data beyond the specific request

AI is optional and falls back to a hardcoded response if unavailable.

## Design Principles

### Visual Design
- Calm, editorial aesthetic
- Restrained purple color palette
- Generous spacing and typography
- Subtle animations that respect `prefers-reduced-motion`

### Special Effects
- **Aurora Background**: WebGL shader-based effect on protected routes
- **Ghost Cursor**: Three.js cursor trail on auth pages
- Both effects are disabled on touch devices and respect accessibility preferences

### No Gamification
- No streaks or consistency metrics
- No social comparison
- No urgent language
- No time-limited actions

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
# Deploy using Docker or your preferred method
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
LEGACY_ENCRYPTION_KEY=your-encryption-key-here
FEATHERLESS_API_KEY=your-api-key-here  # Optional
FEATHERLESS_MODEL=mistralai/Mistral-7B-Instruct-v0.2
SMTP_USER=your-email@example.com  # Optional
SMTP_PASSWORD=your-email-password  # Optional
```

## Contributing

This project was created for a hackathon. Contributions are welcome, but please keep the core philosophy in mind:

- Prioritize privacy over sharing
- Prioritize calm over urgency
- Prioritize awareness over intervention
- No gamification or social features
- No algorithmic recommendations

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with React, FastAPI, and PostgreSQL
- AI powered by Featherless AI (Mistral-7B-Instruct)
- WebGL effects using Three.js and OGL
- Icons from Lucide React

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Remember**: This is a private space for reflection, presence, and legacy. Take your time. There is no rush here.
