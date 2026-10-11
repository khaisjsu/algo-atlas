import { toItems } from "../trace";
import type { Action, Bilingual, Field, Step, VizModule } from "../types";
import { b, parseList, randInt } from "../types";
import type { HashState, Item, Marks } from "../views";

type HModel = { mode: "chain" | "probe"; size: number; chains: Item[][]; slots: Array<Item | null | "del"> };

const clone = (m: HModel): HModel => ({ ...m, chains: m.chains.map((c) => c.slice()), slots: m.slots.slice() });

const view = (m: HModel, bucketMarks: Marks = {}, itemMarks: Marks = {}, formula?: string): HashState => ({
  mode: m.mode,
  size: m.size,
  chains: m.chains.map((c) => c.slice()),
  slots: m.slots.slice(),
  bucketMarks,
  itemMarks,
  formula,
});

class HashTrace {
  steps: Step<HashState>[] = [];
  constructor(public m: HModel) {}
  snap(line: number | number[], note: Bilingual, bm: Marks = {}, im: Marks = {}, formula?: string, vars?: Record<string, string | number>) {
    this.steps.push({ state: view(this.m, bm, im, formula), line, note, vars });
  }
}

const count = (m: HModel) => (m.mode === "chain" ? m.chains.reduce((s, c) => s + c.length, 0) : m.slots.filter((s) => s && s !== "del").length);
const h = (k: number, size: number) => ((k % size) + size) % size;

const keyField = (def: number): Field => ({ key: "key", label: b("Key", "Khoá"), kind: "number", default: def, min: 0, max: 999 });

function fresh(mode: HModel["mode"], size: number, keys: number[]): HModel {
  const m: HModel = { mode, size, chains: Array.from({ length: size }, () => []), slots: Array(size).fill(null) };
  for (const k of [...new Set(keys)]) {
    if (mode === "chain") m.chains[h(k, size)].push(...toItems([k]));
    else {
      let i = h(k, size);
      for (let p = 0; p < size && m.slots[i]; p++) i = (i + 1) % size;
      if (!m.slots[i]) m.slots[i] = toItems([k])[0];
    }
  }
  return m;
}

type HAction = Action<HModel, HashState>;

