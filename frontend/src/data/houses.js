// The eight great houses a user can swear to at registration.
// Sigil art lives in frontend/public/house_logos (served as-is).

export const HOUSES = [
  { key: "stark", name: "House Stark", words: "Winter is Coming", seat: "Winterfell", file: "starks.png" },
  { key: "lannister", name: "House Lannister", words: "Hear Me Roar!", seat: "Casterly Rock", file: "lannister.png" },
  { key: "targaryen", name: "House Targaryen", words: "Fire and Blood", seat: "Dragonstone", file: "targaryen.png" },
  { key: "baratheon", name: "House Baratheon", words: "Ours is the Fury", seat: "Storm's End", file: "barathons.png" },
  { key: "greyjoy", name: "House Greyjoy", words: "We Do Not Sow", seat: "Pyke", file: "greyjoy.png" },
  { key: "tyrell", name: "House Tyrell", words: "Growing Strong", seat: "Highgarden", file: "tyrell.png" },
  { key: "martell", name: "House Martell", words: "Unbowed, Unbent, Unbroken", seat: "Sunspear", file: "martell.png" },
  { key: "arryn", name: "House Arryn", words: "As High as Honor", seat: "The Eyrie", file: "arryn.png" },
];

export function houseByKey(key) {
  return HOUSES.find((h) => h.key === String(key || "").toLowerCase()) || HOUSES[0];
}

export function sigilSrc(key) {
  return `/house_logos/${houseByKey(key).file}`;
}

// owner may be an object, an id string, or missing (old docs predate houses)
export function houseOf(owner) {
  if (owner && typeof owner === "object" && owner.house) return String(owner.house).toLowerCase();
  return "";
}
