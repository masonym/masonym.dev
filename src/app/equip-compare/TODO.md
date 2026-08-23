- Potential lines need to be cleaned up
- Potential line selector container thingy can maybe fit next to the star force box? Lot of empty space.
- Ring of Restraint cannot get potentials
- Androids don't appear - even though they can't be upgraded/give no stats, we should either pre-fill it with an android and make it uneditable, or get the androids and allow them to be selected.
- Main/sub stats aren't working properly for star force. It seems to be giving all stats for most items when enhancing, rather than *class stats*. "Class stats" refers to the classes main stat and sub stat. 
  - Warrior: Str/Dex
  - Magician: Int/Luk
  - Thief: Lux/Dex
  - Bowman: Dex/Str
  - Pirate: Str/Dex
  - Xenon: Str, Dex, and Luk 
  - Demon Avenger: HP
- ~~We should show the item set effect (each different set amount in the set in text, and the current set amount in a brighter text - for example if we have 5 pitched items, it should show the 5th set effect and all of the previous ones in a brighter text, while the 6th and onwards sets are in a darker text. Place it to the right of the main tooltip, as a tooltip when hovering the item tooltip~~
  Done. Hovering an item in a set draws a second panel beside its tooltip: the
  header counts pieces, the members are listed one row per piece (worn ones lit),
  and every threshold is listed with the reached ones lit and the rest dimmed.
  Member ids are reduced to pieces by two rules - group by the loadout slot they
  compete for (AbsoLab's 11 one-handers and 3 two-handers are one weapon), then
  split or collapse by how many of that slot exist (5 emblems are one piece,
  Brilliant's 2 rings are two, because there are four ring slots).
  A few sets reach a threshold whose piece is not equipment - a Sengoku totem,
  the Alchemist Set's potions - so the header counts to the top threshold and the
  list says how many pieces it could not name.
  Defence lines are left out of the effect text, same as the tooltip and diff.