const insert: HAction = {
  id: "insert",
  label: b("Insert", "Chèn"),
  fields: [keyField(47)],
  code: ["i = hash(key) = key mod m", "chaining: append key to bucket[i]", "probing: while slot[i] is occupied", "  i = (i + 1) mod m", "slot[i] = key"],
  run(m0, v) {
    const k = Number(v.key);
    const m = clone(m0);
    const t = new HashTrace(m);
    let i = h(k, m.size);
    const f = `${k} mod ${m.size} = ${i}`;
    t.snap(0, b(`Hash the key: ${f}.`, `Băm khoá: ${f}.`), { [i]: "compare" }, {}, f, { key: k, i });
    if (m.mode === "chain") {
      if (m.chains[i].some((x) => x.v === k)) {
        t.snap(1, b(`${k} is already in bucket ${i}.`, `${k} đã có trong ô ${i}.`), { [i]: "found" }, {}, f);
        return { steps: t.steps, model: m };
      }
      const [item] = toItems([k]);
      m.chains[i].push(item);
      t.snap(1, m.chains[i].length > 1
        ? b(`Collision! Bucket ${i} already had ${m.chains[i].length - 1} key(s); append ${k} to its chain.`, `Va chạm! Ô ${i} đã có ${m.chains[i].length - 1} khoá; nối ${k} vào chuỗi.`)
        : b(`Bucket ${i} was empty; store ${k} there.`, `Ô ${i} trống; lưu ${k} vào đó.`), { [i]: "found" }, { [item.id]: "found" }, f, { key: k, i, "load α": (count(m) / m.size).toFixed(2) });
      return { steps: t.steps, model: m };
    }
    if (count(m) >= m.size) return { error: b("Table is full — open addressing needs load factor < 1.", "Bảng đầy — địa chỉ mở cần hệ số tải < 1.") };
    let tomb: number | null = null;
    const place = (at: number, p: number) => {
      const [item] = toItems([k]);
      m.slots[at] = item;
      t.snap(4, b(`Store ${k} in slot ${at}${p ? ` after ${p} probe(s)` : ""}.`, `Lưu ${k} vào ô ${at}${p ? ` sau ${p} lần dò` : ""}.`), { [at]: "found" }, { [item.id]: "found" }, f, { key: k, i: at, probes: p, "load α": (count(m) / m.size).toFixed(2) });
      return { steps: t.steps, model: m };
    };
    for (let p = 0; p < m.size; p++) {
      const s = m.slots[i];
      if (!s) return place(tomb ?? i, p);
      if (s !== "del" && s.v === k) {
        t.snap(2, b(`${k} already present at slot ${i}.`, `${k} đã có ở ô ${i}.`), { [i]: "found" }, {}, f);
        return { steps: t.steps, model: m };
      }
      if (s === "del" && tomb == null) tomb = i;
      const nx = (i + 1) % m.size;
      t.snap([2, 3], s === "del"
        ? b(`Slot ${i} is a tombstone — remember it, but keep probing in case ${k} is further on.`, `Ô ${i} là bia mộ — ghi nhớ, nhưng dò tiếp phòng khi ${k} ở phía sau.`)
        : b(`Slot ${i} holds ${s.v} — collision. Probe the next slot ${nx}.`, `Ô ${i} chứa ${s.v} — va chạm. Dò ô kế tiếp ${nx}.`), { [i]: "reject", [nx]: "compare" }, {}, f, { key: k, i, probes: p + 1 });
      i = nx;
    }
    return tomb != null ? place(tomb, m.size) : { steps: t.steps, model: m };
  },
};

const search: HAction = {
  id: "search",
  label: b("Search", "Tìm"),
  fields: [keyField(28)],
  code: ["i = hash(key)", "chaining: scan bucket[i]", "probing: while slot[i] not empty:", "  if slot[i] == key: found; i = (i + 1) mod m", "not found"],
  run(m, v) {
    const k = Number(v.key);
    const t = new HashTrace(m);
    let i = h(k, m.size);
    const f = `${k} mod ${m.size} = ${i}`;
    t.snap(0, b(`Only bucket ${i} can contain ${k}.`, `Chỉ ô ${i} có thể chứa ${k}.`), { [i]: "compare" }, {}, f, { key: k, i });
    if (m.mode === "chain") {
      for (const it of m.chains[i]) {
        const hit = it.v === k;
        t.snap(1, hit ? b(`Found ${k}.`, `Tìm thấy ${k}.`) : b(`${it.v} ≠ ${k}, next in chain.`, `${it.v} ≠ ${k}, phần tử kế trong chuỗi.`), { [i]: hit ? "found" : "compare" }, { [it.id]: hit ? "found" : "compare" }, f);
        if (hit) return { steps: t.steps, model: m };
      }
      t.snap(4, b(`End of chain: ${k} is not stored.`, `Hết chuỗi: không có ${k}.`), { [i]: "reject" }, {}, f);
      return { steps: t.steps, model: m };
    }
    for (let p = 0; p < m.size; p++) {
      const s = m.slots[i];
      if (!s) {
        t.snap(4, b(`Slot ${i} is empty — ${k} would have been placed here, so it is absent.`, `Ô ${i} trống — ${k} lẽ ra đã nằm ở đây, nên không có.`), { [i]: "reject" }, {}, f, { probes: p });
        return { steps: t.steps, model: m };
      }
      if (s !== "del" && s.v === k) {
        t.snap(3, b(`Found ${k} at slot ${i} after ${p} probe(s).`, `Tìm thấy ${k} ở ô ${i} sau ${p} lần dò.`), { [i]: "found" }, { [s.id]: "found" }, f, { probes: p });
        return { steps: t.steps, model: m };
      }
      t.snap([2, 3], s === "del" ? b(`Slot ${i} is a tombstone — keep probing.`, `Ô ${i} là bia mộ — tiếp tục dò.`) : b(`Slot ${i} holds ${s.v}; keep probing.`, `Ô ${i} chứa ${s.v}; tiếp tục dò.`), { [i]: "compare" }, {}, f, { probes: p + 1 });
      i = (i + 1) % m.size;
    }
    t.snap(4, b("Probed every slot: not found.", "Đã dò mọi ô: không tìm thấy."), {}, {}, f);
    return { steps: t.steps, model: m };
  },
};

