// Persisting the current character across reloads, and migrating characters
// saved before background editing shipped.

const STORAGE_KEY = "bsh-chargen-character";

function saveCharacter(character) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  } catch {
    // Private browsing, full storage, etc. — losing persistence isn't
    // worth breaking generation over.
  }
}

function loadSavedCharacter() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Characters saved before background editing shipped predate baseAttributes
// and per-slot slotType. Both are exactly reconstructable rather than lost:
// base scores by reversing each background's known +1 bonus, slot type from
// pickBackgrounds' fixed ordering (the two origin-tied picks always come
// before the free pick).
function migrateCharacter(saved) {
  if (!saved.baseAttributes) {
    const baseAttributes = { ...saved.attributes };
    for (const bg of saved.backgrounds) baseAttributes[bg.bonus] -= 1;
    saved.baseAttributes = baseAttributes;
  }
  saved.backgrounds = saved.backgrounds.map((bg, i) => ({
    ...bg,
    slotType: bg.slotType ?? (i < 2 ? "origin" : "free"),
  }));
  return saved;
}
