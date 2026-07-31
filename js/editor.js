// Pure functions supporting post-generation edits: what's legal to swap in,
// whether the current picks are still legal, and how to re-derive subsystems
// after a background changes. None of these touch app state — see main.js
// for the stateful apply functions that call them.

// Legal replacements for one background slot: an origin-tied slot may only
// draw from that origin's own list; the free slot may draw from any origin.
// Always excludes names already used in another slot, and unique backgrounds
// if another slot already holds one (SRD p.8: "cannot take two... unique").
function eligibleBackgrounds(originName, backgrounds, slotIndex) {
  const slot = backgrounds[slotIndex];
  const chosenNames = backgrounds.map((bg) => bg.name);
  const hasUniqueElsewhere = backgrounds.some((bg, i) => i !== slotIndex && bg.unique);
  const pool = slot.slotType === "origin" ? BACKGROUNDS[originName] : Object.values(BACKGROUNDS).flat();
  return pool.filter(
    (bg) => (bg.name === slot.name || !chosenNames.includes(bg.name)) && (!hasUniqueElsewhere || !bg.unique)
  );
}

// True once an origin change leaves an origin-tied slot holding a background
// that origin no longer offers. Flagged, not prevented — the player decides
// whether to fix it.
function isBackgroundIllegal(originName, backgroundSlot) {
  if (backgroundSlot.slotType !== "origin") return false;
  return !BACKGROUNDS[originName].some((bg) => bg.name === backgroundSlot.name);
}

// Re-derives subsystems after a background edit without re-rolling ones the
// player already has and didn't touch: kept if their granting background is
// still present, freshly rolled only for a newly-granted one, dropped if
// their granting background is gone.
function updateSubsystems(existingSubsystems, oldBackgrounds, newBackgrounds) {
  const oldNames = new Set(oldBackgrounds.map((bg) => bg.name));
  const newNames = new Set(newBackgrounds.map((bg) => bg.name));

  const kept = existingSubsystems.filter((sub) => {
    const grantingName = Object.keys(SUBSYSTEMS_BY_BACKGROUND).find(
      (name) => SUBSYSTEMS_BY_BACKGROUND[name].label === sub.label
    );
    return newNames.has(grantingName);
  });

  const added = newBackgrounds
    .filter((bg) => !oldNames.has(bg.name) && SUBSYSTEMS_BY_BACKGROUND[bg.name])
    .map((bg) => rollSubsystem(SUBSYSTEMS_BY_BACKGROUND[bg.name]));

  return [...kept, ...added];
}