const remove: HAction = {
  id: "remove",
  label: b("Remove", "Xoá"),
  fields: [keyField(28)],
  code: ["locate key as in search", "chaining: unlink it from the chain", "probing: replace with a tombstone (DEL)", "  so later probes don't stop early"],
  run(m0, v) {
    const k = Number(v.key);
    const m = clone(m0);
    const t = new HashTrace(m);
    let i = h(k, m.size);
    const f = `${k} mod ${m.size} = ${i}`;
    t.snap(0, b(`Look in bucket ${i}.`, `Tìm trong ô ${i}.`), { [i]: "compare" }, {}, f);
    if (m.mode === "chain") {
      const idx = m.chains[i].findIndex((x) => x.v === k);
      if (idx < 0) { t.snap(1, b(`${k} not found.`, `Không tìm thấy ${k}.`), { [i]: "reject" }, {}, f); return { steps: t.steps, model: m }; }
      const it = m.chains[i][idx];
      t.snap(1, b(`Found ${k}; unlink it.`, `Tìm thấy ${k}; gỡ nó ra.`), { [i]: "found" }, { [it.id]: "reject" }, f);
      m.chains[i].splice(idx, 1);
      t.snap(1, b(`Removed ${k}.`, `Đã xoá ${k}.`), { [i]: "found" }, {}, f);
      return { steps: t.steps, model: m };
    }
    for (let p = 0; p < m.size; p++) {
      const s = m.slots[i];
      if (!s) break;
      if (s !== "del" && s.v === k) {
        t.snap(0, b(`Found ${k} at slot ${i}.`, `Tìm thấy ${k} ở ô ${i}.`), { [i]: "found" }, { [s.id]: "reject" }, f);
        m.slots[i] = "del";
        t.snap([2, 3], b(`Mark slot ${i} as a tombstone. Emptying it would break searches for keys that probed past it.`, `Đánh dấu ô ${i} là bia mộ. Làm trống nó sẽ phá vỡ việc tìm các khoá đã dò qua nó.`), { [i]: "pivot" }, {}, f);
        return { steps: t.steps, model: m };
      }
      t.snap(0, b(`Slot ${i} isn't ${k}; probe on.`, `Ô ${i} không phải ${k}; dò tiếp.`), { [i]: "compare" }, {}, f);
      i = (i + 1) % m.size;
    }
    t.snap(0, b(`${k} not found.`, `Không tìm thấy ${k}.`), {}, {}, f);
    return { steps: t.steps, model: m };
  },
};

