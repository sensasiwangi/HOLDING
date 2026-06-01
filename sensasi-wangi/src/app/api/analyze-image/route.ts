import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Kamu adalah parfumeur AI untuk "Sensasi Wangi Indonesia".
Pengunjung memberikan gambar, dan kamu harus menganalisis gambar tersebut
dan merubahnya ke scent profile untuk formula parfum.

Analisis elemen visual dalam gambar:
- Warna: oranye/merah → warm spices, amber, vanilla; biru → aquatic, marine, fresh; hijau → herbal, green notes; putih → clean, floral, musk; coklat → woody, gourmand, patchouli
- Objek: laut → aquatic, sea salt; hutan → woody, green, moss; bunga → floral; buah → fruity; makanan → gourmand
- Mood: cerah → citrus, fresh; gelap → oriental, woody; lembut → floral, musk; tajam → spicy, green

Response HARUS dalam format JSON (tanpa markdown):
{
  "mood": "deskripsi mood",
  "intensity": 1-10,
  "longevity_target": "e.g. 4-6 jam",
  "top_notes": ["family1", "family2"],
  "middle_notes": ["family1", "family2"],
  "base_notes": ["family1", "family2"],
  "image_analysis": "Apa yang kamu lihat dalam gambar dan bagaimana menerjemahkannya ke aroma",
  "suggested_name": "Nama parfum catchy",
  "story": "Paragraf untuk pengunjung"
}`;

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text" as const, text: SYSTEM_PROMPT + "\n\nAnalisis gambar ini dan buat scent profile:" },
            { type: "image_url" as const, image_url: { url: image, detail: "low" } },
          ],
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";

    try {
      return NextResponse.json(JSON.parse(content));
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[0]));
      }
      return NextResponse.json({ error: "Failed to parse", raw: content }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Image analysis error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
