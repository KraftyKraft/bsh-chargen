// App state and event wiring — the only file that mutates the current
// character or touches the DOM's event listeners directly. Generation lives
// in generator.js, edit validation in editor.js, and rendering in render.js;
// this file is the controller that ties them together in response to clicks.

// The character currently on screen, and which single field (if any) is
// mid-edit. editingTarget is transient UI state — never saved.
let character = null;
let editingTarget = null;

function rerender() {
  if (character) renderCharacter(character, editingTarget);
}

function applyOriginChange(newOriginName) {
  character.origin = { name: newOriginName, story: rollOriginStory(newOriginName) };
  character.equipment.coins = STARTING_COINS[newOriginName];
  editingTarget = null;
  rerender();
  saveCharacter(character);
}

// Edits the displayed (final, post-bonus) score rather than the base roll,
// since that's what's actually on screen — then solves backward for what
// baseAttributes must be so a later background swap still reapplies bonuses
// correctly on top, instead of the edit silently drifting out of sync.
function applyAttributeChange(statName, rawValue) {
  // A number input silently sanitizes unparseable text to "" rather than
  // rejecting it, and Number("") is 0, not NaN — so "" must be checked for
  // explicitly, or garbage input would quietly apply as a score of 0. Empty
  // or otherwise invalid input is treated as a cancel: closes and reverts
  // to the unedited value, rather than applying anything or getting stuck.
  const newScore = Math.round(Number(rawValue));
  if (rawValue !== "" && Number.isFinite(newScore)) {
    const currentBonus = character.backgrounds.filter((bg) => bg.bonus === statName).length;
    character.baseAttributes[statName] = newScore - currentBonus;
    character.attributes = applyBackgroundBonuses(character.baseAttributes, character.backgrounds);
    character.hp = character.attributes.CON;
    saveCharacter(character);
  }

  editingTarget = null;
  rerender();
}

// Only rerolls if the table actually changed — reselecting the table you're
// already on (including via an idempotent outside-click close) leaves the
// existing roll alone, same as origin/background edits, rather than silently
// rerolling every time the edit UI is opened and closed. To reroll on the
// same table on purpose, see rerollOwnWeapon/rerollChoiceWeapon below.
function applyWeaponTableChange(newOriginName) {
  if (newOriginName !== character.equipment.choiceOrigin) {
    character.equipment.choiceOrigin = newOriginName;
    character.equipment.choiceWeapon = rollWeapon(newOriginName);
    saveCharacter(character);
  }
  editingTarget = null;
  rerender();
}

function rerollOwnWeapon() {
  character.equipment.ownWeapon = rollWeapon(character.origin.name);
  saveCharacter(character);
  rerender();
}

function rerollChoiceWeapon() {
  character.equipment.choiceWeapon = rollWeapon(character.equipment.choiceOrigin);
  saveCharacter(character);
  rerender();
}

function applyBackgroundChange(index, newBackgroundName) {
  const picked = eligibleBackgrounds(character.origin.name, character.backgrounds, index).find(
    (bg) => bg.name === newBackgroundName
  );
  if (!picked) return;

  const oldBackgrounds = character.backgrounds;
  const newBackgrounds = oldBackgrounds.map((bg, i) => (i === index ? { ...picked, slotType: bg.slotType } : bg));

  character.backgrounds = newBackgrounds;
  character.attributes = applyBackgroundBonuses(character.baseAttributes, newBackgrounds);
  character.hp = character.attributes.CON;
  character.subsystems = updateSubsystems(character.subsystems, oldBackgrounds, newBackgrounds);
  character.damage = calculateDamage(newBackgrounds);

  editingTarget = null;
  rerender();
  saveCharacter(character);
}

