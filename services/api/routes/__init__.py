from .teach import router as teach_router
from .evaluate import router as evaluate_router
from .student import router as student_router

__all__ = ["teach_router", "evaluate_router", "student_router"]
