package fburl

import (
	"net/url"
	"regexp"
	"strings"
)

// phpEmpty: "" and "0" are empty (strings only, which is all that reaches us).
func phpEmpty(s string) bool { return s == "" || s == "0" }

var numericRe = regexp.MustCompile(`^[ \t\n\r\v\f]*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[ \t\n\r\v\f]*$`)

func isNumeric(s string) bool { return numericRe.MatchString(s) }

var chineseRe = regexp.MustCompile(`[\x{4e00}-\x{9fa5}]`)

// phpURLDecode mimics urldecode: '+' is a space, invalid %xx is kept verbatim.
func phpURLDecode(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		switch c := s[i]; {
		case c == '+':
			b.WriteByte(' ')
		case c == '%' && i+2 < len(s) && isHex(s[i+1]) && isHex(s[i+2]):
			b.WriteByte(unhex(s[i+1])<<4 | unhex(s[i+2]))
			i += 2
		default:
			b.WriteByte(c)
		}
	}
	return b.String()
}

func isHex(c byte) bool {
	return c >= '0' && c <= '9' || c >= 'a' && c <= 'f' || c >= 'A' && c <= 'F'
}

func unhex(c byte) byte {
	switch {
	case c >= '0' && c <= '9':
		return c - '0'
	case c >= 'a' && c <= 'f':
		return c - 'a' + 10
	}
	return c - 'A' + 10
}

// phpURLEncode mimics urlencode (RFC1738: '~' is escaped, space is '+').
func phpURLEncode(s string) string {
	return strings.ReplaceAll(url.QueryEscape(s), "~", "%7E")
}

var stripTagsRe = regexp.MustCompile(`<[^>]*>?`)
