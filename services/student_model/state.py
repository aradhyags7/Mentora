"""
STUDENT STATE MODEL & COGNITIVE PROFILE STORE
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from .bkt import update_bkt_mastery, DEFAULT_BKT_PARAMS


class StudentState(BaseModel):
    id: str = "student_local"
    concepts: Dict[str, float] = Field(default_factory=lambda: {
        "math.algebra": 0.88,
        "math.functions": 0.79,
        "math.limits": 0.42,
        "math.derivative": 0.25,
        "cs.array": 0.90,
        "cs.binary_search": 0.40,
    })
    misconceptions: List[str] = Field(default_factory=list)
    recent_errors: List[str] = Field(default_factory=list)
    preferred_modes: List[str] = Field(default_factory=lambda: ["visual", "worked_example", "socratic"])
    confidence: float = 0.60
    totalInteractions: int = 0
    lastUpdated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StudentModelStore:
    def __init__(self):
        self._state = StudentState()

    def get_state(self) -> StudentState:
        return self._state.model_copy(deep=True)

    def get_mastery(self, concept: str) -> float:
        return self._state.concepts.get(concept, DEFAULT_BKT_PARAMS.p_l0)

    def record_interaction(self, concept: str, is_correct: bool) -> tuple[float, float]:
        prior = self.get_mastery(concept)
        prior, updated = update_bkt_mastery(prior, is_correct)
        self._state.concepts[concept] = updated
        self._state.totalInteractions += 1
        self._state.lastUpdated = datetime.now(timezone.utc).isoformat()
        return prior, updated

    def add_misconception(self, misconception_id: str):
        if misconception_id not in self._state.misconceptions:
            self._state.misconceptions.append(misconception_id)

    def clear_misconception(self, misconception_id: str):
        if misconception_id in self._state.misconceptions:
            self._state.misconceptions.remove(misconception_id)

    def record_error(self, error_desc: str):
        self._state.recent_errors = [error_desc] + self._state.recent_errors[:4]

    def reset(self):
        self._state = StudentState()


GlobalStudentModelStore = StudentModelStore()
