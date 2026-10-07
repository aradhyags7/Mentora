"""
TEACH ROUTE - GENERATES TEACHING DSL LESSONS
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.teacher_agent.agent import GlobalTeacherAgent
from packages.teaching_dsl.schema import TeachingDslLesson

router = APIRouter(prefix="/api", tags=["teach"])


class TeachRequest(BaseModel):
    prompt: str = Field(..., description="Student inquiry, e.g. 'Teach me derivatives.'")
    student_id: Optional[str] = "student_local"


class TeachResponse(BaseModel):
    success: bool
    dsl: TeachingDslLesson
    artifact_id: str


@router.post("/teach", response_model=TeachResponse)
async def teach_endpoint(req: TeachRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    try:
        lesson = await GlobalTeacherAgent.generate_lesson(
            user_prompt=req.prompt,
            student_id=req.student_id or "student_local"
        )
        artifact_id = lesson.meta.concept if lesson.meta else "math.derivative"

        return TeachResponse(
            success=True,
            dsl=lesson,
            artifact_id=artifact_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
