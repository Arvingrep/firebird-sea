<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 过滤插件
 *
 * @version        $Id: filter.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

/**
 *  去除html中不规则内容字符
 *
 * @access    public
 * @param     string  $str  需要处理的字符串
 * @param     string  $rptype  返回类型
 *            $rptype = 0 表示仅替换 html标记
 *            $rptype = 1 表示替换 html标记同时去除连续空白字符
 *            $rptype = 2 表示替换 html标记同时去除所有空白字符
 *            $rptype = -1 表示仅替换 html危险的标记
 * @return    string
 */
if (!function_exists('HtmlReplace')){
    function HtmlReplace($str,$rptype=0){
        $str = stripslashes($str);
		$str = preg_replace("/<[\/]{0,1}style([^>]*)>(.*)<\/style>/i", '', $str);
        if($rptype==0){
            $str = htmlspecialchars($str);
        }else if($rptype==1){
            $str = htmlspecialchars($str);
            $str = str_replace("　", ' ', $str);
            $str = preg_replace("/[\r\n\t ]{1,}/", ' ', $str);
        }else if($rptype==2){
            $str = htmlspecialchars($str);
            $str = str_replace("　", '', $str);
            $str = preg_replace("/[\r\n\t ]/", '', $str);
        }else{
            $str = preg_replace("/[\r\n\t ]{1,}/", ' ', $str);
            $str = preg_replace('/script/i', 'ｓｃｒｉｐｔ', $str);
            $str = preg_replace("/<[\/]{0,1}(link|meta|ifr|fra)[^>]*>/i", '', $str);
        }
        return addslashes($str);
    }
}



/**
 *  修复浏览器XSS hack的函数
 *
 * @param     string   $val  需要处理的内容
 * @return    string
 */
if (!function_exists('RemoveXSS')){
    function RemoveXSS($val) {
       if(is_array($val)) return $val;
       $val = rawurldecode($val);  //rawurldecode方法可以防止val中的加号被转为空格
       $val = preg_replace('/<style(.*?)>/i', 'style', $val); //处理<style>@important url(这种内容
       $val = preg_replace('/([\x00-\x08\x0b-\x0c\x0e-\x19])/', '', $val);

       // 这里不可以进行addslashes操作，因为数据中会有json类的数据会被转换掉导致解析错误
       if(
            !strstr($val, '{') &&
            !strstr($val, '}') &&
            !strstr($val, '<p') &&
            !strstr($val, '<img') &&
            !strstr($val, 'document.write') &&
            !strstr($val, 'text/javascript')
        ){
            $val = addslashes(stripslashes($val));
       }

       $search = 'abcdefghijklmnopqrstuvwxyz';
       $search .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
       $search .= '1234567890!@#$%^&*()';
       $search .= '~`";:?+/={}[]-_|\'\\';
       for ($i = 0; $i < strlen($search); $i++) {
          $val = preg_replace('/(&#[xX]0{0,8}'.dechex(ord($search[$i])).';?)/i', $search[$i], $val); // with a ;
          $val = preg_replace('/(&#0{0,8}'.ord($search[$i]).';?)/', $search[$i], $val); // with a ;
       }


       $ra1 = array('javascript', 'vbscript', 'expression', 'applet', 'blink', 'script', 'document', 'eval', 'embed', 'object', 'frameset', 'ilayer', 'bgsound', 'base', 'insert', 'delete', 'select', 'sleep');
       $ra2 = array('onabort', 'onpageshow', 'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate', 'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus', 'onbeforepaste', 'onbeforeprint', 'onbeforeunload', 'onbeforeupdate', 'onblur', 'onbounce', 'oncellchange', 'onchange', 'onclick', 'oncontextmenu', 'oncontrolselect', 'oncopy', 'oncut', 'ondataavailable', 'ondatasetchanged', 'ondatasetcomplete', 'ondblclick', 'ondeactivate', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onerror', 'onerrorupdate', 'onfilterchange', 'onfinish', 'onfocus', 'onfocusin', 'onfocusout', 'onhelp', 'onkeydown', 'onkeypress', 'onkeyup', 'onlayoutcomplete', 'onload', 'onlosecapture', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onmove', 'onmoveend', 'onmovestart', 'onpaste', 'onpropertychange', 'onreadystatechange', 'onreset', 'onresize', 'onresizeend', 'onresizestart', 'onrowenter', 'onrowexit', 'onrowsdelete', 'onrowsinserted', 'onscroll', 'onselect', 'onselectionchange', 'onselectstart', 'onstart', 'onstop', 'onsubmit', 'onunload');
       $ra = array_merge($ra1, $ra2);

       $found = true;
       while ($found == true) {
          $val_before = $val;
          for ($i = 0; $i < sizeof($ra); $i++) {
             $pattern = '/';
             for ($j = 0; $j < strlen($ra[$i]); $j++) {
                if ($j > 0) {
                   $pattern .= '(';
                   $pattern .= '(&#[xX]0{0,8}([9ab]);)';
                   $pattern .= '|';
                   $pattern .= '|(&#0{0,8}([9|10|13]);)';
                   $pattern .= ')*';
                }
                $pattern .= $ra[$i][$j];
             }
             $pattern .= '/i';
             $replacement = substr($ra[$i], 0, 2).'<x>'.substr($ra[$i], 2);

             $val = preg_replace($pattern, $replacement, $val);
             if ($val_before == $val) {
                $found = false;
             }
          }
       }
         // 已发现的一些不应该被替换的字符串
       $filter = array(
          'title' => 'ti<x>tle',
          'style' => 'st<x>yle'
        );
       foreach ($filter as $key => $value) {
        $val = str_replace($value, $key, $val);
       }
       return $val;
    }
}

