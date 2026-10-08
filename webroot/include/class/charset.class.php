<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 系统中用到的字符编码转换的插件函数
 *
 * @version        $Id: charset.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$UC2GBTABLE = $CODETABLE = $BIG5_DATA = $GB_DATA = '';
$GbkUniDic = null;

/**
 *  UTF-8 转GB编码
 *
 * @access    public
 * @param     string  $utfstr  需要转换的字符串
 * @return    string
 */
if (!function_exists('utf82gb')){
    function utf82gb($utfstr){
        if(function_exists('iconv')){
            return iconv('utf-8','gbk//ignore',$utfstr);
        }
        global $UC2GBTABLE;
        $okstr = "";
        if(trim($utfstr)==""){
            return $utfstr;
        }
        if(empty($UC2GBTABLE)){
            $filename = HUONIAOINC."/data/gb2312-utf8.dat";
            $fp = fopen($filename,"r");
            while($l = fgets($fp,15)){
                $UC2GBTABLE[hexdec(substr($l, 7, 6))] = hexdec(substr($l, 0, 6));
            }
            fclose($fp);
        }
        $okstr = "";
        $ulen = strlen($utfstr);
        for($i=0;$i<$ulen;$i++){
            $c = $utfstr[$i];
            $cb = decbin(ord($utfstr[$i]));
            if(strlen($cb)==8){
                $csize = strpos(decbin(ord($cb)),"0");
                for($j=0;$j < $csize;$j++){
                    $i++; $c .= $utfstr[$i];
                }
                $c = utf82u($c);
                if(isset($UC2GBTABLE[$c])){
                    $c = dechex($UC2GBTABLE[$c]+0x8080);
                    $okstr .= chr(hexdec($c[0].$c[1])).chr(hexdec($c[2].$c[3]));
                }else{
                    $okstr .= "&#".$c.";";
                }
            }else{
                $okstr .= $c;
            }
        }
        $okstr = trim($okstr);
        return $okstr;
    }
}

/**
 *  GB转UTF-8编码
 *
 * @access    public
 * @param     string  $gbstr  gbk的字符串
 * @return    string
 */
if (!function_exists('gb2utf8')){
    function gb2utf8($gbstr){
        if(function_exists('iconv')){
            return iconv('gbk','utf-8//ignore',$gbstr);
        }
        global $CODETABLE;
        if(trim($gbstr)==""){
            return $gbstr;
        }
        if(empty($CODETABLE)){
            $filename = HUONIAOINC."/data/gb2312-utf8.dat";
            $fp = fopen($filename,"r");
            while ($l = fgets($fp,15)){
                $CODETABLE[hexdec(substr($l, 0, 6))] = substr($l, 7, 6);
            }
            fclose($fp);
        }
        $ret = "";
        $utf8 = "";
        while ($gbstr != ''){
            if (ord(substr($gbstr, 0, 1)) > 0x80){
                $thisW = substr($gbstr, 0, 2);
                $gbstr = substr($gbstr, 2, strlen($gbstr));
                $utf8 = "";
                @$utf8 = u2utf8(hexdec($CODETABLE[hexdec(bin2hex($thisW)) - 0x8080]));
                if($utf8!=""){
                    for ($i = 0;$i < strlen($utf8);$i += 3)
                    $ret .= chr(substr($utf8, $i, 3));
                }
            }else{
                $ret .= substr($gbstr, 0, 1);
                $gbstr = substr($gbstr, 1, strlen($gbstr));
            }
        }
        return $ret;
    }
}

/**
 *  Unicode转utf8
 *
 * @access    public
 * @param     string  $c  Unicode的字符串内容
 * @return    string
 */
if (!function_exists('u2utf8')){
    function u2utf8($c){
        for ($i = 0;$i < count($c);$i++){
            $str = "";
        }
        if ($c < 0x80){
            $str .= $c;
        }
        else if ($c < 0x800){
            $str .= (0xC0 | $c >> 6);
            $str .= (0x80 | $c & 0x3F);
        }else if ($c < 0x10000){
            $str .= (0xE0 | $c >> 12);
            $str .= (0x80 | $c >> 6 & 0x3F);
            $str .= (0x80 | $c & 0x3F);
        }else if ($c < 0x200000){
            $str .= (0xF0 | $c >> 18);
            $str .= (0x80 | $c >> 12 & 0x3F);
            $str .= (0x80 | $c >> 6 & 0x3F);
            $str .= (0x80 | $c & 0x3F);
        }
        return $str;
    }
}

