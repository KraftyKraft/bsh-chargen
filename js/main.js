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
      <span class="value">${character.backgrounds.join(", ")}</span>
    </div>
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
