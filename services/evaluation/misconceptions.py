"""
MISCONCEPTION CATALOG & DIAGNOSTIC CLASSIFIER
"""

from typing import List, Optional
from pydantic import BaseModel


class MisconceptionItem(BaseModel):
    id: str
    concept: str
    pattern: str
    title: str
    explanation: str
    severity: str
    remediationAction: str
    remediationGuidance: str


MISCONCEPTION_CATALOG: List[MisconceptionItem] = [
    MisconceptionItem(
        id="confuses_derivative_with_function_value",
        concept="math.derivative",
        pattern="function value instead of slope",
        title="Confusing Function Value with Instantaneous Slope",
        explanation="The student evaluates f(x) instead of the rate of change f'(x). For example, claiming the derivative of x² at 3 is 9 because 3² = 9.",
        severity="medium",
        remediationAction="VISUALIZE",
        remediationGuidance="Distinguish altitude (height on the y-axis) from steepness (speedometer reading or slope of the tangent line)."
    ),
    MisconceptionItem(
        id="confuses_secant_with_tangent",
        concept="math.derivative",
        pattern="secant average instead of instantaneous limit",
        title="Treating Average Rate as Instantaneous Rate",
        explanation="The student computes Δy/Δx over a finite interval without taking the limit as Δx approaches zero.",
        severity="medium",
        remediationAction="DEMONSTRATE",
        remediationGuidance="Show the secant line morphing continuously into the tangent line as Δx shrinks toward 0."
    ),
    MisconceptionItem(
        id="omitted_power_rule_coefficient",
        concept="math.derivative",
        pattern="derivative of x^2 is x",
        title="Omitted Power Rule Exponent Coefficient",
        explanation="The student decreases the power but forgets to multiply by the original exponent (e.g. d/dx(x²) = x instead of 2x).",
        severity="low",
        remediationAction="WORKED_EXAMPLE",
        remediationGuidance="Step through the geometric expansion (x + dx)² = x² + 2x·dx + dx² to show why the factor of 2 emerges naturally."
    ),
    MisconceptionItem(
        id="binary_search_unsorted_assumption",
        concept="cs.binary_search",
        pattern="works on unsorted arrays",
        title="Assuming Binary Search Operates on Unsorted Data",
        explanation="The student believes binary search can eliminate partitions without requiring monotonicity or sorted order.",
        severity="high",
        remediationAction="REMEDIATE",
        remediationGuidance="Show a counterexample where an unsorted array discards the half that actually contains the target value."
    )
]


def classify_misconception(concept: str, student_answer: str) -> Optional[MisconceptionItem]:
    text = student_answer.lower().strip()
    if concept == "math.derivative" or "deriv" in concept:
        if (
            "9" in text or
            "y value" in text or
            "y-value" in text or
            "height" in text or
            "altitude" in text or
            "point (" in text or
            "location" in text or
            "squared is" in text or
            ("value of the function" in text and "rate" not in text)
        ):
            return next((m for m in MISCONCEPTION_CATALOG if m.id == "confuses_derivative_with_function_value"), None)

    if concept == "cs.binary_search" or "binary" in concept:
        if "unsorted" in text or "random order" in text:
            return next((m for m in MISCONCEPTION_CATALOG if m.id == "binary_search_unsorted_assumption"), None)

    return None
