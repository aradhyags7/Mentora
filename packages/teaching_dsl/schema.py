"""
MENTORA TEACHING DSL SPECIFICATION & PYDANTIC SCHEMA (Version 1.0)

Strict declarative contract governing the interface between the Teacher Model
and the Classroom Runtime. Guarantees the LLM never generates arbitrary frontend code.
"""

from typing import List, Dict, Any, Optional, Union, Literal
from pydantic import BaseModel, Field
import time

TeachingMode = Literal[
    'explanation',
    'socratic',
    'visual',
    'demonstration',
    'worked_example',
    'guided_practice',
    'debugging',
    'assessment'
]

TeachingAction = Literal[
    'EXPLAIN',
    'ASK',
    'HINT',
    'DEMONSTRATE',
    'VISUALIZE',
    'WORKED_EXAMPLE',
    'PRACTICE',
    'CHALLENGE',
    'REMEDIATE',
    'ADVANCE',
    'ASSESS'
]


class WordTimestamp(BaseModel):
    word: str
    startOffsetMs: int
    endOffsetMs: int


class DslSpeakStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds from start of lesson beat")
    type: Literal["speak"] = "speak"
    text: str = Field(..., description="Spoken teacher narration")
    words: Optional[List[WordTimestamp]] = None


class DslArtifactCreateStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["artifact.create"] = "artifact.create"
    artifact: str = Field(..., description="Artifact semantic key from registry, e.g. math.derivative")
    props: Dict[str, Any] = Field(default_factory=dict, description="Initial props for the artifact")


class DslArtifactAnimateStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["artifact.animate"] = "artifact.animate"
    target: str = Field(..., description="Target visual entity or component ID")
    animation: str = Field(..., description="Named animation or state transition")
    params: Optional[Dict[str, Any]] = None
    durationMs: Optional[int] = Field(default=2000, description="Animation duration in milliseconds")


class DslCameraStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["camera"] = "camera"
    panX: Optional[float] = 0.0
    panY: Optional[float] = 0.0
    zoom: Optional[float] = 1.0
    durationMs: Optional[int] = 800


class DslAskStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["ask"] = "ask"
    question: str = Field(..., description="Socratic or checkpoint prompt for student")
    expectedConcept: Optional[str] = None
    hints: Optional[List[str]] = Field(default_factory=list)


DslTimelineStep = Union[
    DslSpeakStep,
    DslArtifactCreateStep,
    DslArtifactAnimateStep,
    DslCameraStep,
    DslAskStep
]


class LessonMeta(BaseModel):
    concept: str = "math.derivative"
    targetPrerequisites: Optional[List[str]] = Field(default_factory=list)
    estimatedDifficulty: Optional[Literal["introductory", "intermediate", "advanced"]] = "introductory"
    studentLevel: Optional[str] = "undergraduate"


class TeachingDslLesson(BaseModel):
    version: str = "1.0"
    lesson_id: str = Field(default_factory=lambda: f"lesson_{int(time.time() * 1000)}")
    mode: TeachingMode = "visual"
    objective: str = Field(..., description="Pedagogical objective of this teaching beat")
    action: TeachingAction = "VISUALIZE"
    timeline: List[DslTimelineStep] = Field(..., description="Ordered sequence of teaching steps")
    meta: Optional[LessonMeta] = None
