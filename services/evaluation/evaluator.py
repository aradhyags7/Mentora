"""
STUDENT RESPONSE EVALUATOR
"""

from typing import Optional, List
from pydantic import BaseModel
from .misconceptions import classify_misconception, MisconceptionItem
from services.student_model.state import GlobalStudentModelStore


class EvaluationResponse(BaseModel):
    is_correct: bool
    score: float
    reasoning: str
    detected_misconceptions: List[MisconceptionItem]
    concept: str
    mastery_before: float
    mastery_after: float
    recommended_action: str
    recommended_mode: str


def evaluate_student_answer(
    concept: str,
    question: str,
    student_answer: str
) -> EvaluationResponse:
    text = student_answer.lower().strip()
    detected_misc = classify_misconception(concept, text)

    # 1. Misconception triggered
    if detected_misc:
        GlobalStudentModelStore.add_misconception(detected_misc.id)
        GlobalStudentModelStore.record_error(f"Misconception: {detected_misc.title}")
        prior, updated = GlobalStudentModelStore.record_interaction(concept, is_correct=False)

        return EvaluationResponse(
            is_correct=False,
            score=0.20,
            reasoning=f"You're observing the altitude on the curve rather than its instantaneous steepness. {detected_misc.explanation}",
            detected_misconceptions=[detected_misc],
            concept=concept,
            mastery_before=prior,
            mastery_after=updated,
            recommended_action="REMEDIATE",
            recommended_mode="demonstration"
        )

    # 2. Correct conceptual insight
    if any(keyword in text for keyword in ["slope", "rate of change", "steepness", "speed", "tangent", "velocity"]):
        GlobalStudentModelStore.clear_misconception("confuses_derivative_with_function_value")
        prior, updated = GlobalStudentModelStore.record_interaction(concept, is_correct=True)

        return EvaluationResponse(
            is_correct=True,
            score=1.0,
            reasoning="Spot on! The derivative represents the instantaneous slope of the tangent line—the exact rate of change at that point.",
            detected_misconceptions=[],
            concept=concept,
            mastery_before=prior,
            mastery_after=updated,
            recommended_action="ADVANCE",
            recommended_mode="socratic"
        )

    # 3. Partially correct or constructive response
    prior, updated = GlobalStudentModelStore.record_interaction(concept, is_correct=True)
    return EvaluationResponse(
        is_correct=True,
        score=0.85,
        reasoning="Good observation! Let's examine how this connects directly to the geometric limit.",
        detected_misconceptions=[],
        concept=concept,
        mastery_before=prior,
        mastery_after=updated,
        recommended_action="EXPLAIN",
        recommended_mode="explanation"
    )
