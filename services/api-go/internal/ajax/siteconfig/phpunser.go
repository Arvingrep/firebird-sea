package siteconfig

import (
	"strconv"
	"strings"
)

// phpUnser 是 PHP unserialize() 的最小实现（N、b、i、d、s、a），用于解析 site_city.config。
// 与 article 包内同名实现等价（那边未导出，且只服务于 selfmediaDetail）。
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