// innerHTML replacement drops all prior listeners each render, so this runs
// after every renderCharacter() call to rewire whatever's currently on screen.
function attachEditHandlers() {
  document.querySelectorAll("[data-attr-edit]").forEach((btn) => {
    btn.onclick = () => {
      editingTarget = { kind: "attribute", name: btn.dataset.attrEdit };
      rerender();
    };
  });

  document.querySelectorAll("[data-attr-select]").forEach((input) => {
    const name = input.dataset.attrSelect;
    input.onchange = (e) => applyAttributeChange(name, e.target.value);
    // Same reselect/re-enter-same-value case as the background selects below.
    input.onblur = () => {
      if (editingTarget?.kind === "attribute" && editingTarget.name === name) {
        applyAttributeChange(name, input.value);
      }
    };
  });

  const originBtn = document.getElementById("origin-edit-btn");
  if (originBtn) {
    originBtn.onclick = () => {
      editingTarget = { kind: "origin" };
      rerender();
    };
  }

  const originSelect = document.getElementById("origin-select");
  if (originSelect) {
    originSelect.onchange = (e) => applyOriginChange(e.target.value);
    // Reselecting the option that's already effectively active — including
    // the browser's own default of "first option" when an illegal
    // background means none of them match `selected` — fires neither
    // change nor input, since the value never moved. blur commits the
    // select's live value regardless, so closing the edit any way other
    // than a genuine change still locks in whatever's showing.
    originSelect.onblur = () => {
      if (editingTarget?.kind === "origin") applyOriginChange(originSelect.value);
    };
  }

  const rerollOwnBtn = document.getElementById("reroll-own-weapon-btn");
  if (rerollOwnBtn) rerollOwnBtn.onclick = rerollOwnWeapon;

  const rerollChoiceBtn = document.getElementById("reroll-choice-weapon-btn");
  if (rerollChoiceBtn) rerollChoiceBtn.onclick = rerollChoiceWeapon;

  const weaponTableBtn = document.getElementById("weapon-table-edit-btn");
  if (weaponTableBtn) {
    weaponTableBtn.onclick = () => {
      editingTarget = { kind: "weaponTable" };
      rerender();
    };
  }

  const weaponTableSelect = document.getElementById("weapon-table-select");
  if (weaponTableSelect) {
    weaponTableSelect.onchange = (e) => applyWeaponTableChange(e.target.value);
    weaponTableSelect.onblur = () => {
      if (editingTarget?.kind === "weaponTable") applyWeaponTableChange(weaponTableSelect.value);
    };
  }

  document.querySelectorAll("[data-bg-edit]").forEach((btn) => {
    btn.onclick = () => {
      editingTarget = { kind: "background", index: Number(btn.dataset.bgEdit) };
      rerender();
    };
  });

  document.querySelectorAll("[data-bg-select]").forEach((select) => {
    const index = Number(select.dataset.bgSelect);
    select.onchange = (e) => applyBackgroundChange(index, e.target.value);
    // Same reselect-same-value case as the origin select above.
    select.onblur = () => {
      if (editingTarget?.kind === "background" && editingTarget.index === index) {
        applyBackgroundChange(index, select.value);
      }
    };
  });
}

// Reselecting the currently-active option fires neither change nor blur
// reliably across browsers, so the primary way an edit closes is this: any
// click that lands outside the open <select> (and outside an edit button,
// which already manages its own transition) closes it — by committing the
// select's live value, same as blur above, not by discarding it. Attached
// once — document persists across #sheet's innerHTML rebuilds, unlike the
// per-render listeners in attachEditHandlers.
document.addEventListener("click", (e) => {
  if (!editingTarget) return;
  if (e.target.closest(".edit-select") || e.target.closest(".edit-btn")) return;
  if (editingTarget.kind === "origin") {
    applyOriginChange(document.getElementById("origin-select").value);
  } else if (editingTarget.kind === "attribute") {
    const input = document.querySelector(`[data-attr-select="${editingTarget.name}"]`);
    applyAttributeChange(editingTarget.name, input.value);
  } else if (editingTarget.kind === "weaponTable") {
    applyWeaponTableChange(document.getElementById("weapon-table-select").value);
  } else {
    const select = document.querySelector(`[data-bg-select="${editingTarget.index}"]`);
    applyBackgroundChange(editingTarget.index, select.value);
  }
});

document.getElementById("generate").addEventListener("click", () => {
  character = generateCharacter();
  editingTarget = null;
  rerender();
  saveCharacter(character);
});

document.getElementById("print").addEventListener("click", () => {
  window.print();
});

const savedCharacter = loadSavedCharacter();
if (savedCharacter) {
  character = migrateCharacter(savedCharacter);
  rerender();
}
