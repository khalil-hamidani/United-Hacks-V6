from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.core.indicators import derive_indicator
from app.db.session import get_db
from app.models.relationship import Relationship
from app.models.user import User
from app.schemas.relationship import (
    RelationshipCreate,
    RelationshipResponse,
    RelationshipUpdate,
)

router = APIRouter(prefix="/relationships", tags=["relationships"])


def build_response(rel: Relationship) -> dict:
    indicator = derive_indicator(rel.state)
    return {
        "id": rel.id,
        "name": rel.name,
        "state": rel.state,
        "notes": rel.notes,
        "indicator": indicator,
        "created_at": rel.created_at,
        "updated_at": rel.updated_at,
    }


@router.post(
    "/", response_model=RelationshipResponse, status_code=status.HTTP_201_CREATED
)
async def create_relationship(
    data: RelationshipCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    rel = Relationship(
        user_id=current_user.id,
        name=data.name,
        state=data.state,
        notes=data.notes,
    )
    db.add(rel)
    await db.flush()
    await db.refresh(rel)
    return build_response(rel)


@router.get("/", response_model=List[RelationshipResponse])
async def list_relationships(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[dict]:
    result = await db.execute(
        select(Relationship).where(Relationship.user_id == current_user.id)
    )
    relationships = result.scalars().all()
    return [build_response(rel) for rel in relationships]


@router.get("/{relationship_id}", response_model=RelationshipResponse)
async def get_relationship(
    relationship_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    result = await db.execute(
        select(Relationship).where(
            Relationship.id == relationship_id,
            Relationship.user_id == current_user.id,
        )
    )
    rel = result.scalar_one_or_none()
    if rel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found",
        )
    return build_response(rel)


@router.put("/{relationship_id}", response_model=RelationshipResponse)
async def update_relationship(
    relationship_id: str,
    data: RelationshipUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    result = await db.execute(
        select(Relationship).where(
            Relationship.id == relationship_id,
            Relationship.user_id == current_user.id,
        )
    )
    rel = result.scalar_one_or_none()
    if rel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found",
        )
    if data.name is not None:
        rel.name = data.name
    if data.state is not None:
        rel.state = data.state
    if data.notes is not None:
        rel.notes = data.notes
    await db.flush()
    await db.refresh(rel)
    return build_response(rel)


@router.delete("/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_relationship(
    relationship_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    result = await db.execute(
        select(Relationship).where(
            Relationship.id == relationship_id,
            Relationship.user_id == current_user.id,
        )
    )
    rel = result.scalar_one_or_none()
    if rel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found",
        )
    await db.delete(rel)
