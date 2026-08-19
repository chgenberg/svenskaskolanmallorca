import { existsSync } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";
import { approvalFeeHint, SCHOOL_FUTURE_SENTENCE, trackOf } from "@/lib/tracks/config";
import { SKOLVERKET_FORMS } from "./defaults";
import { attachmentSummary, getAttachments } from "./attachments";
import {
  employerEmail,
  employerEmailEn,
  employerMailto,
  employerMailtoEn,
  fieldGuidePairs,
  fieldGuidePairsEn,
  fillSteps,
  getChecklist,
  officialFormUrl,
  reasonLabel,
} from "./export";
import { getPackStatus, getRisks, getStops, statusLabel, whyText } from "./gates";
import type { PackStatus, WizardState } from "./types";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 40;
const CW = PAGE_W - M * 2;
const FOOTER_Y = PAGE_H - 36;

const BLUE = "#0070bc";
const KLINT = "#005289";
const INK = "#2c324c";
const STONE = "#5a6570";
const PAPER = "#ecf0f1";
const SOFT = "#e4f1fa";
const GOLD = "#fcb900";
const LINE = "#d0d7de";
const WHITE = "#ffffff";
const WARN = "#8a6a2f";
const WARN_BG = "#f6efd8";
const OK = "#3f6b4c";
const OK_BG = "#e6f0e8";
const STOP = "#8f3d2c";
const STOP_BG = "#f8e7e2";

const SCHOOL_URL = "https://www.svenskaskolanmallorca.com/";

const FONTS = {
  regular: join(process.cwd(), "public/fonts/Raleway-Regular.ttf"),
  semibold: join(process.cwd(), "public/fonts/Raleway-SemiBold.ttf"),
};
const LOGO = join(process.cwd(), "public/LOGO-SVENSKA-SKOLAN.jpg");

type Doc = PDFKit.PDFDocument;

export function buildPdfBuffer(state: WizardState, title?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const track = trackOf(state);
    const heading = title || `Underlaget — Svenska Skolan Mallorca, ${track.shortLabel.toLowerCase()}`;
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      lang: "sv",
      info: {
        Title: heading,
        Author: "Svenska Skolan Mallorca",
        Subject: `Underlag till Skolverket, ${track.shortLabel.toLowerCase()}`,
        Keywords: `Skolverket, underlag, ${track.id}, Mallorca`,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const regular = existsSync(FONTS.regular) ? "Raleway" : "Helvetica";
    const bold = existsSync(FONTS.semibold) ? "Raleway-SemiBold" : "Helvetica-Bold";
    if (existsSync(FONTS.regular)) doc.registerFont("Raleway", FONTS.regular);
    if (existsSync(FONTS.semibold)) doc.registerFont("Raleway-SemiBold", FONTS.semibold);

    doc.font(regular);
    doc.initForm();

    const ctx: Layout = { doc, regular, bold, firstPage: true };
    drawCoverHeader(ctx, state, heading);
    drawOverview(ctx, state, heading);
    drawSteps(ctx, state);
    drawFieldGuide(ctx, state);
    drawWhy(ctx, state);
    drawEmail(ctx, state);
    drawChecklist(ctx, state);
    drawAttachments(ctx, state);
    drawNotesAndFooterCopy(ctx);

    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(range.start + i);
      if (i > 0) drawContinuedHeader(ctx, heading, track.shortLabel);
      drawPageFooter(ctx, i + 1, range.count);
    }

    doc.end();
  });
}

type Layout = {
  doc: Doc;
  regular: string;
  bold: string;
  firstPage: boolean;
};

