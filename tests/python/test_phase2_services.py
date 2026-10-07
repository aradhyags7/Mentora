"""
TEST PHASE 2 MENTORA SERVICES
- Corbett & Anderson BKT Algorithm
- Teaching DSL Pydantic Schema Validation
- Misconception Classifier
- Student State Management
- FastAPI Routes Integration
"""

import pytest
from packages.teaching_dsl.schema import TeachingDslLesson, DslSpeakStep, DslArtifactCreateStep, DslAskStep
from services.student_model.bkt import update_bkt_mastery, BktParameters, DEFAULT_BKT_PARAMS
from services.student_model.state import GlobalStudentModelStore
from services.evaluation.misconceptions import classify_misconception, MISCONCEPTION_CATALOG
from services.evaluation.evaluator import evaluate_student_answer
from fastapi.testclient import TestClient
from services.api.main import app


def test_bkt_mastery_update_correct():
    params = BktParameters(p_l0=0.25, p_t=0.15, p_g=0.20, p_s=0.10)
    p_prior = 0.25
    prior, p_posterior = update_bkt_mastery(p_prior, is_correct=True, params=params)
    assert p_posterior > p_prior
    assert 0.0 <= p_posterior <= 1.0


def test_bkt_mastery_update_incorrect():
    params = BktParameters(p_l0=0.50, p_t=0.10, p_g=0.20, p_s=0.10)
    p_prior = 0.50
    prior, p_posterior = update_bkt_mastery(p_prior, is_correct=False, params=params)
    assert p_posterior < p_prior
    assert 0.0 <= p_posterior <= 1.0


def test_teaching_dsl_pydantic_validation():
    sample = {
        "lesson_id": "test_deriv_01",
        "objective": "Understand instantaneous rate of change",
        "mode": "socratic",
        "meta": {
            "concept": "math.derivative",
            "target_misconceptions": ["confuses_derivative_with_function_value"]
        },
        "timeline": [
            {
                "t": 0.0,
                "type": "speak",
                "text": "Welcome to derivatives from first principles."
            },
            {
                "t": 2.5,
                "type": "artifact.create",
                "artifact": "math.derivative",
                "state": {"x0": 2.0}
            },
            {
                "t": 5.0,
                "type": "ask",
                "question": "Does derivative mean where the curve is, or how steep it is?",
                "expected_answer_concepts": ["slope", "steepness", "rate of change"],
                "hints": ["Think about steepness vs height."]
            }
        ],
        "evaluation": {
            "expected_understanding": "The derivative is instantaneous slope, not height.",
            "diagnostic_rubric": {
                "confuses_derivative_with_function_value": "Student looked at y-value instead of slope."
            }
        }
    }

    lesson = TeachingDslLesson.model_validate(sample)
    assert lesson.lesson_id == "test_deriv_01"
    assert len(lesson.timeline) == 3
    assert isinstance(lesson.timeline[0], DslSpeakStep)
    assert isinstance(lesson.timeline[1], DslArtifactCreateStep)
    assert isinstance(lesson.timeline[2], DslAskStep)


def test_misconception_detection():
    # Misconception test: altitude instead of slope
    answer = "The derivative at x=2 is 0 because the curve is at the point (2, 0)."
    misc = classify_misconception("math.derivative", answer)
    assert misc is not None
    assert misc.id == "confuses_derivative_with_function_value"

    # Correct response
    correct_ans = "The derivative is the instantaneous slope or rate of change of the tangent line."
    misc_none = classify_misconception("math.derivative", correct_ans)
    assert misc_none is None


def test_evaluator_updates_bkt_mastery():
    GlobalStudentModelStore.reset()
    res = evaluate_student_answer(
        concept="math.derivative",
        question="What is the derivative at x=2?",
        student_answer="it is 0 because the height is zero"
    )
    assert res.is_correct is False
    assert len(res.detected_misconceptions) > 0
    assert res.mastery_after < res.mastery_before
    assert res.recommended_action == "REMEDIATE"


def test_fastapi_endpoints():
    client = TestClient(app)

    # Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    # Student state
    res_state = client.get("/api/student-state")
    assert res_state.status_code == 200
    assert "math.derivative" in res_state.json()["student_state"]["concepts"]

    # Evaluate endpoint
    res_eval = client.post("/api/evaluate", json={
        "concept": "math.derivative",
        "question": "What is the derivative?",
        "answer": "It is the slope of the tangent line"
    })
    assert res_eval.status_code == 200
    data = res_eval.json()
    assert data["success"] is True
    assert data["evaluation"]["is_correct"] is True
    assert "next_dsl" in data
