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

function renderCharacter(character) {
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
    .map((bg) => effectBlock(bg.name, `+1 ${bg.bonus}`, bg.effect))
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
    <div class="sheet-row">
      <span class="label">Origin</span>
      <span class="value">${character.origin.name}</span>
    </div>
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
}

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

document.getElementById("generate").addEventListener("click", () => {
  const character = generateCharacter();
  renderCharacter(character);
  saveCharacter(character);
});

document.getElementById("print").addEventListener("click", () => {
  window.print();
});

const savedCharacter = loadSavedCharacter();
if (savedCharacter) {
  renderCharacter(savedCharacter);
}
