/**
 * MENTORA AI - FEW-SHOT EXAMPLES (Phase 3 Core Evolution)
 * 
 * Provides production-grade reference examples demonstrating the 4-Zone
 * Spatial Canvas Layout, word-level triggerPhrase synchronization, and DSA dry-runs.
 */

export const FEW_SHOT_PROMPT = `
### FEW-SHOT EXAMPLE 1: Binary Search (Array + Moving Pointers + Code Stepper + Recurrence)

Input Concept: "Binary Search"

Kinetic Timeline Output:
{
  "id": "tl_binary_search",
  "title": "Binary Search (O(log n))",
  "concept": "Data Structures & Algorithms",
  "totalDurationMs": 24000,
  "initialCamera": {
    "x": -300,
    "y": -220,
    "zoom": 1.15
  },
  "initialEntities": [
    {
      "id": "node_bottleneck",
      "type": "investigation_node",
      "title": "Search Space Invariant",
      "subtitle": "Linear scan O(n) vs Halving O(log n)",
      "categoryBadge": "Core Invariant",
      "metricLabel": "Search Space",
      "metricValue": "N → N / 2",
      "accentColor": "#38BDF8",
      "position": { "x": 260, "y": 220 }
    },
    {
      "id": "arr_sorted_memory",
      "type": "array",
      "title": "Sorted Array (Target: 23)",
      "elements": [
        { "value": 2, "state": "default" },
        { "value": 5, "state": "default" },
        { "value": 8, "state": "default" },
        { "value": 12, "state": "default" },
        { "value": 16, "state": "default" },
        { "value": 23, "state": "default" },
        { "value": 38, "state": "default" },
        { "value": 56, "state": "default" }
      ],
      "pointers": [
        { "id": "ptr_low", "name": "low", "targetIndex": 0, "color": "#38BDF8", "position": "top" },
        { "id": "ptr_high", "name": "high", "targetIndex": 7, "color": "#EF4444", "position": "top" },
        { "id": "ptr_mid", "name": "mid", "targetIndex": 3, "color": "#10B981", "position": "bottom" }
      ],
      "highlightRange": {
        "start": 0,
        "end": 7,
        "label": "Active Search Window",
        "color": "#38BDF8"
      },
      "position": { "x": 920, "y": 260 }
    },
    {
      "id": "code_stepper",
      "type": "code_trace",
      "title": "binary_search.py",
      "language": "python",
      "codeLines": [
        "def binary_search(nums, target):",
        "    low, high = 0, len(nums) - 1",
        "    while low <= high:",
        "        mid = (low + high) // 2",
        "        if nums[mid] == target:",
        "            return mid",
        "        elif nums[mid] < target:",
        "            low = mid + 1",
        "        else:",
        "            high = mid - 1",
        "    return -1"
      ],
      "activeLine": 2,
      "highlightedLines": [2, 3],
      "variableWatch": {
        "low": 0,
        "high": 7,
        "target": 23
      },
      "complexityBadge": {
        "time": "O(log n)",
        "space": "O(1)"
      },
      "position": { "x": 1620, "y": 340 }
    },
    {
      "id": "eq_recurrence",
      "type": "equation",
      "latex": "T(n) = T(n/2) + \\mathcal{O}(1) \\implies \\mathcal{O}(\\log n)",
      "explanation": "Master Theorem Case 2 Recurrence Proof",
      "colorMap": {
        "T(n)": "#38BDF8",
        "T(n/2)": "#F59E0B",
        "\\mathcal{O}(\\log n)": "#10B981"
      },
      "position": { "x": 920, "y": 840 }
    }
  ],
  "cues": [
    {
      "id": "cue_1",
      "timestampMs": 0,
      "durationMs": 5000,
      "narration": "In a sorted array, checking elements one by one takes linear time. But sorted order guarantees a powerful invariant: testing the midpoint eliminates an entire half.",
      "actions": [
        {
          "type": "camera",
          "panX": -260,
          "panY": -220,
          "zoom": 1.2,
          "durationMs": 1000,
          "triggerPhrase": "linear time"
        }
      ]
    },
    {
      "id": "cue_2",
      "timestampMs": 5000,
      "durationMs": 6000,
      "narration": "Notice how the mid pointer lands on index 3 with value 12. Since 12 is less than our target 23, we can eliminate the entire left subarray.",
      "actions": [
        {
          "type": "camera",
          "panX": -920,
          "panY": -260,
          "zoom": 1.25,
          "durationMs": 1000,
          "triggerPhrase": "mid pointer lands on index 3"
        },
        {
          "type": "array:mark_state",
          "targetId": "arr_sorted_memory",
          "indices": [0, 1, 2, 3],
          "state": "eliminated",
          "triggerPhrase": "eliminate the entire left subarray"
        },
        {
          "type": "array:move_pointer",
          "targetId": "arr_sorted_memory",
          "pointerId": "ptr_low",
          "targetIndex": 4,
          "triggerPhrase": "eliminate the entire left subarray"
        }
      ]
    },
    {
      "id": "cue_3",
      "timestampMs": 11000,
      "durationMs": 6000,
      "narration": "Follow the live code execution on line 8. We advance low to mid plus one, updating our variable watch instantly to low equals 4.",
      "actions": [
        {
          "type": "camera",
          "panX": -1620,
          "panY": -340,
          "zoom": 1.2,
          "durationMs": 1000,
          "triggerPhrase": "live code execution on line 8"
        },
        {
          "type": "code_trace:set_line",
          "targetId": "code_stepper",
          "activeLine": 8,
          "variableWatch": { "low": 4, "high": 7, "mid": 3, "nums[mid]": 12, "target": 23 },
          "highlightedLines": [7, 8],
          "triggerPhrase": "updating our variable watch instantly"
        }
      ]
    },
    {
      "id": "cue_4",
      "timestampMs": 17000,
      "durationMs": 7000,
      "narration": "Because every comparison divides the remaining search space by 2, the recurrence relation mathematically converges to logarithmic time complexity.",
      "actions": [
        {
          "type": "camera",
          "panX": -920,
          "panY": -840,
          "zoom": 1.2,
          "durationMs": 1200,
          "triggerPhrase": "recurrence relation mathematically converges"
        }
      ]
    }
  ]
}
`.trim();
