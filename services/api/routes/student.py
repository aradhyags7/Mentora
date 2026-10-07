"""
STUDENT STATE ROUTE - GET/RESET BKT COGNITIVE PROFILE
"""

from fastapi import APIRouter
from pydantic import BaseModel
from services.student_model.state import GlobalStudentModelStore, StudentState

router = APIRouter(prefix="/api", tags=["student"])


class StateResponse(BaseModel):
    success: bool
    student_state: StudentState


@router.get("/student-state", response_model=StateResponse)
async def get_student_state():
    state = GlobalStudentModelStore.get_state()
    return StateResponse(success=True, student_state=state)


@router.post("/student-state/reset", response_model=StateResponse)
async def reset_student_state():
    GlobalStudentModelStore.reset()
    state = GlobalStudentModelStore.get_state()
    return StateResponse(success=True, student_state=state)