function drawCoverHeader(ctx: Layout, state: WizardState, heading: string) {
  const { doc } = ctx;
  doc.save();
  doc.rect(0, 0, PAGE_W, 118).fill(BLUE);
  doc.rect(0, 118, PAGE_W, 5).fill(GOLD);
  doc.restore();

  if (existsSync(LOGO)) {
    doc.save();
    doc.roundedRect(M, 22, 74, 74, 37).fill(WHITE);
    doc.restore();
    doc.image(LOGO, M + 5, 27, { fit: [64, 64] });
  }

  const textX = existsSync(LOGO) ? M + 88 : M;
  doc.fillColor(WHITE).font(ctx.bold).fontSize(9).text("SVENSKA SKOLAN MALLORCA", textX, 28, {
    width: 300,
  });
  doc.font(ctx.bold).fontSize(20).text("Underlaget", textX, 44, { width: 300 });
  doc.font(ctx.regular).fontSize(10).fillColor("#d6eaf8").text(`${trackOf(state).shortLabel} · 3 § · stöd till vårdnadshavare`, textX, 70, {
    width: 300,
  });

  const status = getPackStatus(state);
  const badge = statusColors(status);
  const label = statusLabel(status);
  const badgeW = Math.max(96, doc.font(ctx.bold).fontSize(9).widthOfString(label) + 28);
  const badgeX = PAGE_W - M - badgeW;
  pill(doc, badgeX, 38, badgeW, 28, badge.bg);
  doc.fillColor(badge.fg).font(ctx.bold).fontSize(9).text(label, badgeX, 46, {
    width: badgeW,
    align: "center",
  });

  doc.y = 138;
  doc.x = M;
  doc.fillColor(STONE).font(ctx.regular).fontSize(9).text(heading, M, 138, { width: CW });
  doc.moveDown(0.6);
}

function drawContinuedHeader(ctx: Layout, heading: string, label: string) {
  const { doc } = ctx;
  doc.save();
  doc.rect(0, 0, PAGE_W, 36).fill(BLUE);
  doc.rect(0, 36, PAGE_W, 3).fill(GOLD);
  doc.restore();
  doc.fillColor(WHITE).font(ctx.bold).fontSize(9).text("Underlaget  ·  Svenska Skolan Mallorca", M, 13, {
    width: CW - 80,
  });
  doc.fillColor("#d6eaf8").font(ctx.regular).fontSize(8).text(label, PAGE_W - M - 80, 13, {
    width: 80,
    align: "right",
  });
  void heading;
}

function drawOverview(ctx: Layout, state: WizardState, heading: string) {
  const { doc } = ctx;
  const student = `${state.studentFirstName} ${state.studentLastName}`.trim() || "—";
  const form = reasonLabel(state) || "Välj blankett";
  const facts = [
    { label: "Elev", value: student },
    { label: "Blankett", value: form },
    { label: "Plats", value: state.stayPlace || "—" },
  ];

  ensure(ctx, 92);
  const boxY = doc.y;
  rounded(doc, M, boxY, CW, 78, PAPER);
  const col = CW / 3;
  facts.forEach((fact, i) => {
    const x = M + 14 + i * col;
    doc.fillColor(STONE).font(ctx.regular).fontSize(8).text(fact.label.toUpperCase(), x, boxY + 14, {
      width: col - 20,
    });
    doc.fillColor(INK).font(ctx.bold).fontSize(11).text(fact.value, x, boxY + 30, {
      width: col - 20,
    });
  });
  doc.y = boxY + 90;

  const stops = getStops(state);
  if (stops.length) {
    const text = `Gör inte så här. ${stops.join(" ")}`;
    const h = Math.max(52, doc.font(ctx.regular).fontSize(9.5).heightOfString(text, { width: CW - 28 }) + 22);
    ensure(ctx, h + 8);
    rounded(doc, M, doc.y, CW, h, STOP_BG);
    doc.fillColor(STOP).font(ctx.bold).fontSize(10).text(text, M + 14, doc.y + 12, { width: CW - 28 });
    doc.y += h + 12;
  } else {
    const track = trackOf(state);
    const overview =
      `Ni söker inte själva. ${track.submittersShort} skickar underlaget. Skolverket beslutar. ${approvalFeeHint(track)} ${SCHOOL_FUTURE_SENTENCE}`;
    const overviewH = Math.max(
      52,
      doc.font(ctx.regular).fontSize(9).heightOfString(overview, { width: CW - 28 }) + 20,
    );
    rounded(doc, M, doc.y, CW, overviewH, SOFT);
    doc.fillColor(KLINT).font(ctx.regular).fontSize(9);
    doc.text(overview, M + 14, doc.y + 10, { width: CW - 28 });
    doc.y += overviewH + 10;
  }

  const summary = attachmentSummary(state);
  if (summary.total) {
    const missing = summary.total - summary.done;
    const text =
      missing > 0
        ? `Luckor till skolan: ${missing} av ${summary.total} bilagor saknas.`
        : `Alla ${summary.total} bilagor till skolan är ikryssade.`;
    const bg = missing > 0 ? WARN_BG : OK_BG;
    const fg = missing > 0 ? WARN : OK;
    ensure(ctx, 36);
    rounded(doc, M, doc.y, CW, 32, bg);
    doc.fillColor(fg).font(ctx.bold).fontSize(9).text(text, M + 14, doc.y + 10, { width: CW - 28 });
    doc.y += 42;
  }

  const risks = getRisks(state);
  if (risks.length) {
    const text = risks.join(" ");
    const h = Math.max(40, doc.font(ctx.regular).fontSize(9).heightOfString(text, { width: CW - 28 }) + 20);
    ensure(ctx, h + 8);
    rounded(doc, M, doc.y, CW, h, WARN_BG);
    doc.fillColor(WARN).font(ctx.regular).fontSize(9).text(text, M + 14, doc.y + 10, { width: CW - 28 });
    doc.y += h + 12;
  }

  ensure(ctx, 78);
  sectionTitle(ctx, "Innehåll", "innehall");
  const toc = [
    { id: "steg", label: "1  Så fyller du i" },
    { id: "falt", label: "2  Fältguide" },
    { id: "text", label: "3  Blanketttext" },
    { id: "mejl", label: "4  Mejl" },
    { id: "check", label: "5  Checklista" },
    ...(getAttachments(state).length ? [{ id: "bilagor", label: "6  Till skolan" }] : []),
  ];
  const chipW = (CW - 12) / 2;
  const startY = doc.y;
  toc.forEach((item, i) => {
    const colI = i % 2;
    const row = Math.floor(i / 2);
    const x = M + colI * (chipW + 12);
    const y = startY + row * 28;
    pill(doc, x, y, chipW, 24, SOFT);
    doc.fillColor(BLUE).font(ctx.bold).fontSize(9).text(item.label, x, y + 7, {
      width: chipW,
      align: "center",
    });
    doc.goTo(x, y, chipW, 24, item.id);
  });
  doc.y = startY + Math.ceil(toc.length / 2) * 28 + 8;
  void heading;
}

