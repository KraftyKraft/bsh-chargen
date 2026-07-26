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

// Starting coins by origin, per SRD p.9.
const STARTING_COINS = {
  Barbarian: 25,
  Civilised: 50,
  Decadent: 100,
};

// Base weapon/unarmed damage dice, per SRD p.9 (3.3.3). Vicious and Pit-fighter modify these.
const BASE_WEAPON_DAMAGE = "d6";
const BASE_UNARMED_DAMAGE = "d4";

// Weapon tables per origin, per SRD p.12. Roll d10: 1-9 map to the list, 10 = no weapon.
// Two-handed weapons (marked * in the SRD) give Advantage on damage rolls (p.5).
const WEAPONS = {
  Barbarian: [
    { name: "Bone bow", twoHanded: true },
    { name: "Chakram", twoHanded: false },
    { name: "Claymore", twoHanded: true },
    { name: "Hunting knife", twoHanded: false },
    { name: "Iwisa", twoHanded: false },
    { name: "Spear", twoHanded: true },
    { name: "Nomad scimitar", twoHanded: false },
    { name: "Raider's great axe", twoHanded: true },
    { name: "Warhammer", twoHanded: false },
  ],
  Civilised: [
    { name: "Cestus", twoHanded: false },
    { name: "Dagger", twoHanded: false },
    { name: "Engraved longbow", twoHanded: true },
    { name: "Executioner's cleaver", twoHanded: true },
    { name: "Flail", twoHanded: false },
    { name: "Katana", twoHanded: false },
    { name: "Legion gladius", twoHanded: false },
    { name: "Rapier", twoHanded: false },
    { name: "Pilgrim's staff", twoHanded: true },
  ],
  Decadent: [
    { name: "Blood metal sickle", twoHanded: false },
    { name: "Crossbow", twoHanded: true },
    { name: "Inquisitor's long sword", twoHanded: true },
    { name: "Maul", twoHanded: false },
    { name: "Razor whip", twoHanded: false },
    { name: "Rusted harpoon", twoHanded: false },
    { name: "Scythe", twoHanded: true },
    { name: "Shiv", twoHanded: false },
    { name: "Serrated sword", twoHanded: false },
  ],
};

// Dark Pacts subsystems (SRD ch.6, p.14-21) unlocked by specific backgrounds.

const DEMON_TYPES = [
  { name: "Abyss", effect: "The target becomes monstrous, misshapen, or disfigured; an object of fear and disgust for the next d6 hours. On a roll of 1 the effect is permanent." },
  { name: "Envy", effect: "The target tries to take a specific object of your choosing that is in its sight, by force if necessary. On a roll of 1, the object is a piece of your equipment." },
  { name: "Fear", effect: "You learn your target's deepest fear. On a roll of 1, they learn your deepest fear as well." },
  { name: "Greed", effect: "Creates 4d6 fake coins that will revert to their natural state (beans, rocks, whatever you had on hand) within one hour. On a roll of 1, the demon steals 4d6 coins from you (or your allies) as well." },
  { name: "Hate", effect: "Your target verbally abuses someone of your choosing for d6 minutes. On a roll of 1, you shout insults at your target as well." },
  { name: "Isolation", effect: "No one seems to care about the target: it can't be heard or seen for d6 hours. On a roll of 1, you cannot see them either." },
  { name: "Gluttony", effect: "Your target attacks (randomly selected) people and tries to eat them. It stops when they have eaten 2d6 HP worth of people. On a roll of 1, the target wants to eat you." },
  { name: "Nightmare", effect: "The target loses sleep for the night: all attribute tests made against them have Advantage on the following day. On a roll of 1, anger takes over and tests against the target are made with Disadvantage instead." },
  { name: "Oblivion", effect: "The target disappears from everyone's memories for the next d6 hours. On a roll of 1, the demon steals one Background from you as well. You will recover it after a long rest." },
  { name: "Ruin", effect: "Breaks a piece of equipment which can be up to the size of a cart. On a roll of 1, a piece of your own gear breaks as well." },
  { name: "Sloth", effect: "The target falls asleep. On a roll of 1, they never wake up." },
  { name: "Suspicion", effect: "Choose someone in sight as the object of your target's suspicions. On a roll of 1 you become the centre of the target's attention." },
  { name: "Wrath", effect: "The target becomes berserk and attacks everyone in sight, seeking to inflict pain rather than kill. On a roll of 1, you are affected as well." },
];

