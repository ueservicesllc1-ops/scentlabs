import { FragranceOil } from "@/types/fragrance";
import fragrancesClean from "./fragrances-clean.json";

export function cleanFragranceName(name: string): string {
  return name; // Already cleaned in the build-time JSON
}

export function inferScentFamily(name: string, description: string = "", currentFamily: string = ""): string {
  const text = `${name} ${description}`.toLowerCase();
  if (currentFamily && currentFamily !== "Woody" && currentFamily !== "woody") return currentFamily;
  if (/citrus|lemon|lime|orange|bergamot|grapefruit|tangerine|mandarin|yuzu|lemongrass|clementine/.test(text)) return "Citrus";
  if (/floral|rose|jasmine|gardenia|lavender|violet|peony|orchid|blossom|tulip|magnolia|lily|tuberose|iris|hibiscus|lilac|freesia|lotus|plumeria|daisy|ylang/.test(text)) return "Floral";
  if (/vanilla|coconut|chocolate|cocoa|coffee|honey|sugar|caramel|sweet|cream|milk|cookie|cake|candy|almond|cinnamon|butter|mango|peach|apple|berry|cherry|strawberry|pineapple|banana|watermelon|fig|pear|plum/.test(text)) return "Gourmand";
  if (/clean|fresh|powder|linen|breeze|rain|water|aquatic|ocean|sea|cotton|ice|bamboo|soap|pure|sky/.test(text)) return "Fresh";
  if (/amber|musk|oud|oudh|incense|myrrh|frankincense|tonka|patchouli|saffron|cardamom|opium|oriental/.test(text)) return "Amber";
  if (/tobacco|leather|smoke|cigar|rum|suede/.test(text)) return "Tobacco";
  if (/cedar|sandalwood|pine|oak|wood|woody|cypress|birch|vetiver|mahogany|driftwood|teak/.test(text)) return "Woody";
  const families = ["Amber", "Floral", "Fresh", "Citrus", "Oriental", "Gourmand", "Woody"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) { hash = (hash << 5) - hash + name.charCodeAt(i); hash |= 0; }
  return families[Math.abs(hash) % families.length];
}

export const INITIAL_FRAGRANCES: FragranceOil[] = (fragrancesClean as unknown as FragranceOil[]);
