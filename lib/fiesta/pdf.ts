import { existsSync } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";
import {
  formatMeetingDate,
  ROLE_BY_TOPIC,
  roleStatusLabel,
  sourceLabel,
  TOPICS,
  type FiestaState,
  type TopicId,
} from "./model";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 40;
const CW = PAGE_W - M * 2;
const BLUE = "#0070bc";
const KLINT = "#005289";
const INK = "#2c324c";
const STONE = "#5a6570";
const PAPER = "#ecf0f1";
const SOFT = "#e4f1fa";
const GOLD = "#fcb900";
const LINE = "#d0d7de";
const WHITE = "#ffffff";
const SCHOOL_URL = "https://www.svenskaskolanmallorca.com/";
const FONTS = {
  regular: join(process.cwd(), "public/fonts/Raleway-Regular.ttf"),
  semibold: join(process.cwd(), "public/fonts/Raleway-SemiBold.ttf"),
};
const LOGO = join(process.cwd(), "public/LOGO-SVENSKA-SKOLAN.jpg");

type Doc = PDFKit.PDFDocument;
type Layout = { doc: Doc; regular: string; bold: string };

function ensure(ctx: Layout, h: number) {
  if (ctx.doc.y + h < PAGE_H - 48) return;
  ctx.doc.addPage();
  ctx.doc.y = 56;
}

export function buildFiestaPdf(state: FiestaState): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const heading = `${state.meetingTitle} — ${formatMeetingDate(state.meetingDate) || state.meetingDate}`;
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      lang: "sv",
      info: {
        Title: heading,
        Author: "Svenska Skolan Mallorca",
        Subject: "Fiesta / festgruppen, mötesanteckningar",
        Keywords: "Fiesta, Halloween, Svenska Skolan Mallorca",
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

    const ctx: Layout = { doc, regular, bold };
    drawHeader(ctx, heading);
    drawMeta(ctx, state);

    for (const topic of TOPICS) {
      drawTopic(ctx, state, topic.id);
    }

    const inbox = state.clips.filter((clip) => clip.topicId === "inbox");
    if (inbox.length) {
      ensure(ctx, 40);
      doc.fillColor(KLINT).font(bold).fontSize(13).text("Okopplade klipp", M, doc.y, { width: CW });
      doc.moveDown(0.4);
      for (const clip of inbox) {
        drawClip(ctx, clip.text, sourceLabel(clip.source));
      }
    }

    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(range.start + i);
      if (i > 0) {
        doc.save();
        doc.rect(0, 0, PAGE_W, 36).fill(BLUE);
        doc.rect(0, 36, PAGE_W, 3).fill(GOLD);
        doc.restore();
        doc.fillColor(WHITE).font(bold).fontSize(9).text("Fiesta  ·  Svenska Skolan Mallorca", M, 13, {
          width: CW - 80,
        });
      }
      doc.fillColor(STONE).font(regular).fontSize(8).text(`${SCHOOL_URL}  ·  ${i + 1} / ${range.count}`, M, PAGE_H - 28, {
        width: CW,
        align: "center",
      });
    }

    doc.end();
  });
}

function drawHeader(ctx: Layout, heading: string) {
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
  doc.fillColor(WHITE).font(ctx.bold).fontSize(9).text("SVENSKA SKOLAN MALLORCA", textX, 28, { width: 320 });
  doc.font(ctx.bold).fontSize(20).text("Fiesta", textX, 44, { width: 320 });
  doc.font(ctx.regular).fontSize(10).fillColor("#d6eaf8").text("Festgruppen  ·  arbetsanteckningar", textX, 70, {
    width: 320,
  });
  doc.y = 138;
  doc.fillColor(STONE).font(ctx.regular).fontSize(9).text(heading, M, 138, { width: CW });
  doc.moveDown(0.5);
}

