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

  // 3. Perfume formulation / dilution advice (EDP, Extrait, Elixir, EDT, EDC)
  if (
    q.includes("diluy") ||
    q.includes("diluir") ||
    q.includes("dilucion") ||
    q.includes("dilución") ||
    q.includes("formula") ||
    q.includes("fórmula") ||
    q.includes("formular") ||
    q.includes("receta") ||
    q.includes("preparar") ||
    q.includes("proporcion") ||
    q.includes("proporción") ||
    q.includes("porcentaje") ||
    q.includes("elixir") ||
    q.includes("extrait") ||
    q.includes("edp") ||
    q.includes("edt") ||
    q.includes("edc") ||
    q.includes("alcohol") ||
    q.includes("como hacer perfume") ||
    q.includes("cómo hacer perfume")
  ) {
    return `🧪 **GUÍA MAESTRA DE FORMULACIÓN Y DILUCIÓN (SCENTLAB)**

Nuestras esencias son **100% puras Grado A sin cortar**, por lo que rinden al máximo. Aquí tienes las fórmulas exactas por categoría:

1. **Eau de Cologne (EDC):** 
   • **3% a 5%** de esencia + 95% a 97% alcohol de perfumería.
   • *Duración:* 2 a 3 horas (frescura ligera).

2. **Eau de Toilette (EDT):**
   • **10% a 15%** de esencia + 85% a 90% alcohol.
   • *Duración:* 4 a 6 horas (ideal para uso diario).

3. **Eau de Parfum (EDP) ⭐ [El más popular y comercial]:**
   • **18% a 22%** de esencia + 78% a 82% alcohol.
   • *Duración:* 8 a 10 horas con excelente proyección y estela.

4. **Parfum / Extrait de Parfum (Lujo Extremo):**
   • **25% a 30%** de esencia + 70% a 75% alcohol.
   • *Duración:* 12 a 16+ horas (fijación profunda y concentrada).

5. **Elixir / Ultra Concentrado:**
   • **30% a 35%** de esencia + 65% a 70% alcohol.
   • *Duración:* Potencia pesada y máxima densidad aromática.

6. **Roll-on en Aceite (Sin alcohol):**
   • **20% a 25%** de esencia + 75% a 80% aceite portador (Jojoba o Coco MCT).

---
⚗️ **EJEMPLO PRÁCTICO PARA UN FRASCO DE 50 ML (Eau de Parfum al 20%):**
• **10 ml (0.34 oz)** de Aceite de Fragancia SCENTLAB.
• **40 ml (1.35 oz)** de Alcohol de Perfumería (Etanol 96° / SDA 40-B).
• *Tip Pro:* Agita bien y deja macerar en un lugar oscuro y fresco de **2 a 3 semanas** para que las notas maduren y se fundan.

📦 **Materiales recomendados:**
• [Ver Frascos y Atomizadores](/bottles)
• [Ver Tiras de Prueba y Pipetas](/testing)
• [Explorar Catálogo de Esencias](/fragrance)`;
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