/**
 *  utf8转Unicode
 *
 * @access    public
 * @param     string  $c  UTF-8的字符串信息
 * @return    string
 */
if (!function_exists('utf82u')){
    function utf82u($c){
        switch(strlen($c)){
            case 1:
                return ord($c);
            case 2:
                $n = (ord($c[0]) & 0x3f) << 6;
                $n += ord($c[1]) & 0x3f;
                return $n;
            case 3:
                $n = (ord($c[0]) & 0x1f) << 12;
                $n += (ord($c[1]) & 0x3f) << 6;
                $n += ord($c[2]) & 0x3f;
                return $n;
            case 4:
                $n = (ord($c[0]) & 0x0f) << 18;
                $n += (ord($c[1]) & 0x3f) << 12;
                $n += (ord($c[2]) & 0x3f) << 6;
                $n += ord($c[3]) & 0x3f;
                return $n;
        }
    }
}

/**
 *  Big5码转换成GB码
 *
 * @access    public
 * @param     string   $Text  字符串内容
 * @return    string
 */
if (!function_exists('big52gb')){
    function big52gb($Text){
        if(function_exists('iconv')){
            return iconv('big5','gbk//ignore',$Text);
        }
        global $BIG5_DATA;
        if(empty($BIG5_DATA)){
            $filename = HUONIAOINC."/data/big5-gb.dat";
            $fp = fopen($filename, "rb");
            $BIG5_DATA = fread($fp,filesize($filename));
            fclose($fp);
        }
        $max = strlen($Text)-1;
        for($i=0;$i<$max;$i++){
            $h = ord($Text[$i]);
            if($h>=0x80){
                $l = ord($Text[$i+1]);
                if($h==161 && $l==64){
                    $gbstr = "　";
                }else{
                    $p = ($h-160)*510+($l-1)*2;
                    $gbstr = $BIG5_DATA[$p].$BIG5_DATA[$p+1];
                }
                $Text[$i] = $gbstr[0];
                $Text[$i+1] = $gbstr[1];
                $i++;
            }
        }
        return $Text;
    }
}

/**
 *  GB码转换成Big5码
 *
 * @access    public
 * @param     string  $Text 字符串内容
 * @return    string
 */
if (!function_exists('gb2big5')){
    function gb2big5($Text){
        if(function_exists('iconv')){
            return iconv('gbk','big5//ignore',$Text);
        }
        global $GB_DATA;
        if(empty($GB_DATA)){
            $filename = HUONIAOINC."/data/gb-big5.dat";
            $fp = fopen($filename, "rb");
            $gb = fread($fp,filesize($filename));
            fclose($fp);
        }
        $max = strlen($Text)-1;
        for($i=0;$i<$max;$i++){
            $h = ord($Text[$i]);
            if($h>=0x80){
                $l = ord($Text[$i+1]);
                if($h==161 && $l==64){
                    $big = "　";
                }else{
                    $p = ($h-160)*510+($l-1)*2;
                    $big = $GB_DATA[$p].$GB_DATA[$p+1];
                }
                $Text[$i] = $big[0];
                $Text[$i+1] = $big[1];
                $i++;
            }
        }
        return $Text;
    }
}

/**
 *  unicode url编码转gbk编码函数
 *
 * @access    public
 * @param     string  $str  转换的内容
 * @return    string
 */
if (!function_exists('UnicodeUrl2Gbk')){
    function UnicodeUrl2Gbk($str){
        //载入对照词典
        if(!isset($GLOBALS['GbkUniDic'])){
            $fp = fopen(HUONIAOINC.'/data/gbk-unicode.dat','rb');
            while(!feof($fp)){
                $GLOBALS['GbkUniDic'][bin2hex(fread($fp,2))] = fread($fp,2);
            }
            fclose($fp);
        }

        //处理字符串
        $str = str_replace('$#$','+',$str);
        $glen = strlen($str);
        $okstr = "";
        for($i=0; $i < $glen; $i++){
            if($glen-$i > 4){
                if($str[$i]=='%' && $str[$i+1]=='u'){
                    $uni = strtolower(substr($str,$i+2,4));
                    $i = $i+5;
                    if(isset($GLOBALS['GbkUniDic'][$uni])){
                        $okstr .= $GLOBALS['GbkUniDic'][$uni];
                    }else{
                        $okstr .= "&#".hexdec('0x'.$uni).";";
                    }
                }else{
                    $okstr .= $str[$i];
                }
            }else{
                $okstr .= $str[$i];
            }
        }
        return $okstr;
    }
}

