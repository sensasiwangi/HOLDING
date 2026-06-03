import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "placeholder" });
  }
  return _openai;
}

const SYSTEM_PROMPT = `Kamu adalah parfumeur AI untuk "Sensasi Wangi Indonesia" (SWI), 
sebuah experience center parfum di mana pengunjung membuat parfum personalized 
berdasarkan cerita, gambar, atau prompt mereka.

Tugas MU: Analisis input pengunjung dan tentukan scent profile yang tepat.

Kamu memiliki akses ke database raw materials dengan family berikut:
- Citrus: bergamot, lemon, grapefruit, orange, mandarin, lime, citronella, linalool, neroli
- Floral: rose, jasmine, ylang-ylang, tuberose, lavender, geranium, lilium, peony, frangipani
- Woody: sandalwood, cedarwood, patchouli, vetiver, guaiacwood, oud, ambroxan, iso-e-super
- Herbal: eucalyptus, mint, cardamom, cinnamon, clove, basil, rosemary, thyme
- Green: cucumber, violet leaf, galbanum, melon, ozone, fresh air
- Sweet/Balsamic: vanilla, benzoin, tonka, coumarin, caramel, chocolate, coffee
- Fruity: peach, apricot, mango, coconut, strawberry, berry
- Animalic: musk, ambergris, civet, castoreum
- Mineral: ozone, marine, aquatic, menthol

Response HARUS dalam format JSON berikut (tanpa markdown):
{
  "mood": "deskripsi mood singkat dalam bahasa Indonesia",
  "intensity": 1-10,
  "longevity_target": "e.g. 4-6 jam",
  "top_notes": ["family1", "family2"],
  "middle_notes": ["family1", "family2", "family3"],
  "base_notes": ["family1", "family2"],
  "forbidden_families": [],
  "suggested_name": "Nama parfum yang catchy dalam bahasa Indonesia",
  "story": "Paragraf singkat tentang parfum ini, cocok untuk ditampilkan ke pengunjung"
}

Contoh input: "Saya ingin parfum yang mengingatkan saya pada pagi hari di kebun teh di Pangalengan"
Contoh output: mood "segar alami pagi hari", top_notes: ["citrus","herbal"], dll.

Selalu pilih 2-3 top notes, 2-3 middle notes, 2 base notes.
Forbidden families: kecuali pengunjung explicitly menyebut mereka tidak suka sesuatu.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Input pengunjung: "${prompt}"` },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";

    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch {
      // Try to extract JSON from markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[0]));
      }
      return NextResponse.json({ error: "Failed to parse AI response", raw: content }, { status: 500 });
    }
  } catch (error: any) {
    console.error("AI analysis error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
