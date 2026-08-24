import { NextRequest, NextResponse } from "next/server";
import { INITIAL_FRAGRANCES } from "@/data/fragrances";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_INSTRUCTION = `
Eres "ScentSommelier IA", el Asistente Olfativo y Maestro Perfumista experto de SCENTLAB (scentlabs.com).
Tu misión es guiar, asesorar y recomendar aceites de fragancia puros grado A (concentrados sin cortar), frascos de laboratorio, atomizadores, suministros de prueba y etiquetas personalizadas a los clientes.

CONOCIMIENTO DE LA TIENDA SCENTLAB:
1. Catálogo: Más de 1,390 aceites de fragancia puros concentrados (Grado A, sin diluir/uncut).
2. Tamaños disponibles de esencias: 1 oz, 2 oz, 4 oz, 8 oz y 16 oz (en envases de vidrio oscuro con tapa hermética).
3. Envío Gratis: A partir de $250 dólares estadounidenses para todo Estados Unidos y Puerto Rico.
4. Otros productos:
   - Botellas de vidrio oscuro (ámbar, transparente, roll-on, atomizadores de niebla fina).
   - Tiras olfativas secantes (blotter strips) libres de pelusa para evaluación de notas.
   - Viales de muestra de 5ml, pipetas de transferencia graduadas.
   - Suministros para kits de prueba (Testing Starter Kits en /testing).
   - Etiquetas personalizadas troqueladas a medida (Custom Labels en /custom-labels con foil dorado, plata, matte, etc.).
5. Guía de formulación de perfumería:
   - Eau de Cologne (EDC): 3% - 5% de aceite de fragancia en alcohol de perfumería.
   - Eau de Toilette (EDT): 10% - 15% de aceite de fragancia.
   - Eau de Parfum (EDP): 15% - 20% de concentración (el estándar más popular).
   - Extrait de Parfum: 20% - 30%+ de concentración.
   - Aceite corporal / Roll-on: Diluido en aceite portador (Jojoba o Coco Fraccionado MCT) al 15-25%.

REGLAS DE RECOMENDACIÓN Y EQUIVALENCIAS:
- Si el cliente pregunta por un perfume de diseñador/nicho conocido (ej. "Santal 33", "Baccarat Rouge 540", "Aventus", "Sauvage", "Tom Ford Tobacco Vanille", "Lost Cherry", "Chanel No 5", "Black Opium", etc.):
  a) Si lo tenemos como tipo de inspiración (ej. Baccarat Rouge 540 Type, Sauvage Type, Tobacco Vanille Type), ofréceselo con entusiasmo mencionando que tenemos el concentrado tipo de alta pureza.
  b) Si NO lo tenemos exactamente (como "Santal 33" de Le Labo), sé súper claro y amable: "Actualmente no tenemos Santal 33 en nuestro inventario, pero te encantarán sus notas amaderadas, cremosas y ahumadas. Te recomiendo probar nuestras esencias similares: Sandalwood, Amber White, o Cedarwood & Woods, las cuales comparten esa calidez sofisticada de sándalo y maderas nobles."
- Sé siempre cortés, apasionado por el arte de la perfumería, conciso y profesional.
- Responde en el mismo idioma que te hable el usuario (Español o Inglés).
- Usa formato markdown limpio (negritas para nombres de fragancias, listas con viñetas cuando des varias opciones).
`;

/**
 * Intelligent fallback engine if Gemini API key reaches limit or errors
 */
