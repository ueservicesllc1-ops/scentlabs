import { NextRequest, NextResponse } from "next/server";
import { INITIAL_FRAGRANCES } from "@/data/fragrances";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

interface FamousPerfumeProfile {
  aliases: string[];
  house: string;
  name: string;
  notes: string;
  recommendations: { name: string; slug: string; desc: string }[];
}

const FAMOUS_PERFUMES: FamousPerfumeProfile[] = [
  // ━━━ ARABIC & ORIENTAL PERFUMES ━━━
  {
    aliases: [
      "arabe",
      "arabes",
      "árabe",
      "árabes",
      "dubai",
      "saudi",
      "lattafa",
      "al haramain",
      "haramain",
      "afnan",
      "rasasi",
      "khamrah",
      "oud",
      "oudh",
      "attar",
      "oriental",
      "orientales",
      "perfumeria arabe",
      "perfumería árabe",
      "almizcle arabe",
    ],
    house: "Perfumería Oriental & Árabe",
    name: "Perfumes Árabes & Acordes Orientales",
    notes: "Madera de oud oscuro, azafrán, rosa de Damasco, ámbar dorado, resinas de incienso, mirra, almizcle blanco y especias cálidas de alta proyección",
    recommendations: [
      { name: "Al Haramain: Amber Oud Gold Edition (U) Type", slug: "al-haramain-amber-oud-gold-edition-u-type", desc: "El legendario perfume árabe frutal dulce con ámbar y oud majestuoso." },
      { name: "Initio: Oud For Greatness (U) Type", slug: "initio-parfums-prives-oud-for-greatness-u-type", desc: "Oud místico, azafrán y nuez moscada con estela monumental." },
      { name: "Maison Francis Kurkdjian: Oud Satin Mood (U) Type", slug: "maison-francis-kurkdjian-oud-satin-mood-u-type", desc: "Rosa turca, violeta empolvada, vainilla y oud suntuoso." },
      { name: "Arabian Oud: Only White (U) Type", slug: "arabian-oud-only-white-u-type", desc: "Almizcle blanco árabe puro, fresco, sedoso y elegante." },
      { name: "Amber White", slug: "amber-white", desc: "El clásico ámbar oriental de SCENTLAB de altísima fijación." },
      { name: "Al Rehab: Dehn Al Oud (U) Type", slug: "al-rehab-dehn-al-oud-u-type", desc: "Oud árabe tradicional amaderado y profundo." },
    ],
  },
  // ━━━ GOD OF FIRE / TROPICAL NICHE ━━━
  {
    aliases: ["god of fire", "god of fir", "stephane humbert", "lucas 777", "humbert lucas", "mango god"],
    house: "Stéphane Humbert Lucas 777",
    name: "God of Fire",
    notes: "Mango exótico maduro, frutos rojos silvestres, jengibre picante, limón, jazmín, maderas cálidas de cedro, ámbar y un toque de oud",
    recommendations: [
      { name: "Tropical Mango", slug: "tropical-mango", desc: "Acorde puro de mango jugoso y vibrante de altísima proyección." },
      { name: "Mango Pineapple", slug: "mango-pineapple", desc: "Frutas tropicales intensas con acidez chispeante y dulzura exótica." },
      { name: "Coco-Mango", slug: "coco-mango", desc: "Mango cremoso con fondo cálido y tropical." },
      { name: "Amber White", slug: "amber-white", desc: "Ideal como base ambarada y amaderada para fijar acordes frutales." },
    ],
  },
  // ━━━ SANTAL 33 ━━━
  {
    aliases: ["santal 33", "le labo", "santal33", "santal"],
    house: "Le Labo",
    name: "Santal 33",
    notes: "Sándalo australiano cremoso, cardamomo, cedro de Virginia, papiro, cuero ahumado, iris y hojas de violeta",
    recommendations: [
      { name: "Amber White", slug: "amber-white", desc: "Cálido, amaderado, cremoso y con una fijación legendaria." },
      { name: "Egyptian Musk", slug: "egyptian-musk", desc: "Almizcle limpio sofisticado que aporta frescura y elegancia." },
      { name: "Frankincense & Sandalwood", slug: "frankincense-sandalwood", desc: "Madera de sándalo noble con resinas místicas." },
    ],
  },
  // ━━━ ERBA PURA ━━━
  {
    aliases: ["erba pura", "xerjoff", "erba gold", "sospiro"],
    house: "Xerjoff",
    name: "Erba Pura",
    notes: "Canasta de frutas mediterráneas, naranja dulce, bergamota de Calabria, limón siciliano, almizcle blanco y vainilla de Madagascar",
    recommendations: [
      { name: "Tropical Mango", slug: "tropical-mango", desc: "Frutas exóticas y explosión jugosa de larga duración." },
      { name: "Mango Pineapple", slug: "mango-pineapple", desc: "Cítricos y frutas dulces energizantes." },
      { name: "Egyptian Musk", slug: "egyptian-musk", desc: "La base de almizcle blanco perfecta para notas frutales." },
    ],
  },
  // ━━━ ANGELS' SHARE ━━━
  {
    aliases: ["angels share", "angel share", "angels' share", "kilian"],
    house: "Kilian Paris",
    name: "Angels' Share",
    notes: "Licor de coñac, corteza de canela, madera de roble, haba tonka, praliné crujiente y vainilla cremosa",
    recommendations: [
      { name: "Tom Ford: Tobacco Vanille (U) Type", slug: "tom-ford-tobacco-vanille-u-type", desc: "Vainilla especiada, hojas de tabaco y maderas cálidas." },
      { name: "Amber White", slug: "amber-white", desc: "Fondo ambarado envolvente para fragancias licorosas." },
    ],
  },
  // ━━━ LOST CHERRY ━━━
  {
    aliases: ["lost cherry", "cherry", "cereza"],
    house: "Tom Ford",
    name: "Lost Cherry",
    notes: "Cereza negra ácida, licor de cereza, almendra amarga, rosa turca, haba tonka tostada, bálsamo del Perú y sándalo",
    recommendations: [
      { name: "Cherry Mango", slug: "cherry-mango", desc: "Cereza dulce y jugosa con notas frutales intensas." },
      { name: "Tom Ford: Tobacco Vanille (U) Type", slug: "tom-ford-tobacco-vanille-u-type", desc: "Excelente para mezclar y aportar fondo dulce ambarado." },
    ],
  },
  // ━━━ DELINA ━━━
  {
    aliases: ["delina", "parfums de marly", "marly delina", "delina exclusif"],
    house: "Parfums de Marly",
    name: "Delina",
    notes: "Rosa turca aterciopelada, lichi jugoso, ruibarbo, bergamota, nuez moscada, vainilla y almizcle blanco",
    recommendations: [
      { name: "Pink Sugar", slug: "pink-sugar", desc: "Aroma dulce, femenino y adictivo con notas de frutos rojos." },
      { name: "Egyptian Musk", slug: "egyptian-musk", desc: "Base de almizcle suave que realza cualquier acorde floral." },
    ],
  },
  // ━━━ IMAGINATION / LV ━━━
  {
    aliases: ["imagination", "louis vuitton", "lv imagination", "afternoon swim", "pacific chill"],
    house: "Louis Vuitton",
    name: "Imagination / Cítricos LV",
    notes: "Té negro chino, ambroxan mineral, bergamota de Calabria, naranja siciliana, jengibre fresco y canela",
    recommendations: [
      { name: "Lemongrass", slug: "lemongrass", desc: "Chispeante frescura cítrica y herbal de alto impacto." },
      { name: "Baby Powder: Clear", slug: "baby-powder-clear", desc: "Limpieza fresca y estela suave durante todo el día." },
    ],
  },
  // ━━━ TYGAR ━━━
  {
    aliases: ["tygar", "bvlgari tygar", "turathi blue"],
    house: "Bvlgari",
    name: "Le Gemme Tygar",
    notes: "Pomelo efervescente ultra realista, jengibre picante y fondo mineral pesado de ambroxan",
    recommendations: [
      { name: "Dior: Sauvage (M) Type", slug: "dior-sauvage-m-type", desc: "Cítrico especiado con potente ambroxan y maderas." },
      { name: "Lemongrass", slug: "lemongrass", desc: "Energía cítrica y fresca." },
    ],
  },
  // ━━━ BLEU DE CHANEL ━━━
  {
    aliases: ["bleu de chanel", "bleu", "blue chanel"],
    house: "Chanel",
    name: "Bleu de Chanel",
    notes: "Pomelo, limón, menta, pimienta rosa, jengibre, nuez moscada, jazmín, incienso, cedro y sándalo",
    recommendations: [
      { name: "Dior: Sauvage (M) Type", slug: "dior-sauvage-m-type", desc: "La esencia azul por excelencia con gran frescura y fondo amaderado." },
      { name: "Creed: Aventus (M) Type", slug: "creed-aventus-m-type", desc: "Elegancia masculina con maderas nobles y frutas frescas." },
    ],
  },
  // ━━━ BACCARAT ROUGE 540 ━━━
  {
    aliases: ["baccarat", "540", "baccarat rouge", "br540", "kurkdjian"],
    house: "Maison Francis Kurkdjian",
    name: "Baccarat Rouge 540",
    notes: "Azafrán exótico, jazmín egipcio, ámbar gris mineral y madera de cedro recién cortado",
    recommendations: [
      { name: "Maison Francis Kurkdjian: Baccarat Rouge 540 (U) Type", slug: "maison-francis-kurkdjian-baccarat-rouge-540-u-type", desc: "¡Nuestra fórmula concentrada tipo 1:1 directa Grado A puro sin cortar!" },
      { name: "Amber White", slug: "amber-white", desc: "Cálido y ambarado con fijación profunda." },
    ],
  },
  // ━━━ SAUVAGE ━━━
  {
    aliases: ["sauvage", "dior sauvage", "sauvage elixir"],
    house: "Dior",
    name: "Sauvage",
    notes: "Bergamota de Calabria radiante, pimienta de Sichuan, lavanda, ambroxan mineral y cedro",
    recommendations: [
      { name: "Dior: Sauvage (M) Type", slug: "dior-sauvage-m-type", desc: "¡Disponible directamente en nuestro catálogo Grado A puro!" },
    ],
  },
  // ━━━ AVENTUS ━━━
  {
    aliases: ["aventus", "creed aventus", "creed"],
    house: "Creed",
    name: "Aventus",
    notes: "Piña ahumada jugosa, bergamota italiana, grosellas negras, abedul ahumado, pachulí y musgo de roble",
    recommendations: [
      { name: "Creed: Aventus (M) Type", slug: "creed-aventus-m-type", desc: "¡Nuestra versión tipo concentrada de máxima proyección!" },
    ],
  },
  // ━━━ TOBACCO VANILLE ━━━
  {
    aliases: ["tobacco vanille", "tom ford tobacco"],
    house: "Tom Ford",
    name: "Tobacco Vanille",
    notes: "Hoja de tabaco aromática, vainilla de Madagascar, cacao puro, haba tonka y frutos secos",
    recommendations: [
      { name: "Tom Ford: Tobacco Vanille (U) Type", slug: "tom-ford-tobacco-vanille-u-type", desc: "¡Disponible directamente en nuestro catálogo Grado A puro!" },
    ],
  },
];

