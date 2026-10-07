"""
BAYESIAN KNOWLEDGE TRACING (BKT) ENGINE

Implements standard Corbett & Anderson (1995) algorithm for interpretable
student mastery tracking per conceptual component.
"""

from pydantic import BaseModel


class BktParameters(BaseModel):
    p_l0: float = 0.25  # Prior initial knowledge probability
    p_t: float = 0.15   # Probability of learning on an opportunity
    p_g: float = 0.20   # Guess probability
    p_s: float = 0.10   # Slip probability


DEFAULT_BKT_PARAMS = BktParameters()


def update_bkt_mastery(
    prior: float,
    is_correct: bool,
    params: BktParameters = DEFAULT_BKT_PARAMS
) -> tuple[float, float]:
    """
    Computes updated posterior probability P(L_t) given observation.
    Returns (prior, updated_mastery).
    """
    p_t = params.p_t
    p_g = params.p_g
    p_s = params.p_s

    # 1. Posterior probability given observation
    if is_correct:
        numerator = prior * (1.0 - p_s)
        denominator = numerator + (1.0 - prior) * p_g
        p_learned_given_obs = numerator / denominator if denominator > 0 else prior
    else:
        numerator = prior * p_s
        denominator = numerator + (1.0 - prior) * (1.0 - p_g)
        p_learned_given_obs = numerator / denominator if denominator > 0 else prior

    # 2. State transition probability (opportunity to learn from practice step)
    new_mastery = p_learned_given_obs + (1.0 - p_learned_given_obs) * p_t
    clamped_mastery = max(0.01, min(0.99, round(new_mastery, 3)))

    return prior, clamped_mastery