const SPIRIT_TYPES = [
  { name: "Ancestor spirit", effect: "The wise counsel of an ancestor gives you Advantage to one attribute test. You must possess an object that belonged to the ancestor to be able to summon them. On a roll of 1 the ancestor disapproves of your action and gives you Disadvantage instead." },
  { name: "Animal lord spirit", effect: "All animal species have an animal lord: a being representing all the qualities that animal possesses. The animal lord's subjects come to your help (but do not risk their lives doing so) or stop attacking you. On a roll of 1 the animals flee (or attack you if they are predators)." },
  { name: "Disease spirit", effect: "The target is plagued with a non-lethal but debilitating disease, forcing them to be bedridden until a proper cure is found. On a roll of 1 the disease is contagious." },
  { name: "Fire spirit", effect: "An existing fire can be manipulated: doubled in size, given any shape or form, moved around, etc. It can inflict d6 damage (and then Ud6 ongoing damage). A roll of 1 makes the target fire die." },
  { name: "Forest spirit", effect: "This spirit can help you find your way, food, water, or shelter when you're in a forest (or jungle or whatever wild environment you have in your campaign). It can also summon plants that will hinder your enemies (Advantage on attribute tests against them for one turn). A roll of 1 means the spirit makes sure you have a miserable time: no short or long rest for the next two days." },
  { name: "Hunger spirit", effect: "The target immediately searches for food and water and will not stop until it has eaten a full meal. A roll of 1 means the shaman is affected as well." },
  { name: "Pain spirit", effect: "Causing pain that prevents the target from acting for one Turn is a common use of this spirit. A roll of 1 means the shaman is afflicted at the same time." },
  { name: "River spirit", effect: "Water must be present and, as with a fire spirit, it can be manipulated in many ways: doubled in size, shaped, moved around, etc. On a roll of 1, the target body of water disappears." },
  { name: "Wind spirit", effect: "This spirit can be invoked to extinguish flames, dissipate toxic fumes, or even force humanoids to the ground. A result of 1 has the opposite effect: flames are fanned, toxic fumes move towards the shaman, etc." },
];

const FAERIE_TIES = [
  { name: "Barrow wisdom", effect: "You learned some rudimentary necromancy. You can speak with the dead, provided either their body or soul is nearby. The dead are rarely cooperative. They may demand a price, but you can also attempt to force them to do something or answer a question (WIS test required, decrease your Doom die)." },
  { name: "Cauldron of gold", effect: "You own a magical gold bezant (worth 100 coins) that always finds its way back to your purse after 1d8 dawns. It is part of a treasure of immense value towards which it could lead you, if only you knew the right charm..." },
  { name: "Changeling knowledge", effect: "As a human adopted by the fey, you learned all about (choose two): hunting and tracking, history and myth, courtly manners and intrigue, philosophy and metaphysics, strategy and tactics, metallurgy and mining, or some other subject (with the GM's approval). Roll with Advantage when making a test relevant to your area of expertise." },
  { name: "Cold iron weapon", effect: "You inherited, stole, or otherwise came into the possession of a legendary blade. It has a name and a legend, perhaps also a dark prophecy. It deals an extra d6 damage to all denizens of faerie." },
  { name: "Doomed to greatness", effect: "Once per day, you can roll your Doom die with Advantage. After you do so, it takes 1d3 long rests to go back to its maximum." },
  { name: "Dwarf deceit", effect: "You get Advantage when lying or sneaking with the intention to do harm." },
  { name: "Elfin secret", effect: "You learned how to (choose): speak to birds, make plants obey a one-word command, become invisible to mortals, enthral a lover, divine one's most secret desire, make (non-aggressive) mortals tremble with fear. If you use this secret more than once per day, roll your Doom." },
  { name: "Silversmith sorcerer", effect: "Your master taught you how to weave spells into your jewellery. Roll for two spells. You know how to bind them to one of your creations at the cost of 1d6 x 100 coins and 3d6 days of work. The bearer of one of your items can cast the spell as if they were a sorcerer." },
  { name: "Skinwalker", effect: "You know the spells needed to turn into an animal while wearing a specially prepared pelt. You can own two of these pelts at any time." },
  { name: "Trollish ruggedness", effect: "Add +1 to the protection of any type of armour you wear." },
  { name: "True faith", effect: "You know how to fight the fey with fire, faith, and iron. Roll your Doom die to dispel one magical effect of fey origin." },
  { name: "Witchsight", effect: "You can see through the veil that hides the realms of faerie. Elves, trolls, and other magical beings are always visible to you. You may be able to see magical auras and detect illusions with a successful WIS roll." },
];

