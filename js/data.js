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

// Origin story tables, per SRD p.6-8. Each entry completes "Your character was born..."
const ORIGINS = {
  Barbarian: [
    "in a slave camp.",
    "on an island just before the invaders came.",
    "during your clan's last raid.",
    "in an invading army's camp before you were kidnapped.",
    "under the harsh sun, in the territory of a desert tribe.",
    "in the hut of a banished druid.",
    "in a stone circle shunned by your people.",
    "among your Pict brothers and sisters after a bloody battle.",
    "aboard a longship filled with Northern raiders.",
    "nine months after a foreign mercenary married your mother.",
    "while the rest of the Iron Horde was attacking a caravan.",
    "in a civilized kingdom, but you were traded as a hostage.",
    "in a cave network ruled by strange insectoid creatures.",
    "in a palace, soon after raided by your adoptive tribe.",
    "on the night your clan burned the Empire's capital.",
    "in a forest clearing, denounced by the druids as a dark omen.",
    "on the last ship of a seafaring clan.",
    "inside a wicker statue about to be burned.",
    "on the foreign ship bringing your family back home.",
    "in the middle of a battle against your conquerors.",
  ],
  Civilised: [
    "in the city's worst slums.",
    "in the shadows of a theocracy.",
    "aboard a plague ship, somehow the only survivor.",
    "in a bustling mining town.",
    "during an expedition searching for a mythical city.",
    "on the street, as your family was fleeing revolutionary forces.",
    "in a foreign land after your parents' ship got wrecked.",
    "inside an invocation pentacle, near the sorcerer's body.",
    "on the prison island where the monarch's political opponents are sent.",
    "on the day the king was beheaded by your father.",
    "aboard a ship sent to find a new maritime route.",
    "in a military academy where your parents were teaching.",
    "in a fortress later burned by your family's enemies.",
    "in the biggest mansion of the city's merchant quarter.",
    "in the middle of a mercenary camp.",
    "in a secluded religious community.",
    "in the dilapidated manor of your ruined family.",
    "in an isolated farm on the frontier.",
    "in the richest palace of the Caliphate.",
    "in a hideout for the assassin's guild.",
  ],
  Decadent: [
    "in a jewelled tower, symbol of a corrupt empire.",
    "in the barracks of the slave soldiers.",
    "in a disreputable brothel of the City of Thieves.",
    "in the poppy fields owned by the Court's greatest sorcerer.",
    "in the necropolis where you were raised by ghosts.",
    "in a museum, as part of the permanent exhibition.",
    "in the ruins of a crystal palace.",
    "inside a monstrous creature killed by your adoptive parents.",
    "as a vessel for the soul of a dying noble. The ritual failed.",
    "in the last city of a dying species.",
    "covered with the blood of your own people after a failed invocation.",
    "in the arena's champion quarters.",
    "in the servants quarters of a vampire's tower.",
    "below the Empress's palace, among her slaves.",
    "in the desiccated gardens of a dying desert city.",
    "on a tropical island, just as it was beginning to sink.",
    "in an asylum deep within the Forbidden City.",
    "in the laboratory of the alchemist you called Father.",
    "at the top of a pyramid of red obsidian.",
    "in a hurricane summoned by your mother.",
  ],
};

const ORIGIN_NAMES = Object.keys(ORIGINS);
