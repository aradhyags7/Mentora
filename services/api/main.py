"""
MENTORA TEACHING LAYER - FASTAPI BACKEND APPLICATION
"""

import sys
from pathlib import Path

# Ensure root directory is in Python path for package imports
root_path = Path(__file__).resolve().parent.parent.parent
if str(root_path) not in sys.path:
    sys.path.insert(0, str(root_path))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.api.routes import teach_router, evaluate_router, student_router
from services.api.config import HOST, PORT

app = FastAPI(
    title="Mentora AI Teaching Layer API",
    description="Adaptive pedagogical intelligence layer transforming foundation models into interactive teachers.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (default port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(teach_router)
app.include_router(evaluate_router)
app.include_router(student_router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "mentora-teaching-layer",
        "teacher_model": "nvidia/nemotron-3-super-120b-a12b",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("services.api.main:app", host=HOST, port=PORT, reload=True)
