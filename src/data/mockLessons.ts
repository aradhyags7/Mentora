import { LessonData } from '@/types/classroom';

export const LESSONS: Record<string, LessonData> = {
  calculus: {
    id: 'calculus',
    title: 'The Derivative as a Tangent Limit',
    category: 'Mathematics',
    icon: 'Sigma',
    overview: 'Understanding why derivatives represent instantaneous rates of change rather than just memorized formulas.',
    concepts: [
      { id: 'c1', name: 'Functions & Curves', status: 'mastered', description: 'Plotting $f(x)=x^2$' },
      { id: 'c2', name: 'Secant Line Slope', status: 'mastered', description: 'Average rate of change over $[x, x+\\Delta x]$' },
      { id: 'c3', name: 'Tangent Slope Limit', status: 'current', description: 'Deriving $f\'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)-f(x)}{\\Delta x}$' },
      { id: 'c4', name: 'Power Rule Derivation', status: 'next', description: 'Generalizing $x^n \\to n x^{n-1}$' }
    ],
    initialMode: 'socratic',
    initialTeacherSpeech: "Welcome! Today, instead of memorizing derivative rules, we are going to discover why the derivative exists. Notice our curve f(x) = x². What happens to the secant line between P and Q when we drag Δx down toward zero?",
    socraticSuggestions: [
      "Why can't we simply set Δx = 0 directly?",
      "Show me the secant line steepen visually",
      "Let me solve the algebraic limit step-by-step",
      "Explain what the slope at x = 1 means physically"
    ],
    initialFormulaLatex: "m_{\\text{sec}} = \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}",
    formulaDerivationSteps: [
      {
        latex: "m_{\\text{sec}} = \\frac{(x+\\Delta x)^2 - x^2}{\\Delta x}",
        explanation: "Substitute f(t) = t² into the difference quotient.",
        deltaX: 1.5
      },
      {
        latex: "m_{\\text{sec}} = \\frac{x^2 + 2x\\Delta x + (\\Delta x)^2 - x^2}{\\Delta x}",
        explanation: "Expand the squared binomial.",
        deltaX: 1.0
      },
      {
        latex: "m_{\\text{sec}} = \\frac{2x\\Delta x + (\\Delta x)^2}{\\Delta x} = 2x + \\Delta x",
        explanation: "Cancel the x² terms and factor out Δx (valid since Δx ≠ 0).",
        deltaX: 0.4
      },
      {
        latex: "f'(x) = \\lim_{\\Delta x \\to 0} (2x + \\Delta x) = 2x",
        explanation: "Take the limit as Δx reaches 0. At x=1, the slope is exactly 2!",
        deltaX: 0.01
      }
    ]
  },

  binary_search: {
    id: 'binary_search',
    title: 'Binary Search: Why O(log n)?',
    category: 'Computer Science',
    icon: 'Binary',
    overview: 'Deriving logarithmic complexity by cutting the problem space in half each iteration.',
    concepts: [
      { id: 'b1', name: 'Sorted Array Indexing', status: 'mastered', description: 'Constant time lookup by index' },
      { id: 'b2', name: 'Middle Pointer Calculation', status: 'mastered', description: 'mid = left + (right - left) // 2' },
      { id: 'b3', name: 'Interval Elimination', status: 'current', description: 'Eliminating n/2 elements on each comparison' },
      { id: 'b4', name: 'Logarithmic Proof', status: 'next', description: 'Solving n / 2^k = 1 for k = log2(n)' }
    ],
    initialMode: 'guided_practice',
    initialTeacherSpeech: "Notice our sorted array of 10 elements. If we are searching for 18, we inspect the middle element. Since 18 is greater than 12, we can eliminate the entire left half with a single comparison!",
    socraticSuggestions: [
      "Why must the array be sorted for binary search to work?",
      "How many steps does it take if the array has 1,000,000 items?",
      "Step through the debugger line-by-line",
      "What is the worst-case scenario when the target is missing?"
    ],
    starterCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    steps = 0

    while left <= right:
        steps += 1
        mid = (left + right) // 2
        mid_val = arr[mid]
        
        if mid_val == target:
            return mid, steps
        elif mid_val < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1, steps

# Try searching for target 18 in sorted array:
data = [1, 3, 5, 7, 9, 12, 15, 18, 21, 25]
result, steps_taken = binary_search(data, 18)
print(f"Found target 18 at index {result} in {steps_taken} comparisons!")`,
    codeTraceSteps: [
      {
        line: 5,
        variables: { left: 0, right: 9, steps: 1, mid: 4, "arr[mid]": 9, target: 18 },
        explanation: "Step 1: mid = 4 (value 9). 9 < 18, eliminate indices 0..4."
      },
      {
        line: 12,
        variables: { left: 5, right: 9, steps: 2, mid: 7, "arr[mid]": 18, target: 18 },
        explanation: "Step 2: mid = 7 (value 18). Match found! Total comparisons: 2."
      }
    ]
  },

  physics_projectile: {
    id: 'physics_projectile',
    title: 'Kinematics: 2D Projectile Trajectory',
    category: 'Physics',
    icon: 'Compass',
    overview: 'Exploring how horizontal and vertical velocity components evolve independently under constant gravitational acceleration.',
    concepts: [
      { id: 'p1', name: 'Velocity Vectors', status: 'mastered', description: 'Decomposing v0 into vx and vy' },
      { id: 'p2', name: 'Constant Horizontal Motion', status: 'mastered', description: 'ax = 0 -> x(t) = v0 * cos(theta) * t' },
      { id: 'p3', name: 'Vertical Gravitational Arc', status: 'current', description: 'ay = -g -> y(t) = v0*sin(theta)*t - 0.5*g*t^2' },
      { id: 'p4', name: 'Optimal Angle for Max Range', status: 'next', description: 'Deriving theta = 45 degrees' }
    ],
    initialMode: 'demonstration',
    initialTeacherSpeech: "Notice how gravity only acts downward on the y-axis, while horizontal velocity remains completely unchanged in a vacuum. Let's adjust the launch angle and fire!",
    socraticSuggestions: [
      "Why does a launch angle of 45° maximize range in a vacuum?",
      "What would happen to the arc on the Moon where g = 1.62 m/s²?",
      "Double the initial velocity and observe what happens to flight time",
      "Show the velocity vector tangent to the trajectory"
    ],
    defaultParams3D: {
      angle: 45,
      velocity: 28,
      gravity: 9.8
    }
  }
};