/**
 *  自动转换字符集 支持数组转换
 *
 * @access    public
 * @param     string  $str  转换的内容
 * @return    string
 */
if (!function_exists('AutoCharset')){
    function AutoCharset($fContents, $from='gbk', $to='utf-8'){
        $from   =  strtoupper($from)=='UTF8'? 'utf-8' : $from;
        $to     =  strtoupper($to)=='UTF8'? 'utf-8' : $to;
        if(strtoupper($from) === strtoupper($to) || empty($fContents) || (is_scalar($fContents) && !is_string($fContents))){
            //如果编码相同或者非字符串标量则不转换
            return $fContents;
        }
        if(is_string($fContents)){
            if(function_exists('mb_convert_encoding')){
                return mb_convert_encoding ($fContents, $to, $from);
            }elseif(function_exists('iconv')){
                return iconv($from, $to, $fContents);
            }else{
                return $fContents;
            }
        }elseif(is_array($fContents)){
            foreach ($fContents as $key => $val) {
                $_key =     AutoCharset($key,$from,$to);
                $fContents[$_key] = AutoCharset($val,$from,$to);
                if($key != $_key )
                    unset($fContents[$key]);
            }
            return $fContents;
        }else{
            return $fContents;
        }
    }
}


/**
 *  拆分中文字符串
 *
 * @access    public
 * @param     string  $tempaddtext  要拆分的内容
 * @return    string
 */
if (!function_exists('arr_split_zh')){
    function arr_split_zh($tempaddtext){
        //去除指定字符
        $tempaddtext = str_replace("·", "", $tempaddtext);

        $tempaddtext = iconv("UTF-8", "gb2312//IGNORE", $tempaddtext);
        $cind = 0;
        $arr_cont = array();

        for($i = 0; $i < strlen($tempaddtext); $i++){
            if(strlen(substr($tempaddtext, $cind, 1)) > 0){
                if(ord(substr($tempaddtext, $cind, 1)) < 0xA1 ){ //如果为英文则取1个字节
                    array_push($arr_cont, substr($tempaddtext, $cind, 1));
                    $cind++;
                }else{
                    array_push($arr_cont, substr($tempaddtext, $cind, 2));
                    $cind += 2;
                }
            }
        }
        foreach ($arr_cont as &$row){
            $row = iconv("gb2312", "UTF-8", $row);
        }

        return $arr_cont;
    }
}


/**
 *  获取中文字符拼音首字母
 *
 * @access    public
 * @param     string  $str  转换的内容
 * @return    string
 */
if (!function_exists('getFirstCharter')){
    function getFirstCharter($str){
        if(empty($str)) {return '';}

        //分隔中文中符串
        $str = arr_split_zh($str);
        $str = $str[0];

        $fchar = ord($str[0]);

        //如果是数字
        if($fchar >= 48 && $fchar <= 57) return $str;

        //如果是英文
        if($fchar >= ord('A') && $fchar <= ord('z')) return strtoupper($str[0]);

        $s1 = iconv('UTF-8', 'gb2312', $str);
        $s2 = iconv('gb2312', 'UTF-8', $s1);
        $s = $s2 == $str ? $s1 : $str;
        $asc = ord($s[0]) * 256 + ord($s[1]) - 65536;
        if($asc >= -20319 && $asc <= -20284) return 'A';
        if($asc >= -20283 && $asc <= -19776) return 'B';
        if($asc >= -19775 && $asc <= -19219) return 'C';
        if($asc >= -19218 && $asc <= -18711) return 'D';
        if($asc >= -18710 && $asc <= -18527) return 'E';
        if($asc >= -18526 && $asc <= -18240) return 'F';
        if($asc >= -18239 && $asc <= -17923) return 'G';
        if($asc >= -17922 && $asc <= -17418) return 'H';
        if($asc >= -17417 && $asc <= -16475) return 'J';
        if($asc >= -16474 && $asc <= -16213) return 'K';
        if($asc >= -16212 && $asc <= -15641) return 'L';
        if($asc >= -15640 && $asc <= -15166) return 'M';
        if($asc >= -15165 && $asc <= -14923) return 'N';
        if($asc >= -14922 && $asc <= -14915) return 'O';
        if($asc >= -14914 && $asc <= -14631) return 'P';
        if($asc >= -14630 && $asc <= -14150) return 'Q';
        if($asc >= -14149 && $asc <= -14091) return 'R';
        if($asc >= -14090 && $asc <= -13319) return 'S';
        if($asc >= -13318 && $asc <= -12839) return 'T';
        if($asc >= -12838 && $asc <= -12557) return 'W';
        if($asc >= -12556 && $asc <= -11848) return 'X';
        if($asc >= -11847 && $asc <= -11056) return 'Y';
        if($asc >= -11055 && $asc <= -10247) return 'Z';

        //例外情况
        $pinyin = GetPinyin($str);
        if($pinyin){
            return strtoupper(substr($pinyin, 0, 1));
        }else{
            return null;
        }
    }
}


