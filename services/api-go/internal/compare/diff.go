package compare

import (
	"encoding/json"
	"fmt"
	"reflect"
	"regexp"
	"sort"
)

// Difference 是一处差异：字段路径与两边的值（JSON 文本；缺失记为 <缺失>）。
type Difference struct {
	Path string
	PHP  string
	Go   string
}

const missing = "<缺失>"

var indexRe = regexp.MustCompile(`\[\d+\]`)

// Diff 逐字段比较 php 与 gov（均为 json.Unmarshal 到 any 的结果）。
// ignore 里的路径（如 info.ts、list[].id，[] 匹配任意下标）及其子树不参与比较。
func Diff(php, gov any, ignore []string) []Difference {
	ign := make(map[string]bool, len(ignore))
	for _, p := range ignore {
		ign[p] = true
	}
	var out []Difference
	walk("", php, gov, ign, &out)
	return out
}

func walk(path string, a, b any, ign map[string]bool, out *[]Difference) {
	if path != "" && ign[indexRe.ReplaceAllString(path, "[]")] {
		return
	}
	switch av := a.(type) {
	case map[string]any:
		bv, ok := b.(map[string]any)
		if !ok {
			*out = append(*out, Difference{path, show(a), show(b)})
			return
		}
		keys := map[string]bool{}
		for k := range av {
			keys[k] = true
		}
		for k := range bv {
			keys[k] = true
		}
		sorted := make([]string, 0, len(keys))
		for k := range keys {
			sorted = append(sorted, k)
		}
		sort.Strings(sorted)
		for _, k := range sorted {
			child := k
			if path != "" {
				child = path + "." + k
			}
			x, xok := av[k]
			y, yok := bv[k]
			walkChild(child, x, xok, y, yok, ign, out)
		}
	case []any:
		bv, ok := b.([]any)
		if !ok {
			*out = append(*out, Difference{path, show(a), show(b)})
			return
		}
		n := len(av)
		if len(bv) > n {
			n = len(bv)
		}
		for i := 0; i < n; i++ {
			x, xok := at(av, i)
			y, yok := at(bv, i)
			walkChild(fmt.Sprintf("%s[%d]", path, i), x, xok, y, yok, ign, out)
		}
	default:
		if !reflect.DeepEqual(a, b) {
			*out = append(*out, Difference{path, show(a), show(b)})
		}
	}
}

func at(s []any, i int) (any, bool) {
	if i < len(s) {
		return s[i], true
	}
	return nil, false
}

func walkChild(path string, x any, xok bool, y any, yok bool, ign map[string]bool, out *[]Difference) {
	if ign[indexRe.ReplaceAllString(path, "[]")] {
		return
	}
	switch {
	case xok && yok:
		walk(path, x, y, ign, out)
	case xok:
		*out = append(*out, Difference{path, show(x), missing})
	case yok:
		*out = append(*out, Difference{path, missing, show(y)})
	}
}

func show(v any) string {
	b, err := json.Marshal(v)
	if err != nil {
		return fmt.Sprint(v)
	}
	return string(b)
}
