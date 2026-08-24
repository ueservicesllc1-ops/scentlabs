import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, images: [] });
    }

    const searchQuery = `${q} perfume bottle white background`;

    // 1. Fetch VQD token from DuckDuckGo
    const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&iax=images&ia=images`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ success: false, images: [] });
    }

    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=([0-9-]+)/) || html.match(/vqd=["']([^"']+)["']/);
    const vqd = vqdMatch ? vqdMatch[1] : null;

    if (!vqd) {
      return NextResponse.json({ success: true, images: [] });
    }

    // 2. Fetch images using VQD token
    const imgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(searchQuery)}&vqd=${vqd}&f=,,,&p=1`;
    const imgRes = await fetch(imgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://duckduckgo.com/",
      },
    });

    if (!imgRes.ok) {
      return NextResponse.json({ success: false, images: [] });
    }

    const data = await imgRes.json();
    const urls: string[] = (data.results || [])
      .map((r: any) => r.image)
      .filter((url: string) => 
        url && 
        typeof url === "string" &&
        (url.startsWith("http://") || url.startsWith("https://")) &&
        (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".webp") || url.includes("image") || url.includes("product") || url.includes("amazon") || url.includes("walmart"))
      );

    // Return top 4 distinct images
    const uniqueUrls = Array.from(new Set(urls)).slice(0, 4);

    return NextResponse.json({
      success: true,
      query: q,
      images: uniqueUrls,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
