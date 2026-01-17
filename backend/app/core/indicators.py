from app.models.relationship import RelationshipState


INDICATOR_MAP = {
    RelationshipState.STRONG: {"label": "Stable", "level": 5},
    RelationshipState.GOOD_BUT_DISTANT: {"label": "Open", "level": 4},
    RelationshipState.UNCLEAR: {"label": "Needs attention", "level": 3},
    RelationshipState.TENSE: {"label": "Fragile", "level": 2},
    RelationshipState.HURT: {"label": "In repair", "level": 1},
}


def derive_indicator(state: RelationshipState) -> dict:
    return INDICATOR_MAP.get(state, {"label": "Unknown", "level": 0})
