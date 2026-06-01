// scripts/test-brand-calc.ts
// Test brand calculator — run dengan: npx ts-node scripts/test-brand-calc.ts
import { generateBrandReport, calculateHoldingTotal, BRANDS, parseBrandSheet } from "../src/lib/brand-calculator";

async function main() {
  console.log("🏭 Brand Calculator Test\n");

  const allReports = [];

  for (const brand of BRANDS) {
    console.log(`=== ${brand} ===`);
    try {
      const report = await generateBrandReport(brand);
      const s = report.summary;

      console.log(`  Pemasukan:    ${s.totalPemasukan.toLocaleString("id-ID")}`);
      console.log(`  Pengeluaran:  ${s.totalPengeluaran.toLocaleString("id-ID")}`);
      console.log(`  Laba/Rugi:    ${s.labaRugi.toLocaleString("id-ID")}`);
      console.log(`  Margin:       ${s.margin.toFixed(1)}%`);
      console.log(`  Setoran 30%:  ${s.setoran30.toLocaleString("id-ID")}`);
      console.log(`  Transaksi:    ${s.jumlahTransaksi}`);

      if (Object.keys(s.pemasukanPerKategori).length > 0) {
        console.log(`  Kategori masuk:`);
        Object.entries(s.pemasukanPerKategori).forEach(([k, v]) =>
          console.log(`    ${k}: ${v.toLocaleString("id-ID")}`)
        );
      }

      if (Object.keys(s.pengeluaranPerKategori).length > 0) {
        console.log(`  Kategori keluar:`);
        Object.entries(s.pengeluaranPerKategori).forEach(([k, v]) =>
          console.log(`    ${k}: ${v.toLocaleString("id-ID")}`)
        );
      }

      allReports.push(report);
    } catch (e: any) {
      console.log(`  ❌ Error: ${e.message}`);
    }
    console.log("");
  }

  // Holding total
  if (allReports.length > 0) {
    const holding = calculateHoldingTotal(allReports);
    console.log("=== HOLDING TOTAL ===");
    console.log(`  Pemasukan:    ${holding.totalPemasukan.toLocaleString("id-ID")}`);
    console.log(`  Pengeluaran:  ${holding.totalPengeluaran.toLocaleString("id-ID")}`);
    console.log(`  Laba/Rugi:    ${holding.labaRugi.toLocaleString("id-ID")}`);
    console.log(`  Margin:       ${holding.margin.toFixed(1)}%`);
    console.log(`  Setoran 30%:  ${holding.setoran30.toLocaleString("id-ID")}`);
  }
}

main().catch(console.error);
