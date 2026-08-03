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

// Renders one subsystem item slot as its static effect block (with reroll
// and edit buttons) or, while editingTarget targets it, a <select> of every
// legal replacement (see eligibleSubsystemItems — same distinctness rule as
// the original roll: no two items in one subsystem may share a name).
function subsystemItemBlock(character, editingTarget, subsystemIndex, itemIndex) {
  const subsystem = character.subsystems[subsystemIndex];
  const item = subsystem.items[itemIndex];
  const editing =
    editingTarget?.kind === "subsystemItem" &&
    editingTarget.subsystemIndex === subsystemIndex &&
    editingTarget.itemIndex === itemIndex;

  if (editing) {
    const options = eligibleSubsystemItems(subsystem, itemIndex)
      .map((opt) => `<option value="${opt.name}" ${opt.name === item.name ? "selected" : ""}>${opt.name}</option>`)
      .join("");
    return `
    <div class="background-block">
      <select class="edit-select" data-subsystem-select data-subsystem-index="${subsystemIndex}" data-item-index="${itemIndex}">${options}</select>
    </div>`;
  }

  return `
    <div class="background-block">
      <span class="background-name">${withGlossary(item.name)}${item.meta ? ` <span class="bonus">(${withGlossary(item.meta)})</span>` : ""}<button class="edit-btn" data-subsystem-reroll data-subsystem-index="${subsystemIndex}" data-item-index="${itemIndex}" aria-label="Reroll ${item.name}">&#8635;</button><button class="edit-btn" data-subsystem-edit data-subsystem-index="${subsystemIndex}" data-item-index="${itemIndex}" aria-label="Change ${item.name}">&#9998;</button></span>
      <span class="background-effect">${withGlossary(item.effect)}</span>
    </div>`;
}

function weaponLabel(weapon) {
  if (!weapon) return "no weapon";
  return weapon.name + (weapon.twoHanded ? " (two-handed)" : "");
}

// Renders the origin-table weapon roll: its result plus a reroll button. The
// table itself isn't editable here (SRD ties it to your origin) — only which
// result you got on it, unlike the choice-table roll below.
function ownWeaponRow(character) {
  return `
    <div class="sheet-row">
      <span class="label">Weapon <span class="bonus">(origin)</span></span>
      <span class="value">${weaponLabel(character.equipment.ownWeapon)}<button class="edit-btn" id="reroll-own-weapon-btn" aria-label="Reroll origin weapon">&#8635;</button></span>
    </div>`;
}

// Renders the "table of your choice" weapon roll (SRD p.9/29): its result
// with a reroll button (stays on the same table) and an edit button to pick
// a different table — or, while editingTarget targets it, a <select> of
// every origin's table. Unlike backgrounds there's no illegal state here —
// any table is always a legal choice.
function choiceWeaponRow(character, editingTarget) {
  const { choiceOrigin, choiceWeapon } = character.equipment;

  if (editingTarget?.kind === "weaponTable") {
    const options = ORIGIN_NAMES.map(
      (name) => `<option value="${name}" ${name === choiceOrigin ? "selected" : ""}>${name}</option>`
    ).join("");
    return `
    <div class="sheet-row">
      <span class="label">Weapon <span class="bonus">(choice)</span></span>
      <select class="edit-select" id="weapon-table-select">${options}</select>
    </div>`;
  }

  return `
    <div class="sheet-row">
      <span class="label">Weapon <span class="bonus">(choice, ${choiceOrigin})</span></span>
      <span class="value">${weaponLabel(choiceWeapon)}<button class="edit-btn" id="reroll-choice-weapon-btn" aria-label="Reroll choice weapon">&#8635;</button><button class="edit-btn" id="weapon-table-edit-btn" aria-label="Change choice weapon's table">&#9998;</button></span>
    </div>`;
}

// Renders one attribute box as either its static score (with a button to
// start editing) or, while editingTarget targets it, a plain number input.
// Unlike backgrounds there's no legality concept here — any whole number is
// accepted, by design (see applyAttributeChange for how it stays consistent
// with background bonuses).
function attributeBox(character, editingTarget, name) {
  const score = character.attributes[name];
  if (editingTarget?.kind === "attribute" && editingTarget.name === name) {
    return `
      <div class="attribute">
        <span class="name">${name}</span>
        <input type="number" step="1" class="edit-select attr-input" data-attr-select="${name}" value="${score}">
      </div>`;
  }
  return `
      <div class="attribute">
        <span class="name">${name}</span>
        <span class="score">${score}<button class="edit-btn" data-attr-edit="${name}" aria-label="Change ${name}">&#9998;</button></span>
      </div>`;
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
      <span class="value">${character.origin.name}<button class="edit-btn" id="reroll-origin-btn" aria-label="Reroll origin">&#8635;</button><button class="edit-btn" id="origin-edit-btn" aria-label="Change origin">&#9998;</button></span>
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
      <span class="background-name">${withGlossary(bg.name)} <span class="bonus">(+1 ${withGlossary(bg.bonus)}${uniqueSuffix})</span> ${illegalBadge}<button class="edit-btn" data-bg-reroll="${index}" aria-label="Reroll ${bg.name}">&#8635;</button><button class="edit-btn" data-bg-edit="${index}" aria-label="Change ${bg.name}">&#9998;</button></span>
      <span class="background-effect">${withGlossary(bg.effect)}</span>
    </div>`;
}

function renderCharacter(character, editingTarget = null) {
  const sheet = document.getElementById("sheet");

  const attrRows = Object.keys(character.attributes)
    .map((name) => attributeBox(character, editingTarget, name))
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
      (sub, subsystemIndex) => `
      <div class="section">
        <div class="sheet-row">
          <span class="label">${withGlossary(sub.label)}</span>
        </div>
        ${sub.items
          .map((_, itemIndex) => subsystemItemBlock(character, editingTarget, subsystemIndex, itemIndex))
          .join("")}
      </div>`
    )
    .join("");

  sheet.innerHTML = `
    <div class="attributes">${attrRows}</div>
    ${originRow(character, editingTarget)}
    <div class="sheet-row">
      <span class="label">Born...</span>
      <span class="value">${withGlossary(character.origin.story)}<button class="edit-btn" id="reroll-origin-story-btn" aria-label="Reroll origin story">&#8635;</button></span>
    </div>
    ${backgroundsSection}
    ${subsystemBlocks}
    <div class="sheet-row">
      <span class="label">Coins</span>
      <span class="value">${character.equipment.coins}</span>
    </div>
    <div class="sheet-row">
      <span class="label">Equipment</span>
      <span class="value">A set of clothes.</span>
    </div>
    ${ownWeaponRow(character)}
    ${choiceWeaponRow(character, editingTarget)}
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
