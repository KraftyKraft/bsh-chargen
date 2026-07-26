// SRD tables (origins, backgrounds, equipment) live here.

const ATTRIBUTE_NAMES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

// 2d6 roll -> attribute score, per SRD p.6
function attributeScoreFor2d6(roll) {
  if (roll <= 3) return 8;
  if (roll <= 5) return 9;
  if (roll <= 7) return 10;
  if (roll <= 9) return 11;
  if (roll <= 11) return 12;
  return 13;
}
