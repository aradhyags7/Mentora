# Mentora — Phase 2 Architecture Inspection & Vertical Slice Implementation Plan

## 1. Repository Inspection Assessment (10 Dimensions)

### 1.1 Current Repository Structure
- **Root Directory:** Next.js 15 (TypeScript, App Router, React 19).
- **Core Directories:**
  - `src/app/`: Next.js page (`page.tsx`) and API routes (`/api/explain`, `/api/pedagogy`, `/api/tts`).
  - `src/components/`: Modular component design (`layout/`, `dashboard/`, `player/`, `primitives/`, `chat/`, `composer/`).
  - `src/lib/`: Domain engines (`mathEngine.ts`, `csEngine.ts`), DSL compiler (`dslCompiler.ts`), Pedagogy (`studentModel.ts`, `misconceptions.ts`, `pedagogicalPolicy.ts`, `adaptiveLessonEngine.ts`), Artifacts (`registry.ts`), Engine validator (`validator.ts`).
  - `src/types/`: Type definitions for `kinetic.ts`, `teachingDsl.ts`, `pedagogy.ts`, `ai.ts`.
  - `fixtures/`: Hand-authored golden timelines (`derivative-calculus.timeline.json`, `binary-search.timeline.json`).
  - `docs/`: Specs for `dsl-spec.md`, `engine-architecture.md`, `audio-sync.md`.
- **Python Environment:** Python 3.14.5 is installed on the host system with `fastapi 0.141.1`, `uvicorn 0.52.4`, `pydantic 2.13.5`, `httpx 0.28.1`, `numpy 2.4.3`, and `python-dotenv 1.2.3` already available in site-packages.

### 1.2 Existing Frontend Components
- **Shell & Navigation:** [`TopBar.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/layout/TopBar.tsx) with model dropdown and live BKT mastery pill; [`Sidebar.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/layout/Sidebar.tsx) with recent lessons and new chat; [`RightContextPanel.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/layout/RightContextPanel.tsx) with three view tabs: *Teacher Brain*, *Engine*, and *Outline*.
- **Classroom Runtime & Player:** [`KineticPlayer.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/player/KineticPlayer.tsx) (60 FPS playback engine, entity interpolation, camera panning/zooming, subtitle karaoke overlay, scrubber bar).
- **Visual Primitives:**
  - [`CoordinateGraphPrimitive.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/primitives/CoordinateGraphPrimitive.tsx): Canvas-based parametric and polynomial curve plotting, dynamic tangent slope visualization, custom labeled coordinate points.
  - [`ArrayNodePrimitive.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/primitives/ArrayNodePrimitive.tsx): Memory blocks, pointer labels (`low`, `high`, `mid`), interval eliminations.
  - [`CardContainerPrimitive.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/primitives/CardContainerPrimitive.tsx): Dynamic invariant state metrics.
  - [`MathEquationPrimitive.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/primitives/MathEquationPrimitive.tsx): LaTeX formatting with KaTeX.
  - [`RoughCalloutPrimitive.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/primitives/RoughCalloutPrimitive.tsx): Hand-drawn sketch callouts.
- **Socratic Interaction:** [`SocraticEvaluationCard.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/chat/SocraticEvaluationCard.tsx) with hints, input prompt, diagnostic callouts, BKT delta indicator.

### 1.3 Existing Calculus Artifact
- **Semantic ID:** `math.derivative`
- **Reference Fixture:** [`derivative-calculus.timeline.json`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/fixtures/derivative-calculus.timeline.json)
- **Visual Capabilities:** Plotting curve $f(x) = 0.5x^2 - 2$ (and $x^2$), rendering point $x_0 = 2.0$, constructing secant chords with varying $\Delta x$, animating limit convergence as $\Delta x \to 0$, rendering the instantaneous tangent line ($y = 2.0x - 2.0$) with slope $m = 2.0$, KaTeX definition of derivative, camera zoom into point of tangency.

### 1.4 Existing Computer Science Artifact
- **Semantic ID:** `cs.binary_search`
- **Reference Fixture:** [`binary-search.timeline.json`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/fixtures/binary-search.timeline.json)
- **Visual Capabilities:** Array partitioning, pointer movement (`low`, `high`, `mid`), candidate range elimination, $O(\log n)$ convergence trace.

### 1.5 Existing Physics Artifact
- Kinematics & rate of change linked into the derivative foundation in [`registry.ts`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/lib/artifacts/registry.ts) and [`HomeDashboard.tsx`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/components/dashboard/HomeDashboard.tsx).

### 1.6 Existing Backend State
- Currently handled in Next.js serverless route handlers (`src/app/api/explain/route.ts`, `src/app/api/pedagogy/route.ts`).
- Python FastAPI server will now be introduced under `services/api/` as the dedicated AI Teacher layer, adhering to Section 8 & Section 26.

### 1.7 Existing Documentation
- `docs/dsl-spec.md`: Kinetic Timeline DSL specification.
- `docs/engine-architecture.md`: Deterministic 60 FPS runtime architecture.
- `docs/audio-sync.md`: Subtitle timestamp synchronization.

