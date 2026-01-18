from typing import Annotated
import json
import httpx

from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator

from app.api.auth import get_current_user
from app.core.config import settings
from app.models.relationship import RelationshipState
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["ai"])

SYSTEM_PROMPT = """You are a calm, supportive companion helping someone reflect on their relationships.

Rules you MUST follow:
- Use a calm, supportive tone
- Never judge the user or others
- Never diagnose or label behaviors
- Never assign blame
- Offer at most ONE gentle suggestion (or none)
- Doing nothing is always acceptable
- Never use imperative language ("you should", "you must")
- Speak as a thoughtful friend, not an authority

You will receive the current state of a relationship and some context from the user.

Respond with EXACTLY this JSON format, nothing else:
{
  "reflection": "A brief, empathetic observation about what the user shared",
  "suggestion": "One gentle thought or possibility (or acknowledge that doing nothing is okay)",
  "encouragement": "A warm, affirming message"
}"""

FALLBACK_RESPONSE = {
    "reflection": "Every relationship has its unique rhythm and meaning.",
    "suggestion": "Consider what feels most genuine and kind to you right now.",
    "encouragement": "You are doing your best, and that matters more than you know.",
}


class AIRequest(BaseModel):
    relationship_state: RelationshipState
    context_text: str

    @field_validator("context_text")
    @classmethod
    def context_text_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("context_text must not be empty")
        return v.strip()


class AIResponse(BaseModel):
    reflection: str
    suggestion: str
    encouragement: str


async def call_featherless(relationship_state: str, context_text: str) -> dict:
    """Call Featherless AI API and return parsed response."""
    user_message = f"""Relationship state: {relationship_state}

What the person shared:
{context_text}"""

    payload = {
        "model": settings.FEATHERLESS_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": 500,
        "temperature": 0.7,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            settings.FEATHERLESS_API_URL,
            headers={
                "Authorization": f"Bearer {settings.FEATHERLESS_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]

    # Parse JSON from response
    # Handle potential markdown code blocks
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
        content = content.split("```")[1].split("```")[0]

    parsed = json.loads(content.strip())

    return {
        "reflection": str(parsed.get("reflection", FALLBACK_RESPONSE["reflection"])),
        "suggestion": str(parsed.get("suggestion", FALLBACK_RESPONSE["suggestion"])),
        "encouragement": str(
            parsed.get("encouragement", FALLBACK_RESPONSE["encouragement"])
        ),
    }


@router.post("/relationship-support", response_model=AIResponse)
async def relationship_support(
    request: AIRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> AIResponse:
    try:
        if not settings.FEATHERLESS_API_KEY:
            # No API key configured, return fallback
            return AIResponse(**FALLBACK_RESPONSE)

        result = await call_featherless(
            relationship_state=request.relationship_state.value,
            context_text=request.context_text,
        )
        return AIResponse(**result)
    except Exception:
        # Hard fallback - endpoint must never crash
        return AIResponse(**FALLBACK_RESPONSE)
