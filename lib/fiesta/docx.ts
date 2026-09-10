import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeightRule,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import {
  formatMeetingDate,
  ROLE_BY_TOPIC,
  roleStatusLabel,
  sourceLabel,
  TOPICS,
  type FiestaState,
  type TopicId,
} from "./model";

const BLUE = "0070BC";
const GOLD = "FCB900";
const INK = "2C324C";
const STONE = "5A6570";
const SOFT = "E4F1FA";
const PAPER = "ECF0F1";
const WHITE = "FFFFFF";
const LOGO = join(process.cwd(), "public/LOGO-SVENSKA-SKOLAN.jpg");
const SCHOOL_URL = "https://www.svenskaskolanmallorca.com/";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const none = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(
  children: Paragraph[],
  options: { width: number; fill?: string; borders?: typeof none } = { width: 9026 },
) {
  return new TableCell({
    width: { size: options.width, type: WidthType.DXA },
    shading: options.fill ? { type: ShadingType.CLEAR, color: "auto", fill: options.fill } : undefined,
    borders: options.borders ?? none,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children,
  });
}

function p(text: string, opts: { bold?: boolean; size?: number; color?: string; allCaps?: boolean } = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        size: opts.size ?? 20,
        color: opts.color ?? INK,
        font: "Calibri",
        allCaps: opts.allCaps,
      }),
    ],
  });
}

export async function buildFiestaDocx(state: FiestaState): Promise<Buffer> {
  const date = formatMeetingDate(state.meetingDate) || state.meetingDate;
  const logo = existsSync(LOGO)
    ? new ImageRun({
        type: "jpg",
        data: readFileSync(LOGO),
        transformation: { width: 56, height: 56 },
      })
    : null;

  const header = new Table({
    width: { size: 9026, type: WidthType.DXA },
    rows: [
      new TableRow({
        height: { value: 1400, rule: HeightRule.ATLEAST },
        children: [
          cell(
            [
              ...(logo ? [new Paragraph({ children: [logo] })] : []),
              p("SVENSKA SKOLAN MALLORCA", { bold: true, size: 16, color: WHITE, allCaps: true }),
              p("Fiesta", { bold: true, size: 36, color: WHITE }),
              p("Festgruppen  ·  arbetsanteckningar", { size: 18, color: "D6EAF8" }),
            ],
            { width: 9026, fill: BLUE },
          ),
        ],
      }),
      new TableRow({
        height: { value: 80, rule: HeightRule.EXACT },
        children: [cell([new Paragraph("")], { width: 9026, fill: GOLD })],
      }),
    ],
  });

  const meta = new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [3008, 3009, 3009],
    rows: [
      new TableRow({
        children: [
          cell([p("DATUM", { size: 14, color: STONE, bold: true }), p(date || "—", { bold: true, size: 20 })], {
            width: 3008,
            fill: PAPER,
          }),
          cell(
            [p("PLATS", { size: 14, color: STONE, bold: true }), p(state.meetingPlace || "—", { bold: true, size: 20 })],
            { width: 3009, fill: PAPER },
          ),
          cell(
            [
              p("NÄRVARANDE", { size: 14, color: STONE, bold: true }),
              p(state.attendees || "—", { bold: true, size: 20 }),
            ],
            { width: 3009, fill: PAPER },
          ),
        ],
      }),
    ],
  });

  const blocks: (Paragraph | Table)[] = [
    header,
    new Paragraph({ spacing: { after: 200 } }),
    p(state.meetingTitle, { bold: true, size: 28 }),
    p("Huvudfokus: Halloweenfesten. Övriga punkter bara nästa steg.", { size: 20, color: STONE }),
    new Paragraph({ spacing: { after: 120 } }),
    meta,
    new Paragraph({ spacing: { after: 200 } }),
  ];

  for (const topic of TOPICS) {
    blocks.push(...topicBlocks(state, topic.id));
  }

  const inbox = state.clips.filter((clip) => clip.topicId === "inbox");
  if (inbox.length) {
    blocks.push(p("Okopplade klipp", { bold: true, size: 26 }));
    for (const clip of inbox) {
      blocks.push(clipTable(clip.text, sourceLabel(clip.source)));
      blocks.push(new Paragraph({ spacing: { after: 80 } }));
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: INK },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        headers: {
          default: new Header({
            children: [p("Fiesta  ·  Svenska Skolan Mallorca", { size: 16, color: STONE })],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: SCHOOL_URL, size: 16, color: STONE, font: "Calibri" })],
              }),
            ],
          }),
        },
        children: blocks,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

function topicBlocks(state: FiestaState, topicId: TopicId): (Paragraph | Table)[] {
  const topic = TOPICS.find((item) => item.id === topicId);
  if (!topic) return [];
  const note = state.notesByTopic[topicId]?.trim();
  const clips = state.clips.filter((clip) => clip.topicId === topicId);
  const roleId = ROLE_BY_TOPIC[topicId];
  const role = roleId ? state.roles[roleId] : null;
  if (!note && clips.length === 0 && !role?.lead && !role?.note && !topic.focus && topicId !== "halloween") {
    return [];
  }

  const out: (Paragraph | Table)[] = [
    p(topic.title, { bold: true, size: 26, color: topic.focus ? BLUE : "005289" }),
    p(topic.help, { size: 18, color: STONE }),
  ];

  if (role) {
    const line = [
      role.lead ? `Ansvarig: ${role.lead}` : "Ansvarig: —",
      role.helpers ? `Med: ${role.helpers}` : null,
      role.count ? `${role.count} personer` : null,
      roleStatusLabel(role.status) || null,
    ]
      .filter(Boolean)
      .join("  ·  ");
    out.push(p(line, { bold: true, size: 20 }));
    if (role.note.trim()) out.push(p(role.note.trim(), { size: 20 }));
  }

  if (note) {
    out.push(
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        rows: [new TableRow({ children: [cell([p(note, { size: 20 })], { width: 9026, fill: SOFT })] })],
      }),
    );
    out.push(new Paragraph({ spacing: { after: 80 } }));
  }

  for (const clip of clips) {
    out.push(clipTable(clip.text, sourceLabel(clip.source)));
    out.push(new Paragraph({ spacing: { after: 80 } }));
  }

  return out;
}

function clipTable(text: string, source: string) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          cell(
            [p(source.toUpperCase(), { bold: true, size: 14, color: BLUE }), p(text, { size: 19 })],
            { width: 9026, fill: WHITE },
          ),
        ],
      }),
    ],
  });
}