function drawSteps(ctx: Layout, state: WizardState) {
  const { doc } = ctx;
  ensure(ctx, 160);
  sectionTitle(ctx, "Så fyller du i blanketten", "steg");
  ctx.doc.outline.addItem("Så fyller du i blanketten");

  const url = officialFormUrl(state);
  linkButton(ctx, "Öppna Skolverkets blankett", url, BLUE);
  doc.moveDown(0.25);
  linkButton(ctx, "Välj rätt intyg eller blankett", SKOLVERKET_FORMS.guide, KLINT);

  fillSteps(state).forEach((step, i) => {
    const bodyH = doc.font(ctx.regular).fontSize(9.5).heightOfString(step.body, { width: CW - 56 });
    const h = Math.max(56, bodyH + 32);
    ensure(ctx, h + 10);
    const y = doc.y;
    rounded(doc, M, y, CW, h, i % 2 === 0 ? WHITE : PAPER);
    strokeRound(doc, M, y, CW, h, LINE);
    circleNumber(ctx, M + 16, y + 20, i + 1);
    doc.fillColor(INK).font(ctx.bold).fontSize(11).text(step.title, M + 44, y + 10, { width: CW - 60 });
    doc.fillColor(STONE).font(ctx.regular).fontSize(9.5).text(step.body, M + 44, y + 28, { width: CW - 60 });
    doc.y = y + h + 8;
  });
}

function drawFieldGuide(ctx: Layout, state: WizardState) {
  const { doc } = ctx;
  ensure(ctx, 80);
  sectionTitle(ctx, "Fältguide — kopiera till Skolverkets PDF", "falt");
  ctx.doc.outline.addItem("Fältguide");
  hint(ctx, "Markera ett värde och kopiera med ⌘C. Klistra in i motsvarande fält i Skolverkets blankett.");

  const rows = fieldGuidePairs(state);
  rows.forEach((row, i) => {
    const valueH = doc.font(ctx.regular).fontSize(10).heightOfString(row.value, { width: CW - 168 });
    const h = Math.max(28, valueH + 14);
    ensure(ctx, h);
    const y = doc.y;
    rounded(doc, M, y, CW, h, i % 2 === 0 ? SOFT : WHITE);
    doc.fillColor(STONE).font(ctx.regular).fontSize(8).text(row.label.toUpperCase(), M + 10, y + 9, {
      width: 140,
    });
    doc.fillColor(INK).font(ctx.bold).fontSize(10).text(row.value, M + 154, y + 8, { width: CW - 168 });
    doc.y = y + h;
  });
  doc.moveDown(0.6);
}

