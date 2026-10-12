// T4.1：start_param 一律视为不可信输入，只接受白名单格式（如 shop_<id>），其余忽略。
const PATTERNS = [
  { re: /^shop_([1-9][0-9]{0,9})$/, to: (m) => ({ name: 'shop', params: { id: m[1] } }) },
];

export function parseStartParam(raw) {
  if (typeof raw !== 'string' || raw.length > 64) return null;
  for (const p of PATTERNS) {
    const m = p.re.exec(raw);
    if (m) return p.to(m);
  }
  return null;
}