const create: HAction = {
  id: "create",
  label: b("Create", "Tạo"),
  fields: [
    { key: "mode", label: b("Collision strategy", "Xử lý va chạm"), kind: "select", default: "chain", options: [{ value: "chain", label: b("Separate chaining", "Xâu chuỗi riêng") }, { value: "probe", label: b("Linear probing", "Dò tuyến tính") }] },
    { key: "size", label: b("Table size m", "Kích thước bảng m"), kind: "number", default: 11, min: 3, max: 17 },
    { key: "keys", label: b("Keys", "Khoá"), kind: "list", default: "random" },
  ],
  run(_m, v) {
    const size = Math.max(3, Math.min(17, Number(v.size) || 11));
    let keys: number[];
    if (!v.keys || v.keys.trim() === "random") {
      const pool = new Set<number>();
      while (pool.size < Math.round(size * 0.6)) pool.add(randInt(1, 99));
      keys = [...pool];
    }
    else {
      const p = parseList(v.keys);
      if (!p) return { error: b("Enter whole numbers, or the word random.", "Nhập số nguyên, hoặc chữ random.") };
      if (v.mode === "probe" && p.length >= size) return { error: b("Linear probing needs fewer keys than slots.", "Dò tuyến tính cần ít khoá hơn số ô.") };
      keys = p;
    }
    const m = fresh(v.mode === "probe" ? "probe" : "chain", size, keys);
    return { model: m, steps: [{ state: view(m), line: -1, note: b(`Hash table with m = ${size} buckets, ${count(m)} keys (load factor ${(count(m) / size).toFixed(2)}).`, `Bảng băm m = ${size} ô, ${count(m)} khoá (hệ số tải ${(count(m) / size).toFixed(2)}).`) }] };
  },
};

