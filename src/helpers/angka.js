// Helper: konversi angka menjadi teks bahasa Indonesia (terbilang)
export function terbilang(n) {
  n = Math.floor(Number(n));

  if (isNaN(n)) return "";

  const satuan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];

  function toWords(x) {
    if (x < 12) return satuan[x];
    if (x < 20) return toWords(x - 10) + " belas";
    if (x < 100) return toWords(Math.floor(x / 10)) + " puluh " + toWords(x % 10);
    if (x < 200) return "seratus " + toWords(x - 100);
    if (x < 1000) return toWords(Math.floor(x / 100)) + " ratus " + toWords(x % 100);
    if (x < 2000) return "seribu " + toWords(x - 1000);
    if (x < 1000000) return toWords(Math.floor(x / 1000)) + " ribu " + toWords(x % 1000);
    if (x < 1000000000) return toWords(Math.floor(x / 1000000)) + " juta " + toWords(x % 1000000);
    if (x < 1000000000000)
      return toWords(Math.floor(x / 1000000000)) + " miliar " + toWords(x % 1000000000);
    if (x < 1000000000000000)
      return toWords(Math.floor(x / 1000000000000)) + " triliun " + toWords(x % 1000000000000);

    return "";
  }

  const text = toWords(n).replace(/\s+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
