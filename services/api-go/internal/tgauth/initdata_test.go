// 逐条翻译自 services/api/test/telegram-auth.test.js（8 条，全部 BEHAVIOR）。
//
// 与原用例的对应关系：一个 t.Run = 一条 Node test(...)，子测试标题即原用例标题。
// 时钟一律注入（Options.Now），避免「现在」漂移导致偶发失败。
package tgauth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"
)

// ttBotToken 对应 Node 的 BOT_TOKEN。
const ttBotToken = "test-bot-token-not-a-secret"

// ttClock 是固定时钟：Node 用 Date.now()，这里固定成 2023-11-14T22:13:20Z。
var ttClock = time.Unix(1700000000, 0)

func ttNow() time.Time { return ttClock }

func ttNowSec() int64 { return ttClock.Unix() }

// ttSeconds 对应 Node 的 Math.floor(Date.now()/1000) - offsetSeconds。
func ttSeconds(offsetSeconds int64) string {
	return strconv.FormatInt(ttNowSec()+offsetSeconds, 10)
}

// ttSign 复刻 Node 测试文件里的 sign(fields, token)：
// 键排序后按 k=v 用 \n 连接算 HMAC，再返回 application/x-www-form-urlencoded 串。
func ttSign(t *testing.T, fields map[string]string) string {
	t.Helper()
	return ttSignWithToken(t, fields, ttBotToken)
}

func ttSignWithToken(t *testing.T, fields map[string]string, token string) string {
	t.Helper()
	keys := make([]string, 0, len(fields))
	for k := range fields {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	lines := make([]string, 0, len(keys))
	for _, k := range keys {
		lines = append(lines, k+"="+fields[k])
	}
	inner := hmac.New(sha256.New, []byte("WebAppData"))
	inner.Write([]byte(token))
	outer := hmac.New(sha256.New, inner.Sum(nil))
	outer.Write([]byte(strings.Join(lines, "\n")))

	values := url.Values{}
	for _, k := range keys {
		values.Set(k, fields[k])
	}
	values.Set("hash", hex.EncodeToString(outer.Sum(nil)))
	return values.Encode()
}

func ttValidate(initData string) Result {
	return Validate(initData, ttBotToken, Options{Now: ttNow})
}

func TestTelegramInitData(t *testing.T) {
	t.Run("合法签名通过并解析 user", func(t *testing.T) {
		initData := ttSign(t, map[string]string{
			"auth_date": ttSeconds(0),
			"user":      `{"id":42,"first_name":"A"}`,
		})
		result := ttValidate(initData)
		if !result.Valid {
			t.Fatalf("合法签名应通过，实际 error=%q", result.Error)
		}
		if result.User == nil || result.User.ID != 42 {
			t.Fatalf("user.id 应为 42，实际 %+v", result.User)
		}
	})

	t.Run("缺失 initData / hash 被拒绝", func(t *testing.T) {
		if result := ttValidate(""); result.Valid {
			t.Fatal("空 initData 必须被拒绝")
		}
		if result := ttValidate("auth_date=1"); result.Valid {
			t.Fatal("缺 hash 的 initData 必须被拒绝")
		}
	})

	t.Run("篡改字段或错误 Bot Token 被拒绝", func(t *testing.T) {
		good := ttSign(t, map[string]string{
			"auth_date": ttSeconds(0),
			"query_id":  "q1",
			"user":      `{"id":1}`,
		})
		tampered := strings.Replace(good, "q1", "q2", 1)
		if result := ttValidate(tampered); result.Valid {
			t.Fatal("篡改 query_id 后必须被拒绝")
		}
		if result := Validate(good, "other-token", Options{Now: ttNow}); result.Valid {
			t.Fatal("错误 Bot Token 必须被拒绝")
		}
	})

	t.Run("超过 1 小时的 initData 视为过期，1 小时内有效", func(t *testing.T) {
		user := `{"id":7}`
		old := ttSign(t, map[string]string{"auth_date": ttSeconds(-3601), "user": user})
		result := ttValidate(old)
		if result.Valid {
			t.Fatal("超过 1 小时必须视为过期")
		}
		if !strings.Contains(result.Error, "expired") {
			t.Fatalf("过期文案应包含 expired，实际 %q", result.Error)
		}
		fresh := ttSign(t, map[string]string{"auth_date": ttSeconds(-3000), "user": user})
		if result := ttValidate(fresh); !result.Valid {
			t.Fatalf("3000 秒前的 initData 应有效，实际 error=%q", result.Error)
		}
	})

	t.Run("缺失 auth_date 或 user.id 被拒绝", func(t *testing.T) {
		if result := ttValidate(ttSign(t, map[string]string{"user": `{"id":7}`})); result.Valid {
			t.Fatal("缺 auth_date 必须被拒绝")
		}
		if result := ttValidate(ttSign(t, map[string]string{"auth_date": ttSeconds(0)})); result.Valid {
			t.Fatal("缺 user 必须被拒绝")
		}
		badUser := ttSign(t, map[string]string{"auth_date": ttSeconds(0), "user": `{"id":"abc"}`})
		if result := ttValidate(badUser); result.Valid {
			t.Fatal("user.id 非数字必须被拒绝")
		}
	})

	t.Run("未来的 auth_date 被拒绝", func(t *testing.T) {
		future := ttSign(t, map[string]string{"auth_date": ttSeconds(3600), "user": `{"id":7}`})
		if result := ttValidate(future); result.Valid {
			t.Fatalf("未来 auth_date 必须被拒绝，实际 result=%+v", result)
		}
	})

	t.Run("signature 字段参与 HMAC 数据串：带 signature 的合法 initData 通过，篡改 signature 失败", func(t *testing.T) {
		good := ttSign(t, map[string]string{
			"auth_date": ttSeconds(0),
			"user":      `{"id":7}`,
			"signature": "AAAA-opaque-signature-value",
		})
		if result := ttValidate(good); !result.Valid {
			t.Fatalf("带 signature 的合法 initData 应通过，实际 error=%q", result.Error)
		}
		tampered := strings.Replace(good, "AAAA-opaque", "BBBB-opaque", 1)
		if result := ttValidate(tampered); result.Valid {
			t.Fatal("篡改 signature 必须被拒绝")
		}
	})

	t.Run("hash 格式非法被拒绝（非 64 位十六进制）", func(t *testing.T) {
		query := url.Values{}
		query.Set("auth_date", ttSeconds(0))
		query.Set("user", `{"id":7}`)
		query.Set("hash", "zz")
		if result := ttValidate(query.Encode()); result.Valid {
			t.Fatal("非 64 位十六进制 hash 必须被拒绝")
		}
	})
}