const TWISTED_SCIENCE_MARVELS = [
  { name: "Acid spray", meta: "2 inv. pts", effect: "An enemy's weapon damage die is automatically downgraded by one step." },
  { name: "Blood-tinted spyglass", meta: "4 inv. pts", effect: "The user can see any living being (with blood in their veins), even those hiding behind cover or in darkness." },
  { name: "Bomb", meta: "4 inv. pts, single-use", effect: "D8 damage to anyone Nearby. A critical failure means the bomb explodes near you." },
  { name: "Firelance", meta: "6 inv. pts", effect: "A ranged weapon that spits fire at your enemies. Add Ud4 ongoing damage to a successful attack." },
  { name: "Freezing warhammer", meta: "6 inv. pts", effect: "Freezes any non-living matter it hits. Frozen objects are easy to shatter. On a roll of 20, when using the warhammer, the wielder suffers d6 frost damage and the hammer is destroyed." },
  { name: "Gas mask", meta: "2 inv. pts", effect: "Protects the wearer from gas-based effects." },
  { name: "Hallucinogenic gas", meta: "4 inv. pts, single-use", effect: "Indoors only. Roll a d6 for every person in the room, 1-2: relaxed state making the target easy to influence, 3-5: vivid dreams, making users oblivious to anything happening around them, 6: nightmarish visions, lots of panicking and screaming." },
  { name: "Image crystal", meta: "4 inv. pts", effect: "A small crystal that projects a human-sized (or smaller) image of your choosing. The image must be decided when you build the crystal." },
  { name: "Metal Owl", meta: "4 inv. pts", effect: "An owl automaton that can follow simple orders (up to six words). It has 4 HP and can distract a foe but cannot attack." },
  { name: "Prosthetic limb", meta: "10 inv. pts", effect: "No Usage die needed. Works as the original. Can be sacrificed to negate the damage from one attack." },
  { name: "Resurrection shot", meta: "4 inv. pts, single-use", effect: "The target doesn't have to roll on the Helpless table but needs to roll a d20. On a result of 20, they die (probably in a gruesome way)." },
  { name: "Sleep box", meta: "4 inv. pts", effect: "A music box that plunges every living creature hearing its melody into a trance. The Usage die roll tells you how long the effect lasts (in minutes)." },
  { name: "Targeting monocle", meta: "4 inv. pts", effect: "Lets you ignore any penalties on your ranged attack rolls (including those related to your target's level)." },
  { name: "Terror gas grenade", meta: "2 inv. pts, single-use", effect: "Roll a d6 for anyone breathing it. 1-4: they flee in terror, 5-6: they go berserk and add d4 to their damage." },
  { name: "Truth serum", meta: "4 inv. pts, single-use", effect: "Once injected with the serum, they tell everything they know. Roll a d20. On a result of 15-20, the target dies before they can speak." },
];