function drawWhy(ctx: Layout, state: WizardState) {
  const { doc } = ctx;
  const text = whyText(state) || "—";
  const textH = doc.font(ctx.regular).fontSize(10.5).heightOfString(text, { width: CW - 28 });
  const h = textH + 56;
  ensure(ctx, Math.min(h, 200));
  sectionTitle(ctx, "Blanketttext — varför utomlands", "text");
  ctx.doc.outline.addItem("Blanketttext");
  hint(ctx, "Klistra in i fältet om varför vårdnadshavaren måste vara utomlands.");

  const boxH = textH + 28;
  ensure(ctx, boxH + 8);
  const y = doc.y;
  rounded(doc, M, y, CW, boxH, SOFT);
  doc.save();
  doc.rect(M, y, 5, boxH).fill(GOLD);
  doc.restore();
  doc.fillColor(INK).font(ctx.regular).fontSize(10.5).text(text, M + 18, y + 12, { width: CW - 32 });
  doc.y = y + boxH + 6;
  doc.fillColor(STONE).font(ctx.regular).fontSize(8).text(`${text.length} tecken`, M, doc.y, { width: CW, align: "right" });
  doc.moveDown(0.8);
}

function drawEmailDraft(
  ctx: Layout,
  email: string,
  mailto: string,
  title: string,
  dest: string,
) {
  const { doc } = ctx;
  const textH = doc.font(ctx.regular).fontSize(9.5).heightOfString(email, { width: CW - 28 });
  ensure(ctx, 90);
  sectionTitle(ctx, title, dest);
  ctx.doc.outline.addItem(title);

  linkButton(ctx, "Öppna utkast i mejlprogrammet", mailto, BLUE);
  hint(ctx, "Knappen öppnar ert mejlprogram med ämne och text ifyllda. Kontrollera mottagaren innan ni skickar.");

  const boxH = textH + 24;
  ensure(ctx, Math.min(boxH, 180));
  const y = doc.y;
  rounded(doc, M, y, CW, boxH, PAPER);
  doc.fillColor(INK).font(ctx.regular).fontSize(9.5).text(email, M + 14, y + 12, { width: CW - 28 });
  doc.y = y + boxH + 12;
}

function drawEmail(ctx: Layout, state: WizardState) {
  drawEmailDraft(ctx, employerEmail(state), employerMailto(state), "Mejl till arbetsgivare eller undertecknare", "mejl");
  if (trackOf(state).englishEmployerPack && state.reason === "employment") {
    drawFieldGuideEn(ctx, state);
    drawEmailDraft(ctx, employerEmailEn(state), employerMailtoEn(state), "Email to employer (English)", "mejl-en");
  }
}

function drawFieldGuideEn(ctx: Layout, state: WizardState) {
  const { doc } = ctx;
  ensure(ctx, 80);
  sectionTitle(ctx, "Field guide (English)", "falt-en");
  ctx.doc.outline.addItem("Field guide (English)");
  hint(ctx, "Copy these values into Skolverket’s Employer certificate. The official English form is not hosted here.");

  const rows = fieldGuidePairsEn(state);
  rows.forEach((row, i) => {
    const valueH = doc.font(ctx.regular).fontSize(10).heightOfString(row.value, { width: CW - 168 });
    const h = Math.max(28, valueH + 14);
    ensure(ctx, h);
    const y = doc.y;
    rounded(doc, M, y, CW, h, i % 2 === 0 ? SOFT : WHITE);
    doc.fillColor(STONE).font(ctx.regular).fontSize(8).text(row.label.toUpperCase(), M + 10, y + 9, {
      width: 140,
    });
    doc.fillColor(INK).font(ctx.bold).fontSize(10).text(row.value, M + 154, y + 8, { width: CW - 168 });
    doc.y = y + h;
  });
  doc.moveDown(0.6);
}

