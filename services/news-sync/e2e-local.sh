#!/usr/bin/env bash
# 本地真实环境替身一轮验收:n8n-news-mock(TASK-016 同款数据面)作为采集源/门户/告警端点。
# 用法: MOCK=http://localhost:18080 bash services/news-sync/e2e-local.sh <workdir>
# 产出: <workdir>/round1.json round2.json fail-round.json mock-state.json (无任何密钥)
set -euo pipefail
MOCK="${MOCK:-http://localhost:18080}"
OUT="${1:?usage: e2e-local.sh <workdir>}"
mkdir -p "$OUT"
cd "$(dirname "${BASH_SOURCE[0]}")"

export NEWS_PORTAL_PUBLISH_URL="$MOCK/portal/publish"
export NEWS_PORTAL_TOKEN="local-e2e"
export NEWS_ALERT_API_BASE="$MOCK"
export NEWS_ALERT_BOT_TOKEN="mock"
export NEWS_ALERT_CHAT_ID="1"
export NEWS_SYNC_SEEN_FILE="$OUT/news-seen.json"
rm -f "$NEWS_SYNC_SEEN_FILE"

echo "== 采集(RSS 适配层) =="
curl -fsS "$MOCK/rss.xml" | node src/feed.js | tee "$OUT/items.json"

echo "== 第 1 轮:应发布 published>=1 =="
node src/cli.js < "$OUT/items.json" | tee "$OUT/round1.json"

echo "== 第 2 轮:同输入应 published=0、duplicates>=1 =="
node src/cli.js < "$OUT/items.json" | tee "$OUT/round2.json"

echo "== 失败轮:门户预置连续失败,新条目应 failed=1 且触发告警 =="
curl -fsS -X POST "$MOCK/portal/fail-next" -H 'Content-Type: application/json' -d '{"count":5}' >/dev/null
echo '[{"title":"failure drill","url":"https://example.test/news/failure-drill","summary":"演练"}]' > "$OUT/fail-item.json"
node src/cli.js < "$OUT/fail-item.json" > "$OUT/fail-round.json" && { echo "期望非零退出"; exit 1; } || true
cat "$OUT/fail-round.json"

curl -fsS "$MOCK/state" > "$OUT/mock-state.json"
node -e '
const fs=require("fs"),d=p=>JSON.parse(fs.readFileSync(p));
const r1=d(process.argv[1]),r2=d(process.argv[2]),fr=d(process.argv[3]),st=d(process.argv[4]);
const ok=(c,m)=>{if(!c){console.error("FAIL: "+m);process.exit(1)}console.log("OK: "+m)};
ok(r1.published>=1&&r1.failed===0,"第1轮发布 "+r1.published+" 条且无失败");
ok(r2.published===0&&r2.duplicates>=1,"第2轮 0 发布、"+r2.duplicates+" 条去重");
ok(fr.failed===1,"失败轮 failed=1(已重试后计失败)");
ok(st.portal.length===r1.published,"门户实收 "+st.portal.length+" 条 = 第1轮发布数(无重复落库)");
ok(st.tg.length>=1,"运营者告警已送达 mock Telegram("+st.tg.length+" 条)");
' "$OUT/round1.json" "$OUT/round2.json" "$OUT/fail-round.json" "$OUT/mock-state.json"
echo "== E2E PASS,证据目录: $OUT =="
