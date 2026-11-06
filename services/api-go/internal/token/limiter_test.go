// 逐条翻译自 services/api/test/tma-token.test.js 的第 7 条：限流固定窗口。
package token

import (
	"testing"
	"time"
)

func TestTMALimiter(t *testing.T) {
	t.Run("限频：窗口内超过上限返回 false，窗口过后恢复", func(t *testing.T) {
		clock := &ttClock{sec: 0}
		allow := NewLimiter(2, 10*time.Second, clock.now)

		if !allow("a") {
			t.Fatal("第 1 次应放行")
		}
		if !allow("a") {
			t.Fatal("第 2 次应放行")
		}
		if allow("a") {
			t.Fatal("窗口内第 3 次应被拒绝")
		}
		if !allow("b") {
			t.Fatal("不同 key 应独立计数")
		}
		clock.sec = 11
		if !allow("a") {
			t.Fatal("窗口过后应恢复放行")
		}
	})
}
