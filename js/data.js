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

// Backgrounds per origin, per SRD p.8-9. "unique" backgrounds can't be combined with each other.
const BACKGROUNDS = {
  Barbarian: [
    { name: "Berserker", unique: true, bonus: "STR", effect: "When you go berserk, add a d6 to the damage you deal. The damage you receive is divided by 2. Your rage stops when you roll a 1 on the d6. You need a long rest to be able to go berserk again." },
    { name: "Chieftain", unique: false, bonus: "STR", effect: "You can use Strength instead of Charisma when trying to intimidate someone." },
    { name: "Herbalist", unique: false, bonus: "INT", effect: "You can create d6 doses of healing balm (each one restores d6 + Level HP), hallucinogenic drugs, or poison (d6 damage per dose). You need a long rest close to nature to replenish your stock." },
    { name: "Hunter", unique: false, bonus: "DEX", effect: "In combat your first arrow always hits, and you add your level to its damage." },
    { name: "Raider", unique: false, bonus: "STR", effect: "When you get a critical success on an attack roll, you inflict damage equal to your Strength score (no need to roll the damage)." },
    { name: "Scout", unique: false, bonus: "WIS", effect: "You get Advantage on your Initiative rolls." },
    { name: "Shaman", unique: false, bonus: "WIS", effect: "You have made a pact with two spirits (see p. 29)." },
    { name: "Storyteller", unique: false, bonus: "CHA", effect: "You always know d4 interesting things about objects, places, or people (one roll per session). While you tell a story, your audience doesn't notice what happens Nearby." },
    { name: "Survivor", unique: false, bonus: "CON", effect: "It takes you d6 minutes to find something that can be used as a knife or club." },
    { name: "Wildling", unique: false, bonus: "CON", effect: "You can take a long rest anywhere, regardless of the situation." },
  ],
  Civilised: [
    { name: "Bodyguard", unique: false, bonus: "CON", effect: "If you use an action to protect a Close character during your turn, you absorb any damage from attacks against them, but you divide it by two (rounded up)." },
    { name: "Bookworm", unique: false, bonus: "INT", effect: "You can substitute any attribute test with an INT test (explain how and why your knowledge helps you). Replenishes after a long rest." },
    { name: "Diplomat", unique: false, bonus: "CHA", effect: "You know two additional languages (see p. 25) and can make yourself understood by anyone willing to do so. If all you do is talk you can act first at the beginning of any combat Turn." },
    { name: "Inventor", unique: true, bonus: "INT", effect: "You know how to build two scientific marvels (see p. 44)." },
    { name: "Legionnaire", unique: false, bonus: "STR", effect: "You are used to fighting in groups. Three times per session, a Nearby ally can re-roll a failed dodge, parry, or attack roll." },
    { name: "Sophist", unique: false, bonus: "CHA", effect: "You can make someone believe a blatant lie if you succeed at a CHA test. The \"effect\" lasts one hour. Works once per session." },
    { name: "Street urchin", unique: false, bonus: "DEX", effect: "Get Advantage on actions involving stealth, pick-pocketing, eavesdropping, and streetwise." },
    { name: "Surgeon", unique: false, bonus: "INT", effect: "Make an INT test when attending someone with 0 HP. They roll a d4 on the Helpless table instead of a d6 if you succeed." },
    { name: "Sword master", unique: false, bonus: "DEX", effect: "You can use DEX instead of STR when making a melee attacks with one-handed bladed weapons." },
  ],
  Decadent: [
    { name: "Assassin", unique: true, bonus: "DEX", effect: "Your first attack against an unaware target is an automatic hit that deals damage equal to your Dexterity score." },
    { name: "Changeling", unique: false, bonus: "CHA", effect: "You were abducted as a baby and raised by very different folk. Choose two faerie ties (see p. 42)." },
    { name: "Forbidden knowledge", unique: false, bonus: "INT", effect: "You start the game with 4 randomly selected spells (see p. 38)." },
    { name: "Pit-fighter", unique: false, bonus: "STR", effect: "Your unarmed damage is equal to your weapon damage." },
    { name: "Snake blood", unique: false, bonus: "CON", effect: "You're immune to poisons and venoms." },
    { name: "Vicious", unique: false, bonus: "STR", effect: "Your weapon damage die is now d8 (d6 unarmed)." },
    { name: "Warlock", unique: false, bonus: "CHA", effect: "You have a pact with two demons (see p. 34)." },
  ],
};
