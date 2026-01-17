from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.ai import router as ai_router
from app.api.auth import router as auth_router
from app.api.checkin import router as checkin_router
from app.api.legacy import router as legacy_router
from app.api.relationships import router as relationships_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models.checkin import Checkin  # noqa: F401
from app.models.legacy import LegacyItem, TrustedRecipient  # noqa: F401
from app.models.relationship import Relationship  # noqa: F401

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


# DEMO NOTE: This is a hackathon demo application.
# Legacy vault simulate-release is for demonstration only.
# In production, implement proper notification systems.
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
