// Validation helpers — shared between frontend and API

export interface ValResult {
  valid: boolean;
  message: string;
  severity: "error" | "warning" | "success";
}

export function validateKTP(ktp: string): ValResult {
  if (!ktp) return { valid: false, message: "Nomor KTP wajib diisi", severity: "error" };
  const cleaned = ktp.replace(/[\s.\-]/g, "");
  if (!/^\d{16}$/.test(cleaned)) return { valid: false, message: "KTP harus 16 digit angka", severity: "error" };
  const province = parseInt(cleaned.substring(0, 2));
  if (province < 11 || province > 94) return { valid: false, message: `Kode provinsi ${province} tidak valid`, severity: "error" };
  const dd = parseInt(cleaned.substring(6, 8));
  const mm = parseInt(cleaned.substring(8, 10));
  const yy = parseInt(cleaned.substring(10, 12));
  if (mm < 1 || mm > 12) return { valid: false, message: "Bulan lahir pada KTP tidak valid", severity: "warning" };
  const actualDD = dd > 40 ? dd - 40 : dd;
  if (actualDD < 1 || actualDD > 31) return { valid: false, message: "Tanggal lahir pada KTP tidak valid", severity: "warning" };
  const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
  const age = new Date().getFullYear() - fullYear;
  if (age < 17) return { valid: false, message: `Usia ${age} tahun — minimal 17 tahun`, severity: "error" };
  if (age > 120) return { valid: false, message: "Usia tidak wajar", severity: "warning" };
  return { valid: true, message: `KTP valid (usia ${age} thn)`, severity: "success" };
}

export function validateNPWP(npwp: string): ValResult {
  if (!npwp) return { valid: false, message: "NPWP wajib diisi", severity: "error" };
  const cleaned = npwp.replace(/[\s.\-]/g, "");
  if (!/^\d{15}$/.test(cleaned)) return { valid: false, message: "NPWP harus 15 digit angka", severity: "error" };
  return { valid: true, message: "NPWP valid", severity: "success" };
}

export function validatePhone(phone: string): ValResult {
  if (!phone) return { valid: false, message: "Nomor HP wajib diisi", severity: "error" };
  const cleaned = phone.replace(/[\s\-()]/g, "").replace(/^\+62/, "0");
  if (!/^08\d{8,11}$/.test(cleaned)) return { valid: false, message: "Format: 08xxxxxxxxxx (10-13 digit)", severity: "error" };
  return { valid: true, message: "HP valid", severity: "success" };
}

export function validateEmail(email: string): ValResult {
  if (!email) return { valid: false, message: "Email wajib diisi", severity: "error" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, message: "Format email tidak valid", severity: "error" };
  const suspicious = ["tempmail.com", "guerrillamail.com", "10minutemail.com"];
  const domain = email.split("@")[1]?.toLowerCase();
  if (suspicious.includes(domain)) return { valid: false, message: "Email sementara tidak diterima", severity: "error" };
  return { valid: true, message: "Email valid", severity: "success" };
}

export function validateBankAccount(bank: string, accountNumber: string, accountName: string): ValResult {
  if (!bank) return { valid: false, message: "Nama bank wajib dipilih", severity: "error" };
  if (!accountNumber) return { valid: false, message: "Nomor rekening wajib diisi", severity: "error" };
  if (!accountName) return { valid: false, message: "Nama pemilik rekening wajib diisi", severity: "error" };
  const cleaned = accountNumber.replace(/[\s\-]/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, message: "Nomor rekening hanya boleh angka", severity: "error" };
  const lens: Record<string, [number, number]> = { "BCA": [10,10], "Mandiri": [13,13], "BNI": [10,10], "BRI": [15,15], "BSI": [10,10] };
  const range = lens[bank];
  if (range && (cleaned.length < range[0] || cleaned.length > range[1])) {
    return { valid: false, message: `Rekening ${bank} biasanya ${range[0]}-${range[1]} digit`, severity: "warning" };
  }
  return { valid: true, message: `Rekening ${bank} ${cleaned.length} digit — format OK`, severity: "success" };
}
