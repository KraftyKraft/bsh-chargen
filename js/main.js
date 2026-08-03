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

// The origin-tied weapon's table is defined entirely by the origin, so any
// origin change — pick or reroll alike — rerolls it too; left alone, it'd
// otherwise silently sit on a table that isn't even the current origin
// anymore, with no "Illegal" flag (unlike backgrounds) to ever catch it.
function setOrigin(newOriginName) {
  character.origin = { name: newOriginName, story: rollOriginStory(newOriginName) };
  character.equipment.coins = STARTING_COINS[newOriginName];
  character.equipment.ownWeapon = rollWeapon(newOriginName);
}

function applyOriginChange(newOriginName) {
  setOrigin(newOriginName);
  editingTarget = null;
  rerender();
  saveCharacter(character);
}

function rerollOrigin() {
  applyOriginChange(ORIGIN_NAMES[rollDie(ORIGIN_NAMES.length) - 1]);
}

// Rerolls only the flavor story, independent of origin — same relationship
// as the origin-table weapon roll: tied to the current origin, no separate
// pick UI of its own.
function rerollOriginStory() {
  character.origin = { ...character.origin, story: rollOriginStory(character.origin.name) };
  saveCharacter(character);
  rerender();
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

// weaponName is "" for the "No weapon" option — find() then yields undefined,
// which the ?? null normalizes to the same null the random rolls use.
function applyOwnWeaponChange(weaponName) {
  character.equipment.ownWeapon = WEAPONS[character.origin.name].find((w) => w.name === weaponName) ?? null;
  editingTarget = null;
  rerender();
  saveCharacter(character);
}

function applyChoiceWeaponChange(weaponName) {
  character.equipment.choiceWeapon = ALL_WEAPONS.find((w) => w.name === weaponName) ?? null;
  editingTarget = null;
  rerender();
  saveCharacter(character);
}

function rerollOwnWeapon() {
  character.equipment.ownWeapon = rollWeapon(character.origin.name);
  saveCharacter(character);
  rerender();
}

// Uniform over every weapon plus one "no weapon" outcome — matching the
// dropdown's full-table-combined scope, now that the choice slot isn't tied
// to a single stored table anymore.
function rerollChoiceWeapon() {
  const pool = [...ALL_WEAPONS, null];
  character.equipment.choiceWeapon = pool[rollDie(pool.length) - 1];
  saveCharacter(character);
  rerender();
}

// Rerolls one subsystem item slot, respecting the same distinctness rule as
// the original roll (no two items in one subsystem share a name). Spells are
// rerolled through the actual weighted d100 table (rollSpell, with a retry
// on collision) so a reroll doesn't quietly flatten the SRD's odds to
// uniform — the other four subsystem tables were already uniform picks.
function rerollSubsystemItem(subsystemIndex, itemIndex) {
  const subsystem = character.subsystems[subsystemIndex];
  const config = subsystemConfigFor(subsystem.label);
  const otherNames = subsystem.items.filter((_, i) => i !== itemIndex).map((item) => item.name);

  let picked;
  if (config.weighted) {
    do {
      picked = rollSpell();
    } while (otherNames.includes(picked.name));
  } else {
    const pool = eligibleSubsystemItems(subsystem, itemIndex);
    picked = pool[rollDie(pool.length) - 1];
  }

  subsystem.items[itemIndex] = picked;
  saveCharacter(character);
  rerender();
}

function applySubsystemItemChange(subsystemIndex, itemIndex, newItemName) {
  const subsystem = character.subsystems[subsystemIndex];
  const picked = eligibleSubsystemItems(subsystem, itemIndex).find((entry) => entry.name === newItemName);
  if (picked) subsystem.items[itemIndex] = picked;
  editingTarget = null;
  rerender();
  saveCharacter(character);
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

// A background reroll is applyBackgroundChange with a random pick from the
// same eligible pool the dropdown offers — same origin-tied/free and
// distinctness rules, including "fixing" a currently-Illegal slot by landing
// on a legal pick, since the illegal name is never in that pool.
function rerollBackground(index) {
  const pool = eligibleBackgrounds(character.origin.name, character.backgrounds, index);
  applyBackgroundChange(index, pool[rollDie(pool.length) - 1].name);
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

  const rerollOriginBtn = document.getElementById("reroll-origin-btn");
  if (rerollOriginBtn) rerollOriginBtn.onclick = rerollOrigin;

  const rerollOriginStoryBtn = document.getElementById("reroll-origin-story-btn");
  if (rerollOriginStoryBtn) rerollOriginStoryBtn.onclick = rerollOriginStory;

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

  const ownWeaponBtn = document.getElementById("own-weapon-edit-btn");
  if (ownWeaponBtn) {
    ownWeaponBtn.onclick = () => {
      editingTarget = { kind: "ownWeapon" };
      rerender();
    };
  }

  const ownWeaponSelect = document.getElementById("own-weapon-select");
  if (ownWeaponSelect) {
    ownWeaponSelect.onchange = (e) => applyOwnWeaponChange(e.target.value);
    ownWeaponSelect.onblur = () => {
      if (editingTarget?.kind === "ownWeapon") applyOwnWeaponChange(ownWeaponSelect.value);
    };
  }

  const rerollChoiceBtn = document.getElementById("reroll-choice-weapon-btn");
  if (rerollChoiceBtn) rerollChoiceBtn.onclick = rerollChoiceWeapon;

  const choiceWeaponBtn = document.getElementById("choice-weapon-edit-btn");
  if (choiceWeaponBtn) {
    choiceWeaponBtn.onclick = () => {
      editingTarget = { kind: "choiceWeapon" };
      rerender();
    };
  }

  const choiceWeaponSelect = document.getElementById("choice-weapon-select");
  if (choiceWeaponSelect) {
    choiceWeaponSelect.onchange = (e) => applyChoiceWeaponChange(e.target.value);
    choiceWeaponSelect.onblur = () => {
      if (editingTarget?.kind === "choiceWeapon") applyChoiceWeaponChange(choiceWeaponSelect.value);
    };
  }

  document.querySelectorAll("[data-bg-reroll]").forEach((btn) => {
    const index = Number(btn.dataset.bgReroll);
    btn.onclick = () => rerollBackground(index);
  });

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

  document.querySelectorAll("[data-subsystem-reroll]").forEach((btn) => {
    const subsystemIndex = Number(btn.dataset.subsystemIndex);
    const itemIndex = Number(btn.dataset.itemIndex);
    btn.onclick = () => rerollSubsystemItem(subsystemIndex, itemIndex);
  });

  document.querySelectorAll("[data-subsystem-edit]").forEach((btn) => {
    const subsystemIndex = Number(btn.dataset.subsystemIndex);
    const itemIndex = Number(btn.dataset.itemIndex);
    btn.onclick = () => {
      editingTarget = { kind: "subsystemItem", subsystemIndex, itemIndex };
      rerender();
    };
  });

  document.querySelectorAll("[data-subsystem-select]").forEach((select) => {
    const subsystemIndex = Number(select.dataset.subsystemIndex);
    const itemIndex = Number(select.dataset.itemIndex);
    select.onchange = (e) => applySubsystemItemChange(subsystemIndex, itemIndex, e.target.value);
    // Same reselect-same-value case as the origin/background selects above.
    select.onblur = () => {
      if (
        editingTarget?.kind === "subsystemItem" &&
        editingTarget.subsystemIndex === subsystemIndex &&
        editingTarget.itemIndex === itemIndex
      ) {
        applySubsystemItemChange(subsystemIndex, itemIndex, select.value);
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
  } else if (editingTarget.kind === "ownWeapon") {
    applyOwnWeaponChange(document.getElementById("own-weapon-select").value);
  } else if (editingTarget.kind === "choiceWeapon") {
    applyChoiceWeaponChange(document.getElementById("choice-weapon-select").value);
  } else if (editingTarget.kind === "subsystemItem") {
    const select = document.querySelector(
      `[data-subsystem-select][data-subsystem-index="${editingTarget.subsystemIndex}"][data-item-index="${editingTarget.itemIndex}"]`
    );
    applySubsystemItemChange(editingTarget.subsystemIndex, editingTarget.itemIndex, select.value);
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
