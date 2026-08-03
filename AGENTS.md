# AGENTS.md

Notes for anyone (human or AI) working on this codebase, beyond what the code itself shows.

## What this is

A static, dependency-free character generator for *Black Sword Hack: Ultimate Chaos Edition*. Plain HTML/CSS/JS, no build step, no bundler, no backend. See `README.md` for the project pitch.

## File layout and load order

No module system — every file shares one global `<script>` scope, wired together purely by load order in `index.html`:

```
data.js → generator.js → editor.js → render.js → storage.js → main.js
```

- **`data.js`** — SRD tables only (origins, backgrounds, weapons, subsystems, glossary). No logic.
- **`generator.js`** — random-generation logic (rolling dice, picking from tables). No DOM, no app state.
- **`editor.js`** — pure validation/eligibility functions for post-generation edits (what's legal to swap in, whether a current pick is still legal). No side effects.
- **`render.js`** — pure "character (+ what's mid-edit) → HTML string" functions. No app state; takes everything as arguments.
- **`storage.js`** — `localStorage` persistence and migration of old saved-character shapes.
- **`main.js`** — the only file that holds app state (`character`, `editingTarget`) or touches the DOM's event listeners. The controller that ties the others together.

If you add a new file, add its `<script>` tag in `index.html` in the right place in this chain — functions are called at runtime, not at load time, so forward references between files work fine as long as everything's loaded before the first user interaction.

## Design philosophy: let the player break the rules

This is the single most load-bearing, least-obvious decision in the codebase. Every post-generation edit (attributes, origin, backgrounds, both weapon rolls, subsystem items) lets the player pick or reroll **anything**, with no validation blocking an SRD-illegal state. The one exception is a purely cosmetic "Illegal" badge on a background slot that no longer matches the current origin (see `isBackgroundIllegal` in `editor.js`) — informational, not preventive. Attributes have no such flag at all; any whole number is accepted.

When adding a new editable field, default to this pattern: let the player set it to anything, don't gate the UI on legality. If you're tempted to add a `confirm()` or disable a control because a choice looks wrong, that's very likely against the grain of this codebase — ask first.

## Editable-field UX pattern

Every editable field (origin, backgrounds, attributes, both weapon rolls, subsystem items) follows the same shape, established across several features — copy it rather than inventing a new one:

- A **reroll button** (↻) for an instant, no-confirmation random reroll.
- An **edit button** (✎) that swaps the static value for a `<select>` (or `<input>` for attributes).
- The edit closes on **blur or on any click outside it** — never on `change` alone. Reselecting the option that's already active fires neither `change` nor a reliable `blur` in every browser, so every closing path explicitly commits the control's live `.value`. See the document-level `click` listener at the bottom of `main.js`.
- `<input type="number">` silently sanitizes unparseable text to `""`, and `Number("")` is `0`, not `NaN` — always check for `""` explicitly before treating a value as valid (see `applyAttributeChange`).

## SRD fidelity

When porting a rule from the SRD into code or data, cite the page number in a comment (e.g. `// SRD p.9, p.12`). The SRD's web edition is at https://blackswordhack.github.io/. Several features here go a step further than strict RAW toward player agency (e.g. picking an exact weapon rather than just "a table of your choice") — that's a deliberate choice (see above), not a fidelity bug.

## Testing

There is no test framework. Changes are verified by hand in an actual browser (Chrome and Firefox, desktop and mobile viewports) — dropdown/reroll interactions, `localStorage` persistence across reload, and old-save migration in particular. Print/PDF layout can't be checked from on-screen CSS alone (`@page` margins and pagination don't apply to screen media) — use a headless Chrome print-to-PDF export to inspect real pagination when touching `css/style.css`'s `@media print` block.

A recurring gotcha when testing locally with a plain HTTP server: browsers cache JS/CSS aggressively across reloads of the same origin. If changes don't seem to take effect, serve from a fresh port rather than trusting a hard refresh.
