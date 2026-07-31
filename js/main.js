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
