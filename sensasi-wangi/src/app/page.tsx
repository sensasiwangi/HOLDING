"use client";

import { useState } from "react";

type InputMode = "prompt" | "image" | "mood";
type Step = "input" | "analyzing" | "formula" | "mixing" | "done";

interface ScentProfile {
  mood: string;
  intensity: number;
  longevity_target: string;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  suggested_name: string;
  story: string;
}

interface FormulaIngredient {
  name: string;
  family: string;
  note_position: string;
  quantity_drops: number;
  quantity_grams: number;
  step_label: string;
}

interface MixingStep {
  step_number: number;
  step_title: string;
  step_description: string;
  visual_color: string;
  animation_type: string;
  ingredients?: FormulaIngredient[];
}

const MOOD_PRESETS = [
  { emoji: "🌊", label: "Segar & Aquatic", prompt: "Segar seperti angin laut, aquatic, clean" },
  { emoji: "🌸", label: "Romantis Floral", prompt: "Romantis, floral lembut, feminin, elegan" },
  { emoji: "🌿", label: "Alami Herbal", prompt: "Alami, herbal, minty, seperti taman rempah" },
  { emoji: "🍊", label: "Citrus Energik", prompt: "Citrus segar, energik, bright, pagi hari" },
  { emoji: "🪵", label: "Warm Woody", prompt: "Hangat, woody, maskulin, seperti hutan tropis" },
  { emoji: "🍫", label: "Gourmand Manis", prompt: "Manis, gourmand, vanilla, coklat, cozy" },
  { emoji: "🌺", label: "Tropical Paradise", prompt: "Tropis, buah-buahan, coconut, vacation vibes" },
  { emoji: "🏛️", label: "Indonesian Heritage", prompt: "Nusantara, rempah, kayu wangi, budaya Indonesia" },
];