/**
 *  RSA密文解密
 *
 * @access    public
 * @param     string  $str  需要解密的内容
 * @return    string
 */
if (!function_exists('rsaDecrypt')){
    function rsaDecrypt($str){
        if(empty($str)) return '';

        global $cfg_encryptPrivkey;
        if(empty($cfg_encryptPrivkey)) return $str;

        $str = str_replace(' ', '+', $str);

        $returnData = array();

        //判断是否为多个组合，因为长内容前端加密会报错，需要分隔加密
        if(strstr($str, '||rsa||')){

            $strArr = explode('||rsa||', $str);
            foreach($strArr as $key => $val){
                $encrypt_data = base64_decode($val);
                openssl_private_decrypt($encrypt_data, $decrypt_data, $cfg_encryptPrivkey);
                array_push($returnData, urldecode($decrypt_data));
            }

        }else{
            $encrypt_data = base64_decode($str);
            openssl_private_decrypt($encrypt_data, $decrypt_data, $cfg_encryptPrivkey);
            array_push($returnData, urldecode($decrypt_data));
        }

        $dataArr = array();

        //对内容安全过滤
        if($returnData){
            foreach($returnData as $key => $val){
                array_push($dataArr, ((is_string($val) && strstr($val, '[{')) || is_array($val)) ? $val : addslashes(htmlspecialchars(RemoveXSS($val))));
            }
        }

        return join('', $dataArr);
    }
}

/**
 * 验证字符串是否为有效的十六进制格式（符合 hex2bin 要求）
 * @param string $input 待验证的字符串
 * @return bool 是否通过验证
 */
function validateHexString(string $input): bool {
    // 规则 1：检查是否包含前缀 0x 或 0X
    if (preg_match('/^0x/i', $input)) {
        return false;
    }

    // 规则 2：检查是否仅包含 0-9, a-f, A-F
    if (!preg_match('/^[0-9a-fA-F]*$/', $input)) {
        return false;
    }

    // 规则 3：检查是否为偶数长度
    return strlen($input) % 2 === 0;
}


/**
 *  AES密文解密
 *
 * @access    public
 * @param     string  $str  需要解密的内容
 * @return    string
 */
if (!function_exists('aesDecrypt')){
    function aesDecrypt($str){
        global $dsql;

        //如果密钥没有设置，直接返回原内容
        $key = trim($GLOBALS['cfg_aes_key']);
        if(!$key || !$str || !validateHexString($str)) return $str;

        //将16进制字符串转为二进制
        $encryptedData = hex2bin($str);
        $iv = '';

        //一般默认为AES-128-EBC，需要查询数据库配置，确认最终使用的什么值
        //查看使用的配置，mysql命令中执行：SHOW VARIABLES LIKE 'block_encryption_mode';
        //如果修改过数据库配置，这里也要同步修改，建议使用AES-256-CBC
        //修改方法，修改mysql配置文件，如my.cnf
        //[mysqld]下面增加：block_encryption_mode = AES-256-CBC
        $method = 'AES-128-EBC';
        $sql = $dsql->SetQuery("SHOW VARIABLES LIKE 'block_encryption_mode'");
        $ret = $dsql->getArr($sql);
        if($ret){
            $method = $ret['Value'];
        }

        return openssl_decrypt($encryptedData, $method, $key, OPENSSL_RAW_DATA, $iv);
    }
}


/**
 *  AES解密-sql的where条件中使用
 *
 * @access    public
 * @param     string  $str  需要处理的字段
 * @return    string
 */
if (!function_exists('aesDecryptSql')){
    function aesDecryptSql($str, $as = '', $_key = ''){
        $key = $_key ? $_key : trim($GLOBALS['cfg_aes_key']);

        if(!$key) return $str . ($as ? " as `$as`" : "");

        return "CONVERT(AES_DECRYPT(unhex($str), '$key') USING utf8mb4)" . ($as ? " as `$as`" : "");
    }
}


/**
 * 字符串加、解密
 *
 * @access    public
 * @param     string  $text  转换的内容
 * @return    string
 */
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