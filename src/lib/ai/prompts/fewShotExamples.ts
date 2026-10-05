/**
 * MENTORA AI - FEW-SHOT EXAMPLES
 * 
 * Provides reference examples of high-fidelity kinetic timelines.
 */

export const FEW_SHOT_PROMPT = `
Example Concept: Binary Search
Target: Finding 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
Initial Entities:
- Array "arr_main" with 10 sorted elements, ptr_low at 0, ptr_high at 9, ptr_mid at 4.
- Card "card_status" with Range [0..9] and mid index 4.
Cues:
- Cue 1 (0ms): Introduce sorted array and pointers at 0 and 9. Show bracket callout.
- Cue 2 (5000ms): Calculate mid (index 4 = 16). Zoom camera to 1.15. Circle mid.
- Cue 3 (11000ms): 16 < 23. Eliminate range 0..4. Strike callout.
- Cue 4 (17500ms): Move ptr_low to index 5. Range is now [5..9].
- Cue 5 (24000ms): New mid at 7 (56). 23 < 56. Eliminate 7..9. High moves to 6.
- Cue 6 (29500ms): Mid at index 5 (23). Target found! State='found', green circle callout.
`.trim();