const hashTable: VizModule<HModel, HashState> = {
  slug: "hash-table",
  title: b("Hash table", "Bảng băm"),
  short: b("Turn a key into an array index for O(1) average lookups.", "Biến khoá thành chỉ số mảng để tra cứu O(1) trung bình."),
  category: "linear",
  tags: ["O(1) average", "hashing", "collisions", "dictionary"],
  intro: b(
    "A hash table stores key → value pairs in an array. A hash function maps each key to a bucket index; collisions (two keys in one bucket) are resolved by chaining (a small list per bucket) or open addressing (probe for another free slot). Keep the load factor α = n/m low and every operation is O(1) on average.",
    "Bảng băm lưu cặp khoá → giá trị trong một mảng. Hàm băm ánh xạ mỗi khoá tới chỉ số ô; va chạm (hai khoá cùng ô) được xử lý bằng xâu chuỗi (danh sách nhỏ cho mỗi ô) hoặc địa chỉ mở (dò tìm ô trống khác). Giữ hệ số tải α = n/m thấp thì mọi thao tác trung bình là O(1).",
  ),
  invariant: b("A key k is always stored in bucket hash(k) (chaining) or on the probe path starting at hash(k) with no empty slot before it (probing).", "Khoá k luôn nằm ở ô hash(k) (xâu chuỗi) hoặc trên đường dò bắt đầu từ hash(k) mà không có ô trống nào trước nó (dò)."),
  complexity: [
    { label: b("average insert/find/delete", "chèn/tìm/xoá trung bình"), value: "O(1)" },
    { label: b("worst case", "xấu nhất"), value: "O(n)" },
    { label: b("resize (amortised)", "thay đổi kích thước (khấu hao)"), value: "O(1)" },
  ],
  applications: [
    { title: b("Everywhere in code", "Mọi nơi trong mã nguồn"), body: b("Python dict/set, JavaScript Map/objects, Java HashMap — the most-used data structure in practice.", "dict/set của Python, Map/object của JavaScript, HashMap của Java — cấu trúc dữ liệu dùng nhiều nhất trong thực tế.") },
    { title: b("Caches", "Bộ nhớ đệm"), body: b("Memcached, Redis and CDN edge caches are giant distributed hash tables.", "Memcached, Redis và cache CDN là các bảng băm phân tán khổng lồ.") },
    { title: b("Databases", "Cơ sở dữ liệu"), body: b("Hash joins and hash indexes give O(1) equality lookups.", "Hash join và chỉ mục băm cho tra cứu bằng nhau O(1).") },
    { title: b("Deduplication & counting", "Loại trùng & đếm"), body: b("Count word frequencies, detect duplicates, and memoise function results.", "Đếm tần suất từ, phát hiện trùng lặp và ghi nhớ kết quả hàm.") },
  ],
  recognize: [
    b("“Have I seen this before?” / “how many times?” / “find the complement”.", "“Đã gặp cái này chưa?” / “bao nhiêu lần?” / “tìm phần bù”."),
    b("Turning an O(n²) pair search into O(n) (Two Sum).", "Biến tìm cặp O(n²) thành O(n) (Two Sum)."),
    b("Grouping by a computed key (anagrams → sorted letters).", "Gom nhóm theo khoá tính toán (đảo chữ → chữ cái đã sắp xếp)."),
  ],
  pitfalls: [
    b("Hash tables are unordered — no range queries or sorted iteration (use a BST).", "Bảng băm không có thứ tự — không truy vấn khoảng hay duyệt theo thứ tự (dùng BST)."),
    b("Mutable keys (e.g. lists) whose hash changes after insertion get lost.", "Khoá thay đổi được (ví dụ list) có hash đổi sau khi chèn sẽ bị “mất”."),
    b("Adversarial inputs can force collisions; languages randomise hash seeds to prevent DoS.", "Đầu vào cố ý có thể gây va chạm; các ngôn ngữ ngẫu nhiên hoá hạt giống băm để chống DoS."),
  ],
  practice: [
    { name: "Two Sum (1)", url: "https://leetcode.com/problems/two-sum/", level: "Easy" },
    { name: "Group Anagrams (49)", url: "https://leetcode.com/problems/group-anagrams/", level: "Medium" },
    { name: "Design HashMap (706)", url: "https://leetcode.com/problems/design-hashmap/", level: "Easy" },
    { name: "Subarray Sum Equals K (560)", url: "https://leetcode.com/problems/subarray-sum-equals-k/", level: "Medium" },
  ],
  python: `def two_sum(nums, target):
    seen = {}                       # value -> index
    for i, x in enumerate(nums):
        if target - x in seen:      # O(1) average lookup
            return seen[target - x], i
        seen[x] = i

class ChainedHashMap:
    def __init__(self, m=11):
        self.buckets = [[] for _ in range(m)]
    def put(self, key, val):
        b = self.buckets[hash(key) % len(self.buckets)]
        for pair in b:
            if pair[0] == key:
                pair[1] = val; return
        b.append([key, val])`,
  quiz: [
    {
      q: b("Why do hash tables pick a prime table size for k mod m hashing?", "Vì sao bảng băm chọn kích thước nguyên tố khi băm k mod m?"),
      options: [b("Patterned keys (e.g. all even) spread out better", "Khoá có quy luật (ví dụ toàn số chẵn) phân bố đều hơn"), b("Primes use less memory", "Số nguyên tố dùng ít bộ nhớ"), b("It is required by the CPU", "CPU yêu cầu")],
      answer: 0,
      why: b("With m = 10, all multiples of 10 land in bucket 0; a prime m avoids common factors.", "Với m = 10, mọi bội của 10 rơi vào ô 0; m nguyên tố tránh được ước chung."),
    },
    {
      q: b("In linear probing, why can't delete simply empty the slot?", "Trong dò tuyến tính, vì sao xoá không thể chỉ làm trống ô?"),
      options: [b("Searches would stop early at the hole", "Việc tìm sẽ dừng sớm ở chỗ trống"), b("It would leak memory", "Rò rỉ bộ nhớ"), b("It can, actually", "Thực ra là được")],
      answer: 0,
      why: b("Keys that probed past this slot would become unreachable; use a tombstone.", "Các khoá đã dò qua ô này sẽ không tìm được nữa; hãy dùng bia mộ."),
    },
  ],
  view: "hash",
  initial: () => fresh("chain", 11, [15, 28, 47, 5, 61, 39, 72, 16]),
  idle: (m) => view(m),
  actions: [create, insert, search, remove],
};

export const hashModules = [hashTable];
