"""
FEW-SHOT TEACHING DSL EXAMPLES (Phase 3 Core Evolution)

Demonstrates 4-Zone Spatial Canvas Layout and trigger_phrase bindings.
"""

BINARY_SEARCH_FEW_SHOT_JSON = """{
  "version": "2.0",
  "lesson_id": "lesson_binary_search",
  "mode": "visual",
  "objective": "Binary Search (O(log n))",
  "action": "VISUALIZE",
  "timeline": [
    {
      "t": 0,
      "type": "speak",
      "text": "In a sorted array, checking elements one by one takes linear time. But sorted order guarantees a halving invariant.",
      "trigger_phrase": "linear time"
    },
    {
      "t": 4.5,
      "type": "camera",
      "panX": -880,
      "panY": -260,
      "zoom": 1.25,
      "trigger_phrase": "halving invariant"
    },
    {
      "t": 5.0,
      "type": "speak",
      "text": "Notice how the mid pointer lands on index 3 with value 12. Since 12 is less than target 23, we eliminate the entire lower half.",
      "trigger_phrase": "mid pointer lands on index 3"
    },
    {
      "t": 10.0,
      "type": "camera",
      "panX": -1620,
      "panY": -340,
      "zoom": 1.2,
      "trigger_phrase": "code stepper on line 8"
    },
    {
      "t": 10.5,
      "type": "speak",
      "text": "Follow the code stepper on line 8. We advance low to mid plus 1, updating our variable watch instantly to low equals 4.",
      "trigger_phrase": "updating our variable watch instantly"
    },
    {
      "t": 15.0,
      "type": "ask",
      "question": "Why does sorted order allow us to eliminate half the search space with a single midpoint comparison?",
      "expectedConcept": "monotone invariant guarantees target cannot reside in eliminated subarray",
      "hints": [
        "If the target is greater than mid, all elements before mid must also be strictly less than target."
      ],
      "trigger_phrase": "Socratic Checkpoint"
    }
  ],
  "meta": {
    "concept": "Binary Search (O(log n))",
    "targetPrerequisites": ["arrays", "pointers"],
    "estimatedDifficulty": "intermediate",
    "studentLevel": "undergraduate"
  }
}"""

DERIVATIVE_FEW_SHOT_JSON = """{
  "version": "2.0",
  "lesson_id": "lesson_derivative_intro",
  "mode": "visual",
  "objective": "Derivatives from First Principles",
  "action": "VISUALIZE",
  "timeline": [
    {
      "t": 0,
      "type": "speak",
      "text": "Average rate of change connects two distinct points with a secant slope. But what happens at a single instant?",
      "trigger_phrase": "secant slope"
    },
    {
      "t": 4.5,
      "type": "camera",
      "panX": -880,
      "panY": -260,
      "zoom": 1.25,
      "trigger_phrase": "instantaneous tangent slope"
    },
    {
      "t": 5.0,
      "type": "speak",
      "text": "Observe our interactive graph as delta x shrinks toward zero. The secant chord smoothly rotates into an instantaneous tangent slope.",
      "trigger_phrase": "interactive graph"
    },
    {
      "t": 10.5,
      "type": "speak",
      "text": "Notice the color-locked formula below: the limit of the difference quotient converges to the exact derivative value.",
      "trigger_phrase": "color-locked formula"
    },
    {
      "t": 15.0,
      "type": "ask",
      "question": "Why does taking the limit as delta x approaches zero avoid a division-by-zero error in the slope ratio?",
      "expectedConcept": "algebraic cancellation of delta x before taking the limit",
      "hints": [
        "Notice that both numerator and denominator share delta x as a factor."
      ],
      "trigger_phrase": "Socratic Checkpoint"
    }
  ],
  "meta": {
    "concept": "Derivatives from First Principles",
    "targetPrerequisites": ["algebra", "functions"],
    "estimatedDifficulty": "introductory",
    "studentLevel": "undergraduate"
  }
}"""