function drawMeta(ctx: Layout, state: FiestaState) {
  const { doc } = ctx;
  ensure(ctx, 70);
  const y = doc.y;
  doc.save();
  doc.roundedRect(M, y, CW, 58, 8).fill(PAPER);
  doc.restore();
  const col = CW / 3;
  const facts = [
    ["Datum", formatMeetingDate(state.meetingDate) || state.meetingDate || "—"],
    ["Plats", state.meetingPlace || "—"],
    ["Närvarande", state.attendees || "—"],
  ];
  facts.forEach(([label, value], i) => {
    const x = M + 14 + i * col;
    doc.fillColor(STONE).font(ctx.regular).fontSize(8).text(label.toUpperCase(), x, y + 12, { width: col - 20 });
    doc.fillColor(INK).font(ctx.bold).fontSize(10).text(value, x, y + 26, { width: col - 20 });
  });
  doc.y = y + 70;
}

function drawTopic(ctx: Layout, state: FiestaState, topicId: TopicId) {
  const topic = TOPICS.find((item) => item.id === topicId);
  if (!topic) return;
  const { doc } = ctx;
  const note = state.notesByTopic[topicId]?.trim();
  const clips = state.clips.filter((clip) => clip.topicId === topicId);
  const roleId = ROLE_BY_TOPIC[topicId];
  const role = roleId ? state.roles[roleId] : null;
  if (!note && clips.length === 0 && !role?.lead && !role?.note && !topic.focus && topicId !== "halloween") {
    return;
  }

  ensure(ctx, 56);
  doc.fillColor(topic.focus ? BLUE : KLINT).font(ctx.bold).fontSize(13).text(topic.title, M, doc.y, { width: CW });
  doc.fillColor(STONE).font(ctx.regular).fontSize(9).text(topic.help, M, doc.y + 2, { width: CW });
  doc.moveDown(0.35);

  if (role) {
    ensure(ctx, 36);
    const line = [
      role.lead ? `Ansvarig: ${role.lead}` : "Ansvarig: —",
      role.helpers ? `Med: ${role.helpers}` : null,
      role.count ? `${role.count} personer` : null,
      roleStatusLabel(role.status) || null,
    ]
      .filter(Boolean)
      .join("  ·  ");
    doc.fillColor(INK).font(ctx.bold).fontSize(10).text(line, M, doc.y, { width: CW });
    doc.moveDown(0.25);
    if (role.note.trim()) {
      doc.fillColor(INK).font(ctx.regular).fontSize(10).text(role.note.trim(), M, doc.y, { width: CW });
      doc.moveDown(0.3);
    }
  }

  if (note) {
    ensure(ctx, 28);
    const h = Math.max(28, doc.font(ctx.regular).fontSize(10).heightOfString(note, { width: CW - 20 }) + 16);
    ensure(ctx, h);
    const y = doc.y;
    doc.save();
    doc.roundedRect(M, y, CW, h, 6).fill(SOFT);
    doc.restore();
    doc.fillColor(INK).font(ctx.regular).fontSize(10).text(note, M + 10, y + 8, { width: CW - 20 });
    doc.y = y + h + 8;
  }

  for (const clip of clips) {
    drawClip(ctx, clip.text, sourceLabel(clip.source));
  }
}

function drawClip(ctx: Layout, text: string, source: string) {
  const { doc } = ctx;
  const body = text.trim();
  if (!body) return;
  const h = Math.max(32, doc.font(ctx.regular).fontSize(9.5).heightOfString(body, { width: CW - 20 }) + 22);
  ensure(ctx, h + 6);
  const y = doc.y;
  doc.save();
  doc.roundedRect(M, y, CW, h, 6).strokeColor(LINE).lineWidth(0.8).stroke();
  doc.restore();
  doc.fillColor(BLUE).font(ctx.bold).fontSize(8).text(source.toUpperCase(), M + 10, y + 6, { width: CW - 20 });
  doc.fillColor(INK).font(ctx.regular).fontSize(9.5).text(body, M + 10, y + 18, { width: CW - 20 });
  doc.y = y + h + 8;
}
