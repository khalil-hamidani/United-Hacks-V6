from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.ai import router as ai_router
from app.api.auth import router as auth_router
from app.api.checkin import router as checkin_router
from app.api.demo import router as demo_router
from app.api.legacy import router as legacy_router
from app.api.obligations import router as obligations_router
from app.api.relationships import router as relationships_router
from app.api.trusted_person import router as trusted_person_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models.checkin import Checkin
from app.models.financial_obligation import FinancialObligation
from app.models.legacy import LegacyItem, TrustedRecipient
from app.models.notification import NotificationLog, ReleaseEvent
from app.models.obligation_audit_log import ObligationAuditLog
from app.models.relationship import Relationship
from app.models.trusted_person import TrustedPerson

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise
    yield
    logger.info("Shutting down application...")


app = FastAPI(
    title="I Am Only Human",
    description="Backend API for I Am Only Human - A human-centered relationship reflection tool",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


app.include_router(auth_router)
app.include_router(relationships_router)
app.include_router(ai_router)
app.include_router(checkin_router)
app.include_router(legacy_router)
app.include_router(demo_router)
app.include_router(obligations_router, prefix="/api/obligations", tags=["obligations"])
app.include_router(
    trusted_person_router, prefix="/api/trusted-person", tags=["trusted-person"]
)
