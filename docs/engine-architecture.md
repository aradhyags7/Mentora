# Mentora Deterministic Engine Architecture

## Mathematical Model: Pure Function of Time

The visual world at any point in time $t$ is computed via a pure deterministic evaluator:

$$\text{SceneFrameState} = f(\text{Timeline}, t_{\text{ms}})$$

Where:
- $\text{Timeline}$ is the compiled, validated timeline.
- $t_{\text{ms}} \in [0, \text{totalDurationMs}]$.
- $\text{SceneFrameState}$ contains:
  - `entities`: Current visual primitives state
  - `camera`: `{ x, y, zoom }` interpolated with cubic/elastic easing
  - `activeCallouts`: Currently active RoughJS sketches
  - `activeCue`, `activeWordIndex`: Synced karaoke indices

## Scrubbing & Seeking Determinism

Because state is evaluated freshly or via pure replay of actions up to $t_{\text{ms}}$, seeking is instantaneous ($O(N)$ where $N$ is the number of cues, typically $< 10$). 

Scrubbing forward and backward guarantees:
- Zero accumulation errors
- Zero dangling pointer animations
- Bit-exact re-render upon repeated seeks
