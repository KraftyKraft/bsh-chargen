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

function generateCharacter() {
  const origin = rollOrigin();
  const backgrounds = pickBackgrounds(origin.name);
  const attributes = applyBackgroundBonuses(rollAttributes(), backgrounds);

  return {
    attributes,
    origin,
    backgrounds,
    hp: attributes.CON,
    doom: "d6",
  };
}
