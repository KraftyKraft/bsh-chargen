// Pure "character (+ what's mid-edit) -> HTML" rendering. No app state lives
// here — renderCharacter takes everything it needs as arguments, and calls
// out to main.js's attachEditHandlers() at the end to rewire the interactive
// bits innerHTML just replaced.

// Builds one combined regex (named group per GLOSSARY entry) so the source text
// is scanned in a single pass — the inserted tooltip markup is never re-scanned.
const GLOSSARY_PATTERN = new RegExp(
  GLOSSARY.map((entry) => `(?<${entry.key}>${entry.pattern})`).join("|"),
  "g"
);

function glossaryIcon(match, entry) {
  return `${match}<span class="info-icon" tabindex="0">?<span class="tooltip-text"><strong>${entry.term}</strong> ${entry.text} <em>(SRD p.${entry.page})</em></span></span>`;
}

// Appends a "?" tooltip icon after any glossary term found in the text. Safe to
// call on any string — text with no matches is returned unchanged.
function withGlossary(text) {
  return String(text).replace(GLOSSARY_PATTERN, (match, ...rest) => {
    const groups = rest[rest.length - 1];
    const entry = GLOSSARY.find((g) => groups[g.key] !== undefined);
    return glossaryIcon(match, entry);
  });
}

function effectBlock(name, meta, effect) {
  return `
    <div class="background-block">
      <span class="background-name">${withGlossary(name)}${meta ? ` <span class="bonus">(${withGlossary(meta)})</span>` : ""}</span>
      <span class="background-effect">${withGlossary(effect)}</span>
    </div>`;
}

function equipmentText(equipment) {
  const weaponNames = equipment.weapons.map(
    (w) => w.name + (w.twoHanded ? " (two-handed)" : "")
  );
  if (weaponNames.length === 0) return "A set of clothes. No weapons.";
  return `A set of clothes, ${weaponNames.join(", ")}.`;
}

// Renders the Origin row as either its static value (with a button to start
// editing) or, while editingTarget targets it, a <select> of every origin.
function originRow(character, editingTarget) {
  if (editingTarget?.kind === "origin") {
    const options = ORIGIN_NAMES.map(
      (name) => `<option value="${name}" ${name === character.origin.name ? "selected" : ""}>${name}</option>`
    ).join("");
    return `
    <div class="sheet-row">
      <span class="label">Origin</span>
      <select class="edit-select" id="origin-select">${options}</select>
    </div>`;
  }
  return `
    <div class="sheet-row">
      <span class="label">Origin</span>
      <span class="value">${character.origin.name}<button class="edit-btn" id="origin-edit-btn" aria-label="Change origin">&#9998;</button></span>
    </div>`;
}

// Renders one background slot as either its static effect block (with a
// button to start editing, and an Illegal badge if an origin change has
// invalidated it) or, while editingTarget targets it, a <select> of every
// legal replacement for that specific slot (see eligibleBackgrounds).
function backgroundBlock(character, editingTarget, index) {
  const bg = character.backgrounds[index];

  if (editingTarget?.kind === "background" && editingTarget.index === index) {
    const options = eligibleBackgrounds(character.origin.name, character.backgrounds, index)
      .map(
        (opt) =>
          `<option value="${opt.name}" ${opt.name === bg.name ? "selected" : ""}>${opt.name} (+1 ${opt.bonus}${opt.unique ? ", unique" : ""})</option>`
      )
      .join("");
    return `
    <div class="background-block">
      <select class="edit-select" data-bg-select="${index}">${options}</select>
    </div>`;
  }

  const illegalBadge = isBackgroundIllegal(character.origin.name, bg)
    ? `<span class="illegal-badge">Illegal</span>`
    : "";
  const uniqueSuffix = bg.unique ? ", unique" : "";

  return `
    <div class="background-block">
      <span class="background-name">${withGlossary(bg.name)} <span class="bonus">(+1 ${withGlossary(bg.bonus)}${uniqueSuffix})</span> ${illegalBadge}<button class="edit-btn" data-bg-edit="${index}" aria-label="Change ${bg.name}">&#9998;</button></span>
      <span class="background-effect">${withGlossary(bg.effect)}</span>
    </div>`;
}

function renderCharacter(character, editingTarget = null) {
  const sheet = document.getElementById("sheet");

  const attrRows = Object.entries(character.attributes)
    .map(
      ([name, score]) => `
      <div class="attribute">
        <span class="name">${name}</span>
        <span class="score">${score}</span>
      </div>`
    )
    .join("");

  const backgroundBlocks = character.backgrounds
    .map((_, i) => backgroundBlock(character, editingTarget, i))
    .join("");

  // Wrapped in .section (rather than left as flat siblings of .sheet) so print
  // pagination keeps a whole group's label with its items — see break-inside
  // in the print stylesheet.
  const backgroundsSection = `
    <div class="section">
      <div class="sheet-row">
        <span class="label">Backgrounds</span>
      </div>
      ${backgroundBlocks}
    </div>`;

  // Only rendered when a background (e.g. Warlock, Shaman) unlocks a Dark Pacts subsystem.
  const subsystemBlocks = character.subsystems
    .map(
      (sub) => `
      <div class="section">
        <div class="sheet-row">
          <span class="label">${withGlossary(sub.label)}</span>
        </div>
        ${sub.items.map((item) => effectBlock(item.name, item.meta, item.effect)).join("")}
      </div>`
    )
    .join("");

  sheet.innerHTML = `
    <div class="attributes">${attrRows}</div>
    ${originRow(character, editingTarget)}
    <div class="sheet-row">
      <span class="label">Born...</span>
      <span class="value">${withGlossary(character.origin.story)}</span>
    </div>
    ${backgroundsSection}
    ${subsystemBlocks}
    <div class="sheet-row">
      <span class="label">Coins</span>
      <span class="value">${character.equipment.coins}</span>
    </div>
    <div class="sheet-row">
      <span class="label">Equipment</span>
      <span class="value">${withGlossary(equipmentText(character.equipment))}</span>
    </div>
    <div class="sheet-row">
      <span class="label">Damage</span>
      <span class="value">${character.damage.weapon} weapon, ${character.damage.unarmed} unarmed</span>
    </div>
    <div class="sheet-row">
      <span class="label">HP</span>
      <span class="value">${character.hp}</span>
    </div>
    <div class="sheet-row">
      <span class="label">${withGlossary("Doom")}</span>
      <span class="value">${character.doom}</span>
    </div>
  `;

  attachEditHandlers();
}