/**
 *  处理禁用HTML但允许换行的内容
 *
 * @access    public
 * @param     string  $msg  需要过滤的内容
 * @return    string
 */
if (!function_exists('TrimMsg')){
    function TrimMsg($msg)
    {
        $msg = trim(stripslashes($msg));
        $msg = nl2br(htmlspecialchars($msg));
        $msg = str_replace("  ","&nbsp;&nbsp;",$msg);
        return addslashes($msg);
    }
}

/**
 *  过滤用于搜索的字符串
 *
 * @param     string  $keyword  关键词
 * @return    string
 */
if (!function_exists('FilterSearch')){
    function FilterSearch($keyword){
        global $cfg_soft_lang;
        if($cfg_soft_lang=='utf-8'){
            $keyword = preg_replace("/[\"\r\n\t\$\\><']/", '', $keyword);
            if($keyword != stripslashes($keyword)){
                return '';
            }else{
                return $keyword;
            }
        }else{
            $restr = '';
            for($i=0;isset($keyword[$i]);$i++){
                if(ord($keyword[$i]) > 0x80){
                    if(isset($keyword[$i+1]) && ord($keyword[$i+1]) > 0x40){
                        $restr .= $keyword[$i].$keyword[$i+1];
                        $i++;
                    }else{
                        $restr .= ' ';
                    }
                }else{
                    if(preg_match("/[^0-9a-z@#\.]/",$keyword[$i])){
                        $restr .= ' ';
                    }else{
                        $restr .= $keyword[$i];
                    }
                }
            }
        }
        return $restr;
    }
}


/**
 *  将指定数据用逗号分隔，并对数据类型验证
 *
 * @access    public
 * @param     string|array  $arr  要操作的内容
 * @param     booblean      $int  是否需要转成int类型
 * @return    string
 */
if (!function_exists('convertArrToStrWithComma')){
    function convertArrToStrWithComma($arr, $int = true){
        $data = array();
        if(is_array($arr) && !empty($arr)){
            foreach($arr as $val){
                $val = $int ? (int)$val : $val;
                array_push($data, $val);
            }
        }
        elseif(strstr($arr, ',')){
            $_arr = explode(',', $arr);
            foreach($_arr as $val){
                $val = $int ? (int)$val : $val;
                array_push($data, $val);
            }
        }elseif($arr !== '' && $arr != NULL){
            array_push($data, (int)$arr);
        }
        return implode(',', $data);
    }
}


/**
 *  清除字符串中的前后空格、html标签，一般用于页面中显示过滤后的url参数值
 *
 * @access    public
 * @param     string  $str  需要清除的内容
 * @return    string
 */
if (!function_exists('convertStrToPageShow')){
    function convertStrToPageShow($str)
    {   
        if($str){
            return strip_tags(trim($str));
        }
    }
}
