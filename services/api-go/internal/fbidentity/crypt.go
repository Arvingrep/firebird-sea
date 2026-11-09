package fbidentity

import (
	"crypto/md5"
	"encoding/hex"
)

// renrenKey 把 RenrenCrypt 的 __key 变换需要的 md5(密钥) 十六进制串算好。
// 密钥本身只从配置/Secret 传入，不写在源码里。
func renrenKeyStream(key []byte) []byte {
	sum := md5.Sum(key)
	return []byte(hex.EncodeToString(sum[:]))
}

// renrenXORKey 对应 RenrenCrypt::__key：逐字节与 md5(密钥) 的十六进制串循环异或。
func renrenXORKey(txt, key []byte) []byte {
	ks := renrenKeyStream(key)
	out := make([]byte, len(txt))
	ctr := 0
	for i := range txt {
		if ctr == len(ks) {
			ctr = 0
		}
		out[i] = txt[i] ^ ks[ctr]
		ctr++
	}
	return out
}

// phpBase64Decode 对应 PHP 非 strict 的 base64_decode：忽略字母表之外的字符、不要求补齐 '='。
// 返回 ok=false 等价于 PHP 返回 false（长度非法）。
func phpBase64Decode(s string) ([]byte, bool) {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	var idx [256]int8
	for i := range idx {
		idx[i] = -1
	}
	for i := 0; i < len(alphabet); i++ {
		idx[alphabet[i]] = int8(i)
	}
	var out []byte
	var acc uint32
	bits := 0
	n := 0
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c == '=' {
			continue
		}
		v := idx[c]
		if v < 0 {
			continue
		}
		n++
		acc = acc<<6 | uint32(v)
		bits += 6
		if bits >= 8 {
			bits -= 8
			out = append(out, byte(acc>>uint(bits)))
			acc &= (1 << uint(bits)) - 1
		}
	}
	if n%4 == 1 { // 单独剩一个字符，PHP 视为非法
		return nil, false
	}
	return out, true
}

// renrenDecrypt 对应 RenrenCrypt::php_decrypt(base64_decode($txt))：
// 调用方传入的是「cookie 解 base64 之后」的文本，函数内部再解一次（php_encrypt 自带一层 base64）。
func renrenDecrypt(b64 string, key []byte) string {
	raw, ok := phpBase64Decode(b64)
	if !ok {
		raw = nil
	}
	txt := renrenXORKey(raw, key)
	var out []byte
	for i := 0; i < len(txt); i++ {
		md := txt[i]
		i++
		if i >= len(txt) {
			// PHP 越界读取得到空串，XOR 空串结果为空；这里等价地停止。
			break
		}
		out = append(out, txt[i]^md)
	}
	return string(out)
}

// renrenEncrypt 仅供测试构造 cookie（nonce 由调用方给定，便于可重复）。
func renrenEncrypt(txt string, nonce string, key []byte) string {
	var tmp []byte
	ctr := 0
	for i := 0; i < len(txt); i++ {
		if ctr == len(nonce) {
			ctr = 0
		}
		tmp = append(tmp, nonce[ctr], txt[i]^nonce[ctr])
		ctr++
	}
	return encodeStd(renrenXORKey(tmp, key))
}