function getSmartFallbackResponse(userQuery: string): string {
  const q = userQuery.toLowerCase().trim();

  // 1. Specific designer perfume queries
  if (q.includes("santal 33") || q.includes("le labo")) {
    return "Actualmente no tenemos **Santal 33 (Le Labo)** en nuestro inventario, pero si buscas ese perfil olfativo amaderado, cremoso y ahumado (sándalo australiano, cardamomo, cedro y cuero), te recomiendo probar:\n\n• **Sandalwood Pure Grade-A** (nuestro sándalo más rico y cremoso)\n• **Amber White** (cálido, sofisticado y de larga fijación)\n• **Egyptian Musk** (almizclado limpio y elegante)\n\nPuedes encontrarlos en presentaciones desde 1 oz hasta 16 oz en nuestro catálogo de esencias.";
  }

  if (q.includes("baccarat") || q.includes("540") || q.includes("rouge")) {
    return "¡Sí! Tenemos disponible el concentrado **Maison Francis Kurkdjian: Baccarat Rouge 540 (U) Type** en formulación Grado A puro sin cortar. Cuenta con sus características notas de azafrán, jazmín, ámbar gris y cedro. Lo tenemos en tamaños de **1 oz, 2 oz, 4 oz, 8 oz y 16 oz**.";
  }

  if (q.includes("sauvage") || q.includes("dior")) {
    return "¡Contamos con **Dior: Sauvage (M) Type**! Es una de nuestras esencias más vendidas, con notas intensas de bergamota de Calabria, pimienta de Sichuan y ambroxan. Disponible en presentaciones de 1 oz hasta 16 oz.";
  }

  if (q.includes("aventus") || q.includes("creed")) {
    return "¡Sí, tenemos la inspiración tipo **Creed: Aventus (M) Type**! Con sus vibrantes notas de piña ahumada, bergamota, abedul y musgo de roble. Ideal para formular Eau de Parfum de alta proyección.";
  }

  if (q.includes("tobacco vanille") || q.includes("tom ford")) {
    return "¡Tenemos **Tom Ford: Tobacco Vanille (U) Type**! Una esencia cálida y especiada con notas de hoja de tabaco, haba tonka, flor de tabaco, vainilla y cacao. Excelente para perfumes otoñales e invernales.";
  }

  // 2. Shipping FAQ
  if (q.includes("envio") || q.includes("envío") || q.includes("shipping") || q.includes("gratis") || q.includes("costo de envio")) {
    return "🚚 En **SCENTLAB** ofrecemos **ENVÍO GRATIS** en todas las órdenes a partir de **$250 USD** para todo Estados Unidos y Puerto Rico. Para órdenes menores, el costo de flete se calcula en tiempo real con tarifas directas de transportista (USPS / UPS).";
  }

  // 3. Perfume formulation / dilution advice
  if (q.includes("diluir") || q.includes("formula") || q.includes("formular") || q.includes("edp") || q.includes("edt") || q.includes("porcentaje") || q.includes("como hacer perfume") || q.includes("cómo hacer perfume")) {
    return "🧪 **Guía rápida de concentración para perfumería con nuestras esencias Grado A:**\n\n• **Eau de Parfum (EDP) [Recomendado]:** 15% a 20% de aceite de fragancia + 80-85% alcohol de perfumería.\n• **Extrait de Parfum:** 20% a 30% de aceite de fragancia (máxima duración y fijación).\n• **Eau de Toilette (EDT):** 10% a 15% de aceite de fragancia.\n• **Roll-on / Aceite corporal:** 15% a 25% diluido en aceite portador (Jojoba o Coco Fraccionado MCT).\n\n💡 *Tip:* Deja macerar tu mezcla en botella de vidrio oscuro durante 2 a 4 semanas para que las notas se integren a la perfección.";
  }

  // 4. Scent families search
  if (q.includes("floral") || q.includes("flores") || q.includes("rosa") || q.includes("jazmin") || q.includes("lavanda")) {
    const matches = INITIAL_FRAGRANCES.filter(f => f.scentFamily === "Floral").slice(0, 4);
    const list = matches.map(m => `• **${m.name}** (Floral)`).join("\n");
    return `🌸 Para amantes de las fragancias **Florales**, aquí tienes algunas de nuestras mejores opciones:\n\n${list}\n\nPuedes explorar todas en la sección de Esencias filtrando por la familia *Floral*.`;
  }

  if (q.includes("fresc") || q.includes("limpi") || q.includes("verano") || q.includes("citric") || q.includes("citrico")) {
    const matches = INITIAL_FRAGRANCES.filter(f => f.scentFamily === "Fresh" || f.scentFamily === "Citrus").slice(0, 4);
    const list = matches.map(m => `• **${m.name}** (${m.scentFamily})`).join("\n");
    return `🍋 Si buscas aromas **Frescos y Cítricos**, te recomiendo estas esencias súper energizantes:\n\n${list}\n\nIdeales para uso diario y climas cálidos.`;
  }

  if (q.includes("amaderad") || q.includes("wood") || q.includes("mader") || q.includes("sandalo") || q.includes("cedro")) {
    const matches = INITIAL_FRAGRANCES.filter(f => f.scentFamily === "Woody").slice(0, 4);
    const list = matches.map(m => `• **${m.name}** (Woody)`).join("\n");
    return `🌲 En nuestra familia **Woody (Amaderada)** destacan aromas sofisticados y elegantes:\n\n${list}\n\nSon excelentes fijadores de fondo para cualquier formulación.`;
  }

  if (q.includes("dulce") || q.includes("vainilla") || q.includes("gourmand") || q.includes("chocolate") || q.includes("caramelo")) {
    const matches = INITIAL_FRAGRANCES.filter(f => f.scentFamily === "Gourmand").slice(0, 4);
    const list = matches.map(m => `• **${m.name}** (Gourmand)`).join("\n");
    return `🍯 Para aromas **Gourmand y Dulces**, prueba:\n\n${list}\n\nFragancias adictivas con notas cálidas de vainilla, frutas y acordes dulces.`;
  }

  // 5. Search by direct keyword across catalog
  const matchingFrags = INITIAL_FRAGRANCES.filter(f => f.name.toLowerCase().includes(q)).slice(0, 3);
  if (matchingFrags.length > 0) {
    const list = matchingFrags.map(m => `• **${m.name}** (${m.scentFamily})`).join("\n");
    return `Encontré estas opciones en nuestro catálogo que coinciden con tu búsqueda:\n\n${list}\n\n¿Deseas saber más sobre alguna de ellas o necesitas ayuda para combinarla?`;
  }

  return "¡Con gusto te asesoro! En **SCENTLAB** contamos con más de 1,390 aceites de fragancia puros Grado A sin cortar, frascos de laboratorio, atomizadores, tiras de prueba y etiquetas personalizadas.\n\n¿Buscas alguna fragancia o diseñador en especial, o te gustaría que te recomiende opciones según tus acordes favoritos (amaderado, floral, fresco, cítrico, gourmand, ámbar)?";
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
