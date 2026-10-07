"""
MENTORA ARTIFACT REGISTRY (Python Layer)

Defines semantic educational artifacts, their visual capabilities,
input parameter schemas, and default states for the Teacher Agent.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class ArtifactCapability(BaseModel):
    name: str
    description: str


class ArtifactDescriptor(BaseModel):
    id: str
    domain: str
    title: str
    description: str
    capabilities: List[str]
    default_props: Dict[str, Any]
    supported_animations: List[str]


class ArtifactRegistryService:
    def __init__(self):
        self._artifacts: Dict[str, ArtifactDescriptor] = {}
        self._register_defaults()

    def _register_defaults(self):
        # 1. Calculus: Derivatives & Rates of Change
        self.register(ArtifactDescriptor(
            id="math.derivative",
            domain="mathematics",
            title="The Essence of Calculus: Derivatives as Instantaneous Slope",
            description="Interactive continuous curve with secant lines morphing into tangent limits as Δx approaches zero.",
            capabilities=[
                "plot_function",
                "move_point",
                "animate_secant",
                "animate_tangent",
                "show_delta_x",
                "write_equation",
                "highlight_extrema"
            ],
            default_props={
                "function": "0.5*x^2 - 2",
                "rangeX": [-4, 4],
                "rangeY": [-4, 6],
                "focusPoint": 2.0,
                "tangentAtX": 2.0,
                "deltas": [2.0, 1.0, 0.5, 0.1, 0.001]
            },
            supported_animations=[
                "secant_to_tangent",
                "shrink_delta_x",
                "trace_tangent_slope",
                "highlight_point"
            ]
        ))

        # 2. Computer Science: Binary Search Invariants
        self.register(ArtifactDescriptor(
            id="cs.binary_search",
            domain="computer_science",
            title="Binary Search Algorithm & Monotonic Invariants",
            description="Sorted array space halving with low, high, and mid pointers and partition elimination.",
            capabilities=[
                "array_partition",
                "move_pointer",
                "highlight_candidate",
                "eliminate_subarray",
                "logarithmic_trace"
            ],
            default_props={
                "array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
                "target": 23
            },
            supported_animations=[
                "calculate_mid",
                "compare_target",
                "eliminate_left_partition",
                "eliminate_right_partition",
                "mark_target_found"
            ]
        ))

        # 3. Physics: Projectile Motion
        self.register(ArtifactDescriptor(
            id="physics.projectile",
            domain="physics",
            title="Kinematics: 2D Projectile Trajectory",
            description="Parabolic motion decomposition into orthogonal horizontal and vertical velocity vectors.",
            capabilities=[
                "set_angle",
                "set_initial_velocity",
                "trace_parabola",
                "show_velocity_vectors"
            ],
            default_props={
                "launchAngle": 45,
                "initialVelocity": 20,
                "gravity": 9.81
            },
            supported_animations=[
                "launch_projectile",
                "show_apex",
                "impact_range"
            ]
        ))

    def register(self, descriptor: ArtifactDescriptor):
        self._artifacts[descriptor.id] = descriptor

    def get(self, artifact_id: str) -> Optional[ArtifactDescriptor]:
        return self._artifacts.get(artifact_id)

    def find_for_concept(self, query: str) -> Optional[ArtifactDescriptor]:
        q = query.lower()
        if any(term in q for term in ["deriv", "calculus", "slope", "rate of change", "tangent", "secant"]):
            return self._artifacts.get("math.derivative")
        if any(term in q for term in ["binary", "search", "array", "divide and conquer"]):
            return self._artifacts.get("cs.binary_search")
        if any(term in q for term in ["projectile", "trajectory", "motion", "gravity"]):
            return self._artifacts.get("physics.projectile")
        return self._artifacts.get("math.derivative")

    def list_all(self) -> List[ArtifactDescriptor]:
        return list(self._artifacts.values())


ArtifactRegistry = ArtifactRegistryService()
