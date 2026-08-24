import { NextRequest, NextResponse } from "next/server";
import { INITIAL_FRAGRANCES } from "@/data/fragrances";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_INSTRUCTION = `
Eres el "Asesor Experto en Perfumería y Formulación de SCENTLAB" (scentlabs.com).
Tu misión es guiar, asesorar y resolver cualquier duda a los clientes, recomendando aceites de fragancia puros grado A (concentrados sin cortar), frascos de laboratorio, atomizadores, suministros de prueba y etiquetas personalizadas.

CONOCIMIENTO DE LA TIENDA SCENTLAB:
1. Catálogo: Más de 1,390 aceites de fragancia puros concentrados (Grado A, sin diluir/uncut).
2. Tamaños disponibles de esencias: 1 oz, 2 oz, 4 oz, 8 oz y 16 oz (en envases de vidrio oscuro con tapa hermética).
3. Envío Gratis: A partir de $250 dólares estadounidenses para todo Estados Unidos y Puerto Rico.
4. Otros productos:
   - Botellas de vidrio oscuro (ámbar, transparente, roll-on, atomizadores de niebla fina en /bottles).
   - Tiras olfativas secantes (blotter strips), viales de muestra de 5ml, pipetas (en /testing).
   - Etiquetas personalizadas troqueladas a medida (Custom Labels con foil dorado, plata, matte en /custom-labels).
5. Guía de formulación de perfumería:
   - Eau de Parfum (EDP): 15% - 20% de concentración (el estándar más popular).
   - Extrait de Parfum: 20% - 30%+ de concentración.
   - Roll-on: 15% - 25% diluido en aceite portador (Jojoba o Coco Fraccionado MCT).

REGLAS DE RECOMENDACIÓN Y ENLACES (MUY IMPORTANTE):
- Cada vez que recomiendes una esencia o producto de la tienda, DEBES incluir el enlace en formato Markdown para que el cliente pueda hacer clic directamente.
  Ejemplos de enlaces:
  • [Maison Francis Kurkdjian: Baccarat Rouge 540 Type](/fragrance/maison-francis-kurkdjian-baccarat-rouge-540-u-type)
  • [Dior: Sauvage (M) Type](/fragrance/dior-sauvage-m-type)
  • [Creed: Aventus (M) Type](/fragrance/creed-aventus-m-type)
  • [Tom Ford: Tobacco Vanille (U) Type](/fragrance/tom-ford-tobacco-vanille-u-type)
  • [Amber White](/fragrance/amber-white)
  • [Egyptian Musk](/fragrance/egyptian-musk)
  • [Catálogo de Esencias](/fragrance)
  • [Suministros de Laboratorio y Prueba](/testing)
  • [Botellas de Vidrio y Roll-on](/bottles)
  • [Etiquetas Personalizadas](/custom-labels)
- Si el cliente pregunta por un perfume de diseñador que NO tenemos (ej. "Santal 33"), explica amablemente sus notas y recomienda 2 o 3 opciones parecidas con sus enlaces directos.
- Sé siempre cortés, apasionado por el arte de la perfumería, conciso y profesional.
- Responde en el mismo idioma que te hable el usuario (Español o Inglés).
`;

