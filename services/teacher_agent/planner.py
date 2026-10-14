"""
PEDAGOGICAL LESSON PLANNER
"""

from typing import Dict, Any, Optional
from services.student_model.state import GlobalStudentModelStore


class LessonPlanner:
    @staticmethod
    def plan_session(concept_query: str) -> Dict[str, Any]:
        concept_id = concept_query.lower().replace(" ", "_").strip() or "concept"

        student_state = GlobalStudentModelStore.get_state()
        mastery = student_state.concepts.get(concept_id, 0.25)

        # Select mode and pedagogical focus
        mode = "visual" if mastery < 0.4 else "socratic"
        action = "VISUALIZE" if mastery < 0.4 else "ASK"

        return {
            "concept_query": concept_query,
            "concept_id": concept_id,
            "mastery": mastery,
            "mode": mode,
            "action": action,
            "student_state": student_state.model_dump(),
        }
