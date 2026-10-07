"""
EVALUATE ROUTE - ASSESSES RESPONSES, TRACES BKT, GENERATES ADAPTIVE BEAT
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.evaluation.evaluator import evaluate_student_answer, EvaluationResponse
from services.teacher_agent.agent import GlobalTeacherAgent
from services.student_model.state import GlobalStudentModelStore, StudentState
from packages.teaching_dsl.schema import TeachingDslLesson

router = APIRouter(prefix="/api", tags=["evaluate"])


class EvaluateRequest(BaseModel):
    concept: str = Field(..., description="Concept key, e.g. 'math.derivative'")
    question: str = Field(..., description="The Socratic prompt presented")
    answer: str = Field(..., description="The student's response")
    student_id: Optional[str] = "student_local"


class EvaluateAndAdaptResponse(BaseModel):
    success: bool
    evaluation: EvaluationResponse
    next_dsl: TeachingDslLesson
    student_state: StudentState


@router.post("/evaluate", response_model=EvaluateAndAdaptResponse)
async def evaluate_endpoint(req: EvaluateRequest):
    if not req.answer.strip():
        raise HTTPException(status_code=400, detail="Answer is required")

    try:
        # Step 1: Pedagogical diagnosis & BKT mastery update
        eval_result = evaluate_student_answer(
            concept=req.concept,
            question=req.question,
            student_answer=req.answer
        )

        # Step 2: Next pedagogical Teaching DSL generation via Teacher Agent
        next_dsl = await GlobalTeacherAgent.generate_remediation_or_advance(
            concept=req.concept,
            evaluation_result=eval_result.model_dump(),
            student_id=req.student_id or "student_local"
        )

        # Step 3: Current updated student state
        student_state = GlobalStudentModelStore.get_state()

        return EvaluateAndAdaptResponse(
            success=True,
            evaluation=eval_result,
            next_dsl=next_dsl,
            student_state=student_state
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
