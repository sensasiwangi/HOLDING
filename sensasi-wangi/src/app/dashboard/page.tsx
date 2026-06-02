"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FlaskConical, ShieldCheck, DollarSign, Package, Users, Truck, BookOpen,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Droplets,
  BarChart3, PieChart, Sparkles, ChevronRight, X, RefreshCw,
  ClipboardList, Zap, ArrowRight, Send, Plus, Search, Minus,
} from "lucide-react";

// ── Keuangan sub-page import ──
import KeuanganPage from "./keuangan/page";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Toast { id: number; type: "success" | "error" | "info"; message: string; }
type ViewMode = "dashboard" | "operasional";
type Tab = "overview" | "produksi" | "qc" | "keuangan" | "inventory" | "customer" | "supplier" | "sop";

function uid() { return Date.now() + Math.random(); }

// ═══════════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border backdrop-blur-xl text-xs animate-fade-up ${
          t.type === "success" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
          t.type === "error" ? "bg-red-500/15 border-red-500/30 text-red-400" :
          "bg-blue-500/15 border-blue-500/30 text-blue-400"
        }`}>
          {t.type === "success" ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" /> :
           t.type === "error" ? <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" /> :
           <Clock size={14} className="mt-0.5 flex-shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100"><X size={12} /></button>
        </div>
      ))}
    </div>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return <RefreshCw size={size} className="animate-spin text-teal-400" />;
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    passed: "bg-emerald-500/15 text-emerald-400", ok: "bg-emerald-500/15 text-emerald-400",
    low: "bg-orange-500/15 text-orange-400", critical: "bg-red-500/15 text-red-400",
    empty: "bg-red-500/15 text-red-400", completed: "bg-emerald-500/15 text-emerald-400",
    confirmed: "bg-blue-500/15 text-blue-400", pending: "bg-orange-500/15 text-orange-400",
    mixed: "bg-purple-500/15 text-purple-400", draft: "bg-zinc-500/15 text-zinc-400",
    new: "bg-blue-500/15 text-blue-400", regular: "bg-teal-500/15 text-teal-400",
    loyal: "bg-purple-500/15 text-purple-400", vip: "bg-amber-500/15 text-amber-400",
    fail: "bg-red-500/15 text-red-400", warn: "bg-yellow-500/15 text-yellow-400",
    pass: "bg-emerald-500/15 text-emerald-400", in_progress: "bg-blue-500/15 text-blue-400",
    pemula: "bg-blue-500/15 text-blue-400", menengah: "bg-orange-500/15 text-orange-400",
    lanjut: "bg-red-500/15 text-red-400",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${map[status] || "bg-zinc-500/15 text-zinc-400"}`}>{status}</span>;
}

