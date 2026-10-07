"""
FEW-SHOT TEACHING DSL EXAMPLES FOR DERIVATIVES
"""

DERIVATIVE_FEW_SHOT_JSON = """{
  "version": "1.0",
  "lesson_id": "lesson_derivative_intro",
  "mode": "visual",
  "objective": "Understand derivatives as instantaneous rate of change and the limit of secants",
  "action": "VISUALIZE",
  "timeline": [
    {
      "t": 0,
      "type": "speak",
      "text": "Welcome to Mentora. Instead of memorizing rules, let's understand what a derivative actually means geometrically. Imagine looking at your speedometer at one single millisecond."
    },
    {
      "t": 4,
      "type": "artifact.create",
      "artifact": "math.derivative",
      "props": {
        "function": "0.5*x^2 - 2",
        "focusPoint": 2.0,
        "tangentAtX": 2.0
      }
    },
    {
      "t": 8,
      "type": "camera",
      "panX": 0,
      "panY": -10,
      "zoom": 1.15,
      "durationMs": 800
    },
    {
      "t": 12,
      "type": "artifact.animate",
      "target": "secant",
      "animation": "secant_to_tangent",
      "durationMs": 2500
    },
    {
      "t": 16,
      "type": "speak",
      "text": "Notice how the average rate between two points changes as delta x shrinks toward zero. The secant chord smoothly snaps into the tangent line."
    },
    {
      "t": 22,
      "type": "ask",
      "question": "As delta x shrinks toward zero and the secant snaps to a tangent line, what does the resulting number (2.0) represent geometrically?",
      "expectedConcept": "instantaneous slope or rate of change",
      "hints": [
        "Think about the difference between your average speed over an hour versus your speedometer reading right now.",
        "A line tilted upward has positive steepness (rise over run)."
      ]
    }
  ],
  "meta": {
    "concept": "math.derivative",
    "targetPrerequisites": ["algebra", "functions"],
    "estimatedDifficulty": "introductory",
    "studentLevel": "undergraduate"
  }
}"""
