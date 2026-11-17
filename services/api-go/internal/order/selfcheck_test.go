// 契约护栏（不是临时自检）：用例锁定与 Node 版逐字对齐的对外行为。
// DB 相关的读取路径需要真实 MySQL，这里只覆盖纯函数与校验分支；这些分支是改实现前
// 必须先看的口径，合并前不要按临时文件删。
package order

import (
	"context"
	"errors"
	"strings"
	"testing"
)

func TestSelfCheckCentavos(t *testing.T) {
	cases := map[string]int64{
		"125.00":    12500,
		"0.01":      1,
		"999999.99": 99999999,
		"1.10":      110,
	}
	for input, want := range cases {
		got, err := CentavosFromDecimal(input)
		if err != nil || got != want {
			t.Fatalf("%s: want %d, got %d (%v)", input, want, got, err)
		}
	}
	for _, bad := range []string{"125", "125.0", "125.000", "-1.00", "abc", ""} {
		if _, err := CentavosFromDecimal(bad); err == nil {
			t.Fatalf("%q should be rejected", bad)
		}
	}
}

func TestSelfCheckReadPayOrderValidatesInputsWithoutDB(t *testing.T) {
	ctx := context.Background()
	// 参数校验必须在触库前完成：ordernum 非法时连连接都不该用到。
	for _, bad := range []string{"ORD'1", "ORD 1", ";DROP", "", strings.Repeat("x", 65)} {
		_, _, err := ReadPayOrder(ctx, nil, bad, "huoniao_")
		var oe *OrderError
		if !errors.As(err, &oe) || oe.Code != CodeBadRequest {
			t.Fatalf("%q: want BAD_REQUEST, got %v", bad, err)
		}
	}
	_, _, err := ReadPayOrder(ctx, nil, "ORD1", "bad;prefix")
	var oe *OrderError
	if !errors.As(err, &oe) || oe.Code != CodeInvalid {
		t.Fatalf("bad prefix: want ORDER_INVALID, got %v", err)
	}
}

func TestSelfCheckAssertOwnershipValidatesTgUser(t *testing.T) {
	for _, bad := range []string{"x;1", "", "-1", strings.Repeat("1", 34)} {
		err := AssertOwnership(context.Background(), nil, bad, 1)
		var oe *OrderError
		if !errors.As(err, &oe) || oe.Code != CodeUnauthorized {
			t.Fatalf("%q: want UNAUTHORIZED, got %v", bad, err)
		}
	}
}
