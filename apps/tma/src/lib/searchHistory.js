// 搜索历史的纯逻辑（node:test 可直接覆盖）。与 cart 一样走"注入 storage"的模式，
// 存储不可用时退化为内存，绝不因为 localStorage 抛异常而让首页白屏。
import { safeStorage } from './cart.js';

const KEY = 'fbsearch:v1';
const LIMIT = 8;
const MAX_LEN = 40;

// 规范化：折叠空白、去控制字符、限长。空串返回 null（不记录）。
function normalize(q) {
  if (typeof q !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  const s = q.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
  return s || null;
}

export function createSearchHistory(options = {}) {
  const storage = 'storage' in options ? options.storage : safeStorage();
  const key = options.key || KEY;
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : LIMIT;
  let items = [];

  function save() {
    if (!storage) return;
    try { storage.setItem(key, JSON.stringify(items)); } catch { /* 配额满/隐私模式：仅内存 */ }
  }

  function load() {
    items = [];
    if (!storage) return;
    let raw;
    try { raw = storage.getItem(key); } catch { return; }
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    if (!Array.isArray(data)) return;
    const seen = new Set();
    for (const v of data) {
      const s = normalize(v);
      if (!s) continue;
      const k = s.toLowerCase();
      if (seen.has(k)) continue;   // 大小写不同的重复项只留第一条
      seen.add(k);
      items.push(s);
      if (items.length >= limit) break;
    }
  }

  const api = {
    list() { return [...items]; },
    // 最近搜的排最前；重复项上移而不是新增一条
    add(q) {
      const s = normalize(q);
      if (!s) return false;
      const k = s.toLowerCase();
      items = [s, ...items.filter((x) => x.toLowerCase() !== k)].slice(0, limit);
      save();
      return true;
    },
    remove(q) {
      const k = String(q ?? '').toLowerCase();
      const next = items.filter((x) => x.toLowerCase() !== k);
      if (next.length === items.length) return false;
      items = next;
      save();
      return true;
    },
    clear() { items = []; save(); },
    reload() {
      const before = items.join('\n');
      load();
      return items.join('\n') !== before;
    },
  };
  load();
  return api;
}

export const _normalize = normalize;
