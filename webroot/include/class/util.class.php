<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 核心插件
 *
 * @version        $Id: util.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

/**
 *  获得当前的脚本网址
 *
 * @return    string
 */
if (!function_exists('GetCurUrl')){
    function GetCurUrl(){
        if(!empty($_SERVER["REQUEST_URI"])){
            $scriptName = $_SERVER["REQUEST_URI"];
            $nowurl = $scriptName;
        }else{
            $scriptName = $_SERVER["PHP_SELF"];
            if(empty($_SERVER["QUERY_STRING"])){
                $nowurl = $scriptName;
            }else{
                $nowurl = $scriptName."?".$_SERVER["QUERY_STRING"];
            }
        }
        return $nowurl;
    }
}

/**
 *  生成一个随机字符
 *
 * @access    public
 * @param     string  $ddnum
 * @return    string
 */
if (!function_exists('dd2char')){
    function dd2char($ddnum){
        $ddnum = strval($ddnum);
        $slen = strlen($ddnum);
        $okdd = '';
        $nn = '';
        for($i=0;$i<$slen;$i++){
            if(isset($ddnum[$i+1])){
                $n = $ddnum[$i].$ddnum[$i+1];
                if(($n>96 && $n<123) || ($n>64 && $n<91)){
                    $okdd .= chr($n);
                    $i++;
                }else{
                    $okdd .= $ddnum[$i];
                }
            }else{
                $okdd .= $ddnum[$i];
            }
        }
        return $okdd;
    }
}

/**
 *  json_encode兼容函数
 *
 * @access    public
 * @param     string  $data
 * @return    string
 */
if (!function_exists('json_encode')) {
	function format_json_value(&$value){
		if(is_bool($value)) {
			$value = $value?'TRUE':'FALSE';
		} else if (is_int($value)) {
			$value = intval($value);
		} else if (is_float($value)) {
			$value = floatval($value);
		} else if (defined($value) && $value === NULL) {
			$value = strval(constant($value));
		} else if (is_string($value)) {
			$value = '"'.addslashes($value).'"';
		}
		return $value;
	}

    function json_encode($data){
        if(is_object($data)) {
            //对象转换成数组
            $data = get_object_vars($data);
        }else if(!is_array($data)) {
            // 普通格式直接输出
            return format_json_value($data);
        }
        // 判断是否关联数组
        if(empty($data) || is_numeric(implode('',array_keys($data)))) {
            $assoc  =  FALSE;
        }else {
            $assoc  =  TRUE;
        }
        // 组装 Json字符串
        $json = $assoc ? '{' : '[' ;
        foreach($data as $key=>$val) {
            if(!is_NULL($val)) {
                if($assoc) {
                    $json .= "\"$key\":".json_encode($val).",";
                }else {
                    $json .= json_encode($val).",";
                }
            }
        }
        if(strlen($json)>1) {// 加上判断 防止空数组
            $json  = substr($json,0,-1);
        }
        $json .= $assoc ? '}' : ']' ;
        return $json;
    }
}

/**
 *  json_decode兼容函数
 *
 * @access    public
 * @param     string  $json  json数据
 * @param     string  $assoc  当该参数为 TRUE 时，将返回 array 而非 object
 * @return    string
 */
if (!function_exists('json_decode')) {
    function json_decode($json, $assoc=FALSE){
        // 目前不支持二维数组或对象
        $begin  =  substr($json,0,1) ;
        if(!in_array($begin,array('{','[')))
            // 不是对象或者数组直接返回
            return $json;
        $parse = substr($json,1,-1);
        $data  = explode(',',$parse);
        if($flag = $begin =='{' ) {
            // 转换成PHP对象
            $result   = new stdClass();
            foreach($data as $val) {
                $item    = explode(':',$val);
                $key =  substr($item[0],1,-1);
                $result->$key = json_decode($item[1],$assoc);
            }
            if($assoc)
                $result   = get_object_vars($result);
        }else {
            // 转换成PHP数组
            $result   = array();
            foreach($data as $val)
                $result[]  =  json_decode($val,$assoc);
        }
        return $result;
    }
}

/**
 *  create_uuid 生成UUID
 *
 * @access    public
 * @param     string  $prefix  前缀
 * @return    string
 */
if (!function_exists('create_uuid')) {
	function create_uuid($prefix = ""){
		$chars = md5(uniqid(mt_rand(), true));
		$uuid = substr($chars, 0, 8) . '-'
			. substr($chars, 8, 4) . '-'
			. substr($chars, 12, 4) . '-'
			. substr($chars, 16, 4) . '-'
			. substr($chars, 20, 12);
		return $prefix . $uuid;
	}
}