const FAMILY_COLORS: Record<string, string> = {
  Citrus: "#F4C430",
  Floral: "#E8B4C8",
  Woody: "#8B6914",
  Herbal: "#4A6741",
  Green: "#7EB8DA",
  "Sweet/Balsamic": "#D4A843",
  Fruity: "#FF6B6B",
  Animalic: "#C9B896",
  Mineral: "#A8D8EA",
};

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [inputMode, setInputMode] = useState<InputMode>("prompt");
  const [prompt, setPrompt] = useState("");
  const [profile, setProfile] = useState<ScentProfile | null>(null);
  const [formula, setFormula] = useState<any>(null);
  const [error, setError] = useState("");
  const [currentMixStep, setCurrentMixStep] = useState(0);

  async function handleAnalyze() {
    setStep("analyzing");
    setError("");

    try {
      const endpoint = inputMode === "image" ? "/api/analyze-image" : "/api/analyze";
      const body = inputMode === "image"
        ? { image: prompt }
        : { prompt };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Analisis gagal");

      const data = await res.json();
      setProfile(data);

      // Generate formula
      const formulaRes = await fetch("/api/formulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: inputMode,
          input_text: prompt,
          ai_mood: data.mood,
          scent_profile: data,
          ingredients: generateLocalFormula(data),
          mixing_steps: generateLocalSteps(data),
          maturation_days: 14,
          maturation_notes: "Simpan botol ini di tempat gelap selama 14 hari. Aduk pelan setiap 2-3 hari.",
          total_cost: 0,
          selling_price: 0,
        }),
      });

      if (formulaRes.ok) {
        const formulaData = await formulaRes.json();
        setFormula(formulaData);
      }

      setStep("formula");
    } catch (err: any) {
      setError(err.message);
      setStep("input");
    }
  }

  function generateLocalFormula(profile: ScentProfile): FormulaIngredient[] {
    const ingredients: FormulaIngredient[] = [];
    let order = 1;

    for (const note of profile.top_notes.slice(0, 2)) {
      ingredients.push({
        name: note.charAt(0).toUpperCase() + note.slice(1),
        family: note,
        note_position: "top",
        quantity_drops: 15,
        quantity_grams: 0.75,
        step_label: "Top Notes",
      });
      order++;
    }

    for (const note of profile.middle_notes.slice(0, 3)) {
      ingredients.push({
        name: note.charAt(0).toUpperCase() + note.slice(1),
        family: note,
        note_position: "middle",
        quantity_drops: 12,
        quantity_grams: 0.6,
        step_label: "Middle Notes",
      });
      order++;
    }

    for (const note of profile.base_notes.slice(0, 2)) {
      ingredients.push({
        name: note.charAt(0).toUpperCase() + note.slice(1),
        family: note,
        note_position: "base",
        quantity_drops: 10,
        quantity_grams: 0.5,
        step_label: "Base Notes",
      });
      order++;
    }

    return ingredients;
  }

  function generateLocalSteps(profile: ScentProfile): MixingStep[] {
    const steps: MixingStep[] = [];
    let n = 1;

    steps.push({
      step_number: n++, step_title: "Tambahkan Top Notes",
      step_description: "Teteskan bahan top notes ke dalam beaker",
      visual_color: FAMILY_COLORS.Citrus || "#FFD700", animation_type: "pour",
    });

    steps.push({
      step_number: n++, step_title: "Aduk Pelan",
      step_description: "Goyangkan beaker perlahan 10 detik",
      visual_color: "#CCCCCC", animation_type: "shake",
    });

    steps.push({
      step_number: n++, step_title: "Tambahkan Middle Notes",
      step_description: "Teteskan bahan middle notes ke dalam beaker",
      visual_color: FAMILY_COLORS.Floral || "#E8B4C8", animation_type: "pour",
    });

    steps.push({
      step_number: n++, step_title: "Aduk Pelan",
      step_description: "Goyangkan beaker perlahan 10 detik",
      visual_color: "#CCCCCC", animation_type: "shake",
    });

    steps.push({
      step_number: n++, step_title: "Tambahkan Base Notes",
      step_description: "Teteskan bahan base notes ke dalam beaker",
      visual_color: FAMILY_COLORS.Woody || "#8B6914", animation_type: "pour",
    });

    steps.push({
      step_number: n++, step_title: "Aduk Rata",
      step_description: "Goyangkan beaker 30 detik hingga homogen",
      visual_color: "#888888", animation_type: "shake",
    });

    steps.push({
      step_number: n++, step_title: "Tambahkan Alkohol",
      step_description: "Tambahkan Ethanol 96% hingga total 30ml. Goyangkan 1 menit",
      visual_color: "#7EB8DA", animation_type: "pour",
    });

    steps.push({
      step_number: n++, step_title: "Pindahkan ke Botol",
      step_description: "Tuang ke botol 30ml menggunakan corong. Tutup rapat",
      visual_color: "#FFFFFF", animation_type: "pour",
    });

    steps.push({
      step_number: n, step_title: "Masterasi",
      step_description: "Simpan botol di tempat gelap selama 14 hari. Aduk pelan setiap 2-3 hari",
      visual_color: "#2C1810", animation_type: "wait",
    });

    return steps;
  }

  function reset() {
    setStep("input");
    setPrompt("");
    setProfile(null);
    setFormula(null);
    setCurrentMixStep(0);
  }

  // ═══ RENDER ═══

  if (step === "analyzing") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🧪</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#8B6914" }}>
            AI sedang meracik parfum Anda...
          </h2>
          <p className="text-gray-600">Menganalisis cerita Anda dan memilih bahan terbaik</p>
          <div className="mt-6 flex justify-center gap-2">
            <span className="animate-bounce">🌸</span>
            <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>🌿</span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>🍊</span>
            <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>🪵</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === "formula" && profile) {
    const ingredients = generateLocalFormula(profile);
    const steps = generateLocalSteps(profile);

    return (
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#8B6914" }}>
            {profile.suggested_name}
          </h1>
          <p className="text-gray-600 italic">{profile.story}</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#F5E6D3" }}>
              Mood: {profile.mood}
            </span>
            <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#F5E6D3" }}>
              Intensitas: {profile.intensity}/10
            </span>
            <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "#F5E6D3" }}>
              Tahan: {profile.longevity_target}
            </span>
          </div>
        </div>

        {/* Formula Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#8B6914" }}>
            🧪 Formula Parfum (Botol 30ml)
          </h2>

          {/* Note layers */}
          {["Top Notes", "Middle Notes", "Base Notes"].map((layer) => {
            const layerIngs = ingredients.filter(i => i.step_label === layer);
            if (layerIngs.length === 0) return null;
            return (
              <div key={layer} className="mb-4">
                <h3 className="font-semibold text-sm mb-2" style={{ color: layer === "Top Notes" ? "#F4C430" : layer === "Middle Notes" ? "#E8B4C8" : "#8B6914" }}>
                  {layer}
                </h3>
                {layerIngs.map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="font-medium">{ing.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({ing.family})</span>
                    </div>
                    <div className="text-right text-sm">
                      <span className="font-mono">{ing.quantity_drops} tetes</span>
                      <span className="text-gray-400 mx-1">|</span>
                      <span className="font-mono">{ing.quantity_grams}g</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Carrier */}
          <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">Ethanol 96% (carrier)</span>
              <span className="font-mono text-sm">~25.5 ml</span>
            </div>
          </div>
        </div>

        {/* Mixing Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#8B6914" }}>
            📋 Panduan Mixing
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Campurkan di beaker, lalu pindahkan ke botol 30ml
          </p>

          {steps.map((s, idx) => (
            <div
              key={idx}
              className="step-card animate-fadeIn"
              style={{ borderLeftColor: s.visual_color, animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: s.visual_color }}>
                  {s.step_number}
                </span>
                <div>
                  <h4 className="font-semibold">{s.step_title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{s.step_description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Maturation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-2" style={{ color: "#8B6914" }}>
            🌙 Masterasi
          </h2>
          <div className="p-4 rounded-lg" style={{ backgroundColor: "#2C1810", color: "white" }}>
            <p className="text-center">
              Simpan botol ini di tempat gelap selama <strong>14 hari</strong>.
              Aduk pelan setiap 2-3 hari. Setelah 14 hari, parfum siap digunakan.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setStep("mixing")}
            className="flex-1 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: "#8B6914" }}
          >
            Mulai Mixing
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl border-2 font-semibold"
            style={{ borderColor: "#8B6914", color: "#8B6914" }}
          >
            Buat Baru
          </button>
        </div>
      </div>
    );
  }

  if (step === "mixing") {
    const steps = generateLocalSteps(profile!);
    const currentStep = steps[currentMixStep];

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "#8B6914" }}>
            Step {currentMixStep + 1} / {steps.length}
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((currentMixStep + 1) / steps.length) * 100}%`,
                backgroundColor: "#8B6914",
              }}
            />
          </div>
        </div>

        {currentStep && (
          <div
            className="bg-white rounded-2xl shadow-lg p-8 text-center animate-fadeIn"
            style={{ borderTop: `4px solid ${currentStep.visual_color}` }}
          >
            <div className="text-5xl mb-4">
              {currentStep.animation_type === "pour" ? "🧪" :
               currentStep.animation_type === "shake" ? "🫧" :
               currentStep.animation_type === "wait" ? "⏳" : "✨"}
            </div>
            <h3 className="text-2xl font-bold mb-3">{currentStep.step_title}</h3>
            <p className="text-gray-600 text-lg">{currentStep.step_description}</p>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          {currentMixStep > 0 && (
            <button
              onClick={() => setCurrentMixStep(s => s - 1)}
              className="px-6 py-3 rounded-xl border-2 font-semibold"
              style={{ borderColor: "#8B6914", color: "#8B6914" }}
            >
              ← Sebelumnya
            </button>
          )}
          <button
            onClick={() => {
              if (currentMixStep < steps.length - 1) {
                setCurrentMixStep(s => s + 1);
              } else {
                setStep("done");
              }
            }}
            className="flex-1 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: "#8B6914" }}
          >
            {currentMixStep < steps.length - 1 ? "Selanjutnya →" : "Selesai! 🎉"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#8B6914" }}>
            Parfum Anda Siap Di-Masterasi!
          </h2>
          <p className="text-gray-600 mb-6">
            Ingat: simpan botol di tempat gelap selama 14 hari untuk hasil terbaik.
            Parfum akan semakin harum seiring waktu!
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold mb-2">Tips Masterasi:</h3>
            <ul className="text-left text-sm text-gray-600 space-y-2">
              <li>✅ Simpan di tempat gelap & sejuk</li>
              <li>✅ Aduk pelan setiap 2-3 hari</li>
              <li>✅ Jangan buka tutup selama proses</li>
              <li>✅ Setelah 14 hari, saring dengan filter kopi</li>
              <li>✅ Parfum bisa bertahan 1-2 tahun</li>
            </ul>
          </div>
          <button
            onClick={reset}
            className="w-full py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: "#8B6914" }}
          >
            Buat Parfum Baru
          </button>
        </div>
      </div>
    );
  }

  // ═══ INPUT STEP ═══
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#8B6914" }}>
          🌸 Sensasi Wangi Indonesia
        </h1>
        <p className="text-gray-600 text-lg">Your Story, Your Scent</p>
        <p className="text-sm text-gray-400 mt-1">AI Perfume Composer • Botol 30ml</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Input Mode Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "prompt" as InputMode, label: "✍️ Cerita / Prompt" },
            { key: "mood" as InputMode, label: "🎭 Pilih Mood" },
            { key: "image" as InputMode, label: "📷 Upload Gambar" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setInputMode(tab.key); setPrompt(""); }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                inputMode === tab.key
                  ? "text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
              style={inputMode === tab.key ? { backgroundColor: "#8B6914" } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Text Prompt */}
        {inputMode === "prompt" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block font-semibold mb-2" style={{ color: "#8B6914" }}>
              Ceritakan parfum impian Anda...
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: Saya ingin parfum yang mengingatkan saya pada sore hari di tepi Pantai Selatan, dengan hembusan angin yang hangat dan aroma kelapa..."
              className="w-full h-32 p-4 border-2 rounded-xl resize-none focus:outline-none"
              style={{ borderColor: "#F5E6D3" }}
            />
            <p className="text-xs text-gray-400 mt-2">
              Semakin detail cerita Anda, semakin personal parfum yang dihasilkan AI
            </p>
          </div>
        )}

        {/* Mood Presets */}
        {inputMode === "mood" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block font-semibold mb-4" style={{ color: "#8B6914" }}>
              Pilih mood yang Anda inginkan:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {MOOD_PRESETS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setPrompt(mood.prompt)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    prompt === mood.prompt
                      ? "ring-2 shadow-lg"
                      : "border border-gray-200 hover:border-gray-300"
                  }`}
                  style={prompt === mood.prompt ? { outline: "2px solid #8B6914", backgroundColor: "#FFF8F0" } : {}}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <p className="font-semibold mt-1 text-sm">{mood.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        {inputMode === "image" && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block font-semibold mb-2" style={{ color: "#8B6914" }}>
              Upload gambar inspirasi
            </label>
            <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: "#F5E6D3" }}>
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-500 text-sm">
                Foto pemandangan, warna, atau apapun yang menginspirasi parfum Anda
              </p>
              <p className="text-xs text-gray-400 mt-2">
                (Fitur upload gambar akan aktif setelah deployment)
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleAnalyze}
          disabled={!prompt}
          className={`w-full mt-6 py-4 rounded-xl text-white font-bold text-lg transition-all ${
            prompt ? "shadow-lg hover:shadow-xl" : "opacity-50 cursor-not-allowed"
          }`}
          style={{ backgroundColor: "#8B6914" }}
        >
          🧪 Racik Parfum Saya
        </button>

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: "#F5E6D3" }}>
          <h3 className="font-semibold mb-2" style={{ color: "#8B6914" }}>
            Bagaimana cara kerjanya?
          </h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Ceritakan inspirasi parfum Anda (cerita, gambar, atau mood)</li>
            <li>2. AI menganalisis dan memilih bahan dari 300+ raw material</li>
            <li>3. Formula dibuat dengan mempertimbangkan stok yang tersedia</li>
            <li>4. Anda campur sendiri di beaker sesuai panduan step-by-step</li>
            <li>5. Pindahkan ke botol 30ml, masterasi 14 hari di tempat gelap</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
