export const CROP_IMAGES: Record<string, string> = {
  potato: "/crops/potato.jpg",
  onion: "/crops/onion.jpg",
  tomato: "/crops/tomato.jpg",
  "green-chilli": "/crops/green-chilli.jpg",
  brinjal: "/crops/brinjal.jpg",
  ginger: "/crops/ginger.jpg",
  garlic: "/crops/garlic.jpg",
  "red-chilli": "/crops/red-chilli.jpg",
  cabbage: "/crops/cabbage.jpg",
  cauliflower: "/crops/cauliflower.jpg",
  paddy: "/crops/paddy.jpg",
  rice: "/crops/rice.jpg",
  wheat: "/crops/wheat.jpg",
  mustard: "/crops/mustard.jpg",
};

/**
 * Returns a high-definition, verified local crop image URL based on crop name, id, or alias.
 */
export function getCropImage(nameOrId?: string | null, fallback?: string): string {
  if (!nameOrId) return fallback || CROP_IMAGES.potato;

  const raw = nameOrId.toLowerCase().trim();

  // Ginger
  if (raw.includes("ginger") || raw.includes("adrak") || raw.includes("ada")) {
    return CROP_IMAGES.ginger;
  }

  // Chillies (check green vs red carefully)
  if (
    raw.includes("green chilli") ||
    raw.includes("green-chilli") ||
    raw.includes("green chili") ||
    raw.includes("hari mirch") ||
    raw.includes("lanka") ||
    (raw.includes("chilli") && raw.includes("green"))
  ) {
    return CROP_IMAGES["green-chilli"];
  }

  if (
    raw.includes("red chilli") ||
    raw.includes("red-chilli") ||
    raw.includes("red chili") ||
    raw.includes("lal mirch") ||
    raw.includes("dry chilli") ||
    raw.includes("guntur")
  ) {
    return CROP_IMAGES["red-chilli"];
  }

  // Generic chilli fallback to green chilli
  if (raw.includes("chilli") || raw.includes("chili") || raw.includes("mirch")) {
    return CROP_IMAGES["green-chilli"];
  }

  // Brinjal / Eggplant
  if (raw.includes("brinjal") || raw.includes("eggplant") || raw.includes("baigan") || raw.includes("baigana") || raw.includes("aubergine")) {
    return CROP_IMAGES.brinjal;
  }

  // Garlic
  if (raw.includes("garlic") || raw.includes("lehsun") || raw.includes("lasun") || raw.includes("rasuna")) {
    return CROP_IMAGES.garlic;
  }

  // Cauliflower
  if (raw.includes("cauliflower") || raw.includes("phula") || raw.includes("phool") || raw.includes("gobhi") || raw.includes("gobi")) {
    // Distinguish cabbage vs cauliflower
    if (raw.includes("cabbage") || raw.includes("patta") || raw.includes("bandha")) {
      return CROP_IMAGES.cabbage;
    }
    return CROP_IMAGES.cauliflower;
  }

  // Cabbage
  if (raw.includes("cabbage") || raw.includes("bandha") || raw.includes("patta gobhi")) {
    return CROP_IMAGES.cabbage;
  }

  // Potato
  if (raw.includes("potato") || raw.includes("alu") || raw.includes("aloo") || raw.includes("batata")) {
    return CROP_IMAGES.potato;
  }

  // Onion
  if (raw.includes("onion") || raw.includes("piaja") || raw.includes("pyaz") || raw.includes("pyaaz") || raw.includes("kanda")) {
    return CROP_IMAGES.onion;
  }

  // Tomato
  if (raw.includes("tomato") || raw.includes("bilati") || raw.includes("tamatar")) {
    return CROP_IMAGES.tomato;
  }

  // Paddy / Dhan
  if (raw.includes("paddy") || raw.includes("dhan") || raw.includes("dhana")) {
    return CROP_IMAGES.paddy;
  }

  // Rice / Chawal
  if (raw.includes("rice") || raw.includes("chawal") || raw.includes("chaula")) {
    return CROP_IMAGES.rice;
  }

  // Wheat
  if (raw.includes("wheat") || raw.includes("gehun") || raw.includes("gehu") || raw.includes("gahama")) {
    return CROP_IMAGES.wheat;
  }

  // Mustard
  if (raw.includes("mustard") || raw.includes("sarson") || raw.includes("sorisa") || raw.includes("rai")) {
    return CROP_IMAGES.mustard;
  }

  // Check direct key match
  if (CROP_IMAGES[raw]) {
    return CROP_IMAGES[raw];
  }

  // Filter out known broken third-party links from fallback
  if (
    fallback &&
    !fallback.includes("photo-1615485290382-441e4d049cb5") && // was broccoli
    !fallback.includes("photo-1588252303782-cb80119abd6d") && // was red chilli for green chilli
    !fallback.includes("photo-1615485500704-8e990f9900f7") && // was spice seeds for brinjal
    !fallback.includes("GreenChilli.jpg") // broken url
  ) {
    return fallback;
  }

  return CROP_IMAGES.potato;
}
