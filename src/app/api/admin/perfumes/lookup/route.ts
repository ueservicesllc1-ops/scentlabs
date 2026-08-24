import { NextRequest, NextResponse } from "next/server";
import { searchPerfumePresets, PerfumePreset, ALL_PERFUME_HOUSES, getEnrichedPerfumeData } from "@/data/perfume-catalog-database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    let parsedFromUrl = false;
    let imageUrlFromUrl: string | undefined = undefined;

    // 1. Check if the input is a URL (Walmart, Amazon, Fragrantica, etc.)
    if (q.startsWith("http://") || q.startsWith("https://")) {
      parsedFromUrl = true;
      try {
        const parsedUrl = new URL(q);
        const pathname = parsedUrl.pathname;
        
        // Extract slug from URL (e.g. /ip/Lattafa-Unisex-Oud-Mood-EDP-Perfume-Natural-Spray-100ML-3-4oz/515731422)
        const pathSegments = pathname.split("/").filter(Boolean);
        const slugSegment = pathSegments.find(s => s.length > 10 && !/^\d+$/.test(s)) || pathSegments[pathSegments.length - 1] || "";
        
        // Clean slug into words
        const cleanedQuery = decodeURIComponent(slugSegment)
          .replace(/[-_+]/g, " ")
          .replace(/\b(ip|dp|gp|product|perfume|natural|spray|eau|de|parfum|edp|edt|fl|oz|ml|100ml|100|3\.4oz|3\.4)\b/gi, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (cleanedQuery.length >= 2) {
          q = cleanedQuery;
        }

        // Try to fetch og:image or page title
        try {
          const fetchRes = await fetch(parsedUrl.toString(), {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            },
            next: { revalidate: 3600 }
          });

          if (fetchRes.ok) {
            const html = await fetchRes.text();
            
            // Extract OG image
            const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
            if (imgMatch && imgMatch[1]) {
              imageUrlFromUrl = imgMatch[1];
            }

            // Extract title
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              const rawTitle = titleMatch[1].replace(/[-|].*$/, "").trim();
              if (rawTitle.length > 3) {
                q = rawTitle;
              }
            }
          }
        } catch (fetchErr) {}
      } catch (urlErr) {}
    }

    // 2. Search in our rich 2,035+ perfume database
    const localResults = searchPerfumePresets(q);

    if (localResults.length > 0) {
      const enhancedResults = localResults.map(r => {
        const enrich = getEnrichedPerfumeData(r.name, r.brand);
        return {
          ...r,
          shortDescription: enrich?.shortDescription || r.shortDescription,
          description: enrich?.description || r.description,
          inspiredBy: r.inspiredBy || enrich?.inspiredBy,
          originalBrand: r.originalBrand || enrich?.originalBrand,
          relationshipType: r.relationshipType || enrich?.relationshipType,
          estimatedSimilarity: r.estimatedSimilarity || enrich?.estimatedSimilarity,
          isOneToOne: r.isOneToOne || enrich?.isOneToOne,
          notes: r.notes || enrich?.notes,
          imageUrl: imageUrlFromUrl || (r as any).imageUrl
        };
      });

      return NextResponse.json({
        success: true,
        source: parsedFromUrl ? "url_matched_database" : "database",
        detectedQuery: q,
        results: enhancedResults,
      });
    }

    // 3. Fallback: Live Web Intelligence Search via DuckDuckGo
    let webTitle = "";
    let webSnippet = "";
    try {
      const searchRes = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(q + " perfume notes fragrantica")}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (searchRes.ok) {
        const searchHtml = await searchRes.text();
        const firstResultMatch = searchHtml.match(/<a class="result__url" href="[^"]*">([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);
        if (firstResultMatch) {
          webTitle = firstResultMatch[1].replace(/<[^>]+>/g, "").trim();
          webSnippet = firstResultMatch[2].replace(/<[^>]+>/g, "").trim();
        }
      }
    } catch (webErr) {}

    // 4. Heuristic & Web extraction
    const combinedText = `${q} ${webTitle} ${webSnippet}`.toLowerCase();
    let detectedBrand = "Lattafa";
    let brandType: "arabic" | "designer_niche" = "arabic";

    for (const house of ALL_PERFUME_HOUSES) {
      const hLower = house.name.toLowerCase();
      if (combinedText.includes(hLower)) {
        detectedBrand = house.name;
        brandType = house.type;
        break;
      }
    }

    // Common brand heuristics
    if (detectedBrand === "Lattafa") {
      if (combinedText.includes("armaf") || combinedText.includes("club de nuit")) { detectedBrand = "Armaf"; brandType = "arabic"; }
      else if (combinedText.includes("afnan") || combinedText.includes("9pm") || combinedText.includes("supremacy")) { detectedBrand = "Afnan"; brandType = "arabic"; }
      else if (combinedText.includes("rasasi") || combinedText.includes("hawas")) { detectedBrand = "Rasasi"; brandType = "arabic"; }
      else if (combinedText.includes("al haramain") || combinedText.includes("amber oud")) { detectedBrand = "Al Haramain"; brandType = "arabic"; }
      else if (combinedText.includes("bharara")) { detectedBrand = "Bharara"; brandType = "designer_niche"; }
      else if (combinedText.includes("orientica")) { detectedBrand = "Orientica"; brandType = "arabic"; }
      else if (combinedText.includes("dior") || combinedText.includes("sauvage")) { detectedBrand = "Dior"; brandType = "designer_niche"; }
      else if (combinedText.includes("creed") || combinedText.includes("aventus")) { detectedBrand = "Creed"; brandType = "designer_niche"; }
      else if (combinedText.includes("tom ford")) { detectedBrand = "Tom Ford"; brandType = "designer_niche"; }
      else if (combinedText.includes("chanel")) { detectedBrand = "Chanel"; brandType = "designer_niche"; }
      else if (combinedText.includes("ysl") || combinedText.includes("yves saint laurent")) { detectedBrand = "Yves Saint Laurent"; brandType = "designer_niche"; }
      else if (combinedText.includes("kilian")) { detectedBrand = "Kilian Paris"; brandType = "designer_niche"; }
    }

    // Clean perfume title
    let cleanTitle = q
      .replace(new RegExp(`\\b${detectedBrand}\\b`, "gi"), "")
      .replace(/\b(perfume|fragrance|unisex|for men|for women|natural spray|eau de parfum|edp|edt|100ml|3\.4oz)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanTitle) cleanTitle = q;

    cleanTitle = cleanTitle
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    const isWomen = combinedText.includes("women") || combinedText.includes("femme") || combinedText.includes("her") || combinedText.includes("pink");
    const isMen = combinedText.includes("men") || combinedText.includes("homme") || combinedText.includes("him") || combinedText.includes("pour homme");

    const fallbackResult: PerfumePreset & { imageUrl?: string } = {
      name: cleanTitle,
      brand: detectedBrand,
      brandType: brandType,
      concentration: combinedText.includes("extrait") ? "Extrait de Parfum" : combinedText.includes("edt") ? "Eau de Toilette (EDT)" : "Eau de Parfum (EDP)",
      gender: isWomen ? "Women" : isMen ? "Men" : "Unisex",
      measure: "100 ml / 3.4 fl oz",
      description: webSnippet || `Perfume original ${cleanTitle} de la prestigiosa casa ${detectedBrand}. Fragancia de alta proyección y fijación duradera.`,
      imageUrl: imageUrlFromUrl,
    };

    return NextResponse.json({
      success: true,
      source: parsedFromUrl ? "url_ai_parsed" : "ai_web_intelligence",
      detectedQuery: q,
      results: [fallbackResult],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
