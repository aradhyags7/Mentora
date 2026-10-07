"""
PEDAGOGICAL LESSON PLANNER
"""

from typing import Dict, Any, Optional
from services.student_model.state import GlobalStudentModelStore
from services.artifact_registry.registry import ArtifactRegistry


class LessonPlanner:
    @staticmethod
    def plan_session(concept_query: str) -> Dict[str, Any]:
        artifact = ArtifactRegistry.find_for_concept(concept_query)
        artifact_id = artifact.id if artifact else "math.derivative"

        student_state = GlobalStudentModelStore.get_state()
        mastery = student_state.concepts.get(artifact_id, 0.25)

        # Select mode and pedagogical focus
        mode = "visual" if mastery < 0.4 else "socratic"
        action = "VISUALIZE" if mastery < 0.4 else "ASK"

        return {
            "concept_query": concept_query,
            "artifact_id": artifact_id,
            "artifact": artifact,
            "mastery": mastery,
            "mode": mode,
            "action": action,
            "student_state": student_state.model_dump(),
        }