// Sorcery spell list, per SRD p.17-19. Roll d100; ranges cover 1-100 with uneven bucket sizes.
const SPELLS = [
  { min: 1, max: 2, name: "Acid blood", effect: "You can turn 3 HP worth of your blood into acid. Does d6 damage or dissolves an item the size of a small book." },
  { min: 3, max: 5, name: "Animate mirror", effect: "You animate your own reflection in a mirror. It will attack anyone that passes near it (d6 damage). Lasts until dispelled or the mirror is destroyed." },
  { min: 6, max: 7, name: "Blood mark", effect: "You mark one of your possessions with your blood, permanently losing 1 hit point. You always know where the item is. If it is destroyed, or the mark is erased, your HP comes back." },
  { min: 8, max: 10, name: "Call the Id", effect: "You summon an invisible creature made of anger. It can remove a physical obstacle or inflict 2d6 damage before disappearing." },
  { min: 11, max: 12, name: "Curse of the mute", effect: "The target cannot speak. On a spellcasting roll of 1, the affliction is permanent." },
  { min: 13, max: 14, name: "Darkness", effect: "d6 targets are blinded for d6 minutes." },
  { min: 15, max: 17, name: "Dead man's map", effect: "The blood of a dead creature draws a map that indicates the rough location of the murderer." },
  { min: 18, max: 20, name: "Deafening scream", effect: "A horrendous scream paralyses everyone hearing it for a few seconds. Children and animals die." },
  { min: 21, max: 22, name: "Demon's breath", effect: "All light sources in the same room as you are extinguished. A fire also starts in another room of the building." },
  { min: 23, max: 24, name: "Dream guardian", effect: "Animates a doll, puppet, or stuffed animal that stands guard while you sleep. It screams if it sees someone you haven't designated as friendly. The spell does not work during the day." },
  { min: 25, max: 27, name: "Dream message", effect: "Send a message to someone you know through a dream. The target has to be asleep, but no line of sight is required." },
  { min: 28, max: 29, name: "Fading memories", effect: "The target forgets all interactions with you in the last d6 hours (or years on a roll of 1)." },
  { min: 30, max: 31, name: "Feather crash", effect: "The target survives an otherwise deadly fall. All their equipment is destroyed." },
  { min: 32, max: 34, name: "Feeding the fire", effect: "Make an existing flame burst by feeding it with your anger. Inflicts d6 damage to all Nearby targets." },
  { min: 35, max: 36, name: "Fireflies", effect: "You call forth a swarm of fireflies that give as much light as a torch. They disappear at the slightest sign of violence." },
  { min: 37, max: 38, name: "Fleabag", effect: "Assume the form of a dog until sunset or sunrise (whichever comes first). You cannot end the spell early. Your abilities and HP are the same and you can bite for unarmed damage. You can't talk but you can bark." },
  { min: 39, max: 41, name: "Ghost pains", effect: "The victim feels like they have lost something very important and believes the caster can give it back." },
  { min: 42, max: 43, name: "Gloomy lullaby", effect: "Your target loses consciousness. A result of 1 on the spellcasting roll means the target will not wake up." },
  { min: 44, max: 46, name: "Greedy hand", effect: "One item the target holds in its hand flies to yours. On a casting roll of 1, the object is destroyed." },
  { min: 47, max: 48, name: "Guiding rat", effect: "When underground, summon a rat that guides you to the nearest exit. It must be fed d4 hit points worth of blood to do so." },
  { min: 49, max: 51, name: "Hellhound", effect: "Turns a regular dog into a raging killing machine (Attack 11, Dodge 11, d6 damage, 10 HP). It dies at the end of the fight whatever happens." },
  { min: 52, max: 53, name: "Impotent arrows", effect: "All projectiles hitting the target of the spell during the next turn do no damage. On a spellcasting result of 1, your allies' projectiles are also harmless." },
  { min: 54, max: 56, name: "Inquisition", effect: "The target must be tied up. It is submitted to intense pain. It will answer d4 questions. The GM rolls the dice. If the caster asks more questions than the number rolled, the victim dies." },
  { min: 57, max: 58, name: "Iron ghost", effect: "Makes a weapon no larger than a sword invisible. The spell ends when the weapon is used. If the weapon does not injure anyone on the turn it is drawn, the sorcerer loses d6 HP." },
  { min: 59, max: 61, name: "Murmurs", effect: "The target hears strange voices whispering in their ears, revealing their darkest secrets." },
  { min: 62, max: 63, name: "Never-ending music", effect: "The target hears a repetitive tune in their head. All rolls against them are made with Advantage." },
  { min: 64, max: 66, name: "Poisonous projectile", effect: "You make a projectile or thrown weapon even deadlier. The victim dies in d6 minutes." },
  { min: 67, max: 68, name: "Portal", effect: "You create a portal to a place you already know. You end up totally naked on the other side. Other people must roll a d6 if they follow you: on a 6, they disappear..." },
  { min: 69, max: 70, name: "Red trap", effect: "Make a small pool of your own blood (losing 2 HP until the spell is cancelled). Anyone stepping in the pool cannot move further." },
  { min: 71, max: 72, name: "Rotten fumes", effect: "Get Advantage on all tests made against those Nearby the target (human or object). The target is unaffected. Lasts d6 minutes." },
  { min: 73, max: 75, name: "Serpent bones", effect: "The target's body becomes boneless, allowing them to escape any bonds or to squeeze into tight passages. Lasts d6 minutes." },
  { min: 76, max: 77, name: "Sharing the pain", effect: "You transfer a loss of HP caused by a wound to a companion." },
  { min: 78, max: 79, name: "Soundkiller", effect: "All sounds Nearby are muffled. The spell lasts 2d6 minutes and follows you around." },
  { min: 80, max: 82, name: "Soul-eater", effect: "You literally chomp on your target's soul. They lose consciousness, or die if you get a 1 on your spellcasting roll." },
  { min: 83, max: 85, name: "Spontaneous combustion", effect: "Your target bursts into flames and suffers continuous damage (d4). If you roll a 1 on the spellcasting roll, everyone present bursts into flames." },
  { min: 86, max: 87, name: "Steal life", effect: "You steal d6 HP from a target you can touch. Your own HP cannot go beyond their maximum." },
  { min: 88, max: 90, name: "Tongue thief", effect: "You can speak up to six words through the mouth of your target." },
  { min: 91, max: 92, name: "Unnatural speed", effect: "The target can move to a Far distance on their Turn. On a 1, a randomly selected piece of the target's equipment is destroyed." },
  { min: 93, max: 95, name: "War drums", effect: "The target is experiencing all the horrors of war. Roll a d6: on 1-4 the target panics, on a 5-6 they go berserk." },
  { min: 96, max: 97, name: "Wine of death", effect: "The spell affects a jug or cup of wine you touch. Those who drink this wine quickly start looking for a fight. A result of 1 on the casting roll means the drinkers try to kill each other." },
  { min: 98, max: 100, name: "Withering", effect: "Your target has the strength and vitality of a 90-year-old for the next d6 hours." },
];

// Maps a background name to the Dark Pacts subsystem it unlocks, per SRD ch.6.
const SUBSYSTEMS_BY_BACKGROUND = {
  Warlock: { label: "Demonic Pacts", table: DEMON_TYPES, count: 2 },
  Shaman: { label: "Spirit Alliances", table: SPIRIT_TYPES, count: 2 },
  Changeling: { label: "Faerie Ties", table: FAERIE_TIES, count: 2 },
  Inventor: { label: "Twisted Science", table: TWISTED_SCIENCE_MARVELS, count: 2 },
  "Forbidden knowledge": { label: "Sorcery — Spells", table: SPELLS, count: 4, weighted: true },
};
