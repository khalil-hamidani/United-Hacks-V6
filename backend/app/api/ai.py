from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator

from app.api.auth import get_current_user
from app.models.relationship import RelationshipState
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["ai"])


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


STUBBED_RESPONSES = {
    RelationshipState.STRONG: AIResponse(
        reflection="It sounds like things are going well in this relationship.",
        suggestion="You might consider expressing appreciation when it feels natural.",
        encouragement="Healthy connections are worth nurturing at your own pace.",
    ),
    RelationshipState.GOOD_BUT_DISTANT: AIResponse(
        reflection="There seems to be a foundation of care, even with some distance.",
        suggestion="Perhaps a simple check-in could feel right when you are ready.",
        encouragement="Distance does not diminish what you have built together.",
    ),
    RelationshipState.UNCLEAR: AIResponse(
        reflection="Uncertainty in relationships is a common and valid experience.",
        suggestion="Taking time to reflect on what you need might bring some clarity.",
        encouragement="It is okay to not have all the answers right now.",
    ),
    RelationshipState.TENSE: AIResponse(
        reflection="Tension can feel heavy, and acknowledging it takes courage.",
        suggestion="When the time feels right, a calm conversation might help.",
        encouragement="Difficult moments do not define the entire relationship.",
    ),
    RelationshipState.HURT: AIResponse(
        reflection="Experiencing hurt in a relationship is deeply human.",
        suggestion="Giving yourself space to process may be helpful.",
        encouragement="Healing takes time, and it is okay to move at your own pace.",
    ),
}


@router.post("/relationship-support", response_model=AIResponse)
async def relationship_support(
    request: AIRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> AIResponse:
    return STUBBED_RESPONSES.get(
        request.relationship_state,
        AIResponse(
            reflection="Every relationship has its unique rhythm.",
            suggestion="Consider what feels most genuine to you.",
            encouragement="You are doing your best, and that matters.",
        ),
    )
