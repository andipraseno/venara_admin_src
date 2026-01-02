// src/utils/formatters.js

// Bersihkan nomor HP/telepon → hanya angka
export function cleanPhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

// Tampilkan nomor dengan spasi tiap 3 digit: 081 234 567 dst
export function prettyPhone(value) {
  const d = cleanPhone(value);
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

// Konversi ke format WhatsApp (62…)
export function waPhone(value) {
  const d = cleanPhone(value);
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("8")) return "62" + d;
  return d;
}

// Validasi email, return true/false
export function isValidEmail(email) {
  if (!email) return true; // kosong = dianggap OK, biar validasi lain yg handle
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Normalisasi website: tambah https:// kalau belum ada
export function normalizeWebsite(url) {
  if (!url) return "";
  let w = url.trim();
  if (!/^https?:\/\//i.test(w)) w = "https://" + w;
  return w.replace(/\s+/g, "");
}

// Konversi ke format Rupiah
export function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
}