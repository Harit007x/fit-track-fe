import { jsPDF } from "jspdf";
import type { DietPlan } from "@/services/body.service";

export interface DietPdfContext {
  goal: string;
  dietType: string;
  foodStyle: string;
  bmi?: number;
  fitnessLevel?: string;
  weightKg?: number;
  heightCm?: number;
}

// Brand palette (RGB)
const ORANGE: [number, number, number] = [249, 115, 22];
const DARK: [number, number, number] = [24, 24, 27];
const GRAY: [number, number, number] = [113, 113, 122];
const LIGHT: [number, number, number] = [244, 244, 245];
const BORDER: [number, number, number] = [228, 228, 231];
const WHITE: [number, number, number] = [255, 255, 255];

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function downloadDietPlanPdf(plan: DietPlan, ctx: DietPdfContext) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  const bottomLimit = pageH - 20; // leave room for footer

  let y = 0;

  const setFill = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const setDraw = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);

  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) {
      doc.addPage();
      y = margin;
    }
  };

  // ---------------- Header band ----------------
  setFill(DARK);
  doc.rect(0, 0, pageW, 34, "F");
  setFill(ORANGE);
  doc.rect(0, 0, 4, 34, "F"); // accent stripe

  setText(ORANGE);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(20);
  doc.text("FIT_TRACK", margin, 15);

  setText(WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Personalized Diet Plan", margin, 24);

  setText(GRAY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.text(dateStr, pageW - margin, 15, { align: "right" });
  doc.text(`${cap(ctx.goal)} • ${cap(ctx.dietType)} • ${cap(ctx.foodStyle)}`, pageW - margin, 24, { align: "right" });

  y = 34 + 8;

  // ---------------- Summary ----------------
  if (plan.summary) {
    setText(GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("OVERVIEW", margin, y);
    y += 5;

    setText(DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(plan.summary, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 4;
  }

  // ---------------- Stat cards (calories + macros + profile) ----------------
  const stats: { label: string; value: string; accent?: boolean }[] = [
    { label: "Target", value: `${plan.targetCalories ?? "-"} kcal`, accent: true },
    { label: "Protein", value: `${plan.macros?.proteinG ?? "-"} g` },
    { label: "Carbs", value: `${plan.macros?.carbsG ?? "-"} g` },
    { label: "Fat", value: `${plan.macros?.fatG ?? "-"} g` },
  ];
  if (ctx.bmi != null) stats.push({ label: "BMI", value: String(ctx.bmi) });
  if (ctx.fitnessLevel) stats.push({ label: "Level", value: ctx.fitnessLevel });

  const perRow = 4;
  const gap = 4;
  const cardW = (contentW - gap * (perRow - 1)) / perRow;
  const cardH = 16;
  ensureSpace(Math.ceil(stats.length / perRow) * (cardH + gap));

  stats.forEach((s, i) => {
    const col = i % perRow;
    const row = Math.floor(i / perRow);
    const x = margin + col * (cardW + gap);
    const cy = y + row * (cardH + gap);

    setFill(s.accent ? ORANGE : LIGHT);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.roundedRect(x, cy, cardW, cardH, 2, 2, "F");

    setText(s.accent ? WHITE : GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(s.label.toUpperCase(), x + 3, cy + 5.5);

    setText(s.accent ? WHITE : DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(s.value, x + 3, cy + 12);
  });
  y += Math.ceil(stats.length / perRow) * (cardH + gap) + 4;

  // ---------------- Meals ----------------
  (plan.meals || []).forEach((meal) => {
    const items = meal.items || [];

    // Estimate height so a meal header doesn't get orphaned.
    ensureSpace(9 + Math.min(items.length, 1) * 7 + 4);

    // Meal header bar
    setFill(DARK);
    doc.roundedRect(margin, y, contentW, 8, 1.5, 1.5, "F");
    setText(WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(meal.name || "Meal").toUpperCase(), margin + 3, y + 5.5);
    setText(ORANGE);
    doc.setFontSize(9);
    doc.text(`${meal.calories ?? ""} kcal`, pageW - margin - 3, y + 5.5, { align: "right" });
    y += 8 + 1;

    const foodX = margin + 3;
    const foodW = contentW * 0.55;
    const qtyX = margin + contentW * 0.6;
    const calX = pageW - margin - 3;

    items.forEach((item, idx) => {
      const foodLines = doc.splitTextToSize(String(item.food || ""), foodW);
      const rowH = Math.max(6.5, foodLines.length * 4.2 + 2.5);
      ensureSpace(rowH);

      // zebra background
      if (idx % 2 === 1) {
        setFill(LIGHT);
        doc.rect(margin, y, contentW, rowH, "F");
      }

      setText(DARK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(foodLines, foodX, y + 4.4);

      setText(GRAY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(String(item.quantity || ""), qtyX, y + 4.4);

      setText(DARK);
      doc.setFont("helvetica", "bold");
      doc.text(item.calories != null ? `${item.calories}` : "", calX, y + 4.4, { align: "right" });

      y += rowH;
    });

    y += 5;
  });

  // ---------------- Hydration ----------------
  if (plan.hydrationLiters) {
    ensureSpace(10);
    setFill([239, 246, 255]);
    doc.roundedRect(margin, y, contentW, 9, 1.5, 1.5, "F");
    setText([37, 99, 235]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Hydration: drink about ${plan.hydrationLiters} L of water today`, margin + 4, y + 5.8);
    y += 9 + 5;
  }

  // ---------------- Tips ----------------
  if (plan.tips && plan.tips.length) {
    ensureSpace(10);
    setText(GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("COACH TIPS", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    plan.tips.forEach((tip) => {
      const lines = doc.splitTextToSize(String(tip), contentW - 6);
      const rowH = lines.length * 4.6 + 2;
      ensureSpace(rowH);
      setText(ORANGE);
      doc.setFont("helvetica", "bold");
      doc.text("▸", margin, y + 3.4);
      setText(DARK);
      doc.setFont("helvetica", "normal");
      doc.text(lines, margin + 5, y + 3.4);
      y += rowH;
    });
    y += 2;
  }

  // ---------------- Footer on every page ----------------
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    setDraw(BORDER);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
    setText(GRAY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      "AI-generated guidance only — not medical advice. Consult a professional before major diet changes.",
      margin,
      pageH - 9
    );
    doc.text(`FIT_TRACK  •  Page ${p} of ${total}`, pageW - margin, pageH - 9, { align: "right" });
  }

  const fileDate = new Date().toISOString().split("T")[0];
  doc.save(`FitTrack_Diet_Plan_${fileDate}.pdf`);
}
