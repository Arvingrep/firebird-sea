package fburl

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
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

// phpBase64Decode mimics non-strict base64_decode: characters outside the alphabet are
// skipped, padding is optional and a trailing partial group is decoded as far as possible.
func phpBase64Decode(s string) string {
	var clean []byte
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || c == '+' || c == '/' {
			clean = append(clean, c)
		} else if c == '=' {
			break
		}
	}
	if len(clean)%4 == 1 {
		clean = clean[:len(clean)-1]
	}
	out, err := base64.RawStdEncoding.WithPadding(base64.NoPadding).DecodeString(string(clean))
	if err != nil {
		return ""
	}
	return string(out)
}

const renrenCryptKey = "KaCXPpoD1vyD[XUWwxhFhkXJulzS~u"

// renrenKey ports RenrenCrypt::__key (XOR with the md5 hex of the key).
func renrenKey(txt, key string) string {
	sum := md5.Sum([]byte(key))
	k := hex.EncodeToString(sum[:])
	out := make([]byte, len(txt))
	for i := 0; i < len(txt); i++ {
		out[i] = txt[i] ^ k[i%len(k)]
	}
	return string(out)
}

// renrenDecrypt ports RenrenCrypt::php_decrypt (which base64-decodes its input itself).
func renrenDecrypt(txt string) string {
	t := renrenKey(phpBase64Decode(txt), renrenCryptKey)
	var out []byte
	for i := 0; i < len(t); i++ {
		m := t[i]
		i++
		if i < len(t) {
			out = append(out, t[i]^m)
		}
	}
	return string(out)
}
