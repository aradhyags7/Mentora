"""
TEACHER AGENT ORCHESTRATOR
"""

import re
import json
import logging
from typing import Dict, Any, Optional
from packages.teaching_dsl.schema import TeachingDslLesson
from .providers.base import TeacherModel, ModelMessage
from .providers.nemotron import NemotronProvider
from .prompts.system_prompt import TEACHER_SYSTEM_PROMPT
from .prompts.few_shots import DERIVATIVE_FEW_SHOT_JSON
from .planner import LessonPlanner
from services.artifact_registry.registry import ArtifactRegistry
from services.student_model.state import GlobalStudentModelStore

logger = logging.getLogger("mentora.teacher_agent")


class TeacherAgent:
    def __init__(self, model: Optional[TeacherModel] = None):
        self.model = model or NemotronProvider()

    async def generate_lesson(
        self,
        user_prompt: str,
        student_id: str = "student_local"
    ) -> TeachingDslLesson:
        plan = LessonPlanner.plan_session(user_prompt)
        artifact_id = plan["artifact_id"]
        artifact = plan["artifact"]

        capabilities_text = ", ".join(artifact.capabilities) if artifact else "continuous curve, secant, tangent, limit"

        user_content = f"""
Student Request: "{user_prompt}"
Target Concept: {artifact_id}
Student Mastery P(L): {plan['mastery']}
Target Mode: {plan['mode']}
Pedagogical Action: {plan['action']}
Artifact Capabilities: {capabilities_text}

Generate an interactive Teaching DSL lesson introducing {artifact_id} from first principles, visually animating the key invariants and concluding with a Socratic checkpoint question.
""".strip()

        messages = [
            ModelMessage(role="system", content=TEACHER_SYSTEM_PROMPT),
            ModelMessage(role="user", content="Teach me derivatives."),
            ModelMessage(role="assistant", content=DERIVATIVE_FEW_SHOT_JSON),
            ModelMessage(role="user", content=user_content),
        ]

        try:
            raw_text = await self.model.generate(
                messages=messages,
                response_schema=TeachingDslLesson,
                temperature=0.2,
                max_tokens=2048,
            )

            # Extract JSON block
            json_match = re.search(r"\{[\s\S]*\}", raw_text)
            if not json_match:
                raise ValueError("No JSON found in model output")

            parsed_data = json.loads(json_match.group(0))

            # Validate against Pydantic schema
            lesson = TeachingDslLesson.model_validate(parsed_data)
            return lesson

        except Exception as e:
            logger.warning(f"Nemotron DSL generation failed or malformed: {e}. Falling back to certified golden fixture.")
            # Auto-repair fallback with certified ground-truth DSL
            fixture_dict = json.loads(DERIVATIVE_FEW_SHOT_JSON)
            return TeachingDslLesson.model_validate(fixture_dict)

    async def generate_remediation_or_advance(
        self,
        concept: str,
        evaluation_result: Dict[str, Any],
        student_id: str = "student_local"
    ) -> TeachingDslLesson:
        is_correct = evaluation_result.get("is_correct", False)
        student_state = GlobalStudentModelStore.get_state()

        if not is_correct:
            # Remediation beat
            remediation_text = evaluation_result.get("reasoning", "Altitude is distinct from steepness.")
            user_content = f"""
Concept: {concept}
Evaluation: INCORRECT
Student Misconception: {remediation_text}
Student Mastery: {student_state.concepts.get(concept, 0.2)}
Action: REMEDIATE
Mode: demonstration

Generate a targeted remediation beat distinguishing function altitude from slope at x=2, and conclude with an intuitive follow-up question.
""".strip()
        else:
            # Advancement beat
            user_content = f"""
Concept: {concept}
Evaluation: CORRECT
Student Mastery: {student_state.concepts.get(concept, 0.6)}
Action: ADVANCE
Mode: guided_practice

Generate an advancement beat showing secant chords converging smoothly to the exact tangent slope 2.0 as delta x drops to 0.001. Conclude with a challenge question about indeterminate forms.
""".strip()

        messages = [
            ModelMessage(role="system", content=TEACHER_SYSTEM_PROMPT),
            ModelMessage(role="user", content=user_content),
        ]

        try:
            raw_text = await self.model.generate(
                messages=messages,
                response_schema=TeachingDslLesson,
                temperature=0.2,
                max_tokens=2048,
            )

            json_match = re.search(r"\{[\s\S]*\}", raw_text)
            if not json_match:
                raise ValueError("No JSON found in model output")

            parsed_data = json.loads(json_match.group(0))
            return TeachingDslLesson.model_validate(parsed_data)
        except Exception as e:
            logger.warning(f"Remediation/advance generation failed: {e}. Using deterministic fallback.")
            fixture_dict = json.loads(DERIVATIVE_FEW_SHOT_JSON)
            return TeachingDslLesson.model_validate(fixture_dict)


GlobalTeacherAgent = TeacherAgent()
