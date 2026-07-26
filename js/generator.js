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

function generateCharacter() {
  const attributes = rollAttributes();

  return {
    attributes,
    origin: "TBD",
    backgrounds: ["TBD", "TBD", "TBD"],
    hp: attributes.CON,
    doom: "d6",
  };
}