/**
 *  验证密码复杂度，必须8位以上，包含数字、小写字母、大写字母和特殊字符，并且不能有连续字符或重复字符
 *
 * @access    public
 * @return    bool
 */
function validatePassword($password) {
    global $cfg_pwdLevel;

    // 0关闭：将不对密码进行任何安全验证，风险较大，不建议使用；
    // 1简单：只对密码进行长度验证，不得小于8位；
    // 2复杂：要求必须8位以上，并且包含字母和数字，推荐使用该方式；
    // 3极致：要求必须8位以上，并且包含大小字母、小写字母、数字和特殊符号，同时不能用连续字母和数字(如abc/cba/123/321等)
    $pwdLevel = (int)$cfg_pwdLevel;

    // 不验证
    if($pwdLevel == 0) return 'ok';
    
    // 长度检查
    if (strlen($password) < 8) {
        return '密码不安全，长度不得小于8位！';
    }

    // 简单验证
    if($pwdLevel == 1) return 'ok';

    // 检查字符类型组合
    $hasDigit = preg_match('/\d/', $password);
    $hasLower = preg_match('/[a-z]/', $password);
    $hasUpper = preg_match('/[A-Z]/', $password);
    $hasSpecial = preg_match('/[^a-zA-Z\d]/', $password);

    // 复杂验证
    if ($pwdLevel == 2){
        if($hasDigit && ($hasLower || $hasUpper)){
            return 'ok';
        }else{
            return '密码不安全，必须包含数字和字母！';
        }
    }

    // 极致验证

    // 检查连续字符或重复字符
    $notRepeat = true;
    for ($i = 0; $i < strlen($password) - 2; $i++) {
        $char1 = ord($password[$i]);
        $char2 = ord($password[$i + 1]);
        $char3 = ord($password[$i + 2]);

        // 检查连续字符（如 abc 或 cba）
        if (abs($char2 - $char1) === 1 && abs($char3 - $char2) === 1) {
            if (($char2 - $char1 === $char3 - $char2)) {
                $notRepeat = false;
            }
        }

        // 检查重复字符（如 111 或 aaa）
        if ($char1 === $char2 && $char2 === $char3) {
            $notRepeat = false;
        }
    }
    if($hasDigit && $hasLower && $hasUpper && $hasSpecial && $notRepeat){
        return 'ok';
    }else{
        return '密码不安全，必须包含数字、小写字母、大写字母和特殊字符，同时不能用连续或重复的字母和数字(如abc/cba/123/321/aaa/666等)';
    }
}

/**
 * 随机生成符合要求的密码
 * 
 * @access public
 * @return string
*/
function generatePassword($len = 12) {
    // 定义字符池
    $digits = '0123456789';
    $lower = 'abcdefghijklmnopqrstuvwxyz';
    $upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $special = '!@#$%&*_+-=:.?';
    $all = $digits . $lower . $upper . $special;

    do {
        $password = [];
        
        // 确保至少包含每个类型一个字符
        $password[] = $digits[random_int(0, strlen($digits)-1)];
        $password[] = $lower[random_int(0, strlen($lower)-1)];
        $password[] = $upper[random_int(0, strlen($upper)-1)];
        $password[] = $special[random_int(0, strlen($special)-1)];
        
        // 填充剩余长度（至少8位，这里生成12位）
        for ($i = 4; $i < $len; $i++) {
            $newChar = $all[random_int(0, strlen($all)-1)];
            
            // 动态检查连续/重复规则
            while (
                count($password) >= 2 && 
                (
                    // 检查连续递增（如 123）
                    (ord($newChar) - ord($password[$i-1]) === 1 && 
                     ord($password[$i-1]) - ord($password[$i-2]) === 1) ||
                    // 检查连续递减（如 321）
                    (ord($password[$i-1]) - ord($newChar) === 1 && 
                     ord($password[$i-2]) - ord($password[$i-1]) === 1) ||
                    // 检查重复字符（如 111）
                    ($newChar === $password[$i-1] && 
                     $password[$i-1] === $password[$i-2])
                )
            ) {
                $newChar = $all[random_int(0, strlen($all)-1)]; // 重新生成
            }
            
            $password[] = $newChar;
        }
        
        // 打乱字符顺序
        shuffle($password);
        $password = implode('', $password);
        
    } while (validatePassword($password) != 'ok'); // 最终验证
    
    return $password;
}