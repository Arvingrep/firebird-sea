<?php
/**
 * 火鸟 · RenrenCrypt 加密类（原样提取）
 *
 * 来源：webroot/include/class/charset.class.php:559-605（HUONIAO CMS 自带）
 * 用途：bridge.php 需要在不引入 common.inc.php 的前提下，构造与火鸟原生登录
 *       完全一致的 Cookie 值 —— base64(RenrenCrypt::php_encrypt("<会员id>&<password列值>"))。
 *
 * 【纪律】本文件是 charset.class.php 中 RenrenCrypt 的逐字拷贝，算法、密钥、
 *         循环结构一字不改。任何"优化"（例如替换 rand / 改用 openssl）都会导致
 *         与火鸟侧 php_decrypt 不兼容，登录态直接失效。唯一新增的是 class_exists
 *         守卫，防止同一请求内既引了 charset.class.php 又引本文件时重复声明。
 */

if (!class_exists('RenrenCrypt')) {
	class RenrenCrypt {
		private $crypt_key = "KaCXPpoD1vyD[XUWwxhFhkXJulzS~u";

		//构造函数
		public function __construct() {}

		//加密
		public function php_encrypt($txt) {
		   if(!$txt) return $txt;
		   $txt = (string)$txt;
		   srand((double)microtime() * 1000000);
		   $encrypt_key = md5(rand(0,32000));
		   $ctr = 0;
		   $tmp = '';
		   for($i = 0;$i<strlen($txt);$i++) {
			$ctr = $ctr == strlen($encrypt_key) ? 0 : $ctr;
			$tmp .= $encrypt_key[$ctr].($txt[$i]^$encrypt_key[$ctr++]);
		   }
		   return base64_encode(self::__key($tmp,$this -> crypt_key));
		}

		//解密
		public function php_decrypt($txt) {
		   $txt = self::__key(base64_decode($txt),$this -> crypt_key);
		   $tmp = '';
		   for($i = 0;$i < strlen($txt); $i++) {
			$md5 = $txt[$i];
			$tmp .= $txt[++$i] ^ $md5;
		   }
		   return $tmp;
		}

		private function __key($txt,$encrypt_key) {
		   $encrypt_key = md5($encrypt_key);
		   $ctr = 0;
		   $tmp = '';
		   for($i = 0; $i < strlen($txt); $i++) {
			$ctr = $ctr == strlen($encrypt_key) ? 0 : $ctr;
			$tmp .= $txt[$i] ^ $encrypt_key[$ctr++];
		   }
		   return $tmp;
		}

		public function __destruct() {
		   $this -> crypt_key = null;
		}
	}
}
