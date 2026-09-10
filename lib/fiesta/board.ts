import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  emptyBoard,
  GROUP_META,
  type Board,
  type GroupId,
} from "./board-model";

export type { Board, BoardGroup, BoardMember, GroupId } from "./board-model";
export { emptyBoard, GROUP_META, groupMeta, isGroupId } from "./board-model";

function dataPath() {
  return process.env.FIESTA_DATA_PATH?.trim() || join(process.cwd(), "data", "fiesta-board.json");
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readBoard(): Promise<Board> {
  const path = dataPath();
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as Board;
    const base = emptyBoard();
    for (const meta of GROUP_META) {
      const incoming = parsed.groups?.[meta.id];
      if (incoming) {
        base.groups[meta.id] = {
          id: meta.id,
          note: incoming.note ?? "",
          members: Array.isArray(incoming.members) ? incoming.members : [],
        };
      }
    }
    base.updatedAt = parsed.updatedAt || base.updatedAt;
    return base;
  } catch {
    return emptyBoard();
  }
}

async function writeBoard(board: Board) {
  const path = dataPath();
  await mkdir(dirname(path), { recursive: true });
  board.updatedAt = new Date().toISOString();
  await writeFile(path, `${JSON.stringify(board, null, 2)}\n`, "utf8");
}

export function newBoardId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getBoard() {
  return enqueue(() => readBoard());
}

export async function joinBoard(input: { groupId: GroupId; name: string; role: string; done: string }) {
  return enqueue(async () => {
    const board = await readBoard();
    const group = board.groups[input.groupId];
    if (!group) throw new Error("Okänd grupp.");
    const name = input.name.trim();
    if (name.length < 2) throw new Error("Skriv ditt namn.");
    const now = new Date().toISOString();
    const existing = group.members.find((member) => member.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.role = input.role.trim() || existing.role;
      if (input.done.trim()) existing.done = input.done.trim();
      existing.updatedAt = now;
    } else {
      group.members.push({
        id: newBoardId(),
        name,
        role: input.role.trim() || "Annat",
        done: input.done.trim(),
        createdAt: now,
        updatedAt: now,
      });
    }
    await writeBoard(board);
    return board;
  });
}

export async function updateMember(input: { groupId: GroupId; memberId: string; role?: string; done?: string }) {
  return enqueue(async () => {
    const board = await readBoard();
    const member = board.groups[input.groupId]?.members.find((item) => item.id === input.memberId);
    if (!member) throw new Error("Hittade inte personen.");
    if (input.role !== undefined) member.role = input.role.trim();
    if (input.done !== undefined) member.done = input.done.trim();
    member.updatedAt = new Date().toISOString();
    await writeBoard(board);
    return board;
  });
}

export async function removeMember(groupId: GroupId, memberId: string) {
  return enqueue(async () => {
    const board = await readBoard();
    const group = board.groups[groupId];
    if (!group) throw new Error("Okänd grupp.");
    group.members = group.members.filter((member) => member.id !== memberId);
    await writeBoard(board);
    return board;
  });
}

export async function setGroupNote(groupId: GroupId, note: string) {
  return enqueue(async () => {
    const board = await readBoard();
    const group = board.groups[groupId];
    if (!group) throw new Error("Okänd grupp.");
    group.note = note.trim();
    await writeBoard(board);
    return board;
  });
}