function getSmartFallbackResponse(userQuery: string): string {
  const q = userQuery.toLowerCase().trim();

  // 1. Specific designer perfume queries
  if (q.includes("santal 33") || q.includes("le labo")) {
    return "Actualmente no tenemos **Santal 33 (Le Labo)** en nuestro inventario, pero si buscas ese perfil olfativo amaderado, cremoso y ahumado (sándalo australiano, cardamomo, cedro y cuero), te recomiendo probar estas alternativas disponibles con enlace directo:\n\n• [Amber White](/fragrance/amber-white) — Cálido, sofisticado y de altísima fijación.\n• [Egyptian Musk](/fragrance/egyptian-musk) — Almizclado limpio, elegante y unisex.\n• [Explorar Catálogo Amaderado](/fragrance) — Ver todas nuestras esencias amaderadas y especiadas.\n\nDisponibles en presentaciones desde 1 oz hasta 16 oz con grado de pureza Grado A sin cortar.";
  }

  if (q.includes("baccarat") || q.includes("540") || q.includes("rouge")) {
    return "¡Sí! Tenemos disponible el concentrado Grado A puro:\n\n👉 [Maison Francis Kurkdjian: Baccarat Rouge 540 (U) Type](/fragrance/maison-francis-kurkdjian-baccarat-rouge-540-u-type)\n\nCuenta con sus acordes inconfundibles de azafrán, jazmín egipcio, ámbar gris y cedro recién cortado. Disponible en **1 oz, 2 oz, 4 oz, 8 oz y 16 oz**.";
  }

  if (q.includes("sauvage") || q.includes("dior")) {
    return "¡Contamos con la inspiración tipo:\n\n👉 [Dior: Sauvage (M) Type](/fragrance/dior-sauvage-m-type)\n\nEs una de nuestras esencias masculinas más vendidas, con bergamota de Calabria, pimienta de Sichuan y fondo de ambroxan de larga duración.";
  }

  if (q.includes("aventus") || q.includes("creed")) {
    return "¡Sí! Tenemos la formulación:\n\n👉 [Creed: Aventus (M) Type](/fragrance/creed-aventus-m-type)\n\nCon sus icónicas notas de piña ahumada, bergamota italiana, abedul y musgo de roble. Perfecta para proyectar elegancia.";
  }

  if (q.includes("tobacco vanille") || q.includes("tom ford")) {
    return "¡Tenemos disponible:\n\n👉 [Tom Ford: Tobacco Vanille (U) Type](/fragrance/tom-ford-tobacco-vanille-u-type)\n\nUna esencia cálida y envolvente con notas de hoja de tabaco aromático, haba tonka, flor de tabaco, vainilla y cacao puro.";
  }

  // 2. Shipping FAQ
  if (q.includes("envio") || q.includes("envío") || q.includes("shipping") || q.includes("gratis") || q.includes("costo de envio")) {
    return "🚚 En **SCENTLAB** ofrecemos **ENVÍO GRATIS** en todas las órdenes a partir de **$250 USD** para todo Estados Unidos y Puerto Rico.\n\nPuedes armar tu pedido combinando [Esencias](/fragrance), [Botellas de Vidrio](/bottles), [Suministros de Prueba](/testing) y [Etiquetas](/custom-labels).";
  }

  // 3. Perfume formulation / dilution advice
  if (q.includes("diluir") || q.includes("formula") || q.includes("formular") || q.includes("edp") || q.includes("edt") || q.includes("porcentaje") || q.includes("como hacer perfume") || q.includes("cómo hacer perfume")) {
    return "🧪 **Guía rápida de concentración para perfumería con nuestras esencias Grado A:**\n\n• **Eau de Parfum (EDP) [Recomendado]:** 15% a 20% de esencia + 80-85% alcohol de perfumería.\n• **Extrait de Parfum:** 20% a 30% de esencia (máxima duración y estela).\n• **Roll-on en aceite:** 15% a 25% diluido en aceite de Jojoba o MCT.\n\n💡 *Suministros útiles para tu formulación:*\n• [Tiras Olfativas Secantes (Blotters)](/testing)\n• [Frascos y Atomizadores de Vidrio](/bottles)";
  }

  // 4. Scent families search
  if (q.includes("floral") || q.includes("flores") || q.includes("rosa") || q.includes("jazmin") || q.includes("lavanda")) {
    const matches = INITIAL_FRAGRANCES.filter(f => f.scentFamily === "Floral").slice(0, 3);
    const list = matches.map(m => `• [${m.name}](/fragrance/${m.slug}) — *Floral*`).join("\n");
    return `🌸 Para amantes de las fragancias **Florales**, aquí tienes excelentes opciones directas:\n\n${list}\n\n👉 [Ver todas las esencias Florales](/fragrance)`;
  }

  if (q.includes("fresc") || q.includes("limpi") || q.includes("verano") || q.includes("citric") || q.includes("citrico")) {
    const matches = INITIAL_FRAGRANCES.filter(f => f.scentFamily === "Fresh" || f.scentFamily === "Citrus").slice(0, 3);
    const list = matches.map(m => `• [${m.name}](/fragrance/${m.slug}) — *${m.scentFamily}*`).join("\n");
    return `🍋 Si buscas aromas **Frescos y Cítricos**, te recomiendo:\n\n${list}\n\n👉 [Explorar Catálogo Completo](/fragrance)`;
  }

  if (q.includes("amaderad") || q.includes("wood") || q.includes("mader") || q.includes("sandalo") || q.includes("cedro")) {
    const matches = INITIAL_FRAGRANCES.filter(f => f.scentFamily === "Woody").slice(0, 3);
    const list = matches.map(m => `• [${m.name}](/fragrance/${m.slug}) — *Woody*`).join("\n");
    return `🌲 En nuestra familia **Woody (Amaderada)** destacan:\n\n${list}\n\n👉 [Ver todas las esencias Amaderadas](/fragrance)`;
  }

  if (q.includes("dulce") || q.includes("vainilla") || q.includes("gourmand") || q.includes("chocolate") || q.includes("caramelo")) {
    const matches = INITIAL_FRAGRANCES.filter(f => f.scentFamily === "Gourmand").slice(0, 3);
    const list = matches.map(m => `• [${m.name}](/fragrance/${m.slug}) — *Gourmand*`).join("\n");
    return `🍯 Para aromas **Gourmand y Dulces**, prueba:\n\n${list}\n\n👉 [Ver todas las esencias Dulces](/fragrance)`;
  }

  // 5. Search by direct keyword across catalog
  const matchingFrags = INITIAL_FRAGRANCES.filter(f => f.name.toLowerCase().includes(q)).slice(0, 3);
  if (matchingFrags.length > 0) {
    const list = matchingFrags.map(m => `• [${m.name}](/fragrance/${m.slug}) — *${m.scentFamily}*`).join("\n");
    return `Encontré estas opciones en nuestro catálogo que coinciden con tu búsqueda:\n\n${list}\n\n¿Deseas conocer más detalles o cómo combinarlas?`;
  }

  return "¡Con gusto te asesoro! En **SCENTLAB** contamos con más de 1,390 aceites de fragancia puros Grado A sin cortar.\n\n• [Ver Catálogo de Esencias](/fragrance)\n• [Ver Frascos y Atomizadores](/bottles)\n• [Ver Suministros de Laboratorio](/testing)\n\n¿Buscas alguna fragancia o diseñador en especial, o te gustaría una recomendación personalizada?";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing messages array" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // If API key is available, try Gemini 3.5 Flash Lite or fallback smoothly
    if (GEMINI_API_KEY) {
      try {
        const contents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

        const requestBody = {
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({ reply: replyText });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to smart olfactory matcher:", geminiErr);
      }
    }

    // Smart ScentLabs olfactory matcher
    const smartReply = getSmartFallbackResponse(lastUserMessage);
    return NextResponse.json({ reply: smartReply });
  } catch (error: any) {
    console.error("Assistant Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
