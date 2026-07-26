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

function generateCharacter() {
  const attributes = rollAttributes();
  const origin = rollOrigin();

  return {
    attributes,
    origin,
    backgrounds: ["TBD", "TBD", "TBD"],
    hp: attributes.CON,
    doom: "d6",
  };
}