const STOP_WORDS = new Set([
  "necesito", "busco", "quiero", "tienen", "algo", "como", "para", "unos", "unas", "sobre", "hola",
  "perfume", "perfumes", "esencia", "esencias", "fragancia", "fragancias", "aceite", "aceites",
  "dime", "recomiendame", "recomiéndame", "que", "qué", "los", "las", "del", "con", "tipo",
  "buenos", "dias", "tardes", "noches", "saludos", "favor", "gracias"
]);

/**
 * Intelligent Olfactory Matching Engine
 */
function getSmartOlfactoryResponse(userQuery: string): string {
  const q = userQuery.toLowerCase().trim();

  // 1. Check famous perfume knowledgebase & Arabic collection
  for (const p of FAMOUS_PERFUMES) {
    const isMatch = p.aliases.some((alias) => q.includes(alias));
    if (isMatch) {
      const isDirect = p.recommendations.some((r) => r.name.toLowerCase().includes(p.name.toLowerCase()));
      const recList = p.recommendations
        .map((r) => `• [${r.name}](/fragrance/${r.slug}) — ${r.desc}`)
        .join("\n");

      if (isDirect) {
        return `✨ **${p.name} (${p.house})**\n\n¡Sí, contamos con esta formulación en nuestro catálogo Grado A puro sin cortar!\n\n${recList}\n\n📦 *Disponible en presentaciones de 1 oz, 2 oz, 4 oz, 8 oz y 16 oz en botellas de plástico transparente con tapa hermética.*`;
      }

      if (p.name.includes("Árabes")) {
        return `🕌 **Colección de Perfumes y Esencias Árabes / Orientales**\n\nEn **SCENTLAB** contamos con una destacada selección de concentrados de estilo árabe y nicho oriental (maderas nobles de Oud, Ámbar dorado, Azafrán y Almizcles de gran estela y fijación):\n\n${recList}\n\n👉 [Ver todas las esencias Ámbar y Orientales en el Catálogo](/fragrance)\n\n📦 *Disponibles en botellas de plástico transparente con tapa hermética de 1 oz, 2 oz, 4 oz, 8 oz y 16 oz.*`;
      }

      return `✨ **Perfil de ${p.name} (${p.house})**\n\nActualmente no contamos con la referencia exacta de ${p.name}, pero su pirámide olfativa se destaca por:\n*${p.notes}*.\n\nPara recrear o disfrutar de ese mismo acorde vibrante, te recomiendo estas opciones disponibles con enlace directo:\n\n${recList}\n\n💡 *Tip de formulación:* Mezclando nuestras esencias frutales con una base de [Amber White](/fragrance/amber-white) obtienes la misma fijación y estela cálida. Disponibles en botellas de plástico transparente desde 1 oz hasta 16 oz.`;
    }
  }

  // 2. Shipping & Returns FAQ (Tiempos, Costos, Envío Gratis $250, Devoluciones, Daños)
  if (
    q.includes("envio") ||
    q.includes("envío") ||
    q.includes("shipping") ||
    q.includes("gratis") ||
    q.includes("cuanto tarda") ||
    q.includes("cuánto tarda") ||
    q.includes("tiempo de entrega") ||
    q.includes("donde envian") ||
    q.includes("dónde envían") ||
    q.includes("costo de envio") ||
    q.includes("tracking") ||
    q.includes("rastreo") ||
    q.includes("devolucion") ||
    q.includes("devolución") ||
    q.includes("devolver") ||
    q.includes("daño") ||
    q.includes("derrame") ||
    q.includes("roto")
  ) {
    return `🚚 **INFORMACIÓN Y POLÍTICAS DE ENVÍO (SCENTLAB)**

• **ENVÍO GRATIS:** A partir de **$250.00 USD** de compra, tu orden califica automáticamente para envío estándar gratuito a todos los 50 estados de EE. UU. y Puerto Rico.
• **Despacho Rápido (24-48h):** Procesamos, fraccionamos y embalamos los pedidos de lunes a viernes desde nuestro centro de formulación y distribución en **New Jersey, Estados Unidos**.
• **Tiempos de Tránsito:** 
  - *USPS Ground / UPS Ground:* 2 a 5 días hábiles promedio.
  - *USPS Priority Mail:* 1 a 3 días hábiles.
• **Empaque de Seguridad:** Esencias en botellas de plástico transparente con tapa de seguridad hermética sellada antifugas.
• **Garantía por Daños:** Si algún frasco sufre derrame en tránsito, te enviamos un reemplazo inmediato reportándolo dentro de los primeros 5 días hábiles a *support@scentlab.com*.

👉 [Ver Políticas de Envío y Devoluciones Completas](/shipping)`;
  }

  // 2.1 Terms & Trademark Disclaimers
  if (
    q.includes("termino") ||
    q.includes("término") ||
    q.includes("condicion") ||
    q.includes("condición") ||
    q.includes("marca registrada") ||
    q.includes("original o copia") ||
    q.includes("son originales") ||
    q.includes("es original") ||
    q.includes("son clones") ||
    q.includes("legal")
  ) {
    return `⚖️ **CALIDAD GRADO A Y TÉRMINOS COMERCIALES**

• **Pureza Grado A:** Todos nuestros aceites son concentrados puros sin diluir (uncut), formulados para brindar la máxima fijación y proyección en perfumería.
• **Deslinde de Marcas (Inspiraciones / Type):** Los nombres de diseñadores (como *Tom Ford, Creed, Dior, MFK, Le Labo*, etc.) son marcas registradas de sus respectivos dueños. SCENTLAB no tiene afiliación con ellos; las menciones se realizan exclusivamente bajo la doctrina de *uso legítimo nominativo* para describir el perfil de notas aromáticas.

👉 [Ver Términos y Condiciones de Servicio](/terms)`;
  }

  // 2.2 Privacy & Payment Security
  if (
    q.includes("privacidad") ||
    q.includes("seguridad") ||
    q.includes("mis datos") ||
    q.includes("tarjeta") ||
    q.includes("pago seguro") ||
    q.includes("stripe")
  ) {
    return `🔒 **PRIVACIDAD Y PAGOS SEGUROS EN SCENTLAB**

• **Pagos Cifrados:** Procesamos todas las transacciones mediante **Stripe Inc.** bajo el estándar bancario de máxima seguridad **PCI-DSS Nivel 1**. Jamás almacenamos los datos de tu tarjeta de crédito.
• **Protección de Datos:** No vendemos ni compartimos tu información personal o comercial con terceros.

👉 [Ver Política de Privacidad](/privacy)`;
  }

  // 3. Perfume formulation / dilution advice
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

  // 4. Note/family keyword search across catalog with clean stop words
  const searchWords = q
    .replace(/[¿?¡!.,;:()]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  if (searchWords.length > 0) {
    let candidateMatches = INITIAL_FRAGRANCES.filter((f) => {
      const text = `${f.name} ${f.scentFamily} ${f.description || ""}`.toLowerCase();
      return searchWords.some((w) => text.includes(w));
    }).slice(0, 4);

    if (candidateMatches.length > 0) {
      const list = candidateMatches
        .map((m) => `• [${m.name}](/fragrance/${m.slug}) — *Familia: ${m.scentFamily}*`)
        .join("\n");
      return `Encontré estas excelentes esencias en nuestro catálogo que coinciden con lo que buscas:\n\n${list}\n\n👉 [Ver todas las esencias en el Catálogo](/fragrance)\n\n¿Deseas saber más sobre sus notas o cómo formularlas?`;
    }
  }

  return "¡Con gusto te asesoro! En **SCENTLAB** contamos con más de 1,390 aceites de fragancia puros Grado A sin cortar.\n\n• [Ver Catálogo de Esencias](/fragrance)\n• [Ver Frascos y Atomizadores](/bottles)\n• [Ver Suministros de Laboratorio](/testing)\n\n¿Buscas alguna fragancia o diseñador en especial (ej. *Perfumes Árabes*, *God of Fire*, *Santal 33*, *Baccarat 540*, *Sauvage*), o qué tipo de notas olfativas prefieres (cítricas, amaderadas, dulces, florales)?";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing messages array" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // If API key is configured and valid, attempt Gemini call
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
        console.warn("Gemini API call skipped, using local Olfactory Intelligence Engine:", geminiErr);
      }
    }

    // High-precision Olfactory Intelligence Engine
    const smartReply = getSmartOlfactoryResponse(lastUserMessage);
    return NextResponse.json({ reply: smartReply });
  } catch (error: any) {
    console.error("Assistant Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