function drawChecklist(ctx: Layout, state: WizardState) {
  const { doc } = ctx;
  ensure(ctx, 80);
  sectionTitle(ctx, "Checklista", "check");
  ctx.doc.outline.addItem("Checklista");
  hint(ctx, "Kryssa i rutorna när ni är klara. Rutorna går att klicka i PDF:en.");

  getChecklist(state).forEach((item, i) => {
    const textH = doc.font(ctx.regular).fontSize(10).heightOfString(item.text, { width: CW - 48 });
    const h = Math.max(28, textH + 12);
    ensure(ctx, h + 2);
    const y = doc.y;
    rounded(doc, M, y, CW, h, item.done ? OK_BG : WHITE);
    if (!item.done) strokeRound(doc, M, y, CW, h, LINE);
    const boxX = M + 10;
    const boxY = y + h / 2 - 7;
    rounded(doc, boxX, boxY, 14, 14, WHITE, 3);
    strokeRound(doc, boxX, boxY, 14, 14, item.done ? OK : BLUE, 3);
    if (item.done) {
      doc.save();
      doc
        .moveTo(boxX + 3, boxY + 7)
        .lineTo(boxX + 6, boxY + 10)
        .lineTo(boxX + 11, boxY + 3)
        .lineWidth(1.6)
        .strokeColor(OK)
        .stroke();
      doc.restore();
    }
    try {
      doc.formCheckbox(`check_${i}_${slug(item.text)}`, boxX, boxY, 14, 14, {
        value: item.done ? "Yes" : "Off",
        backgroundColor: WHITE,
        borderColor: item.done ? OK : BLUE,
      });
    } catch {
      /* visual box above is enough */
    }
    doc.fillColor(INK).font(ctx.regular).fontSize(10).text(item.text, M + 34, y + 8, { width: CW - 48 });
    doc.y = y + h + 4;
  });
}

function drawAttachments(ctx: Layout, state: WizardState) {
  const { doc } = ctx;
  const items = getAttachments(state);
  if (!items.length) return;
  ensure(ctx, 80);
  sectionTitle(ctx, "Lämnas till skolan", "bilagor");
  ctx.doc.outline.addItem("Lämnas till skolan");
  hint(ctx, "Familjen kryssar när pappret finns. Skolan ser det som fortfarande är tomt. Ladda inte upp här.");

  items.forEach((item, i) => {
    const text = `${item.label} — ${item.hint}`;
    const textH = doc.font(ctx.regular).fontSize(10).heightOfString(text, { width: CW - 48 });
    const h = Math.max(34, textH + 14);
    ensure(ctx, h + 2);
    const y = doc.y;
    rounded(doc, M, y, CW, h, item.checked ? OK_BG : WHITE);
    if (!item.checked) strokeRound(doc, M, y, CW, h, LINE);
    const boxX = M + 10;
    const boxY = y + h / 2 - 7;
    rounded(doc, boxX, boxY, 14, 14, WHITE, 3);
    strokeRound(doc, boxX, boxY, 14, 14, item.checked ? OK : BLUE, 3);
    if (item.checked) {
      doc.save();
      doc
        .moveTo(boxX + 3, boxY + 7)
        .lineTo(boxX + 6, boxY + 10)
        .lineTo(boxX + 11, boxY + 3)
        .lineWidth(1.6)
        .strokeColor(OK)
        .stroke();
      doc.restore();
    }
    try {
      doc.formCheckbox(`bilaga_${i}_${item.id}`, boxX, boxY, 14, 14, {
        value: item.checked ? "Yes" : "Off",
        backgroundColor: WHITE,
        borderColor: item.checked ? OK : BLUE,
      });
    } catch {
      /* visual box above is enough */
    }
    doc.fillColor(INK).font(ctx.regular).fontSize(10).text(text, M + 34, y + 8, { width: CW - 48 });
    doc.y = y + h + 4;
  });
}

function drawNotesAndFooterCopy(ctx: Layout) {
  const { doc } = ctx;
  ensure(ctx, 130);
  sectionTitle(ctx, "Egna anteckningar", "anteckningar");
  ctx.doc.outline.addItem("Anteckningar");
  hint(ctx, "Skriv här — fältet är ifyllbart i PDF:en.");
  const y = doc.y;
  rounded(doc, M, y, CW, 78, WHITE);
  strokeRound(doc, M, y, CW, 78, LINE);
  try {
    doc.formText("anteckningar", M + 6, y + 6, CW - 12, 66, {
      multiline: true,
      value: "",
      backgroundColor: WHITE,
      borderColor: WHITE,
    });
  } catch {
    doc.fillColor(STONE).font(ctx.regular).fontSize(9).text("Skriv era anteckningar här.", M + 12, y + 12);
  }
  doc.y = y + 90;

  ensure(ctx, 70);
  rounded(doc, M, doc.y, CW, 58, PAPER);
  doc.fillColor(STONE).font(ctx.regular).fontSize(8.5);
  doc.text(
    "Exempel och stöd från Svenska Skolan Mallorca. Skolverket beslutar. Appen är inte Skolverket. Fingerade namn i exempel. Lämna underlaget till skolan — publicera det inte.",
    M + 14,
    doc.y + 10,
    { width: CW - 28 },
  );
  const linkY = doc.y + 36;
  doc.fillColor(BLUE).font(ctx.bold).fontSize(9).text("svenskaskolanmallorca.com", M + 14, linkY, {
    width: 220,
    link: SCHOOL_URL,
  });
  doc.y = linkY + 22;
}

