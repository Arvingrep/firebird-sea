// Package compare 是 PHP / Go 对比工具（测试 L2）的实现，入口见 cmd/compare。
//
// 同一条用例同时请求 PHP（/include/ajax.php）与 Go（<前缀>/include/ajax.php），
// 逐字段比对返回的 JSON。忽略规则只能来自用例文件，代码里不写死任何字段。
package compare

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
)

// CaseFile 对应 testdata/compare/<service>.<action>.json，格式见同目录 schema.json。
type CaseFile struct {
	Schema  string `json:"$schema"`
	Service string `json:"service"`
	Action  string `json:"action"`
	Cases   []Case `json:"cases"`
}

// Case 是一条对比用例。
type Case struct {
	Name          string            `json:"name"`
	Method        string            `json:"method"`
	Params        map[string]string `json:"params"`
	RequiresLogin bool              `json:"requiresLogin"`
	IgnoreFields  []string          `json:"ignoreFields"`
}

// ParseCaseFile 解析并按 schema.json 的约束校验用例文件。
// 未引入 JSON Schema 库（不动 go.mod/go.sum），约束在这里手写，
// 并由 TestSchemaFileMatchesParser 保证仓库里的用例文件都能通过。
func ParseCaseFile(raw []byte) (*CaseFile, error) {
	dec := json.NewDecoder(bytes.NewReader(raw))
	dec.DisallowUnknownFields() // schema: additionalProperties=false
	var f CaseFile
	if err := dec.Decode(&f); err != nil {
		return nil, fmt.Errorf("用例文件不是合法的用例 JSON: %w", err)
	}
	if dec.More() {
		return nil, errors.New("用例文件末尾有多余内容")
	}
	if f.Service == "" || f.Action == "" {
		return nil, errors.New("service 与 action 必填且不能为空")
	}
	if len(f.Cases) == 0 {
		return nil, errors.New("cases 至少一条")
	}
	for i, c := range f.Cases {
		if c.Name == "" {
			return nil, fmt.Errorf("cases[%d].name 必填", i)
		}
		if c.Method != "GET" && c.Method != "POST" {
			return nil, fmt.Errorf("cases[%d].method 只能是 GET 或 POST，实际 %q", i, c.Method)
		}
		for _, p := range c.IgnoreFields {
			if p == "" {
				return nil, fmt.Errorf("cases[%d].ignoreFields 不能含空串", i)
			}
		}
	}
	return &f, nil
}
