// 契约护栏（不是临时自检）：用例锁定 `JSON.stringify` 的数字格式（指数区间、去前导零、
// -0 与 NaN/±Inf）。改实现前先看这里；合并前不要按临时文件删。
package jsonfloat

import (
	"encoding/json"
	"math"
	"testing"
)

// TestSelfCheckFormatMatchesJSONStringify 的期望值全部来自真实 Node：
//
//	node -e 'for (const v of [...] ) console.log(JSON.stringify(v))'
//
// 不是手写推测。
func TestSelfCheckFormatMatchesJSONStringify(t *testing.T) {
	cases := []struct {
		value float64
		want  string
	}{
		{0, "0"},
		{math.Copysign(0, -1), "0"}, // JSON.stringify(-0) 是 "0"
		{1, "1"},
		{-1, "-1"},
		{0.1, "0.1"},
		{10.01, "10.01"},
		{62.88, "62.88"},
		{0.000001, "0.000001"}, // 1e-6 仍是十进制
		{1e-7, "1e-7"},         // Go 会写成 1e-07，指数前导零必须去掉
		{1.5e-7, "1.5e-7"},
		{1e21, "1e+21"},
		{1.5e21, "1.5e+21"},
		{123456789012345678901, "123456789012345680000"},
		{5e-324, "5e-324"},
		{1.7976931348623157e308, "1.7976931348623157e+308"},
		{0.000001234, "0.000001234"},
		{100, "100"},
		{1.0 / 3.0, "0.3333333333333333"},
	}
	for _, item := range cases {
		if got := Format(item.value); got != item.want {
			t.Fatalf("Format(%v) = %q, want %q", item.value, got, item.want)
		}
	}
}

// TestSelfCheckNonFiniteBecomesNull 钉住「NaN / ±Inf → null」。
// Go 原生行为是整个响应序列化失败，调用方看到 500；Node 是 200 + null。
func TestSelfCheckNonFiniteBecomesNull(t *testing.T) {
	for name, value := range map[string]float64{
		"NaN":      math.NaN(),
		"+Inf":     math.Inf(1),
		"-Inf":     math.Inf(-1),
		"negative": -math.NaN(),
	} {
		payload, err := json.Marshal(struct {
			Value Float `json:"value"`
		}{Value: Float(value)})
		if err != nil {
			t.Fatalf("%s 必须能序列化，实际报错：%v", name, err)
		}
		if string(payload) != `{"value":null}` {
			t.Fatalf("%s 应输出 null，实际 %s", name, payload)
		}
	}
}

// TestSelfCheckFiniteStaysNumber 防「为了修 NaN 把正常数字也变成字符串」。
func TestSelfCheckFiniteStaysNumber(t *testing.T) {
	payload, err := json.Marshal(struct {
		Value Float `json:"value"`
	}{Value: Float(10.01)})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if string(payload) != `{"value":10.01}` {
		t.Fatalf("有限数必须原样输出数字，实际 %s", payload)
	}
}
