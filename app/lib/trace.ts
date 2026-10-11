import type { Bilingual, Field, FieldValues, Mark, Step } from "./types";
import { b, parseList, randInt, randomList } from "./types";
import type { ArrayState, Item, Marks, Pointer } from "./views";

type Extra = {
  marks?: Marks;
  pointers?: Pointer[];
  range?: [number, number] | null;
  aux?: ArrayState["aux"];
  guide?: ArrayState["guide"];
  vars?: Record<string, string | number>;
};

/** Records array snapshots while an algorithm runs. */
export class ArrayTrace {
  steps: Step<ArrayState>[] = [];
  done = new Set<number>();
  constructor(public items: Item[]) {}

  snap(line: number | number[], note: Bilingual, extra: Extra = {}) {
    const marks: Marks = {};
    this.done.forEach((i) => (marks[i] = "done"));
    Object.assign(marks, extra.marks);
    this.steps.push({
      state: {
        items: this.items.slice(),
        marks,
        pointers: extra.pointers,
        range: extra.range ?? null,
        aux: extra.aux,
        guide: extra.guide ?? null,
      },
      line,
      note,
      vars: extra.vars,
    });
  }

  swap(i: number, j: number) {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
  }

  v(i: number) {
    return this.items[i].v;
  }
}

let nextId = 1;
export const toItems = (values: number[]): Item[] => values.map((v) => ({ id: nextId++, v }));

export const idleArray = (items: Item[], marks: Marks = {}): ArrayState => ({ items, marks });

export const fmt = (i: number, v: number) => `A[${i}]=${v}`;

/** The "Create" action shared by every array module, mirroring VisuAlgo's input panel. */
export function createArrayAction(opts: { sorted?: boolean; max?: number; defaultN?: number; hi?: number } = {}) {
  const max = opts.max ?? 24;
  const hi = opts.hi ?? 60;
  const fields: Field[] = [
    {
      key: "shape",
      label: b("Input", "Dữ liệu"),
      kind: "select",
      default: "random",
      options: [
        { value: "random", label: b("Random", "Ngẫu nhiên") },
        { value: "nearly", label: b("Nearly sorted", "Gần như đã sắp xếp") },
        { value: "reversed", label: b("Reversed", "Đảo ngược") },
        { value: "few", label: b("Few unique values", "Ít giá trị khác nhau") },
        { value: "custom", label: b("Custom list", "Tự nhập") },
      ],
    },
    { key: "n", label: b("Size", "Kích thước"), kind: "number", default: opts.defaultN ?? 12, min: 2, max, when: ["shape", "!custom"] },
    { key: "list", label: b("Custom values", "Giá trị tự nhập"), kind: "list", default: "29, 10, 14, 37, 13, 5, 44, 21", placeholder: "e.g. 5, 3, 8, 1", when: ["shape", "custom"] },
  ];

  return {
    id: "create",
    label: b("Create", "Tạo mảng"),
    fields,
    run(_model: Item[], values: FieldValues) {
      let list: number[];
      const n = Math.max(2, Math.min(max, Number(values.n) || 12));
      if (values.shape === "custom") {
        const parsed = parseList(values.list ?? "");
        if (!parsed || parsed.length < 1) return { error: b("Enter whole numbers separated by commas.", "Nhập các số nguyên, cách nhau bởi dấu phẩy.") };
        if (parsed.length > max) return { error: b(`Use at most ${max} values.`, `Tối đa ${max} giá trị.`) };
        if (parsed.some((x) => x < 0 || x > 99)) return { error: b("Keep values between 0 and 99.", "Giữ giá trị trong khoảng 0 đến 99.") };
        list = parsed;
      } else if (values.shape === "nearly") {
        list = randomList(n, 3, hi).sort((x, y) => x - y);
        for (let k = 0; k < Math.max(1, n / 6); k++) {
          const i = randInt(0, n - 2);
          [list[i], list[i + 1]] = [list[i + 1], list[i]];
        }
      } else if (values.shape === "reversed") {
        list = randomList(n, 3, hi).sort((x, y) => y - x);
      } else if (values.shape === "few") {
        const pool = randomList(3, 5, hi);
        list = Array.from({ length: n }, () => pool[randInt(0, 2)]);
      } else {
        list = randomList(n, 3, hi);
      }
      if (opts.sorted) list.sort((x, y) => x - y);
      const items = toItems(list);
      return {
        model: items,
        steps: [
          {
            state: idleArray(items),
            line: -1,
            note: b(`Created an array of ${items.length} values.`, `Đã tạo mảng gồm ${items.length} giá trị.`),
          },
        ],
      };
    },
  };
}

export const markRange = (lo: number, hi: number, mark: Mark): Marks => {
  const m: Marks = {};
  for (let i = lo; i <= hi; i++) m[i] = mark;
  return m;
};
