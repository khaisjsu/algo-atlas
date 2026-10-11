import { dpModules } from "./modules/dp";
import { graphModules } from "./modules/graphs";
import { hashModules } from "./modules/hashing";
import { linearModules } from "./modules/linear";
import { mlModules } from "./modules/ml";
import { searchingModules } from "./modules/searching";
import { sortingModules } from "./modules/sorting";
import { treeModules } from "./modules/trees";
import type { Bilingual, Category, VizModule } from "./types";
import { b } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyModule = VizModule<any, any>;

export const modules: AnyModule[] = [
  ...sortingModules,
  ...searchingModules,
  ...linearModules,
  ...hashModules,
  ...treeModules,
  ...graphModules,
  ...dpModules,
  ...mlModules,
];

export const categories: Array<{ id: Category; title: Bilingual; blurb: Bilingual; tone: string }> = [
  { id: "sorting", title: b("Sorting", "Sắp xếp"), blurb: b("Put things in order — and learn every algorithmic paradigm on the way.", "Sắp xếp mọi thứ — và học mọi mô thức thuật toán trên đường đi."), tone: "coral" },
  { id: "searching", title: b("Searching & patterns", "Tìm kiếm & mẫu tư duy"), blurb: b("Binary search, two pointers and sliding windows: the patterns behind most array problems.", "Tìm nhị phân, hai con trỏ và cửa sổ trượt: các mẫu đằng sau hầu hết bài toán mảng."), tone: "yellow" },
  { id: "linear", title: b("Linear structures & hashing", "Cấu trúc tuyến tính & băm"), blurb: b("Stacks, queues, linked lists and hash tables — the everyday toolbox.", "Ngăn xếp, hàng đợi, danh sách liên kết và bảng băm — hộp đồ nghề hằng ngày."), tone: "blue" },
  { id: "trees", title: b("Trees & sets", "Cây & tập hợp"), blurb: b("Hierarchies that keep data ordered, prioritised or grouped.", "Cấu trúc phân cấp giữ dữ liệu có thứ tự, ưu tiên hoặc theo nhóm."), tone: "green" },
  { id: "graphs", title: b("Graphs", "Đồ thị"), blurb: b("Networks, maps and dependencies: traverse, route, connect and schedule.", "Mạng lưới, bản đồ và phụ thuộc: duyệt, tìm đường, kết nối và lập lịch."), tone: "violet" },
  { id: "dp", title: b("Dynamic programming", "Quy hoạch động"), blurb: b("Solve each sub-problem once, fill a table, read off the answer.", "Giải mỗi bài toán con một lần, điền bảng, đọc ra đáp án."), tone: "pink" },
  { id: "ml", title: b("Machine learning", "Học máy"), blurb: b("Watch models learn: optimisation, regression and clustering.", "Xem mô hình học: tối ưu, hồi quy và phân cụm."), tone: "teal" },
];

export const findModule = (slug: string) => modules.find((m) => m.slug === slug);

export const neighbours = (slug: string) => {
  const i = modules.findIndex((m) => m.slug === slug);
  return { prev: i > 0 ? modules[i - 1] : null, next: i >= 0 && i < modules.length - 1 ? modules[i + 1] : null };
};
