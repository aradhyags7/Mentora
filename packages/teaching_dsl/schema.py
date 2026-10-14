"""
MENTORA TEACHING DSL SPECIFICATION & PYDANTIC SCHEMA (Version 2.0 - Phase 3)

Strict declarative contract governing the interface between the Teacher Model
and the Classroom Runtime. Guarantees the LLM never generates arbitrary frontend code.
Fully synchronized with TypeScript 4-Zone Spatial Canvas and word-level trigger phrases.
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

PrimitiveType = Literal[
    'array',
    'code_trace',
    'tree_graph',
    'stack_hashmap',
    'investigation_node',
    'causal_connector',
    'equation',
    'graph',
    'callout',
    'card'
]


class WordTimestamp(BaseModel):
    word: str
    startOffsetMs: int
    endOffsetMs: int


class CodeTracePayload(BaseModel):
    id: str
    title: Optional[str] = None
    language: str = "python"
    codeLines: List[str]
    activeLine: Optional[int] = 1
    highlightedLines: Optional[List[int]] = None
    variableWatch: Optional[Dict[str, Any]] = None
    complexityBadge: Optional[Dict[str, str]] = None
    position: Optional[Dict[str, float]] = None


class TreeGraphPayload(BaseModel):
    id: str
    title: Optional[str] = None
    variant: Literal["binary_tree", "linked_list", "directed_graph", "recursion_tree"] = "binary_tree"
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]] = Field(default_factory=list)
    activePointer: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, float]] = None


class StackHashMapPayload(BaseModel):
    id: str
    title: str
    variant: Literal["call_stack", "monotonic_stack", "queue", "hashmap"] = "call_stack"
    entries: List[Dict[str, Any]] = Field(default_factory=list)
    position: Optional[Dict[str, float]] = None


class InvestigationNodePayload(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    categoryBadge: Optional[str] = None
    metricLabel: Optional[str] = None
    metricValue: Optional[str] = None
    accentColor: str = "#38BDF8"
    position: Optional[Dict[str, float]] = None


class CausalConnectorPayload(BaseModel):
    id: str
    fromEntityId: Optional[str] = None
    toEntityId: Optional[str] = None
    fromPoint: Optional[Dict[str, float]] = None
    toPoint: Optional[Dict[str, float]] = None
    label: Optional[str] = None
    color: str = "#F59E0B"
    curveOffset: Optional[float] = 0.0


class ArrayPayload(BaseModel):
    id: str
    title: Optional[str] = None
    elements: Optional[List[Dict[str, Any]]] = None
    items: Optional[List[Dict[str, Any]]] = None
    pointers: Optional[List[Dict[str, Any]]] = None
    highlightRange: Optional[Dict[str, Any]] = None
    swapIndices: Optional[List[int]] = None
    position: Optional[Dict[str, float]] = None


class DslSpeakStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds from start of lesson beat")
    type: Literal["speak"] = "speak"
    text: str = Field(..., description="Spoken teacher narration")
    words: Optional[List[WordTimestamp]] = None
    trigger_phrase: Optional[str] = None
    draw_duration_ms: Optional[int] = None


class DslDrawStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["draw"] = "draw"
    primitive_type: PrimitiveType
    payload: Dict[str, Any]
    trigger_phrase: Optional[str] = None
    draw_duration_ms: Optional[int] = 1200


class DslArtifactCreateStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["artifact.create"] = "artifact.create"
    artifact: str = Field(..., description="Artifact semantic key from registry, e.g. math.derivative")
    props: Dict[str, Any] = Field(default_factory=dict, description="Initial props for the artifact")
    trigger_phrase: Optional[str] = None
    draw_duration_ms: Optional[int] = None


class DslArtifactAnimateStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["artifact.animate"] = "artifact.animate"
    target: str = Field(..., description="Target visual entity or component ID")
    animation: str = Field(..., description="Named animation or state transition")
    params: Optional[Dict[str, Any]] = None
    durationMs: Optional[int] = Field(default=2000, description="Animation duration in milliseconds")
    trigger_phrase: Optional[str] = None
    draw_duration_ms: Optional[int] = None


class DslCameraStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["camera"] = "camera"
    panX: Optional[float] = 0.0
    panY: Optional[float] = 0.0
    zoom: Optional[float] = 1.0
    durationMs: Optional[int] = 800
    trigger_phrase: Optional[str] = None
    draw_duration_ms: Optional[int] = None


class DslAskStep(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: Literal["ask"] = "ask"
    question: str = Field(..., description="Socratic or checkpoint prompt for student")
    expectedConcept: Optional[str] = None
    hints: Optional[List[str]] = Field(default_factory=list)
    trigger_phrase: Optional[str] = None
    draw_duration_ms: Optional[int] = None


DslTimelineStep = Union[
    DslSpeakStep,
    DslDrawStep,
    DslArtifactCreateStep,
    DslArtifactAnimateStep,
    DslCameraStep,
    DslAskStep
]


class LessonMeta(BaseModel):
    concept: str = "Binary Search"
    targetPrerequisites: Optional[List[str]] = Field(default_factory=list)
    estimatedDifficulty: Optional[Literal["introductory", "intermediate", "advanced"]] = "intermediate"
    studentLevel: Optional[str] = "undergraduate"


class TeachingDslLesson(BaseModel):
    version: str = "2.0"
    lesson_id: str = Field(default_factory=lambda: f"lesson_{int(time.time() * 1000)}")
    mode: TeachingMode = "visual"
    objective: str = Field(..., description="Pedagogical objective of this teaching beat")
    action: TeachingAction = "VISUALIZE"
    timeline: List[DslTimelineStep] = Field(..., description="Ordered sequence of teaching steps")
    meta: Optional[LessonMeta] = None
