# I Am Only Human - Backend

A human-centered relationship reflection tool built with FastAPI.

## Quick Start

### Prerequisites

- Python 3.12+
- Docker (for PostgreSQL)

### Setup

1. Create and activate virtual environment:
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
# source .venv/bin/activate   # Linux/Mac
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start PostgreSQL:
```bash
docker compose up -d
```

4. Create `.env` file:
```
DATABASE_URL=postgresql+asyncpg://human:human@localhost:5432/iamonlyhuman
SECRET_KEY=your-secret-key-here
LEGACY_ENCRYPTION_KEY=<generate-with-command-below>
```

Generate encryption key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

5. Run the server:
```bash
uvicorn app.main:app --reload
```

6. Open API docs: http://localhost:8000/docs

## API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `GET /auth/me` - Get current user

### Relationships
- `POST /relationships` - Create relationship
- `GET /relationships` - List relationships
- `GET /relationships/{id}` - Get relationship
- `PUT /relationships/{id}` - Update relationship
- `DELETE /relationships/{id}` - Delete relationship

### AI Support
- `POST /ai/relationship-support` - Get supportive reflection

### Check-in
- `GET /checkin/status` - Get check-in status
- `POST /checkin/confirm` - Confirm presence
- `PUT /checkin/config` - Update interval

### Legacy Vault
- `POST /legacy/recipient` - Set trusted recipient
- `GET /legacy/recipient` - Get recipient
- `PUT /legacy/recipient` - Update recipient
- `DELETE /legacy/recipient` - Delete recipient
- `POST /legacy` - Create legacy item
- `GET /legacy` - List legacy items
- `PUT /legacy/{id}` - Update legacy item
- `DELETE /legacy/{id}` - Delete legacy item
- `POST /legacy/simulate-release` - Demo release trigger

## Demo Notes

This is a hackathon demonstration. The following features are simulated:

- AI responses are stubbed (no external API calls)
- Legacy release only logs, does not send emails
- Check-in system has no background notifications

## License

MIT
