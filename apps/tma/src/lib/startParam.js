// T4.1：start_param 一律视为不可信输入，只接受白名单格式（如 shop_<id>），其余忽略。
const PATTERNS = [
  { re: /^shop_([1-9][0-9]{0,9})$/, to: (m) => ({ name: 'shop', params: { id: m[1] } }) },
  // 地址分享：token 与后端 TOKEN_RE 同形（32 位小写 hex）。落到地址页并由页面确认后保存。
  { re: /^addr_([0-9a-f]{32})$/, to: (m) => ({ name: 'addresses', query: { share: m[1] } }) },
];

export function parseStartParam(raw) {
  if (typeof raw !== 'string' || raw.length > 64) return null;
  for (const p of PATTERNS) {
    const m = p.re.exec(raw);
    if (m) return p.to(m);
  }
  return null;
}
