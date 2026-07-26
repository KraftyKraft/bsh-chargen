function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollAttributes() {
  const attributes = {};
  for (const name of ATTRIBUTE_NAMES) {
    const roll = rollDie(6) + rollDie(6);
    attributes[name] = attributeScoreFor2d6(roll);
  }
  return attributes;
}

function rollOrigin() {
  const name = ORIGIN_NAMES[rollDie(ORIGIN_NAMES.length) - 1];
  const stories = ORIGINS[name];
  const story = stories[rollDie(stories.length) - 1];
  return { name, story };
}

// Removes and returns one random element from the array.
function takeRandom(list) {
  const index = rollDie(list.length) - 1;
  return list.splice(index, 1)[0];
}

// Two backgrounds tied to origin + one from any list; no two "unique" backgrounds. SRD p.8.
function pickBackgrounds(originName) {
  const originPool = [...BACKGROUNDS[originName]];
  const chosen = [takeRandom(originPool), takeRandom(originPool)];

  const hasUnique = chosen.some((bg) => bg.unique);
  const anyPool = Object.values(BACKGROUNDS)
    .flat()
    .filter((bg) => !chosen.includes(bg) && (!hasUnique || !bg.unique));
  chosen.push(takeRandom(anyPool));

  return chosen;
}

function applyBackgroundBonuses(attributes, backgrounds) {
  const boosted = { ...attributes };
  for (const bg of backgrounds) {
    boosted[bg.bonus] += 1;
  }
  return boosted;
}

// Picks `count` distinct entries from a plain table (no replacement).
function takeRandomDistinct(table, count) {
  const pool = [...table];
  const picked = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    picked.push(takeRandom(pool));
  }
  return picked;
}

// Rolls d100 against the SRD's weighted spell ranges (p.17-19).
function rollSpell() {
  const roll = rollDie(100);
  return SPELLS.find((spell) => roll >= spell.min && roll <= spell.max);
}

// Forces distinct spells rather than allowing RAW duplicate d100 rolls (see user decision).
function rollDistinctSpells(count) {
  const chosen = [];
  while (chosen.length < count) {
    const spell = rollSpell();
    if (!chosen.includes(spell)) chosen.push(spell);
  }
  return chosen;
}

// Backgrounds like Warlock or Shaman unlock a Dark Pacts subsystem (SRD ch.6).
function rollSubsystems(backgrounds) {
  const subsystems = [];
  for (const bg of backgrounds) {
    const config = SUBSYSTEMS_BY_BACKGROUND[bg.name];
    if (!config) continue;
    const items = config.weighted
      ? rollDistinctSpells(config.count)
      : takeRandomDistinct(config.table, config.count);
    subsystems.push({ label: config.label, items });
  }
  return subsystems;
}

function generateCharacter() {
  const origin = rollOrigin();
  const backgrounds = pickBackgrounds(origin.name);
  const attributes = applyBackgroundBonuses(rollAttributes(), backgrounds);
  const subsystems = rollSubsystems(backgrounds);

  return {
    attributes,
    origin,
    backgrounds,
    subsystems,
    hp: attributes.CON,
    doom: "d6",
  };
}