### 1.8 Existing Teaching DSL
- Formalized in [`src/types/teachingDsl.ts`](file:///c:/Users/ASUS/OneDrive/Desktop/Mentora/src/types/teachingDsl.ts):
  - Steps: `speak`, `artifact.create`, `artifact.animate`, `camera`, `ask`.
  - Modes: `explanation`, `socratic`, `visual`, `demonstration`, `worked_example`, `guided_practice`, `debugging`, `assessment`.
  - Actions: `EXPLAIN`, `ASK`, `HINT`, `DEMONSTRATE`, `VISUALIZE`, `WORKED_EXAMPLE`, `PRACTICE`, `CHALLENGE`, `REMEDIATE`, `ADVANCE`, `ASSESS`.

### 1.9 Existing API Routes
- `POST /api/explain`: Calls universal AI gateway or returns fallback timeline.
- `GET /api/pedagogy`: Returns student cognitive state and misconception taxonomy.
- `POST /api/pedagogy`: Evaluates answers, runs BKT updates, executes deterministic domain calculations.

### 1.10 Existing Environment Configuration
- `.env.local` contains `NVIDIA_API_KEY=nvapi-...`.
- `.env` in root will be configured with `NVIDIA_API_KEY` for the FastAPI backend.
- Confirmed tested with NVIDIA hosted catalog: model `nvidia/nemotron-3-ultra-550b-a55b` is live, verified, and returning completions.

---

## 2. Phase 2 Vertical Slice Implementation Plan

### Goal: Replace Hardcoded Teaching with AI-Generated Teaching Loop
```
User asks "Teach me derivatives."
  ↓
Next.js UI forwards to FastAPI
  ↓
FastAPI receives request (/api/teach)
  ↓
Teacher Agent builds prompt (Student State + Artifact Registry + Teaching DSL contract)
  ↓
Calls NVIDIA Nemotron 3 Ultra (nvidia/nemotron-3-ultra-550b-a55b)
  ↓
Model generates structured Teaching DSL
  ↓
Pydantic Validator validates DSL against schema
  ↓
FastAPI returns validated DSL to Next.js
  ↓
Classroom Runtime compiles DSL to Kinetic Timeline & executes 60 FPS lesson
  ↓
Socratic Checkpoint asks student a question
  ↓
Student answers ("It is the slope of the tangent line" or "It is 9")
  ↓
Next.js sends answer to FastAPI (/api/evaluate)
  ↓
Teacher Agent & Nemotron 3 Ultra evaluate answer
  ↓
BKT updates student mastery & classifies misconceptions
  ↓
Pedagogical Policy selects next action (REMEDIATE vs ADVANCE)
  ↓
Nemotron generates next Teaching DSL beat
  ↓
Classroom continues teaching!
```

---

## 3. Directory Layout to Build

```
services/
├── api/
│   ├── main.py                   # FastAPI application on port 8000 (CORS enabled)
│   ├── config.py                 # Loads NVIDIA_API_KEY from .env
│   └── routes/
│       ├── teach.py              # POST /api/teach endpoint
│       ├── evaluate.py           # POST /api/evaluate endpoint
│       └── student.py            # GET/POST /api/student-state
├── teacher-agent/
│   ├── agent.py                  # TeacherAgent orchestrator
│   ├── planner.py                # Pedagogical Lesson Planner
│   ├── prompts/
│   │   ├── system_prompt.py      # Teaching DSL contract & Pedagogy instructions
│   │   └── few_shots.py          # Ground-truth Calculus few-shot DSL examples
│   └── providers/
│       ├── base.py               # Abstract TeacherModel class
│       └── nemotron.py           # NemotronProvider calling hosted Nemotron 3 Ultra
├── student-model/
│   ├── state.py                  # StudentState model & store
│   └── bkt.py                    # Bayesian Knowledge Tracing implementation
├── evaluation/
│   ├── evaluator.py              # Response evaluator
│   └── misconceptions.py         # Misconception catalog & diagnostic matcher
├── artifact-registry/
│   └── registry.py               # Artifact Registry (math.derivative capabilities)
packages/
└── teaching-dsl/
    └── schema.py                 # Pydantic v2 schemas for Teaching DSL
```

---

## 4. Execution Steps

1. **Create Python Package & Services Hierarchy**: Implement `packages/teaching-dsl/schema.py`, `services/artifact-registry/registry.py`, `services/student-model/`, `services/evaluation/`, `services/teacher-agent/`, and `services/api/`.
2. **Implement Model Gateway**: Build `TeacherModel` abstract base class and `NemotronProvider` specifically calling `nvidia/nemotron-3-ultra-550b-a55b` via the hosted NVIDIA API.
3. **Build FastAPI Endpoints**:
   - `POST /api/teach`: receives `{ concept: "Teach me derivatives", student_id: "student_local" }`, prompts Nemotron 3 Ultra, validates against Pydantic schema, returns Teaching DSL.
   - `POST /api/evaluate`: receives `{ concept: "math.derivative", question: "...", answer: "...", student_id: "student_local" }`, evaluates response, updates BKT mastery, diagnoses misconceptions, selects next action, and generates the continuation DSL.
   - `GET /api/student-state`: retrieves active student model and mastery.
4. **Connect Frontend to FastAPI**:
   - Update `src/app/page.tsx` and `src/app/api/explain/route.ts` to query the FastAPI backend (`http://localhost:8000/api/teach` and `http://localhost:8000/api/evaluate`), falling back gracefully to the certified local engine if the backend is offline.
5. **Verify Vertical Slice End-to-End**:
   - Test "Teach me derivatives" initial generation.
   - Test misconception answer ("It is 9").
   - Test correct answer ("slope of tangent line").
   - Confirm BKT updates and live adaptive continuation in the UI.
6. **Commit & Push**: Commit in one go to `origin/main`.
