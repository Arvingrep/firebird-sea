package article

import (
	"strconv"
	"strings"
)

// sdUnserializeData 解析 PHP serialize() 串并取顶层数组的 ['data'] 子数组
// （selfmediaDetail 的 editlog 草稿）。解析失败、不是数组、data 不是数组都返回 ok=false，
// 对应 PHP 里 array_merge 收到非数组只告警、等于不合并。
func sdUnserializeData(raw string) (map[string]any, bool) {
	p := &phpUnser{s: raw}
	v, ok := p.value()
	if !ok {
		return nil, false
	}
	top, ok := v.(map[string]any)
	if !ok {
		return nil, false
	}
	data, ok := top["data"].(map[string]any)
	return data, ok
}

type phpUnser struct {
	s string
	i int
}

func (p *phpUnser) until(c byte) (string, bool) {
	j := strings.IndexByte(p.s[p.i:], c)
	if j < 0 {
		return "", false
	}
	out := p.s[p.i : p.i+j]
	p.i += j + 1
	return out, true
}

func (p *phpUnser) expect(lit string) bool {
	if strings.HasPrefix(p.s[p.i:], lit) {
		p.i += len(lit)
		return true
	}
	return false
}

// value 支持 N、b、i、d、s、a（含嵌套）；对象等其它类型视为失败。
func (p *phpUnser) value() (any, bool) {
	if p.i+1 >= len(p.s) {
		return nil, false
	}
	t := p.s[p.i]
	switch t {
	case 'N':
		return nil, p.expect("N;")
	case 'b', 'i', 'd':
		if !p.expect(string(t) + ":") {
			return nil, false
		}
		tok, ok := p.until(';')
		if !ok {
			return nil, false
		}
		switch t {
		case 'b':
			return tok == "1", tok == "0" || tok == "1"
		case 'i':
			n, err := strconv.ParseInt(tok, 10, 64)
			return n, err == nil
		default:
			f, err := strconv.ParseFloat(tok, 64)
			return f, err == nil
		}
	case 's':
		if !p.expect("s:") {
			return nil, false
		}
		ln, ok := p.until(':')
		n, err := strconv.Atoi(ln)
		// 长度按字节计，形如 s:3:"abc";
		if !ok || err != nil || n < 0 || !p.expect(`"`) || p.i+n > len(p.s) {
			return nil, false
		}
		str := p.s[p.i : p.i+n]
		p.i += n
		if !p.expect(`";`) {
			return nil, false
		}
		return str, true
	case 'a':
		if !p.expect("a:") {
			return nil, false
		}
		cnt, ok := p.until(':')
		n, err := strconv.Atoi(cnt)
		if !ok || err != nil || n < 0 || !p.expect("{") {
			return nil, false
		}
		out := make(map[string]any, n)
		for k := 0; k < n; k++ {
			key, ok := p.value()
			if !ok {
				return nil, false
			}
			var ks string
			switch kv := key.(type) {
			case string:
				ks = kv
			case int64:
				ks = strconv.FormatInt(kv, 10)
			default:
				return nil, false
			}
			val, ok := p.value()
			if !ok {
				return nil, false
			}
			out[ks] = val
		}
		return out, p.expect("}")
	}
	return nil, false
}