function KpiCard({ icon, label, value, sub, color }: any) {
  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${color} border border-white/[0.06] hover:border-white/[0.12] transition-all`}>
      <div className="text-teal-400 mb-3">{icon}</div>
      <div className="text-[11px] text-[#5a8a78] font-medium mb-1">{label}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-[10px] text-[#4a6a5a] mt-1">{sub}</div>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-semibold text-[#6b9e8f] mb-1 uppercase tracking-wider">{children}</label>;
}

function FormInput({ ...props }: any) {
  return <input {...props} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-[#3d5048] focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all" />;
}

function FormSelect({ ...props }: any) {
  return <select {...props} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500/50 transition-all" />;
}

function FormTextarea({ ...props }: any) {
  return <textarea {...props} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs placeholder-[#3d5048] focus:outline-none focus:border-teal-500/50 transition-all resize-none" />;
}

function PrimaryButton({ children, loading, ...props }: any) {
  return (
    <button {...props} disabled={loading || props.disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
      {loading ? <Spinner size={12} /> : null}{children}
    </button>
  );
}

function SecondaryButton({ children, ...props }: any) {
  return (
    <button {...props}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-[#6b9e8f] hover:text-white hover:bg-white/[0.08] transition-all">
      {children}
    </button>
  );
}

function DangerButton({ children, ...props }: any) {
  return (
    <button {...props}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-all">
      {children}
    </button>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="text-center py-8 text-[12px] text-[#4a6a5a]">{msg}</div>;
}

function Panel({ title, icon, children, badge, className = "" }: any) {
  return (
    <div className={`rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-all ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">{icon} {title}</h3>
        {badge && <div>{badge}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ProgressBar({ pct, color = "from-teal-500 to-teal-400", h = "h-1.5" }: { pct: number; color?: string; h?: string }) {
  return <div className={`${h} bg-white/5 rounded-full overflow-hidden`}><div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${Math.min(100, pct)}%` }} /></div>;
}

async function api(path: string, method = "GET", body?: any) {
  const opts: any = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`/api/${path}`, opts);
  return res.json();
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW PANEL 1: TERIMA BAHAN BAKU
// ═══════════════════════════════════════════════════════════════

function PanelTerimaBahan({ materials, suppliers, onRefresh }: any) {
  const [form, setForm] = useState({ material_name: "", material_id: "", quantity_ml: "", unit_cost: "", batch_number: "", expiry_date: "", supplier_id: "", qc_status: "passed", checked_by: "" });
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);

  const submit = async () => {
    if (!form.material_name || !form.quantity_ml) return;
    setLoading(true);
    const res = await api("batch-receive", "POST", { ...form, quantity_ml: parseFloat(form.quantity_ml), material_id: form.material_id ? parseInt(form.material_id) : undefined, supplier_id: form.supplier_id ? parseInt(form.supplier_id) : undefined });
    setLoading(false);
    if (res.success) {
      setForm({ material_name: "", material_id: "", quantity_ml: "", unit_cost: "", batch_number: "", expiry_date: "", supplier_id: "", qc_status: "passed", checked_by: "" });
      onRefresh();
    }
    return res;
  };

  return (
    <Panel title="Terima Bahan Baku" icon={<Package size={14} className="text-teal-400" />}
      badge={<Badge status="Step 1" />}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <FieldLabel>Material</FieldLabel>
          <FormSelect value={form.material_id} onChange={e => { const m = materials.find((x: any) => x.id === parseInt(e.target.value)); setForm({ ...form, material_id: e.target.value, material_name: m?.name || "" }); }}>
            <option value="">-- Pilih material atau ketik baru --</option>
            {materials.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.stock_ml.toFixed(1)}ml)</option>)}
          </FormSelect>
          <FormInput placeholder="Atau ketik nama material baru..." value={form.material_name} onChange={e => setForm({ ...form, material_name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div><FieldLabel>Quantity (ml)</FieldLabel><FormInput type="number" placeholder="0" value={form.quantity_ml} onChange={e => setForm({ ...form, quantity_ml: e.target.value })} /></div>
            <div><FieldLabel>Unit Cost (Rp)</FieldLabel><FormInput type="number" placeholder="0" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><FieldLabel>Batch Number</FieldLabel><FormInput placeholder="LOT-001" value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })} /></div>
            <div><FieldLabel>Expiry Date</FieldLabel><FormInput type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><FieldLabel>Supplier</FieldLabel>
              <FormSelect value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
                <option value="">-- Pilih supplier --</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </FormSelect>
            </div>
            <div><FieldLabel>QC Status</FieldLabel>
              <FormSelect value={form.qc_status} onChange={e => setForm({ ...form, qc_status: e.target.value })}>
                <option value="passed">Passed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed (Karantina)</option>
              </FormSelect>
            </div>
          </div>
          <FieldLabel>Checked By</FieldLabel>
          <FormInput placeholder="Nama pemeriksa" value={form.checked_by} onChange={e => setForm({ ...form, checked_by: e.target.value })} />
          <PrimaryButton loading={loading} onClick={submit as any}><Send size={12} /> Konfirmasi Penerimaan</PrimaryButton>
        </div>
        <div>
          <FieldLabel>Riwayat Penerimaan Terakhir</FieldLabel>
          {recent.length === 0 ? <EmptyState msg="Belum ada riwayat" /> : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recent.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] text-[10px]">
                  <Badge status={r.qc_status} />
                  <span className="text-white font-medium flex-1 truncate">{r.material_name}</span>
                  <span className="text-[#6b9e8f]">{r.quantity_ml}ml</span>
                  <span className="text-[#4a6a5a]">{r.created_at?.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW PANEL 2: BUAT FORMULA
// ═══════════════════════════════════════════════════════════════

function PanelBuatFormula({ onRefresh }: any) {
  const [prompt, setPrompt] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formulas, setFormulas] = useState<any[]>([]);

  const analyze = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await api("analyze", "POST", { prompt });
      if (res.success) {
        const formula = await api("formulas", "GET");
        setAiResult(res);
      }
    } catch {}
    setLoading(false);
  };

  const saveFormula = async () => {
    if (!aiResult) return;
    setSaving(true);
    const res = await api("formula-save", "POST", { profile: aiResult.profile, result: aiResult.result, input_type: "text_prompt", input_text: prompt });
    setSaving(false);
    if (res.success) {
      setAiResult(null);
      setPrompt("");
      onRefresh();
    }
    return res;
  };

  return (
    <Panel title="Buat Formula" icon={<Sparkles size={14} className="text-purple-400" />}
      badge={<Badge status="Step 2" />}>
      <div className="space-y-4">
        <div>
          <FieldLabel>Deskripsi Scent / Mood</FieldLabel>
          <FormTextarea rows={3} placeholder="Contoh: Parfum segar citrus untuk pagi hari, cocok untuk cuaca tropis Indonesia..." value={prompt} onChange={e => setPrompt(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <PrimaryButton loading={loading} onClick={analyze}><Zap size={12} /> Analisis dengan AI</PrimaryButton>
            {aiResult && <PrimaryButton loading={saving} onClick={saveFormula as any}><CheckCircle2 size={12} /> Simpan Formula</PrimaryButton>}
          </div>
        </div>

        {aiResult && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-white">Hasil Analisis AI</div>
              <div className="flex items-center gap-2">
                {aiResult.compliance && <Badge status={aiResult.compliance.overallStatus} />}
              </div>
            </div>
            {aiResult.result?.ingredients && (
              <div className="space-y-1 mb-3">
                {aiResult.result.ingredients.slice(0, 6).map((ing: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <span className="text-[#4a6a5a] w-4">{i + 1}.</span>
                    <span className="text-white flex-1">{ing.name}</span>
                    <span className="text-[#6b9e8f]">{ing.quantity_drops} tetes</span>
                    <span className="text-[#6b9e8f]">{ing.quantity_grams}g</span>
                  </div>
                ))}
              </div>
            )}
            {aiResult.result?.total_cost > 0 && (
              <div className="flex items-center gap-4 text-[10px] pt-2 border-t border-white/[0.06]">
                <span className="text-[#6b9e8f]">HPP: <b className="text-teal-400">Rp {aiResult.result.total_cost.toLocaleString("id-ID")}</b></span>
                <span className="text-[#6b9e8f]">Concentrate: <b>{aiResult.result.total_concentrate_ml}ml</b></span>
                <span className="text-[#6b9e8f]">Maturation: <b>{aiResult.result.maturation_days} hari</b></span>
              </div>
            )}
          </div>
        )}

        {/* Quick select from existing formulas */}
        <div>
          <FieldLabel>Atau Pilih Formula yang Sudah Ada</FieldLabel>
          {formulas.length === 0 ? <EmptyState msg="Belum ada formula tersimpan" /> : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formulas.filter((f: any) => f.status === "confirmed").map((f: any) => (
                <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer">
                  <FlaskConical size={12} className="text-teal-400" />
                  <div className="flex-1">
                    <div className="text-[11px] font-medium text-white">{f.formula_code} — {f.ai_mood}</div>
                    <div className="text-[9px] text-[#4a6a5a]">Cost: Rp {f.total_cost?.toLocaleString("id-ID")}</div>
                  </div>
                  <Badge status={f.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW PANEL 3: PRODUKSI
// ═══════════════════════════════════════════════════════════════

function PanelProduksi({ formulas, onRefresh }: any) {
  const [form, setForm] = useState({ formula_id: "", target_units: "10", staff_name: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [stockCheck, setStockCheck] = useState<any>(null);
  const [activeBatches, setActiveBatches] = useState<any[]>([]);

  const checkStock = async () => {
    if (!form.formula_id) return;
    const formula = formulas.find((f: any) => f.id === parseInt(form.formula_id));
    if (!formula) return;
    // Get formula ingredients
    const res = await api(`formulas?formulaId=${form.formula_id}`);
    if (res.success && res.ingredients) {
      const checks = (res.ingredients as any[]).map((ing: any) => ({
        name: ing.name,
        needed: (ing.quantity_ml || 0) * parseInt(form.target_units),
        available: ing.stock_ml || 0,
        ok: (ing.stock_ml || 0) >= (ing.quantity_ml || 0) * parseInt(form.target_units),
      }));
      setStockCheck({ ok: checks.every((c: any) => c.ok), checks });
    }
  };

  const startProduction = async () => {
    if (!form.formula_id) return;
    setLoading(true);
    const res = await api("produce", "POST", { formula_id: parseInt(form.formula_id), target_units: parseInt(form.target_units), staff_name: form.staff_name, notes: form.notes });
    setLoading(false);
    if (res.success) {
      setForm({ formula_id: "", target_units: "10", staff_name: "", notes: "" });
      setStockCheck(null);
      onRefresh();
    }
    return res;
  };

  const confirmFormula = async (formulaId: number) => {
    await api("formula-save", "PUT", { formula_id: formulaId, status: "confirmed" });
    onRefresh();
  };

  return (
    <Panel title="Produksi Batch" icon={<FlaskConical size={14} className="text-orange-400" />}
      badge={<Badge status="Step 3" />}>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <FieldLabel>Pilih Formula</FieldLabel>
            <FormSelect value={form.formula_id} onChange={e => { setForm({ ...form, formula_id: e.target.value }); setStockCheck(null); }}>
              <option value="">-- Pilih formula --</option>
              {formulas.map((f: any) => <option key={f.id} value={f.id}>{f.formula_code} — {f.ai_mood} [{f.status}]</option>)}
            </FormSelect>
            <div className="grid grid-cols-2 gap-3">
              <div><FieldLabel>Target Unit (botol)</FieldLabel><FormInput type="number" value={form.target_units} onChange={e => setForm({ ...form, target_units: e.target.value })} /></div>
              <div><FieldLabel>Nama Staff</FieldLabel><FormInput placeholder="Yang bertugas" value={form.staff_name} onChange={e => setForm({ ...form, staff_name: e.target.value })} /></div>
            </div>
            <FieldLabel>Catatan</FieldLabel>
            <FormInput placeholder="Catatan tambahan..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <div className="flex gap-2">
              <SecondaryButton onClick={checkStock}><Search size={12} /> Cek Stok</SecondaryButton>
              <PrimaryButton loading={loading} onClick={startProduction as any} disabled={stockCheck && !stockCheck.ok}><Send size={12} /> Mulai Produksi</PrimaryButton>
            </div>
          </div>

          <div>
            {stockCheck && (
              <div className={`p-3 rounded-xl border mb-3 ${stockCheck.ok ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                <div className={`text-xs font-bold mb-2 ${stockCheck.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {stockCheck.ok ? "✓ Stok mencukupi" : "✗ Stok tidak cukup"}
                </div>
                <div className="space-y-1">
                  {stockCheck.checks.map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <span className={c.ok ? "text-emerald-400" : "text-red-400"}>{c.ok ? "✓" : "✗"}</span>
                      <span className="text-white flex-1">{c.name}</span>
                      <span className="text-[#6b9e8f]">{c.needed.toFixed(1)}ml</span>
                      <span className="text-[#4a6a5a]">/ {c.available.toFixed(1)}ml</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <FieldLabel>Aktif Batch Produksi</FieldLabel>
            {activeBatches.length === 0 ? <EmptyState msg="Tidak ada batch aktif" /> : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeBatches.map((b: any) => (
                  <div key={b.id} className="p-2 rounded-lg bg-white/[0.03] text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{b.batch_name || b.batch_number}</span>
                      <Badge status={b.status} />
                    </div>
                    <div className="text-[#4a6a5a] mt-1">{b.units_produced || b.target_units} botol | {b.qc_status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW PANEL 4: JUAL KE CUSTOMER
// ═══════════════════════════════════════════════════════════════

function PanelJualCustomer({ formulas, onRefresh }: any) {
  const [form, setForm] = useState({ customer_phone: "", customer_name: "", formula_id: "", amount: "", payment_method: "cash", notes: "" });
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  const lookupCustomer = async () => {
    if (!form.customer_phone) return;
    const res = await api(`customers?action=profile&phone=${form.customer_phone}`);
    if (res.success && res.profile) {
      setCustomerInfo(res.profile);
      setForm((f: any) => ({ ...f, customer_name: res.profile.name || f.customer_name }));
    } else {
      setCustomerInfo(null);
    }
  };

  const selectedFormula = formulas.find((f: any) => f.id === parseInt(form.formula_id));

  const submitSales = async () => {
    if (!form.customer_phone || !form.formula_id || !form.amount) return;
    setLoading(true);
    const res = await api("sell", "POST", { ...form, formula_id: parseInt(form.formula_id), amount: parseInt(form.amount) });
    setLoading(false);
    if (res.success) {
      setForm({ customer_phone: "", customer_name: "", formula_id: "", amount: "", payment_method: "cash", notes: "" });
      setCustomerInfo(null);
      onRefresh();
    }
    return res;
  };

  return (
    <Panel title="Jual ke Customer" icon={<DollarSign size={14} className="text-emerald-400" />}
      badge={<Badge status="Step 4" />}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <FieldLabel>Telepon Customer</FieldLabel>
          <div className="flex gap-2">
            <FormInput placeholder="0812..." value={form.customer_phone} onChange={e => { setForm({ ...form, customer_phone: e.target.value }); setCustomerInfo(null); }} />
            <SecondaryButton onClick={lookupCustomer}><Search size={12} /></SecondaryButton>
          </div>
          <FieldLabel>Nama (auto-isi jika existing)</FieldLabel>
          <FormInput value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} />

          {customerInfo && (
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 text-[10px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold">{customerInfo.name || "Customer Baru"}</span>
                <Badge status={customerInfo.segment} />
              </div>
              <div className="text-[#6b9e8f]">Visits: {customerInfo.visit_count} | Spent: Rp {customerInfo.total_spent?.toLocaleString("id-ID")} | CLV: Rp {customerInfo.clv?.toLocaleString("id-ID")}</div>
            </div>
          )}

          <FieldLabel>Produk / Formula</FieldLabel>
          <FormSelect value={form.formula_id} onChange={e => {
            const f = formulas.find((x: any) => x.id === parseInt(e.target.value));
            setForm({ ...form, formula_id: e.target.value, amount: f?.selling_price?.toString() || form.amount });
          }}>
            <option value="">-- Pilih produk --</option>
            {formulas.filter((f: any) => f.status === "confirmed").map((f: any) => <option key={f.id} value={f.id}>{f.formula_code} — {f.ai_mood} (Rp {f.selling_price?.toLocaleString("id-ID")})</option>)}
          </FormSelect>
          <div className="grid grid-cols-2 gap-3">
            <div><FieldLabel>Harga Jual (Rp)</FieldLabel><FormInput type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div><FieldLabel>Metode Bayar</FieldLabel>
              <FormSelect value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
              </FormSelect>
            </div>
          </div>
          <FieldLabel>Catatan</FieldLabel>
          <FormInput placeholder="Catatan transaksi..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <PrimaryButton loading={loading} onClick={submitSales as any}><Send size={12} /> Catat Penjualan</PrimaryButton>
        </div>
        <div>
          <FieldLabel>Penjualan Terakhir</FieldLabel>
          {recentSales.length === 0 ? <EmptyState msg="Belum ada penjualan" /> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentSales.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] text-[10px]">
                  <span className="text-white font-medium flex-1">{s.customer_name || s.customer_phone}</span>
                  <span className="text-teal-400 font-bold">Rp {s.amount?.toLocaleString("id-ID")}</span>
                  <Badge status={s.payment_method} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW PANEL 5: RESTOCK
// ═══════════════════════════════════════════════════════════════

function PanelRestock({ inventoryAlerts, suppliers, onRefresh }: any) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [poForm, setPoForm] = useState({ supplier_id: "", expected_delivery: "" });
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<any[]>([]);

  const toggleItem = (item: any) => {
    const exists = selectedItems.find((s: any) => s.id === item.id);
    if (exists) setSelectedItems(selectedItems.filter((s: any) => s.id !== item.id));
    else setSelectedItems([...selectedItems, { ...item, suggested_qty: item.suggested_order_ml || item.min_stock_ml * 2, unit_price: item.estimated_cost || 0 }]);
  };

  const createPO = async () => {
    if (!poForm.supplier_id || selectedItems.length === 0) return;
    setLoading(true);
    const lineItems = selectedItems.map((i: any) => ({
      material_id: i.id, material_name: i.name, quantity: i.suggested_qty, unit: "ml", unit_price: Math.round((i.estimated_cost || 0) / (i.suggested_qty || 1)),
    }));
    const res = await api("suppliers", "POST", { action: "create_po", supplier_id: parseInt(poForm.supplier_id), items: lineItems, expected_delivery: poForm.expected_delivery });
    setLoading(false);
    if (res.success) {
      setSelectedItems([]);
      onRefresh();
    }
    return res;
  };

  const receivePO = async (poId: number) => {
    const res = await api("restock", "POST", { po_id: poId });
    if (res.success) onRefresh();
    return res;
  };

  return (
    <Panel title="Restock / Reorder" icon={<Truck size={14} className="text-blue-400" />}
      badge={<Badge status="Step 5" />}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <FieldLabel>Stok Menipis — Pilih Item untuk PO</FieldLabel>
          {inventoryAlerts.length === 0 ? <div className="text-center py-4 text-xs text-emerald-400 flex items-center justify-center gap-2"><CheckCircle2 size={14} /> Semua stok aman!</div> : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inventoryAlerts.slice(0, 10).map((a: any) => {
                const selected = selectedItems.find((s: any) => s.id === a.id);
                return (
                  <div key={a.id} onClick={() => toggleItem(a)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${selected ? "bg-teal-500/10 border border-teal-500/20" : "bg-white/[0.02] hover:bg-white/[0.05] border border-transparent"}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selected ? "border-teal-500 bg-teal-500" : "border-white/20"}`}>
                      {selected && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-white truncate">{a.name}</div>
                      <div className="text-[9px] text-[#4a6a5a]">{a.stock_ml.toFixed(1)}ml / min {a.min_stock_ml}ml</div>
                    </div>
                    <Badge status={a.alert_level} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {selectedItems.length > 0 && (
            <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20">
              <div className="text-[11px] font-bold text-teal-400 mb-2">Item Dipilih ({selectedItems.length})</div>
              <div className="space-y-1 text-[10px]">
                {selectedItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Minus size={10} className="text-red-400 cursor-pointer" onClick={() => setSelectedItems(selectedItems.filter((s: any) => s.id !== item.id))} />
                    <span className="text-white flex-1">{item.name}</span>
                    <span className="text-[#6b9e8f]">{item.suggested_qty}ml</span>
                    <span className="text-[#4a6a5a]">~Rp {item.estimated_cost?.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <div className="flex-1"><FormSelect value={poForm.supplier_id} onChange={e => setPoForm({ ...poForm, supplier_id: e.target.value })}>
                  <option value="">Pilih supplier...</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect></div>
                <div><FormInput type="date" value={poForm.expected_delivery} onChange={e => setPoForm({ ...poForm, expected_delivery: e.target.value })} /></div>
              </div>
              <PrimaryButton loading={loading} onClick={createPO as any} className="mt-2"><Plus size={12} /> Buat PO</PrimaryButton>
            </div>
          )}

          <FieldLabel>Purchase Orders Pending</FieldLabel>
          {pos.filter((p: any) => ["sent", "confirmed", "partial"].includes(p.status)).length === 0 ? <EmptyState msg="Tidak ada PO pending" /> : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pos.filter((p: any) => ["sent", "confirmed", "partial"].includes(p.status)).map((p: any) => (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] text-[10px]">
                  <div className="flex-1">
                    <div className="text-white font-medium">{p.po_number}</div>
                    <div className="text-[#4a6a5a]">{p.supplier_name} | Rp {p.total_amount?.toLocaleString("id-ID")}</div>
                  </div>
                  <Badge status={p.status} />
                  {(p.status === "sent" || p.status === "confirmed") && (
                    <SecondaryButton onClick={() => receivePO(p.id)}><CheckCircle2 size={10} /> Terima</SecondaryButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD VIEW (READ-ONLY OVERVIEW)
// ═══════════════════════════════════════════════════════════════

function DashboardView({ data, activeTab, setActiveTab }: { data: any; activeTab: Tab; setActiveTab: (t: Tab) => void }) {
  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <PieChart size={14} /> },
    { key: "produksi", label: "Produksi", icon: <FlaskConical size={14} /> },
    { key: "qc", label: "QC", icon: <ShieldCheck size={14} /> },
    { key: "keuangan", label: "Keuangan", icon: <DollarSign size={14} /> },
    { key: "inventory", label: "Stok", icon: <Package size={14} /> },
    { key: "customer", label: "Customer", icon: <Users size={14} /> },
    { key: "supplier", label: "Supplier", icon: <Truck size={14} /> },
    { key: "sop", label: "SOP", icon: <BookOpen size={14} /> },
  ];
  if (!data) return <div className="flex items-center justify-center py-20"><Spinner size={24} /></div>;

  return (
    <div className="space-y-5">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1 overflow-x-auto border border-white/5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeTab === t.key ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white" : "text-[#4a7a6a] hover:text-white hover:bg-white/5"}`}>
            {t.icon}<span className={`${t.key === "keuangan" ? "" : "hidden sm:inline"}`}>{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={<FlaskConical size={18} />} label="Formula" value={data.formulas} color="from-teal-500/10 via-teal-500/5 to-transparent" />
            <KpiCard icon={<Users size={18} />} label="Customer" value={data.customers} color="from-blue-500/10 via-blue-500/5 to-transparent" />
            <KpiCard icon={<DollarSign size={18} />} label="Pendapatan" value={`Rp ${(data.revenue || 0).toLocaleString("id-ID")}`} color="from-emerald-500/10 via-emerald-500/5 to-transparent" sub={`Margin: ${data.profit_margin || 0}%`} />
            <KpiCard icon={<AlertTriangle size={18} />} label="Stok Rendah" value={data.low_stock_count} color="from-orange-500/10 via-orange-500/5 to-transparent" />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <Panel title="Recent Formulas" icon={<Sparkles size={14} className="text-teal-400" />}>
              {(!data.recentFormulas || data.recentFormulas.length === 0) ? <EmptyState msg="Tidak ada" /> : (
                <div className="space-y-2">{data.recentFormulas.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                    <Droplets size={12} className="text-teal-400" /><span className="flex-1 text-[11px] text-white">{f.formula_code} — {f.ai_mood}</span><Badge status={f.status} />
                  </div>
                ))}</div>
              )}
            </Panel>
            <Panel title="QC Pass Rate" icon={<ShieldCheck size={14} className="text-emerald-400" />}>
              <div className="text-center py-4"><div className="text-4xl font-black text-emerald-400">{data.qcPassRate || 0}%</div><div className="text-[10px] text-[#4a6a5a]">{data.qcTotal || 0} batch</div></Panel>
            </Panel>
          </div>
        </div>
      )}
      {/* Other tabs follow same pattern — abbreviated for brevity */}
      {activeTab === "produksi" && <Panel title="Produksi" icon={<FlaskConical size={14} />}><EmptyState msg="Lihat tab Operasional untuk produksi" /></Panel>}
      {activeTab === "inventory" && <Panel title="Inventory" icon={<Package size={14} />}>
        {(!data.inventoryAlerts || data.inventoryAlerts.length === 0) ? <div className="text-center py-4 text-xs text-emerald-400"><CheckCircle2 size={16} className="inline mr-2" />Semua stok aman</div> : (
          <div className="space-y-2">{data.inventoryAlerts.slice(0, 8).map((a: any) => (
            <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]"><span className={`w-2 h-2 rounded-full ${a.alert_level === "critical" ? "bg-red-400" : "bg-orange-400"}`} /><span className="text-[11px] text-white flex-1">{a.name}</span><span className="text-[10px] text-[#4a6a5a]">{a.stock_ml.toFixed(1)}ml</span><Badge status={a.alert_level} /></div>
          ))}</div>
        )}
      </Panel>}
      {activeTab === "customer" && <Panel title="Customer" icon={<Users size={14} />}>
        {(!data.topCustomers || data.topCustomers.length === 0) ? <EmptyState msg="Tidak ada" /> : (
          <table className="w-full text-[11px]"><thead><tr className="border-b border-white/10 text-[#5a8a78]"><th className="py-2 text-left">Nama</th><th>Segment</th><th className="text-right">CLV</th></tr></thead><tbody>
            {data.topCustomers.slice(0, 5).map((c: any) => <tr key={c.id} className="border-b border-white/5"><td className="py-2 text-white">{c.name}</td><td><Badge status={c.segment} /></td><td className="text-right text-teal-400">Rp {c.clv?.toLocaleString("id-ID")}</td></tr>)}
          </tbody></table>
        )}
      </Panel>}
      {activeTab === "keuangan" && <KeuanganPage />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// OPERASIONALVIEW
// ═══════════════════════════════════════════════════════════════

function OperasionalView({ materials, suppliers, formulas, inventoryAlerts, onRefresh }: any) {
  const [expandedPanel, setExpandedPanel] = useState<string | null>("terima");
  const toggle = (key: string) => setExpandedPanel(expandedPanel === key ? null : key);
  const panelClass = (key: string) => expandedPanel === key ? "ring-1 ring-teal-500/30" : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center"><ClipboardList size={16} className="text-white" /></div>
        <div><h2 className="text-sm font-bold text-white">Workflow Operasional</h2><p className="text-[10px] text-[#4a6a5a]">Input data → System mengolah & mengintegrasi</p></div>
      </div>

      <div className={`transition-all ${panelClass("terima")}`}>
        <button onClick={() => toggle("terima")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-teal-500/30 transition-all">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-400 font-black text-xs">1</div>
          <div className="flex-1 text-left"><div className="text-xs font-bold text-white">Terima Bahan Baku</div><div className="text-[10px] text-[#4a6a5a]">Dari supplier → QC → Update stok</div></div>
          {expandedPanel === "terima" ? <Minus size={14} className="text-[#6b9e8f]" /> : <Plus size={14} className="text-[#6b9e8f]" />}
        </button>
        {expandedPanel === "terima" && <div className="mt-2"><PanelTerimaBahan materials={materials || []} suppliers={suppliers || []} onRefresh={onRefresh} /></div>}
      </div>

      <div className={`transition-all ${panelClass("formula")}`}>
        <button onClick={() => toggle("formula")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 transition-all">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 font-black text-xs">2</div>
          <div className="flex-1 text-left"><div className="text-xs font-bold text-white">Buat Formula</div><div className="text-[10px] text-[#4a6a5a]">AI analis → Generate → Compliance check</div></div>
          {expandedPanel === "formula" ? <Minus size={14} className="text-[#6b9e8f]" /> : <Plus size={14} className="text-[#6b9e8f]" />}
        </button>
        {expandedPanel === "formula" && <div className="mt-2"><PanelBuatFormula onRefresh={onRefresh} /></div>}
      </div>

      <div className={`transition-all ${panelClass("produksi")}`}>
        <button onClick={() => toggle("produksi")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/30 transition-all">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-400 font-black text-xs">3</div>
          <div className="flex-1 text-left"><div className="text-xs font-bold text-white">Produksi</div><div className="text-[10px] text-[#4a6a5a]">Formula + Stok → Mixing → QC batch</div></div>
          {expandedPanel === "produksi" ? <Minus size={14} className="text-[#6b9e8f]" /> : <Plus size={14} className="text-[#6b9e8f]" />}
        </button>
        {expandedPanel === "produksi" && <div className="mt-2"><PanelProduksi formulas={formulas || []} onRefresh={onRefresh} /></div>}
      </div>

      <div className={`transition-all ${panelClass("jual")}`}>
        <button onClick={() => toggle("jual")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 transition-all">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-black text-xs">4</div>
          <div className="flex-1 text-left"><div className="text-xs font-bold text-white">Jual ke Customer</div><div className="text-[10px] text-[#4a6a5a]">Input transaksi → CRM → Revenue otomatis</div></div>
          {expandedPanel === "jual" ? <Minus size={14} className="text-[#6b9e8f]" /> : <Plus size={14} className="text-[#6b9e8f]" />}
        </button>
        {expandedPanel === "jual" && <div className="mt-2"><PanelJualCustomer formulas={formulas || []} onRefresh={onRefresh} /></div>}
      </div>

      <div className={`transition-all ${panelClass("restock")}`}>
        <button onClick={() => toggle("restock")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/30 transition-all">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 font-black text-xs">5</div>
          <div className="flex-1 text-left"><div className="text-xs font-bold text-white">Restock</div><div className="text-[10px] text-[#4a6a5a]">Alert stok → PO ke supplier → Terima → Stok update</div></div>
          {expandedPanel === "restock" ? <Minus size={14} className="text-[#6b9e8f]" /> : <Plus size={14} className="text-[#6b9e8f]" />}
        </button>
        {expandedPanel === "restock" && <div className="mt-2"><PanelRestock inventoryAlerts={inventoryAlerts || []} suppliers={suppliers || []} onRefresh={onRefresh} /></div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

export default function PerfumeDashboard() {
  const [view, setView] = useState<ViewMode>("dashboard");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [, setTick] = useState(0);

  // Data
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [qcStats, setQcStats] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawMats, forms, inv, cus, qc, fin, sup] = await Promise.all([
        api("raw-materials"), api("formulas"), api("inventory?action=alerts"),
        api("customers?action=top"), api("qc?action=stats"), api("finance"), api("suppliers"),
      ]);
      if (rawMats.success) setMaterials(rawMats.materials || rawMats.data || []);
      if (forms.success) setFormulas(forms.formulas || forms.data || []);
      if (inv.success) setInventoryAlerts(inv.alerts || []);
      if (cus.success) setTopCustomers(cus.customers || []);
      if (qc.success) setQcStats(qc.stats);
      if (fin.success) setFinance({ revenue: fin.total_revenue, margin: fin.avg_margin_pct });
      if (sup.success) setSuppliers(sup.suppliers || []);
    } catch (e) { addToast("error", "Gagal memuat data"); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { loadData(); const iv = setInterval(loadData, 30000); return () => clearInterval(iv); }, [loadData]);

  const dashboardData = {
    formulas: formulas.length,
    customers: topCustomers.length,
    revenue: finance?.revenue || 0,
    profit_margin: finance?.margin || 0,
    low_stock_count: inventoryAlerts.length,
    qcPassRate: qcStats?.pass_rate_pct || 0,
    qcTotal: qcStats?.total_batches || 0,
    recentFormulas: formulas.slice(0, 5),
    inventoryAlerts,
    topCustomers,
  };

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#080c0a]/90 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center"><FlaskConical size={18} /></div>
              <div>
                <h1 className="text-sm font-black text-white">Sensasi Wangi Indonesia</h1>
                <p className="text-[9px] text-[#4a7a6a] uppercase tracking-widest font-semibold">Perfume Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-[9px] font-bold text-teal-400 uppercase">Live</span>
              </div>
              <button onClick={loadData} className="p-1.5 rounded-lg hover:bg-white/5 text-[#6b9e8f] hover:text-white transition-all"><RefreshCw size={14} /></button>
            </div>
          </div>
          {/* View Toggle — always visible */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <button onClick={() => setView("dashboard")} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${view === "dashboard" ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/20" : "bg-white/[0.04] text-[#6b9e8f] hover:text-white hover:bg-white/[0.08]"}`}>
              <BarChart3 size={14} /> Dashboard
            </button>
            <button onClick={() => { setView("dashboard"); setActiveTab("keuangan"); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-white/[0.04] text-[#6b9e8f] hover:text-white hover:bg-white/[0.08]">
              <DollarSign size={14} /> Keuangan
            </button>
            <button onClick={() => setView("operasional")} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${view === "operasional" ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/[0.04] text-[#6b9e8f] hover:text-white hover:bg-white/[0.08]"}`}>
              <ClipboardList size={14} /> Operasional
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size={24} /></div>
        ) : view === "dashboard" ? (
          <DashboardView data={dashboardData} activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          <OperasionalView
            materials={materials} suppliers={suppliers} formulas={formulas}
            inventoryAlerts={inventoryAlerts} onRefresh={loadData}
          />
        )}
      </div>
    </div>
  );
}