function drawPageFooter(ctx: Layout, page: number, total: number) {
  const { doc } = ctx;
  doc.save();
  doc.moveTo(M, FOOTER_Y).lineTo(PAGE_W - M, FOOTER_Y).strokeColor(GOLD).lineWidth(1.5).stroke();
  doc.restore();
  doc.fillColor(STONE).font(ctx.regular).fontSize(8);
  doc.text("Svenska Skolan Mallorca  ·  Underlaget", M, FOOTER_Y + 8, { width: CW - 80 });
  doc.text(`${page} / ${total}`, PAGE_W - M - 80, FOOTER_Y + 8, { width: 80, align: "right" });
}

function sectionTitle(ctx: Layout, title: string, dest: string) {
  const { doc } = ctx;
  ensure(ctx, 36);
  doc.addNamedDestination(dest);
  doc.fillColor(BLUE).font(ctx.bold).fontSize(13).text(title, M, doc.y, { width: CW });
  const lineY = doc.y + 4;
  doc.save();
  doc.moveTo(M, lineY).lineTo(M + 72, lineY).strokeColor(GOLD).lineWidth(2).stroke();
  doc.restore();
  doc.y = lineY + 10;
}

function hint(ctx: Layout, text: string) {
  ctx.doc.fillColor(STONE).font(ctx.regular).fontSize(8.5).text(text, M, ctx.doc.y, { width: CW });
  ctx.doc.moveDown(0.45);
}

function linkButton(ctx: Layout, label: string, url: string, color: string) {
  const { doc } = ctx;
  const w = Math.min(CW, doc.font(ctx.bold).fontSize(10).widthOfString(label) + 36);
  ensure(ctx, 36);
  const y = doc.y;
  pill(doc, M, y, w, 28, color);
  doc.fillColor(WHITE).font(ctx.bold).fontSize(10).text(label, M, y + 8, { width: w, align: "center" });
  doc.link(M, y, w, 28, url);
  doc.y = y + 36;
}

function circleNumber(ctx: Layout, x: number, y: number, n: number) {
  const { doc } = ctx;
  doc.save();
  doc.circle(x + 10, y, 10).fill(BLUE);
  doc.restore();
  doc.fillColor(WHITE).font(ctx.bold).fontSize(10).text(String(n), x, y - 7, { width: 20, align: "center" });
}

function ensure(ctx: Layout, height: number) {
  const { doc } = ctx;
  const limit = ctx.firstPage && doc.y < 200 ? PAGE_H - 52 : PAGE_H - 52;
  if (doc.y + height > limit) {
    ctx.firstPage = false;
    doc.addPage();
    doc.y = 56;
    doc.x = M;
  }
}

function statusColors(status: PackStatus) {
  if (status === "complete") return { bg: OK, fg: WHITE };
  if (status === "complete_risk") return { bg: WARN, fg: WHITE };
  return { bg: STOP, fg: WHITE };
}

function rounded(doc: Doc, x: number, y: number, w: number, h: number, color: string, radius = 8) {
  doc.save();
  doc.roundedRect(x, y, w, h, radius).fill(color);
  doc.restore();
}

function strokeRound(doc: Doc, x: number, y: number, w: number, h: number, color: string, radius = 8) {
  doc.save();
  doc.roundedRect(x, y, w, h, radius).lineWidth(0.8).strokeColor(color).stroke();
  doc.restore();
}

function pill(doc: Doc, x: number, y: number, w: number, h: number, color: string) {
  doc.save();
  doc.roundedRect(x, y, w, h, h / 2).fill(color);
  doc.restore();
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/giu, "_")
    .slice(0, 40);
}
