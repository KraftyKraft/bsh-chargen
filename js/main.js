function effectBlock(name, meta, effect) {
  return `
    <div class="background-block">
      <span class="background-name">${name}${meta ? ` <span class="bonus">(${meta})</span>` : ""}</span>
      <span class="background-effect">${effect}</span>
    </div>`;
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

  // Only rendered when a background (e.g. Warlock, Shaman) unlocks a Dark Pacts subsystem.
  const subsystemBlocks = character.subsystems
    .map(
      (sub) => `
      <div class="sheet-row">
        <span class="label">${sub.label}</span>
      </div>
      ${sub.items.map((item) => effectBlock(item.name, item.meta, item.effect)).join("")}`
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
      <span class="value">${character.origin.story}</span>
    </div>
    <div class="sheet-row">
      <span class="label">Backgrounds</span>
    </div>
    ${backgroundBlocks}
    ${subsystemBlocks}
    <div class="sheet-row">
      <span class="label">HP</span>
      <span class="value">${character.hp}</span>
    </div>
    <div class="sheet-row">
      <span class="label">Doom</span>
      <span class="value">${character.doom}</span>
    </div>
  `;
}

document.getElementById("generate").addEventListener("click", () => {
  renderCharacter(generateCharacter());
});
